import assert from 'node:assert/strict'
import fs from 'node:fs'
import { normalizePostId } from './candidate-workflow.mjs'

const cases = [
  ['Discipline Captain Boy', 'Boy', 'discipline-captain-boys'],
  ['Discipline Captain Girl', 'Girl', 'discipline-captain-girls'],
  ['Dicipline', 'Male', 'discipline-captain-boys'],
  ['Disciplinary', 'Female', 'discipline-captain-girls'],
  ['Cultural Captain Boy', 'Boy', 'cultural-captain-boys'],
  ['Cultural Captain Girl', 'Girl', 'cultural-captain-girls'],
  ['Cluthural', 'Male', 'cultural-captain-boys'],
  ['Culture', 'Female', 'cultural-captain-girls'],
  ['Sports Captain Boy', 'Boy', 'sports-captain-boys'],
  ['Sports Captain Girl', 'Girl', 'sports-captain-girls'],
  ['Sport', 'Male', 'sports-captain-boys'],
]

for (const [post, category, expected] of cases) {
  const notes = []
  assert.equal(normalizePostId('', post, notes, category), expected, `${post} / ${category}`)
}

const source = fs.readFileSync('src/data/realCandidates.ts', 'utf8')
const postConfig = fs.readFileSync('src/data/electionPosts.ts', 'utf8')
const mapping = JSON.parse(fs.readFileSync('data/candidate-photo-mapping.json', 'utf8'))
const requiredIds = [
  'discipline-captain-boys',
  'discipline-captain-girls',
  'cultural-captain-boys',
  'cultural-captain-girls',
  'sports-captain-boys',
  'sports-captain-girls',
]

for (const postId of requiredIds) {
  assert.match(source, new RegExp(`postId: "${postId}"`), `${postId} must exist in real candidate data`)
  assert.match(postConfig, new RegExp(`id: '${postId}'`), `${postId} must exist in post configuration`)
  assert(mapping.records.some((record) => record.normalizedPostId === postId), `${postId} must exist in candidate mapping`)
}

for (const mergedId of ['discipline-captain"', 'cultural-captain"', 'sports-captain"']) {
  assert.doesNotMatch(source, new RegExp(`postId: "${mergedId}`), `${mergedId} must not be used as a merged candidate post`)
}

for (const record of mapping.records) {
  if (record.post.includes('Discipline Captain Boy')) assert.equal(record.normalizedPostId, 'discipline-captain-boys')
  if (record.post.includes('Discipline Captain Girl')) assert.equal(record.normalizedPostId, 'discipline-captain-girls')
  if (record.post.includes('Cultural Captain Boy')) assert.equal(record.normalizedPostId, 'cultural-captain-boys')
  if (record.post.includes('Cultural Captain Girl')) assert.equal(record.normalizedPostId, 'cultural-captain-girls')
  if (record.post.includes('Sports Captain Boy')) assert.equal(record.normalizedPostId, 'sports-captain-boys')
  if (record.post.includes('Sports Captain Girl')) assert.equal(record.normalizedPostId, 'sports-captain-girls')
}

console.log('Gender-separated election post verification passed.')
