import 'module-alias/register' // 打包后解析别名
import { getEnv } from '@utils'
import type { EnvConfig } from '@utils'

const env = getEnv()
// 开发环境配置
const development = {
  loginType: 'normal', // 登录类型，uc(内部uc登录)/normal(普通登录)
  use: {
    alarm: false, // 是否使用报警功能。如果启用，请在alarm配置里指定报警网址
  },
  // 注意路径不要以 / 结尾
  nginxLogFilePath: 'H:/nginx/nginx-1.24.0/logs', // nginx日志文件根路径，此路径下面的日志文件命名格式请参照readme
}

// 测试环境配置
const testing = development
const production = testing

const config: EnvConfig = {
  development,
  testing,
  production,
}

const getConfig = () => {
  return config[env] || config.development
}

export default getConfig
