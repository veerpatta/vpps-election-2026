import fs from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import XLSX from 'xlsx'
import JSZip from 'jszip'
import { XMLParser } from 'fast-xml-parser'

export const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
export const mappingPath = path.join(rootDir, 'data', 'candidate-photo-mapping.json')
export const csvReportPath = path.join(rootDir, 'exports', 'candidate-photo-mapping.csv')
export const summaryReportPath = path.join(rootDir, 'exports', 'candidate-processing-summary.md')
export const originalsDir = path.join(rootDir, 'public', 'candidates', 'originals')
export const finalDir = path.join(rootDir, 'public', 'candidates', 'final')
export const placeholdersDir = path.join(rootDir, 'public', 'candidates', 'placeholders')
export const realCandidatesPath = path.join(rootDir, 'src', 'data', 'realCandidates.ts')

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  removeNSPrefix: true,
})

const excelExtensions = new Set(['.xlsx', '.xlsm'])
const imageExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp'])

export const postIdAliases = {
  'cultural-captain-boy': 'cultural-captain-boys',
  'cultural-captain-boys': 'cultural-captain-boys',
  'cultural-captain-girl': 'cultural-captain-girls',
  'cultural-captain-girls': 'cultural-captain-girls',
  'sports-captain-boy': 'sports-captain-boys',
  'sports-captain-boys': 'sports-captain-boys',
  'sports-captain-girl': 'sports-captain-girls',
  'sports-captain-girls': 'sports-captain-girls',
  'discipline-captain-boy': 'discipline-captain-boys',
  'discipline-captain-boys': 'discipline-captain-boys',
  'discipline-captain-girl': 'discipline-captain-girls',
  'discipline-captain-girls': 'discipline-captain-girls',
}

export const supportedPostIds = new Set([
  'head-boy',
  'head-girl',
  'discipline-captain-boys',
  'discipline-captain-girls',
  'cultural-captain-boys',
  'cultural-captain-girls',
  'sports-captain-boys',
  'sports-captain-girls',
  'red-boys-house-captain',
  'red-girls-house-captain',
  'blue-boys-house-captain',
  'blue-girls-house-captain',
  'green-boys-house-captain',
  'green-girls-house-captain',
  'yellow-boys-house-captain',
  'yellow-girls-house-captain',
])

export const houseByName = {
  red: 'red',
  'rana pratap house': 'red',
  'rana pratap': 'red',
  blue: 'blue',
  'rana kumbha house': 'blue',
  'rana kumbha': 'blue',
  green: 'green',
  'bappa rawal house': 'green',
  'bappa rawal': 'green',
  yellow: 'yellow',
  'rana sanga house': 'yellow',
  'rana sanga': 'yellow',
}

export async function ensureWorkflowDirs() {
  await Promise.all([
    fs.mkdir(path.dirname(mappingPath), { recursive: true }),
    fs.mkdir(path.dirname(csvReportPath), { recursive: true }),
    fs.mkdir(originalsDir, { recursive: true }),
    fs.mkdir(finalDir, { recursive: true }),
    fs.mkdir(placeholdersDir, { recursive: true }),
  ])
}

export function toPosix(value) {
  return value.replaceAll(path.sep, '/')
}

export function publicUrlFor(absPath) {
  return `/${toPosix(path.relative(path.join(rootDir, 'public'), absPath))}`
}

