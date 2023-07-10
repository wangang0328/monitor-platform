import { isString } from 'lodash'
import moment from 'moment'
import path from 'path'
import { DISPLAY_BY_MILLSECOND } from '@src/constants/dateFormat'

export const getNowTimeFormated = () => moment().format(DISPLAY_BY_MILLSECOND)

const _stringifySafe = (data: any) => {
  let message = ''
  try {
    message = JSON.stringify(data)
  } catch (error) {
  } finally {
    return message
  }
}

// 将log info error 等参数格式化
export const formatLogArguments = (args: any[]) => {
  return args.reduce((accuted, rawMessage) => {
    if (isString(rawMessage)) {
      return `${accuted}${rawMessage}`
    }
    return `${accuted}${_stringifySafe(rawMessage)}`
  }, '')
}

/**
 * 获取调用栈信息
 */
export function extractCallStackInfo() {
  const reg = /at\s+(.*)\s+\((.*):(\d*):(\d*)\)/i
  const obj = {} as Record<'stack', string>
  Error.captureStackTrace(obj)
  // 调用栈信息
  // ['Error', '    at extractCallStackInfo (E:\\interview\\monitor-platform\\test\\index.js:12:9)',
  //  '**']
  const callStack = obj.stack.split('\n')
  const targetStackInfoStr = callStack[3]
  const match = reg.exec(targetStackInfoStr)
  const data = {
    method: '',
    path: '',
    line: '',
    col: '',
    file: ''
  }
  if (match?.length === 5) {
    data.method = match[0]
    data.path = match[1]
    data.line = match[2]
    data.col = match[3]
    data.file = path.basename(data.path)
  }
  return JSON.stringify(data)
}