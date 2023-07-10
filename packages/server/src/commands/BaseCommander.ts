import { commandLogFactory } from '@src/lib/log4js'

/**
 * 规范命令函数的用法，方便统一管理
 */
abstract class BaseCommander {
  commandLog: any
  commandWarn: any
  static signatrue: string
  // 需要加上静态的语句
  static get signature(): string {
    throw new Error('子类方法必需重写')
  }
  static get description(): string {
    throw new Error('子类方法必需重写')
  }

  /**
   * 执行 execute 函数，使用catch 包装，方便获取报错信息
   */
  async handle(args?: Record<string, any>, options?: Record<string, any>) {
    this.log('command start')
    await this.execute(args, options).catch((error) => {
      this.log('catch error')
      this.log(error.stack)
    })
    this.log('command finish')
  }

  abstract execute(args?: Record<string, any>, options?: Record<string, any>): Promise<any>

  // log 将log输出到日志文件
  log(...args: any[]) {
    const commandName = this.constructor.name
    if (!this.commandLog) {
      this.commandLog = commandLogFactory('log', commandName)
    }
    this.commandLog(...args)
  }

  // 将log 输出到日志文件
  warn(...args: any[]) {
    const commandName = this.constructor.name
    if (!this.commandWarn) {
      this.commandWarn = commandLogFactory('log', commandName)
    }
    this.commandWarn(...args)
  }
}

export default BaseCommander