export function slugify(value) {
  return String(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function asArray(value) {
  if (!value) return []
  return Array.isArray(value) ? value : [value]
}

export function text(value) {
  return String(value ?? '').trim()
}

export function normalizeGender(category, postId, postLabel) {
  const normalized = `${category} ${postId} ${postLabel}`.toLowerCase()
  if (/\bgirls?\b|\bfemale\b|\bgirl\b/.test(normalized)) return 'girls'
  if (/\bboys?\b|\bmale\b|\bboy\b/.test(normalized)) return 'boys'
  return undefined
}

function genderSeparatedPost(postId, postLabel, category) {
  const normalized = `${postId} ${postLabel}`.toLowerCase()
  const gender = normalizeGender(category, postId, postLabel)
  if (!gender) return undefined
  if (/\b(discipline|dicipline|disciplinary)\b/.test(normalized)) return `discipline-captain-${gender}`
  if (/\b(cultural|cluthural|culture)\b/.test(normalized)) return `cultural-captain-${gender}`
  if (/\b(sports?|sport)\b/.test(normalized)) return `sports-captain-${gender}`
  return undefined
}

export function normalizeHouse(houseColor, houseName, postId) {
  const direct = houseByName[text(houseColor).toLowerCase()] ?? houseByName[text(houseName).toLowerCase()]
  if (direct) return direct
  const fromPost = /^([a-z]+)-/.exec(text(postId).toLowerCase())?.[1]
  return houseByName[fromPost] ?? undefined
}

export function normalizePostId(postId, postLabel, rowNotes = [], category = '') {
  const rawPostId = slugify(postId || postLabel)
  const mapped = genderSeparatedPost(rawPostId, postLabel, category) ?? postIdAliases[rawPostId] ?? rawPostId
  if (rawPostId && mapped !== rawPostId) {
    rowNotes.push(`Workbook post id ${rawPostId} normalized to app post id ${mapped}.`)
  }
  if (supportedPostIds.has(mapped)) return mapped

  const label = text(postLabel).toLowerCase()
  if (label.includes('head boy')) return 'head-boy'
  if (label.includes('head girl')) return 'head-girl'
  const fromLabel = genderSeparatedPost('', label, category)
  if (fromLabel) return fromLabel
  return mapped
}

export async function fileExists(filePath) {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

async function collectFiles(dir, maxDepth = 1) {
  const files = []
  async function walk(current, depth) {
    let entries
    try {
      entries = await fs.readdir(current, { withFileTypes: true })
    } catch {
      return
    }
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name)
      if (entry.isDirectory()) {
        if (depth < maxDepth && !['node_modules', '.git', 'dist'].includes(entry.name)) {
          await walk(fullPath, depth + 1)
        }
      } else {
        files.push(fullPath)
      }
    }
  }
  await walk(dir, 0)
  return files
}

export function candidateSearchDirs() {
  const dirs = [
    rootDir,
    path.join(rootDir, 'incoming-candidates'),
    path.join(rootDir, 'assets', 'incoming-candidates'),
    path.join(rootDir, 'assets'),
    path.join(rootDir, 'public'),
    path.join(os.homedir(), 'Downloads'),
    path.join(os.homedir(), 'Desktop'),
  ]

  for (const drive of ['C:', 'D:']) {
    dirs.push(path.join(`${drive}${path.sep}`, 'Downloads'))
  }

  return [...new Set(dirs.map((dir) => path.resolve(dir)))]
}

export async function countEmbeddedPhotos(workbookPath) {
  try {
    const zip = await JSZip.loadAsync(await fs.readFile(workbookPath))
    return Object.keys(zip.files).filter((name) => name.startsWith('xl/media/') && !name.endsWith('/')).length
  } catch {
    return 0
  }
}

export async function locateInputFiles() {
  const found = []
  for (const dir of candidateSearchDirs()) {
    found.push(...(await collectFiles(dir, dir === rootDir ? 1 : 0)))
  }

  const uniqueFiles = [...new Set(found)]
  const excelCandidates = []
  const imageCandidates = []

  for (const filePath of uniqueFiles) {
    const ext = path.extname(filePath).toLowerCase()
    const base = path.basename(filePath).toLowerCase()
    if (base.startsWith('~$')) continue
    if (excelExtensions.has(ext) && /candidate|election|photo|vpps/.test(base)) {
      const stat = await fs.stat(filePath)
      excelCandidates.push({
        filePath,
        mtimeMs: stat.mtimeMs,
        embeddedPhotoCount: await countEmbeddedPhotos(filePath),
      })
    }
    if (imageExtensions.has(ext)) {
      const stat = await fs.stat(filePath)
      const normalizedPath = toPosix(filePath).toLowerCase()
      let nameScore = 0
      if (/uniform|blazer|reference/.test(base)) nameScore += 300
      if (/img-20251027-wa0043/.test(base)) nameScore += 250
      if (/school/.test(base)) nameScore += 50
      if (normalizedPath.includes('/incoming-candidates/')) nameScore += 200
      imageCandidates.push({ filePath, mtimeMs: stat.mtimeMs, nameScore })
    }
  }

  excelCandidates.sort((a, b) => b.embeddedPhotoCount - a.embeddedPhotoCount || b.mtimeMs - a.mtimeMs)
  imageCandidates.sort((a, b) => b.nameScore - a.nameScore || b.mtimeMs - a.mtimeMs)

  return {
    excelFile: excelCandidates[0]?.filePath,
    uniformImage: imageCandidates[0]?.filePath,
    excelCandidates,
    imageCandidates,
  }
}

export function findCandidateSheet(workbook) {
  for (const sheetName of workbook.SheetNames) {
    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1, defval: '' })
    const headerRowIndex = rows.findIndex((row) => row.some((cell) => text(cell).toLowerCase() === 'candidate name'))
    if (headerRowIndex >= 0) {
      return { sheetName, rows, headerRowIndex }
    }
  }
  throw new Error('Could not find a candidate sheet with a Candidate Name header.')
}

