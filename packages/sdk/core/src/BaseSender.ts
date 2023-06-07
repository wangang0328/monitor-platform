/**
 * 发送器， 负责发送逻辑， 比如批量，重试功能
 * 监控的SDK的sender 都是BatchSender 都是负责维护一个缓存队列， 利用requestIdleCallback 延时上报，在浏览器关闭时 调用sendBeacon，保证数据都上报
 * 支持立即上报和清空队列
 * 批量上报考虑gzip压缩，超时处理(一直没有到批量上报的数量)，
 * 错误级别立即上报
 */
import type { Sender } from '@wa-dev/monitor-sdk-types'

type OtherMethod = string

export type ReportMethod = 'get' | 'GET' | 'post' | 'POST' | 'gif' | 'GIF' | 'beacon' | 'BEACON' | OtherMethod

export interface BaseSenderOptions {
  /**
   * 请求方式， 浏览器默认 gif
   */
  method?: ReportMethod
  /**
   * 用户自定义请求函数
   */
  request?: () => void
  /**
   * 缓存数目, 默认10个，用于批量发送， 值为0或者负数则不缓存
   * 错误信息会立即上报
   */
  cacheCount?: number
  /**
   * 缓存时间， 默认10min
   */
  cacheTime?: number
  /**
   * 立即上报类型
   */
  reportNowType?: string
}

abstract class BaseSender<Data = Record<string, any>> implements Sender<Data> {
  /**
   * 发送配置选项
   */
  private _config: BaseSenderOptions

  constructor(config: BaseSenderOptions) {
    // 该抽象类就不设置默认配置了， 不同的平台默认配置可能不同，有子类去实现
    this._config = config
  }

  // 需要重写
  abstract send(data: Data, method?: ReportMethod, reportNow?: boolean): void
}

export default BaseSender
