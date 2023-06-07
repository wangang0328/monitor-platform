import { Client, PluginReturn } from '@wa-dev/monitor-sdk-types'
import { merge } from '@wa-dev/monitor-sdk-utils'

abstract class BaseClient implements Client {
  /**
   * 配置管理器
   */
  // private _configManager: BaseConfigManager
  // private _plugins: { [key: string]: PluginReturn[] }[]
  // eslint-disable-next-line @typescript-eslint/ban-types
  private _hooks: Record<string, Function[]>
  private _config: Record<string, any>

  // TODO: config 类型
  constructor(config: Record<string, any>) {
    // init
    this._config = config
    this._hooks = {}
  }

  setConfig(config: any) {
    // beforeConfig
    this._config = merge(this._config, config)
    // config
  }

  getConfig() {
    return this._config
  }

  /**
   * 挂载插件
   */
  use(plugins: PluginReturn[]) {
    if (!Array.isArray(plugins)) {
      return
    }

    plugins.forEach(({ setup }) => {
      setup(this)
    })
  }

  /**
   * 初始化
   */
  on(hook: 'init', cb: any): void

  /**
   * 配置参数
   */
  on(hook: 'beforeConfig', cb: any): void

  on(hook: 'config', cb: any): void

  /**
   * 开启上报
   */
  on(hook: 'start', cb: any): void

  /**
   * 插件监控到数据，传递个client
   */
  on(hook: 'report', cb: any): void

  on(hook: 'beforeBuild', cb: any): void

  /**
   * 包装数据
   */
  on(hook: 'build', cb: any): void

  on(hook: 'beforeSend', cb: any): void

  /**
   * 发送数据
   */
  on(hook: 'send', cb: any): void

  on(hook: string, cb: any) {
    if (!this._hooks[hook]) {
      this._hooks[hook] = []
    }
    this._hooks[hook].push(cb)
  }

  emit(hook: 'init', cb: any): void

  /**
   * 配置参数
   */
  emit(hook: 'beforeConfig', cb: any): void

  emit(hook: 'config', cb: any): void

  /**
   * 开启上报
   */
  emit(hook: 'start', cb: any): void

  /**
   * 插件监控到数据，传递个client
   */
  emit(hook: 'report', cb: any): void

  emit(hook: 'beforeBuild', cb: any): void

  /**
   * 包装数据
   */
  emit(hook: 'build', cb: any): void

  emit(hook: 'beforeSend', cb: any): void

  /**
   * 发送数据
   */
  emit(hook: 'send', cb: any): void

  emit(hook: string, ...restArgs: any[]) {
    this._hooks[hook].forEach(cb => cb(...restArgs))
  }

  abstract report(data: any): void
}

export default BaseClient