export function buildHeaderMap(headerRow) {
  const map = new Map()
  headerRow.forEach((cell, index) => {
    const key = text(cell).toLowerCase()
    if (key) map.set(key, index)
  })
  return map
}

export function rowValue(row, headerMap, header) {
  const index = headerMap.get(header.toLowerCase())
  return index === undefined ? '' : text(row[index])
}

export function recordsFromSheet(sheetInfo) {
  const headerMap = buildHeaderMap(sheetInfo.rows[sheetInfo.headerRowIndex])
  const records = []
  for (let rowIndex = sheetInfo.headerRowIndex + 1; rowIndex < sheetInfo.rows.length; rowIndex += 1) {
    const row = sheetInfo.rows[rowIndex]
    const candidateName = rowValue(row, headerMap, 'Candidate Name')
    if (!candidateName) continue

    const notes = []
    const rawPostId = rowValue(row, headerMap, 'Post ID')
    const postLabel = rowValue(row, headerMap, 'Post')
    const category = rowValue(row, headerMap, 'Category')
    const postId = normalizePostId(rawPostId, postLabel, notes, category)
    const house = normalizeHouse(rowValue(row, headerMap, 'House Color'), rowValue(row, headerMap, 'House Name'), postId)
    const captainGender = postId.includes('house-captain') || /-(boys|girls)$/.test(postId)
      ? normalizeGender(category, rawPostId, postLabel)
      : undefined

    records.push({
      rowNumber: rowIndex + 1,
      candidateName,
      post: postLabel,
      rawPostId,
      normalizedPostId: postId,
      postLabel,
      house,
      houseName: rowValue(row, headerMap, 'House Name'),
      houseColor: rowValue(row, headerMap, 'House Color'),
      category,
      gender: normalizeGender(category, rawPostId, postLabel),
      captainGender,
      class: rowValue(row, headerMap, 'Class'),
      ballotOrder: rowValue(row, headerMap, 'Ballot Order'),
      officialVoterListName: rowValue(row, headerMap, 'Official Voter List Name'),
      voterListHouse: rowValue(row, headerMap, 'Voter List House'),
      workbookPhotoFilename: rowValue(row, headerMap, 'Photo Filename'),
      workbookAppPhotoPath: rowValue(row, headerMap, 'App Photo Path'),
      hasEmbeddedPhoto: false,
      extractedOriginalPath: '',
      finalImagePath: '',
      placeholderUsed: false,
      notes,
    })
  }
  return records
}

function relTargetToPath(baseDir, target) {
  const cleanTarget = target.replace(/^\/+/, '')
  if (cleanTarget.startsWith('xl/')) return cleanTarget
  return path.posix.normalize(path.posix.join(baseDir, cleanTarget))
}

async function parseXmlFile(zip, filePath) {
  const file = zip.file(filePath)
  if (!file) return undefined
  return parser.parse(await file.async('text'))
}

