import { getEnv } from '@utils'

const env = getEnv()

// 开发环境
const development = {
  host: "127.0.0.1",
  port: "3306",
  user: "root",
  password: "root",
  database: "platform",
}

// 测试环境
const testing = development

// 生产环境
const production = development

const configProcessor = {
  development,
  testing,
  production
}

const getConfig = () => {
  return configProcessor[env] || development
}

export default getConfig
