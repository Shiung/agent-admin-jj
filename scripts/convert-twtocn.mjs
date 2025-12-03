// scripts/convert-twtocn.mjs
import fs from 'fs'
import path from 'path'
import * as OpenCC from 'opencc-js'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const converter = OpenCC.Converter({ from: 'tw', to: 'cn' })

// 模式：check 只列出有變化的行，不寫回檔案；convert 會真的轉檔
const MODE = process.argv[2] === 'check' ? 'check' : 'convert'

// 要處理的副檔名
const exts = ['.js', '.ts', '.vue', '.jsx', '.tsx']

// ================= 工具函式 =================

// 遞迴取得所有目標檔案（子資料夾用）
function getAllFiles(dir, exts, fileList = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const excludeDirs = ['node_modules', '.git', 'dist', 'build']

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      if (excludeDirs.includes(entry.name)) continue
      getAllFiles(fullPath, exts, fileList)
    } else {
      if (exts.some((ext) => entry.name.endsWith(ext))) {
        fileList.push(fullPath)
      }
    }
  }

  return fileList
}

// 判斷是否為「整行註解」
function isFullCommentLine(line) {
  const trimmed = line.trim()
  return (
    trimmed.startsWith('//') ||
    trimmed.startsWith('/*') ||
    trimmed.startsWith('*') ||
    trimmed.startsWith('<!--')
  )
}

// 單純把一行中的中文全部轉成簡體
function convertLine(line) {
  return line.replace(/[\u4e00-\u9fff]+/g, (m) => converter(m))
}

// 處理單一檔案
function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8')
  const lines = content.split(/\r?\n/)

  let inBlockComment = false
  let changed = false

  const newLines = lines.map((line, index) => {
    const trimmed = line.trim()

    // 目前在多行註解內
    if (inBlockComment) {
      if (trimmed.includes('*/') || trimmed.includes('-->')) {
        inBlockComment = false
      }
      return line
    }

    // 多行註解開頭
    if (trimmed.startsWith('/*') || trimmed.startsWith('<!--')) {
      if (!trimmed.includes('*/') && !trimmed.includes('-->')) {
        inBlockComment = true
      }
      return line
    }

    // 整行註解
    if (isFullCommentLine(line)) return line

    // 先轉一次，看看有沒有差異
    const converted = convertLine(line)

    // 完全沒變 → 表示這行沒有需要 tw→cn 的字，直接跳過
    if (converted === line) return line

    // check 模式只印出「有變化的行」
    if (MODE === 'check') {
      console.log(`${filePath}:${index + 1}: ${line}`)
      return line
    }

    // convert 模式才真的寫入
    changed = true
    return converted
  })

  if (MODE === 'convert' && changed) {
    fs.writeFileSync(filePath, newLines.join('\n'), 'utf8')
    console.log(`已轉換：${filePath}`)
  }
}

// ================= 執行入口 =================

// 專案根目錄
const projectRoot = path.resolve(__dirname, '..')

// 從 src 底下開始掃
const srcRoot = path.join(projectRoot, 'src')

if (!fs.existsSync(srcRoot)) {
  console.error('找不到 src 資料夾，請確認專案結構')
  process.exit(1)
}

let files = []

// 1) 先掃 src 根目錄下的檔案（不遞迴）
fs.readdirSync(srcRoot, { withFileTypes: true })
  .filter((entry) => entry.isFile())
  .forEach((entry) => {
    if (exts.some((ext) => entry.name.endsWith(ext))) {
      files.push(path.join(srcRoot, entry.name))
    }
  })

// 2) 再掃限定的子資料夾（遞迴）
const targetSubDirs = [
  'apis',
  'components',
  'directives',
  'pages',
  'router',
  'stores',
  'styles',
  'types',
  'utils',
]

for (const sub of targetSubDirs) {
  const dir = path.join(srcRoot, sub)
  if (fs.existsSync(dir)) {
    getAllFiles(dir, exts, files)
  }
}

console.log(`模式：${MODE}`)
console.log(`共找到 ${files.length} 個檔案`)

if (MODE === 'check') {
  console.log('開始掃描是否仍有需要 tw→cn 的字串...')
} else {
  console.log('開始轉換繁體 → 簡體...')
}

files.forEach((filePath) => processFile(filePath))

console.log(MODE === 'check' ? '掃描完成！' : '全部轉換完成！')
