// import 'module-alias/register' // 打包后解析别名
import path from 'path'
import moment from 'moment'
import { getEnv } from '@utils'
import type { EnvConfig } from '@utils'
import getAppConfig from '@src/configs/app'

const env = getEnv()
const { absoluteLogPath } = getAppConfig()

// 注意路径不要以 / 结尾
const nginxLogFilePath = 'H:/nginx/nginx-1.24.0/logs'

const development = nginxLogFilePath
// 测试环境配置
const testing = development
const production = testing

const config: EnvConfig = {
  development,
  testing,
  production,
}

export const getNginxLogPath = () => {
  return config[env] || config.development
}

const LOG_TYPE_RAW = 'raw'
const LOG_TYPE_JSON = 'json'
const LOG_TYPE_TEST = 'test'

const YMFormat = 'YYYYMM'
const DDFormat = 'DD'
const HHFormat = 'HH'
const mmFormat = 'mm'

type LogType = typeof LOG_TYPE_RAW | typeof LOG_TYPE_JSON | typeof LOG_TYPE_TEST

/**
 * 根据类型获取日志所在的文件夹
 */
export const getBasePathByType = (logType: LogType = LOG_TYPE_RAW) => {
  return path.resolve(absoluteLogPath, 'nginx', logType)
}

/**
 * 根据开始时间和记录类型来生成对应的日志绝对路径，按分钟分割
 */
export const getLogPathByTimeAndType = (logTime: number, logTyp: LogType) => {
  const baseLogDir = getBasePathByType(logTyp)
  const startMoment = moment.unix(logTime)
  const monthName = getMonthDirName(logTime)
  const format = (strFormater: string) => startMoment.format(strFormater)
  return path.resolve(baseLogDir, `./${monthName}/day_${format(DDFormat)}/${format(HHFormat)}/${format(mmFormat)}.log`)
}

/**
 * 根据时间生成month的文件夹 后续方便按月份删除日志
 * @param logTime
 * @returns
 */
export const getMonthDirName = (logTime: number) => {
  return `month_${moment.unix(logTime).format(YMFormat)}`
}