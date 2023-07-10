/**
 * 命令入口， 参数解析&日志打印
 */
// 打包后解析别名
import 'module-alias/register'
import minimist from 'minimist'

// 命令文件路径
const commanderPathMap = {
  // 将nginx日志进行清洗，落在文件中
  'SaveLog:Nginx': './commands/save-log/NginxParseLog'
}


// --parse
console.log(process.argv)
console.log(minimist(process.argv.slice(2)))
// 获取命令参数
const { _: argvList, ...argvObj } = minimist(process.argv.slice(2)) || {}

const { signature, ...restArgvObj } = argvObj
// 校验命令是否合法
if (!signature) {
  console.error('error: 请输入 signature parameter, eg: pnpm run:app --signature SaveLog:Nginx')
  process.exit(1)
}

if (!commanderPathMap[signature]) {
  console.error('error: 请输入正确的 signature, 目前只支持：', Object.keys(commanderPathMap).toString())
  process.exit(1)
}


const runCommander = () => {
  const Commander = require(commanderPathMap[signature]).default
  // const { default: Commander } = await import(commanderPathMap[signature])
  // 执行命令
  const commander = new Commander()
  commander.execute(restArgvObj)
}

runCommander()
