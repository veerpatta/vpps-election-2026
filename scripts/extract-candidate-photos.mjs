import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import XLSX from 'xlsx'
import {
  ensurePlaceholders,
  ensureWorkflowDirs,
  fileExists,
  findCandidateSheet,
  imageAnchorsByRow,
  locateInputFiles,
  mappingPath,
  originalsDir,
  placeholderPathFor,
  publicUrlFor,
  readMapping,
  recordsFromSheet,
  relativeFromRoot,
  slugify,
  writeMapping,
  writeSummary,
} from './candidate-workflow.mjs'

function argValue(name) {
  const prefix = `--${name}=`
  return process.argv.find((arg) => arg.startsWith(prefix))?.slice(prefix.length)
}

async function main() {
  await ensureWorkflowDirs()
  await ensurePlaceholders()

  const located = await locateInputFiles()
  const excelInput = argValue('excel') ?? located.excelFile
  const uniformInput = argValue('uniform') ?? located.uniformImage
  const excelFile = excelInput ? path.resolve(excelInput) : ''
  const uniformImage = uniformInput ? path.resolve(uniformInput) : ''

  if (!excelFile || !(await fileExists(excelFile))) {
    throw new Error('Could not find the Excel file. Please place it in incoming-candidates/.')
  }
  if (!uniformImage || !(await fileExists(uniformImage))) {
    throw new Error('Could not find the uniform reference image. Please place it in incoming-candidates/.')
  }

  const workbook = XLSX.readFile(excelFile, { cellDates: false })
  const sheetInfo = findCandidateSheet(workbook)
  const records = recordsFromSheet(sheetInfo)
  const anchorsResult = await imageAnchorsByRow(excelFile, sheetInfo.sheetName)
  const anchorsByRow = anchorsResult.byRow
  const zip = anchorsResult.zip

  for (const record of records) {
    const anchor = anchorsByRow.get(record.rowNumber)
    if (!anchor) {
      record.placeholderUsed = true
      record.finalImagePath = placeholderPathFor(record)
      record.notes.push('No embedded source photo found; placeholder assigned.')
      continue
    }

    const mediaFile = zip.file(anchor.mediaPath)
    if (!mediaFile) {
      record.placeholderUsed = true
      record.finalImagePath = placeholderPathFor(record)
      record.notes.push(`Embedded image relationship found but media file ${anchor.mediaPath} is missing; placeholder assigned.`)
      continue
    }

    const ext = path.extname(anchor.mediaPath).toLowerCase() || '.jpg'
    const fileName = `${String(record.rowNumber).padStart(3, '0')}-${slugify(record.candidateName)}${ext}`
    const outputPath = path.join(originalsDir, fileName)
    await fs.writeFile(outputPath, await mediaFile.async('nodebuffer'))
    record.hasEmbeddedPhoto = true
    record.extractedOriginalPath = publicUrlFor(outputPath)
    record.finalImagePath = ''
    record.placeholderUsed = false
    record.notes.push(`Extracted from ${anchor.sourceName}.`)
  }

  const existing = await fileExists(mappingPath).then((exists) => (exists ? readMapping() : undefined))
  if (existing?.records) {
    const finalByKey = new Map(existing.records.map((record) => [`${record.rowNumber}:${record.candidateName}`, record.finalImagePath]))
    for (const record of records) {
      const previousFinal = finalByKey.get(`${record.rowNumber}:${record.candidateName}`)
      if (previousFinal && record.hasEmbeddedPhoto) record.finalImagePath = previousFinal
    }
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    excelFile,
    uniformImage,
    sheetName: sheetInfo.sheetName,
    records,
  }

  await writeMapping(payload)
  await writeSummary(payload)

  const withPhotos = records.filter((record) => record.hasEmbeddedPhoto).length
  const placeholders = records.filter((record) => record.placeholderUsed).length
  console.log(`Excel file: ${excelFile}`)
  console.log(`Uniform image: ${uniformImage}`)
  console.log(`Candidate rows found: ${records.length}`)
  console.log(`Embedded photos extracted: ${withPhotos}`)
  console.log(`Placeholders assigned: ${placeholders}`)
  console.log(`Mapping: ${relativeFromRoot(mappingPath)}`)
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