function relationshipsById(relsXml, baseDir) {
  const map = new Map()
  const rels = asArray(relsXml?.Relationships?.Relationship)
  for (const rel of rels) {
    const id = rel['@_Id']
    const target = rel['@_Target']
    if (id && target) map.set(id, relTargetToPath(baseDir, target))
  }
  return map
}

export async function imageAnchorsByRow(workbookPath, sheetName) {
  const zip = await JSZip.loadAsync(await fs.readFile(workbookPath))
  const workbookXml = await parseXmlFile(zip, 'xl/workbook.xml')
  const workbookRelsXml = await parseXmlFile(zip, 'xl/_rels/workbook.xml.rels')
  const workbookRels = relationshipsById(workbookRelsXml, 'xl')
  const sheet = asArray(workbookXml?.workbook?.sheets?.sheet).find((item) => item['@_name'] === sheetName)
  if (!sheet) return new Map()

  const sheetPath = workbookRels.get(sheet['@_id'])
  if (!sheetPath) return new Map()

  const sheetDir = path.posix.dirname(sheetPath)
  const sheetRelsPath = path.posix.join(sheetDir, '_rels', `${path.posix.basename(sheetPath)}.rels`)
  const sheetXml = await parseXmlFile(zip, sheetPath)
  const sheetRelsXml = await parseXmlFile(zip, sheetRelsPath)
  const sheetRels = relationshipsById(sheetRelsXml, sheetDir)
  const drawingRelId = sheetXml?.worksheet?.drawing?.['@_id']
  const drawingPath = sheetRels.get(drawingRelId)
  if (!drawingPath) return new Map()

  const drawingDir = path.posix.dirname(drawingPath)
  const drawingRelsPath = path.posix.join(drawingDir, '_rels', `${path.posix.basename(drawingPath)}.rels`)
  const drawingXml = await parseXmlFile(zip, drawingPath)
  const drawingRelsXml = await parseXmlFile(zip, drawingRelsPath)
  const drawingRels = relationshipsById(drawingRelsXml, drawingDir)

  const anchors = [
    ...asArray(drawingXml?.wsDr?.oneCellAnchor),
    ...asArray(drawingXml?.wsDr?.twoCellAnchor),
  ]

  const byRow = new Map()
  for (const anchor of anchors) {
    const rowNumber = Number(anchor?.from?.row) + 1
    const colNumber = Number(anchor?.from?.col) + 1
    const relId = anchor?.pic?.blipFill?.blip?.['@_embed']
    const mediaPath = drawingRels.get(relId)
    if (!Number.isFinite(rowNumber) || !mediaPath) continue
    byRow.set(rowNumber, {
      rowNumber,
      colNumber,
      relId,
      mediaPath,
      sourceName: path.posix.basename(mediaPath),
    })
  }
  return { byRow, zip }
}

export async function writeJson(filePath, value) {
  await fs.mkdir(path.dirname(filePath), { recursive: true })
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`)
}

export function csvEscape(value) {
  return `"${String(value ?? '').replaceAll('"', '""')}"`
}

export async function writeMappingCsv(records) {
  const headers = [
    'rowNumber',
    'candidateName',
    'post',
    'house',
    'category',
    'class',
    'hasEmbeddedPhoto',
    'extractedOriginalPath',
    'finalImagePath',
    'placeholderUsed',
    'notes',
  ]
  const lines = [
    headers.map(csvEscape).join(','),
    ...records.map((record) => headers.map((header) => csvEscape(header === 'notes' ? record.notes.join(' ') : record[header])).join(',')),
  ]
  await fs.mkdir(path.dirname(csvReportPath), { recursive: true })
  await fs.writeFile(csvReportPath, `${lines.join('\n')}\n`)
}

export async function readMapping() {
  return JSON.parse(await fs.readFile(mappingPath, 'utf8'))
}

export async function writeMapping(payload) {
  await writeJson(mappingPath, payload)
  await writeMappingCsv(payload.records)
}

