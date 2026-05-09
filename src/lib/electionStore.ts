import { createDefaultStore, requiredPosts } from '../data/mockElectionData'
import type {
  Candidate,
  CouncilPost,
  ElectionStatus,
  ElectionStore,
  PostResult,
  Voter,
  Vote,
} from '../types/election'
import { downloadCsv } from './utils'

const STORAGE_KEY = 'vpps-election-2026-store'

function createId(prefix: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function readStore(): ElectionStore {
  const fallback = createDefaultStore()

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fallback))
      return fallback
    }
    return JSON.parse(raw) as ElectionStore
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fallback))
    return fallback
  }
}

function writeStore(store: ElectionStore) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}

export function getElection() {
  return readStore().election
}

export function updateElectionStatus(status: ElectionStatus) {
  const store = readStore()
  store.election = {
    ...store.election,
    status,
    resultsPublished: status === 'results_published',
    updatedAt: new Date().toISOString(),
  }
  writeStore(store)
  return store.election
}

export function getCandidates() {
  return readStore().candidates
}

export function getVotingCandidates(post?: CouncilPost) {
  return getCandidates().filter(
    (candidate) => candidate.approved && candidate.active && (!post || candidate.post === post),
  )
}

export function saveCandidate(
  candidate: Partial<Candidate> & Pick<Candidate, 'name' | 'classSection' | 'post' | 'symbol'>,
) {
  const store = readStore()
  const index = candidate.id ? store.candidates.findIndex((item) => item.id === candidate.id) : -1
  const next: Candidate = {
    id: candidate.id ?? createId('candidate'),
    name: candidate.name,
    classSection: candidate.classSection,
    rollNumber: candidate.rollNumber,
    post: candidate.post,
    photoUrl: candidate.photoUrl,
    symbol: candidate.symbol,
    slogan: candidate.slogan,
    approved: candidate.approved ?? true,
    active: candidate.active ?? true,
  }
  if (index >= 0) store.candidates[index] = next
  else store.candidates.unshift(next)
  writeStore(store)
  return next
}

export function toggleCandidate(candidateId: string, key: 'approved' | 'active') {
  const store = readStore()
  store.candidates = store.candidates.map((candidate) =>
    candidate.id === candidateId ? { ...candidate, [key]: !candidate[key] } : candidate,
  )
  writeStore(store)
}

export function getVoters() {
  return readStore().voters
}

export function saveVoter(voter: Partial<Voter> & Pick<Voter, 'voterName' | 'voterType' | 'votingId'>) {
  const store = readStore()
  const index = voter.id ? store.voters.findIndex((item) => item.id === voter.id) : -1
  const next: Voter = {
    id: voter.id ?? createId('voter'),
    voterName: voter.voterName,
    voterType: voter.voterType,
    classSection: voter.classSection,
    rollNumber: voter.rollNumber,
    departmentOrRole: voter.departmentOrRole,
    votingId: voter.votingId,
    hasVoted: voter.hasVoted ?? false,
    votedAt: voter.votedAt,
    active: voter.active ?? true,
  }
  if (index >= 0) store.voters[index] = next
  else store.voters.unshift(next)
  writeStore(store)
  return next
}

export function generateVotingId(existingIds = getVoters().map((voter) => voter.votingId)) {
  while (true) {
    const votingId = String(Math.floor(100000 + Math.random() * 900000))
    if (!existingIds.includes(votingId)) return votingId
  }
}

export function toggleVoterActive(voterId: string) {
  const store = readStore()
  store.voters = store.voters.map((voter) =>
    voter.id === voterId ? { ...voter, active: !voter.active } : voter,
  )
  writeStore(store)
}

export function resetVoterForDemo(voterId: string) {
  const store = readStore()
  store.voters = store.voters.map((voter) =>
    voter.id === voterId ? { ...voter, hasVoted: false, votedAt: undefined } : voter,
  )
  writeStore(store)
}

