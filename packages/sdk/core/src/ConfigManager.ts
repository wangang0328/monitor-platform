/**
 * 配置管理器， 负责配置逻辑， 比如合并初始配置和用户配置、拉取远端配置
 */

import { merge } from '@wa-dev/monitor-sdk-utils'
import type { ConfigManager, CbType } from '@wa-dev/monitor-sdk-types'

class BaseConfigManager<Config extends Record<string, any> | null = Record<string, any>> implements ConfigManager<Config> {
  // 配置信息
  private _config: Config | null = null
  // 订阅者 状态改变
  private _changeDescribers: (() => void)[] = []
  // 订阅者 配置完成
  private _readyDescribers: (() => void)[] = []

  // 为后面支持远程配置准备
  private _state: 'pending' | 'setting' | 'ready' = 'pending'

  constructor(initialConfig?: Partial<Config>) {
    this._state = 'pending'
    if (initialConfig) {
      this._config = initialConfig as Config
    }
  }

  /**
   * config 改变时
   */
  onChange(cb: () => void) {
    if (!this._changeDescribers.find(cb)) {
      // 判断是否已经有该订阅函数了，有就不再push了，防止触发多次
      this._changeDescribers.push(cb)
    }
  }

  /**
   * config 状态完成时， 目前不支持远程获取配置，第一次设置config后，会触发
   */
  onReady(cb: () => void) {
    if (!this._readyDescribers.find(cb)) {
      // 判断是否已经有该订阅函数了，有就不再push了，防止触发多次
      this._readyDescribers.push(cb)
    }
  }

  private _notify(type: CbType) {
    // 通知订阅方
    if (type === 'change') {
      // 状态变化
      this._changeDescribers.forEach(fn => fn())
    } else {
      // 状态完成
      this._readyDescribers.forEach(fn => fn())
    }
  }

  setConfig(config: Partial<Config>) {
    if (this._config !== null) {
      // merge config
      this._config = merge(this._config, config)
    } else {
      this._config = { ...config } as Config
    }

    this._notify('change')
    if (this._state === 'pending') {
      this._state = 'ready'
      this._notify('ready')
    }

    return this._config as Config
  }

  getConfig() {
    return this._config as Config
  }

  // 移除订阅者
  removeScribe(type: CbType, cb: () => void) {
    const tempList = type === 'change' ? this._changeDescribers : this._readyDescribers
    const index = tempList.findIndex(item => item === cb)
    if (index > -1) {
      tempList.splice(index, 1)
    }
  }
}

export default BaseConfigManager
