export interface Sender<Data = any> {
  /**
   * 发送数据
   */
  send: (data: Data) => void
}