export function validateVotingId(votingId: string) {
  const store = readStore()
  const voter = store.voters.find((item) => item.votingId === votingId)

  if (store.election.status !== 'voting_open') {
    return { ok: false as const, message: 'Voting is currently closed. Please contact the election incharge.' }
  }
  if (!voter || !voter.active) {
    return { ok: false as const, message: 'This Voting ID was not found. Please check and try again.' }
  }
  if (voter.hasVoted) {
    return { ok: false as const, message: 'This Voting ID has already been used for voting.' }
  }
  return { ok: true as const, voter }
}

export function submitVote(votingId: string, selectedCandidateIds: Record<CouncilPost, string>) {
  const store = readStore()
  const voter = store.voters.find((item) => item.votingId === votingId)

  if (store.election.status !== 'voting_open') throw new Error('Voting is currently closed. Please contact the election incharge.')
  if (!voter || !voter.active) throw new Error('This Voting ID was not found. Please check and try again.')
  if (voter.hasVoted) throw new Error('This Voting ID has already been used for voting.')

  const allowed = store.candidates.filter((candidate) => candidate.approved && candidate.active)
  for (const post of requiredPosts) {
    const candidate = allowed.find((item) => item.id === selectedCandidateIds[post] && item.post === post)
    if (!candidate) throw new Error(`Please select one candidate for ${post}.`)
  }

  const timestamp = new Date().toISOString()
  const votes: Vote[] = requiredPosts.map((post) => ({
    id: createId('vote'),
    electionId: store.election.id,
    post,
    candidateId: selectedCandidateIds[post],
    timestamp,
  }))

  store.votes.push(...votes)
  store.voters = store.voters.map((item) =>
    item.votingId === votingId ? { ...item, hasVoted: true, votedAt: timestamp } : item,
  )
  writeStore(store)
}

export function getResults(): PostResult[] {
  const store = readStore()
  return requiredPosts.map((post) => {
    const rows = store.candidates
      .filter((candidate) => candidate.post === post && candidate.approved && candidate.active)
      .map((candidate) => ({
        candidate,
        votes: store.votes.filter((vote) => vote.candidateId === candidate.id).length,
        isWinner: false,
      }))
      .sort((a, b) => b.votes - a.votes || a.candidate.name.localeCompare(b.candidate.name))
    const topVotes = rows[0]?.votes ?? 0
    const markedRows = rows.map((row) => ({ ...row, isWinner: topVotes > 0 && row.votes === topVotes }))
    return {
      post,
      totalVotes: store.votes.filter((vote) => vote.post === post).length,
      winner: markedRows.find((row) => row.isWinner)?.candidate,
      rows: markedRows,
    }
  })
}

export function exportResultsCsv() {
  const rows = [
    ['Post', 'Candidate', 'Class', 'Votes', 'Result'],
    ...getResults().flatMap((result) =>
      result.rows.map((row) => [
        result.post,
        row.candidate.name,
        row.candidate.classSection,
        String(row.votes),
        row.isWinner ? 'Winner' : '',
      ]),
    ),
  ]
  downloadCsv('vpps-election-2026-results.csv', rows)
}

export function getDashboardStats() {
  const store = readStore()
  const activeVoters = store.voters.filter((voter) => voter.active)
  const votesCast = store.voters.filter((voter) => voter.hasVoted).length
  return {
    election: store.election,
    totalVoters: store.voters.length,
    studentVoters: store.voters.filter((voter) => voter.voterType === 'student').length,
    teacherVoters: store.voters.filter((voter) => voter.voterType === 'teacher').length,
    votesCast,
    pendingVotes: Math.max(activeVoters.length - votesCast, 0),
    approvedCandidates: store.candidates.filter((candidate) => candidate.approved && candidate.active).length,
    turnout: activeVoters.length ? Math.round((votesCast / activeVoters.length) * 100) : 0,
  }
}

export function resetDemoData() {
  const store = createDefaultStore()
  writeStore(store)
  return store
}

export function getStoreForChecks() {
  return readStore()
}
