type noop = () => void
export type CbType = 'change' | 'ready'

export interface ConfigManager<Config extends Record<string, any> | null = Record<string, any>> {
  setConfig: (c: Partial<Config>) => Config
  getConfig: () => Config
  /**
   * config 改变
   */
  onChange: (cb: noop) => void
  /**
   * config 已经准备好， 配置完成
   */
  onReady: (cb: noop) => void

  removeScribe: (type: CbType, v: noop) => void
}
