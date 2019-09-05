/**
 * 此文件接收一个参数，指向某个待上传的文件路径
 * 随后调用 阿里云 ossutil 上传至 阿里云 OSS
 * 并将远程 url 复制到剪贴板
 */

const fs = require('fs')
const path = require('path')
const { execSync, spawn } = require('child_process')
const md5 = require('md5')

const [, , arg] = process.argv

console.log(`
input file:
${arg}
`)

if (!fs.existsSync(arg)) {
  console.error(`${arg} unexist.`)
  process.exit(-1)
}

const _sp = arg.split('.')
const ext = _sp[_sp.length - 1]

const tmpDir = './._tmp'

const ossHead = 'oss://image-bed-roy/image-blog/'
const outputUrlHead = 'https://image-bed-roy.oss-cn-shanghai.aliyuncs.com/image-blog/'

fs.existsSync(tmpDir) || fs.mkdirSync(tmpDir)

const buf = fs.readFileSync(arg)
const fmd5 = md5(buf)

const fn = path.resolve(tmpDir, `${fmd5}.${ext}`)
fs.writeFileSync(fn, buf)

const resp = execSync(`ossutil cp ${fn} ${ossHead}${fmd5}.${ext}`).toString()

console.log(`
ossutil response:
${resp}
`)

function pbcopy(d) {
  var proc = spawn('pbcopy')
  proc.stdin.write(d)
  proc.stdin.end()
}

console.log(`
file process ok

${outputUrlHead}${fmd5}.${ext}

copy destination Url to clipboard OK.
`)

pbcopy(`${outputUrlHead}${fmd5}.${ext}`)
