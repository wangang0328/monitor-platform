import log4js from 'log4js'
import type { Configuration, Logger } from 'log4js'

import getAppConfig from '@src/configs/app'
import { getNowTimeFormated, formatLogArguments, extractCallStackInfo } from './utils'

const config = getAppConfig()


const getLoggerConfig = (commandName = 'unSetCommandName') => {
  return {
    appenders: {
      // 定义输出程序
      express: {
        type: 'dateFile', // 按日期保存文件
        filename: `${config.absoluteLogPath}/express/runtime`, // 文件名
        pattern: '-yyyy-MM-dd.log', // 日志模式
        alwaysIncludePattern: true, // 在当前日志文件的名称中包含模式，默认会将模式添加到文件末尾 如：***-2023-12-11.log
      },
      command: {
        type: 'dateFile',
        filename: `${config.absoluteLogPath}/command/${commandName}`
      }
    },
    categories: {
      // 定义日志类别以及使用的输出程序
      default: { appenders: ['express'], level: 'info' },
      express: { appenders: ['express'], level: 'info' },
      command: { appenders: ['command'], level: 'info' }
    }
  }
}

type Category = keyof (ReturnType<typeof getLoggerConfig>)['categories']


// getLogger 会重新打开一个文件，导致文件句柄太多，系统报错退出，因此增加一层缓存
const loggerMap = new Map<string, Logger>()
const generateLogger = (loggerType: Category = 'express') => (commandName?: string) => {
  const loggerConfig = getLoggerConfig(commandName)
  const configJSON = JSON.stringify({ loggerType, loggerConfig })
  if (loggerMap.has(configJSON)) {
    return loggerMap.get(configJSON)
  }
  log4js.configure(loggerConfig)
  const logger = log4js.getLogger(loggerType)
  loggerMap.set(configJSON, logger)
  return logger
}

type LogType = 'log' | 'info' | 'error' | 'warn'

const logFactory = (loggerFn: (key: string) => log4js.Logger) => (logType: LogType, logKey: string, showStackInfo: boolean = false) => {
  const logger = loggerFn(logKey)
  // 将打印方法挂载到logger函数上
  function _log(...args: any[]) {
    // 转成数组
    // const args = [].slice.call(arguments)
    const message = formatLogArguments(args)
    const triggerAt = getNowTimeFormated()
    if (!showStackInfo) {
      // 不打印调用栈信息
      console[logType](`[${triggerAt}]-[${logKey}] ${message}`)
      logger[logType](message)
    } else {
      // 获取调用栈信息
      const callStackInfo = extractCallStackInfo()
      // 打印调用栈信息
      console[logType](`[${triggerAt}]-[${logKey}] ${message} => ${callStackInfo}`)
      logger[logType](`${message} => ${callStackInfo}`)
    }
  }

  return _log
}

export const getExpressLogger = generateLogger('express')
export const getCommandLogger = generateLogger('command')

const expressLogFactory = logFactory(getExpressLogger)

// 默认都是express类型的log
export const log = expressLogFactory('log', 'runtime')
export const info = expressLogFactory('info', 'runtime')
export const error = expressLogFactory('error', 'runtime', true)
export const warn = expressLogFactory('warn', 'runtime', true)

export const commandLogFactory = logFactory(getCommandLogger)