export function placeholderPathFor(record) {
  if (record.gender === 'girls') return '/candidates/placeholders/girls-placeholder.svg'
  if (record.gender === 'boys') return '/candidates/placeholders/boys-placeholder.svg'
  return '/candidates/placeholders/neutral-placeholder.svg'
}

function placeholderSvg(title, accent, initialsText) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="768" height="1024" viewBox="0 0 768 1024" role="img" aria-label="${title}">
  <rect width="768" height="1024" fill="#f8fafc"/>
  <rect x="56" y="56" width="656" height="912" rx="36" fill="#ffffff" stroke="#d8b44a" stroke-width="8"/>
  <circle cx="384" cy="316" r="118" fill="#0b1f3a"/>
  <path d="M194 762c24-154 112-236 190-236s166 82 190 236" fill="#0b1f3a"/>
  <path d="M246 628h276l-42 226H288z" fill="#0f172a"/>
  <path d="M334 526h100l-50 84z" fill="#ffffff"/>
  <path d="M360 610h48l24 172h-96z" fill="${accent}"/>
  <circle cx="504" cy="650" r="38" fill="#ffffff" stroke="#d8b44a" stroke-width="6"/>
  <text x="504" y="662" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" font-weight="700" fill="#0b1f3a">VPPS</text>
  <text x="384" y="888" text-anchor="middle" font-family="Arial, sans-serif" font-size="42" font-weight="800" fill="#0b1f3a">${initialsText}</text>
</svg>
`
}

export async function ensurePlaceholders() {
  await fs.mkdir(placeholdersDir, { recursive: true })
  await fs.writeFile(path.join(placeholdersDir, 'boys-placeholder.svg'), placeholderSvg('Boys candidate placeholder', '#123c7c', 'PHOTO PENDING'))
  await fs.writeFile(path.join(placeholdersDir, 'girls-placeholder.svg'), placeholderSvg('Girls candidate placeholder', '#d8b44a', 'PHOTO PENDING'))
  await fs.writeFile(path.join(placeholdersDir, 'neutral-placeholder.svg'), placeholderSvg('Candidate placeholder', '#64748b', 'PHOTO PENDING'))
}

export async function writeSummary(payload, extra = {}) {
  const records = payload.records ?? []
  const lines = [
    '# Candidate Processing Summary',
    '',
    `Generated at: ${new Date().toISOString()}`,
    '',
    `- Excel file: ${payload.excelFile ?? ''}`,
    `- Uniform image: ${payload.uniformImage ?? ''}`,
    `- Candidate rows found: ${records.length}`,
    `- Embedded photos found: ${records.filter((record) => record.hasEmbeddedPhoto).length}`,
    `- Portraits generated: ${records.filter((record) => record.hasEmbeddedPhoto && record.finalImagePath).length}`,
    `- Placeholders assigned: ${records.filter((record) => record.placeholderUsed).length}`,
    `- Originals folder: public/candidates/originals/`,
    `- Final folder: public/candidates/final/`,
    '',
    '## Manual Review',
    '',
  ]
  const manualReviewNotes = (record) => record.notes.filter((note) =>
    !note.startsWith('Extracted from ') &&
    note !== 'Generated final school-election portrait.' &&
    note !== 'Existing final portrait reused.'
  )
  const reviewRows = records.filter((record) => manualReviewNotes(record).length > 0 || !record.hasEmbeddedPhoto || !supportedPostIds.has(record.normalizedPostId))
  if (reviewRows.length === 0) {
    lines.push('- None.')
  } else {
    for (const record of reviewRows) {
      lines.push(`- Row ${record.rowNumber}: ${record.candidateName} - ${manualReviewNotes(record).join(' ') || 'No embedded photo.'}`)
    }
  }
  if (extra.note) {
    lines.push('', '## Notes', '', extra.note)
  }
  await fs.mkdir(path.dirname(summaryReportPath), { recursive: true })
  await fs.writeFile(summaryReportPath, `${lines.join('\n')}\n`)
}

export function relativeFromRoot(absPath) {
  return toPosix(path.relative(rootDir, absPath))
}
