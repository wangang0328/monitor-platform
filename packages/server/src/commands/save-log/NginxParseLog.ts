/**
 * 解析 ngix 日志数据，并进行清洗
 */
import 'module-alias/register' // 打包后解析别名
import moment from 'moment'
import fs from 'fs'
import queryString from 'query-string'
import { get, isEmpty, has, set } from 'lodash'
import uaParser from 'ua-parser-js'
import { createLineReader } from '@utils'
import { Knex, ip2Locale } from '@src/lib'
import getCommonConfig from '@src/configs/commonConfig'
import { getLogPathByTimeAndType } from '@src/lib'
import BaseCommander from '../BaseCommander'

type ProjectMap = Record<string, { id: string; rate: number; }>

// TODO: 上传map文件，解析map文件，获取对应的行号和列号
class NginxParseLog extends BaseCommander {
  projectMap: ProjectMap
  constructor() {
    super()
  }

  static get signature() {
    return 'SaveLog:Nginx'
  }

  static get description() {
    return '没一分钟读取Nginx日志，并解析'
  }

  // 获取本次要解析的log文件路径
  getNginxLogFilePath() {
    const { nginxLogFilePath } = getCommonConfig()
    // 获取上一分钟的时间
    const lastMinuteTime = moment().unix() - 60
    const logAtMoment = moment.unix(lastMinuteTime)
    // const formatTimeStr = logAtMoment.format('YYYYMM-DD-HH-mm')
    // TODO: 写死先
    const formatTimeStr = '202306-03-18-47'
    return [`${nginxLogFilePath}/${formatTimeStr}.log`, logAtMoment.unix()] as const
  }

  async execute(args?: Record<string, any>, options?: Record<string, any>): Promise<any> {
    // 从数据库中获取project
    this.log('before getProjectMap')
    const projectMap = await this.getProjectMap()
    this.projectMap = projectMap
    this.log('after getProjectMap', projectMap)
    // let logCounter = 0
    // let legalLogCounter = 0

    const [nginxLogFilePath, logAtTime] = this.getNginxLogFilePath()
    this.log('nginx 原始日志路径', nginxLogFilePath)
    // 校验文件是否存在
    if (!fs.existsSync(nginxLogFilePath)) {
      this.log('日志路径不存在， 自动跳过 => ', nginxLogFilePath)
      return
    }
    // 根据日期来获取要保存的日志文件地址
    const writeLogPath = getLogPathByTimeAndType(logAtTime, 'json')

    //TODO: 后续如果接入kafaka, 处理方式可能要改，文件目录使用log日志记录的时间
    // 读取文件
    const laneReader = createLineReader(nginxLogFilePath)
    console.log('nginxParseLog: writeLogPath--', writeLogPath)
    laneReader.pipe(writeLogPath, this.onReadLine.bind(this))
  }


  onReadLine(content: string) {
    if (!content) {
      this.log('没有获取到日志内容，自动跳过')
      // 没有内容
      return
    }
    // TODO: 校验日志时间
    return this.parseLog(content)
  }

  parseLog(content: string) {
    const projectMap = this.projectMap
    const infos = content.split('\t')
    const url = get(infos, [15], '')
    this.log('parseNginxLog url: ', url)
    const urlInfo = queryString.parseUrl(url)
    this.log('parseNginxLog SearchObj: ', urlInfo)
    let record: string | Record<string, any> = get(urlInfo, ['query', 'd'], '{}') as string
    this.log('parseNginxLog record:', record)
    try {
      record = JSON.parse(record) as Record<string, any>
    } catch (error) {
      this.log("====打点数据异常====", error)
      return null
    }
    this.log('parseNginxLog parse record:', record)

    if (isEmpty(record)) {
      this.log('record 不规范: ', record)
      return null
    }
    const pid = record.common?.pid ?? ''
    if (!pid.trim()) {
      this.log('打点数据没有 pid: ', record)
      return null
    }
    // 判断项目中是否有 pid
    if (!projectMap[pid]) {
      this.log('项目尚未注册pid: ', pid, projectMap)
      return null
    }

    // 添加一些数据
    record.project_id = projectMap[pid].id
    record.project_name = pid

    const createdTime = this.parseLogCreatedTime(content)
    if (createdTime <= 0) {
      this.log('parseNginxLog 日期解析失败，跳过该条记录')
      return null
    }
    record.time = createdTime

    // 解析ua信息
    const uaStr = infos[16] || ''
    record.ua = uaParser(decodeURIComponent(uaStr))
    this.log("record.ua", record.ua);
    // 兼容处理saas系统打点UA问题, nwjs低版本下获取不到chrome的版本, 解析拿到的为chromium_ver
    let browserVersion = get(record.ua, ["browser", "version"], "");
    if (browserVersion === "chromium_ver") {
      set(record.ua, ["browser", "version"], "50.0.2661.102");
      set(record.ua, ["browser", "major"], "50");
    }

    // 解析ip地址 映射城市
    const ipStr = infos[3] || infos[4]
    // 本地，默认是深圳ip地址
    const toParseIpStr = ipStr === '127.0.0.1' ? '14.127.123.1' : ipStr
    const { country, province, city } = ip2Locale(toParseIpStr)
    record.country = country
    record.province = province
    record.city = city
    // TODO: 处理sourcemap
    return JSON.stringify(record)
  }

  // 从数据库中获取project
  async getProjectMap() {
    const result = await Knex
      .select(['id', 'project_name', 'rate'])
      .from('t_o_project')
      .where('is_delete', 0)
      .catch(e => {
        this.log(e.message, 'select db table t_o_project 出错')
        return []
      })
    const v = result?.reduce(
      (target, item) => {
        target[item.project_name] = {
          id: item.id,
          rate: item.rate
        }
        return target
      },
      {}
    )
    return v as Record<string, { id: string, rate: number }>
  }

  /**
   * 解析日志记录所在的时间戳，取日志时间作为时间戳
   * 若日志时间不规范，则返回0， 客户端时间不可信，以日志时间为准
   *  因为 创建 log 时间 也就是当前时间的前一分钟，因为获取的日志就是根据日期来创建生成的
   */
  parseLogCreatedTime(data: string) {
    this.log('parseLogCreateAt data', data)
    const [createdDataTime] = data.split('\t')
    if (!createdDataTime) {
      this.log('parseLogCreateAt 没有解析到日期: ', createdDataTime)
      return 0
    }
    const logAtMoment = moment(createdDataTime, moment.ISO_8601)
    if (!logAtMoment.isValid) {
      this.log('parseLogCreateAt 日期解析不合法: ', createdDataTime)
      return 0
    }
    return logAtMoment.unix()
  }
}


export default NginxParseLog
