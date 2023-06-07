/**
 * 组装器，负责将收集上报的平台无关时间转换为特定平台上报格式
 * 主要负责包装特定环境下的上下文信息，在浏览器环境下，上下文信息包括 页面地址，网络状态，当前时间等等，再结合Monitor收集到的数据
 * 完成上报格式的组装
 */
// TODO: 不使用了， 将此改成插件形式
abstract class BaseBuilder<T = any, R = any> {
  abstract bulid: (originData: T) => R
}

export default BaseBuilder
