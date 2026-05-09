import fs from 'node:fs/promises'
import fsSync from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import OpenAI, { toFile } from 'openai'
import {
  ensureWorkflowDirs,
  finalDir,
  fileExists,
  mappingPath,
  publicUrlFor,
  readMapping,
  relativeFromRoot,
  rootDir,
  slugify,
  writeMapping,
  writeSummary,
} from './candidate-workflow.mjs'

function argValue(name) {
  const prefix = `--${name}=`
  return process.argv.find((arg) => arg.startsWith(prefix))?.slice(prefix.length)
}

function hasFlag(name) {
  return process.argv.includes(`--${name}`)
}

function publicPathToAbs(publicPath) {
  const cleanPath = publicPath.startsWith('/') ? publicPath.slice(1) : publicPath
  return path.join(rootDir, 'public', cleanPath)
}

function uniformText(record) {
  if (record.gender === 'girls') {
    return 'navy blazer, white shirt, navy tie, yellow lanyard, school badge, navy skirt, white socks, black shoes'
  }
  if (record.gender === 'boys') {
    return 'navy blazer, white shirt, navy tie, yellow lanyard, school badge, navy trousers, black shoes'
  }
  return 'navy blazer, white shirt, navy tie, yellow lanyard, school badge, neat school uniform'
}

function portraitPrompt(record) {
  return [
    `Create a respectful school-election portrait for ${record.candidateName}.`,
    'Use the first reference image as the identity and face reference; preserve the student identity as much as possible.',
    'Use the second reference image only for school uniform styling.',
    `Uniform: ${uniformText(record)}.`,
    'Pose: folded hands / namaste, medium shot or three-quarter portrait, natural respectful expression.',
    'Style: clean realistic school portrait, neat grooming, consistent lighting, suitable for a web voting card.',
    'Background: simple light background with subtle school-election feel, not busy.',
    'Do not add text, campaign symbols, extra people, caricature styling, or unrelated accessories.',
  ].join(' ')
}

async function generateOne(client, payload, record, uniformImage, force) {
  const finalPath = path.join(finalDir, `${slugify(record.candidateName)}.png`)
  if (!force && (await fileExists(finalPath))) {
    record.finalImagePath = publicUrlFor(finalPath)
    record.placeholderUsed = false
    record.notes.push('Existing final portrait reused.')
    return 'reused'
  }

  const originalPath = publicPathToAbs(record.extractedOriginalPath)
  const imageInputs = [
    await toFile(fsSync.createReadStream(originalPath), path.basename(originalPath)),
    await toFile(fsSync.createReadStream(uniformImage), path.basename(uniformImage)),
  ]

  const response = await client.images.edit({
    model: process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1.5',
    image: imageInputs,
    prompt: portraitPrompt(record),
    size: process.env.OPENAI_IMAGE_SIZE || '1024x1536',
    quality: process.env.OPENAI_IMAGE_QUALITY || 'medium',
    input_fidelity: 'high',
  })

  const b64 = response.data?.[0]?.b64_json
  if (!b64) throw new Error(`No image data returned for ${record.candidateName}.`)

  await fs.writeFile(finalPath, Buffer.from(b64, 'base64'))
  record.finalImagePath = publicUrlFor(finalPath)
  record.placeholderUsed = false
  record.notes.push('Generated final school-election portrait.')
  return 'generated'
}

async function main() {
  await ensureWorkflowDirs()
  if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY required for portrait generation. Please set it, then tell me to continue.')
    process.exit(2)
  }
  if (!(await fileExists(mappingPath))) {
    throw new Error('Candidate mapping not found. Run npm run extract:candidate-photos first.')
  }

  const payload = await readMapping()
  const uniformInput = argValue('uniform') ?? payload.uniformImage
  const uniformImage = uniformInput ? path.resolve(uniformInput) : ''
  if (!uniformImage || !(await fileExists(uniformImage))) {
    throw new Error('Could not find the uniform reference image. Please place it in incoming-candidates/.')
  }

  const limit = Number(argValue('limit') ?? '0')
  const force = hasFlag('force')
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  let generated = 0
  let reused = 0
  let failed = 0
  let processed = 0

  for (const record of payload.records) {
    if (!record.hasEmbeddedPhoto) continue
    if (limit > 0 && processed >= limit) break
    processed += 1
    try {
      const result = await generateOne(client, payload, record, uniformImage, force)
      if (result === 'generated') generated += 1
      if (result === 'reused') reused += 1
      console.log(`${result}: row ${record.rowNumber} ${record.candidateName}`)
    } catch (error) {
      failed += 1
      record.notes.push(`Portrait generation failed: ${error.message}`)
      console.error(`failed: row ${record.rowNumber} ${record.candidateName}: ${error.message}`)
    }
  }

  await writeMapping(payload)
  await writeSummary(payload)
  console.log(`Portraits generated: ${generated}`)
  console.log(`Existing portraits reused: ${reused}`)
  console.log(`Portrait failures: ${failed}`)
  console.log(`Final images folder: ${relativeFromRoot(finalDir)}`)

  if (failed > 0) process.exit(1)
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
