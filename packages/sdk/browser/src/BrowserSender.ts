import { BaseSender } from '@wa-dev/monitor-sdk-core'
import type { ReportMethod, BaseSenderOptions } from '@wa-dev/monitor-sdk-core'

type ReportData = any

class BrowserSender extends BaseSender {
  /**
   * 待发送的缓存队列
   */
  private _queue: ReportData[]

  constructor(config: BaseSenderOptions) {
    super(config)
    this._queue = []
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  send(data: any, method?: ReportMethod, reportNow?: boolean) {
    // TODO: 根据 method 判断使用的请求方式
  }
}

export default BrowserSender
