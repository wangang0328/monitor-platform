/**
 *  项目应用的配置
 */
import 'module-alias/register' // 打包后解析别名
import path from 'path'
import { getEnv } from '@utils'
// import type { EnvConfig } from '@utils'

const env = getEnv()

const production = {
  name: 'fee监控平台开发环境',
  port: 3000,
  proxy: false,
  absoluteLogPath: path.resolve(process.cwd(), 'log')
}

// 下面的特定环境可以深度合并到上面的默认环境
// 线上环境是上面的默认环境，不要乱改哦

// 开发环境配置
const development = {
  name: 'fee监控平台开发环境',
  port: 3000,
  proxy: false,
  absoluteLogPath: path.resolve(process.cwd(), 'log')
  // absoluteLogPath: path.resolve(__dirname, '../../', 'log')
}
// 测试环境配置
const testing = {
  name: 'fee监控平台开发环境',
  port: 3000,
  proxy: false,
  absoluteLogPath: path.resolve(process.cwd(), 'log')
}

let config = {
  development,
  testing,
  production
}

const getAppConfig = () => {
  return config[env] || config.development
}

export default getAppConfig
