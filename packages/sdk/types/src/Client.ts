import { PluginReturn } from './Plugin'

export interface Client {
  /**
   * 发送数据
   */
  report: (data: any) => void

  /**
   * 挂载插件
   */
  use: (client: PluginReturn[]) => void
}
