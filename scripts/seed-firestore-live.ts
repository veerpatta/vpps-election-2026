import { defaultCandidates, defaultElection, defaultVoters } from '../src/data/mockElectionData'
import { getElectionPost } from '../src/data/electionPosts'
import type { Candidate, Voter } from '../src/types/election'

const projectId = process.env.FIREBASE_PROJECT_ID ?? 'vpps-election-2026'
const token = process.env.FIRESTORE_ACCESS_TOKEN
const baseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`

if (!token) {
  throw new Error('FIRESTORE_ACCESS_TOKEN is required.')
}

function firestoreValue(value: unknown): Record<string, unknown> {
  if (value === null) return { nullValue: null }
  if (typeof value === 'boolean') return { booleanValue: value }
  if (typeof value === 'number') return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value }
  return { stringValue: String(value) }
}

function firestoreFields(input: Record<string, unknown>) {
  const fields: Record<string, Record<string, unknown>> = {}
  for (const [key, value] of Object.entries(input)) {
    if (typeof value === 'undefined') continue
    fields[key] = firestoreValue(value)
  }
  return fields
}

async function request(path: string, init: RequestInit) {
  const response = await fetch(`${baseUrl}/${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...init.headers,
    },
  })
  if (!response.ok) {
    throw new Error(`${init.method ?? 'GET'} ${path} failed: ${response.status} ${await response.text()}`)
  }
  return response
}

async function listDocuments(collectionName: string) {
  const response = await request(`${collectionName}?pageSize=1`, { method: 'GET' })
  const data = await response.json() as { documents?: unknown[] }
  return data.documents ?? []
}

async function patchDocument(path: string, data: Record<string, unknown>) {
  await request(path, {
    method: 'PATCH',
    body: JSON.stringify({ fields: firestoreFields(data) }),
  })
}

function candidatePayload(candidate: Candidate) {
  const post = getElectionPost(candidate.postId)
  return {
    id: candidate.id,
    name: candidate.name,
    classSection: candidate.classSection,
    rollNumber: candidate.rollNumber ?? null,
    postId: candidate.postId,
    postLabel: post?.label ?? candidate.postLabel ?? candidate.postId,
    house: post?.kind === 'house' ? post.house : candidate.house ?? null,
    captainGender: post?.captainGender ?? candidate.captainGender ?? null,
    category: candidate.category ?? null,
    photoUrl: candidate.photoUrl ?? null,
    imageUrl: candidate.photoUrl ?? null,
    symbol: candidate.symbol ?? null,
    slogan: candidate.slogan ?? null,
    approved: candidate.approved,
    active: candidate.active,
  }
}

function voterPayload(voter: Voter) {
  return {
    id: voter.id,
    voterName: voter.voterName,
    voterType: voter.voterType,
    classSection: voter.classSection ?? null,
    rollNumber: voter.rollNumber ?? null,
    house: voter.house ?? null,
    departmentOrRole: voter.departmentOrRole ?? null,
    votingId: voter.votingId,
    hasVoted: false,
    votedAt: null,
    active: voter.active,
  }
}

const existing = await Promise.all([
  listDocuments('elections'),
  listDocuments('candidates'),
  listDocuments('voters'),
  listDocuments('votes'),
])

if (existing.some((documents) => documents.length > 0)) {
  throw new Error('Firestore already contains election data. Refusing to overwrite live data.')
}

const now = new Date().toISOString()
await patchDocument('elections/current', {
  ...defaultElection,
  id: 'current',
  createdAt: defaultElection.createdAt,
  updatedAt: now,
  status: 'voting_open',
  resultsPublished: false,
})

for (const candidate of defaultCandidates) {
  await patchDocument(`candidates/${candidate.id}`, candidatePayload(candidate))
}

for (const voter of defaultVoters) {
  await patchDocument(`voters/${voter.id}`, voterPayload(voter))
}

console.log(`Seeded Firestore: 1 election, ${defaultCandidates.length} candidates, ${defaultVoters.length} voters, 0 votes.`)
