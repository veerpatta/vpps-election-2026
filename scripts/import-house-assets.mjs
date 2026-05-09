import { copyFile, mkdir, stat } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')

const assetMap = [
  {
    source: 'Gemini_Generated_Image_kl4i9ukl4i9ukl4i.png',
    target: 'public/houses/heroes/rana-pratap-hero.png',
  },
  {
    source: 'Gemini_Generated_Image_a1i86ua1i86ua1i8.png',
    target: 'public/houses/heroes/rana-kumbha-hero.png',
  },
  {
    source: 'Gemini_Generated_Image_avlit2avlit2avli.png',
    target: 'public/houses/heroes/bappa-rawal-hero.png',
  },
  {
    source: 'Gemini_Generated_Image_qkqgh9qkqgh9qkqg.png',
    target: 'public/houses/heroes/rana-sanga-hero.png',
  },
  {
    source: 'Gemini_Generated_Image_.png',
    target: 'public/houses/logos/rana-pratap-house-logo.png',
  },
  {
    source: 'Gemini_Generated_Image_9rqmlk9rqmlk9rqm.png',
    target: 'public/houses/logos/rana-kumbha-house-logo.png',
  },
  {
    source: 'Gemini_Generated_Image_f3zjgrf3zjgrf3zj.png',
    target: 'public/houses/logos/bappa-rawal-house-logo.png',
  },
  {
    source: 'Gemini_Generated_Image_oj21ovoj21ovoj21.png',
    target: 'public/houses/logos/rana-sanga-house-logo.png',
  },
]

const candidateRoots = [
  projectRoot,
  path.join(projectRoot, 'incoming-house-assets'),
  path.join(projectRoot, 'assets'),
  path.join(projectRoot, 'public'),
  path.join(os.homedir(), 'Downloads'),
  'D:\\Downloads',
]

async function safeIsDirectory(folder) {
  try {
    return (await stat(folder)).isDirectory()
  } catch {
    return false
  }
}

function uniqueFolders(folders) {
  const seen = new Set()
  return folders
    .map((folder) => path.resolve(folder))
    .filter((folder) => {
      const key = folder.toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
}

async function findAsset(fileName) {
  for (const root of uniqueFolders(candidateRoots)) {
    if (!(await safeIsDirectory(root))) continue
    const directPath = path.join(root, fileName)
    if (existsSync(directPath)) return directPath

    const nestedIncomingPath = path.join(root, 'incoming-house-assets', fileName)
    if (existsSync(nestedIncomingPath)) return nestedIncomingPath

    const nestedAssetsPath = path.join(root, 'assets', fileName)
    if (existsSync(nestedAssetsPath)) return nestedAssetsPath
  }
  return undefined
}

const found = []
const copied = []
const missing = []

await mkdir(path.join(projectRoot, 'public/houses/heroes'), { recursive: true })
await mkdir(path.join(projectRoot, 'public/houses/logos'), { recursive: true })

for (const asset of assetMap) {
  const sourcePath = await findAsset(asset.source)
  const targetPath = path.join(projectRoot, asset.target)

  if (!sourcePath) {
    missing.push(asset)
    continue
  }

  found.push({ ...asset, sourcePath })
  await mkdir(path.dirname(targetPath), { recursive: true })
  await copyFile(sourcePath, targetPath)
  copied.push({ ...asset, sourcePath, targetPath })
}

console.log('\nHouse asset import summary')
console.log('==========================')
console.log(`Found: ${found.length}/${assetMap.length}`)
for (const item of found) {
  console.log(`  FOUND  ${item.source} -> ${item.sourcePath}`)
}

console.log(`\nCopied: ${copied.length}/${assetMap.length}`)
for (const item of copied) {
  console.log(`  COPIED ${item.source} -> ${path.relative(projectRoot, item.targetPath)}`)
}

console.log(`\nMissing: ${missing.length}/${assetMap.length}`)
for (const item of missing) {
  console.log(`  MISSING ${item.source}`)
  console.log(`          Paste into incoming-house-assets/ or project root, then rerun npm run import:house-assets`)
}

if (missing.length === 0) {
  console.log('\nAll house assets were imported successfully.')
} else {
  console.log('\nSome assets are missing. The app fallback UI will still work.')
}
