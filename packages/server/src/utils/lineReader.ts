/**
 * 文件流读写，每次读写一行
 */
import fs from 'fs-extra'
import readLine from 'readline'
import { EventEmitter } from 'events'


const isString = (v: any): v is string => typeof v === 'string'

class LineReader extends EventEmitter {
  private _stream: fs.ReadStream
  private _rl: readLine.Interface

  constructor(stream: fs.ReadStream | string) {
    super()
    this._stream = typeof stream === 'string' ? fs.createReadStream(stream) : stream
    const rl = readLine.createInterface(this._stream)
    this._rl = rl

    rl.on('line', (content: string) => {
      this.emit('line', content)
    })

    rl.on('close', () => this.emit('close'))
    rl.on('pause', () => this.emit('pause'))
    rl.on('resume', () => this.emit('resume'))
  }

  close() {
    this._rl.close()
  }

  resume() {
    this._rl.resume()
  }

  pause() {
    this._rl.pause()
  }

  pipe(wsOrPath: fs.WriteStream | string, cb?: (content: string) => undefined | null | string) {
    console.log('hello')
    let ws: fs.WriteStream = wsOrPath as fs.WriteStream
    if (isString(wsOrPath)) {
      fs.ensureFileSync(wsOrPath)
      ws = fs.createWriteStream(wsOrPath)
    }

    const rl = this._rl
    cb = cb || ((v: string) => v)
    rl.on('line', (content) => {
      let formatedData = cb(content)
      console.log('formated----', formatedData, typeof formatedData)
      if (formatedData) {
        if (!formatedData.endsWith('\n')) {
          formatedData = `${formatedData}\n`
        }
        // 有返回值，进行处理
        const flag = ws.write(formatedData)
        if (!flag) {
          // 内存中还有数据没有写完
          rl.pause()
        }
      }
    })

    ws.on('drain', () => {
      // 内存中数据已经写完
      rl.resume()
    })

    rl.on('close', () => {
      ws.close()
    })
  }
}


const createReadLane = (stream: fs.ReadStream | string) => {
  return new LineReader(stream)
}

export default createReadLane
