import type { Client } from './Client'

export interface PluginReturn<T extends Client = Client> {
  /**
   * 插件名称
   */
  name: string
  /**
   * 插件初始化
   */
  setup: (client: T) => void
  /**
   * 实例销毁时调用，可以在此销毁副作用
   */
  tearDown?: (client: T) => void
}

export type Plugin = <T extends Client = Client>(options?: Record<string, any>) => PluginReturn<T>
