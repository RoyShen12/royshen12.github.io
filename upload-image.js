const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')
const md5 = require('md5')

const [, , arg] = process.argv

console.log(arg)

if (!fs.existsSync(arg)) {
  console.error(`${arg} unexist.`)
  process.exit(-1)
}

const _sp = arg.split('.')
const ext = _sp[_sp.length - 1]

const tmpDir = './._tmp'

fs.existsSync(tmpDir) || fs.mkdirSync(tmpDir)

const buf = fs.readFileSync(arg)
const fmd5 = md5(buf)

const fn = path.resolve(tmpDir, `${fmd5}.${ext}`)
fs.writeFileSync(fn, buf)

const resp = execSync(`ossutil cp ${fn} oss://image-bed-roy/image-blog/${fmd5}.${ext}`).toString()

console.log(resp)
