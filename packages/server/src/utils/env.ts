/**
 * 环境变量 判断
 */

type Env = 'development' | 'testing' | 'production'

export const getEnv = () => (process.env.NODE_ENV || 'development') as Env

const validateEnv = <T extends Env>(v: Env): v is T => getEnv() === v

export const isDevelopment = () => validateEnv<'development'>('development')

export const isProduction = () => validateEnv<'production'>('production')

export const isTesting = () => validateEnv<'testing'>('testing')

export type EnvConfig<T = any> = {
  [key in Env]: T
}
