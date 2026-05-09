import { createDefaultStore, defaultCandidates, defaultVoters } from '../data/mockElectionData'
import {
  GENERAL_POSTS,
  HOUSE_CAPTAIN_POSTS,
  getElectionPost,
  getLegacyPostId,
  getPostLabel,
  getPostsForVoter,
} from '../data/electionPosts'
import type {
  Candidate,
  ElectionPostId,
  ElectionStatus,
  ElectionStore,
  HouseId,
  PostResult,
  Voter,
  Vote,
} from '../types/election'
import { houseOrder, houses } from './houses'
import { downloadCsv } from './utils'

const STORAGE_KEY = 'vpps-election-2026-store'

function createId(prefix: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function migrateStore(store: ElectionStore): ElectionStore {
  const candidates = Array.isArray(store.candidates)
    ? store.candidates
        .map((candidate) => migrateCandidate(candidate as Candidate & { post?: string }))
        .filter((candidate): candidate is Candidate => Boolean(candidate))
    : []
  const voters = Array.isArray(store.voters) ? [...store.voters] : []
  for (const demoVoter of defaultVoters) {
    const existingIndex = voters.findIndex((voter) => voter.votingId === demoVoter.votingId || voter.id === demoVoter.id)
    if (existingIndex >= 0) {
      voters[existingIndex] = {
        ...demoVoter,
        hasVoted: voters[existingIndex].hasVoted,
        votedAt: voters[existingIndex].votedAt,
        active: voters[existingIndex].active,
      }
    } else {
      voters.push({ ...demoVoter })
    }
  }

  const votes = Array.isArray(store.votes)
    ? store.votes
        .map((vote) => migrateVote(vote as Vote & { post?: string }, candidates))
        .filter((vote): vote is Vote => Boolean(vote))
    : []

  for (const demoCandidate of defaultCandidates) {
    const existingIndex = candidates.findIndex((candidate) => candidate.id === demoCandidate.id)
    if (existingIndex >= 0) {
      candidates[existingIndex] = {
        ...demoCandidate,
        photoUrl: candidates[existingIndex].photoUrl ?? demoCandidate.photoUrl,
        approved: candidates[existingIndex].approved,
        active: candidates[existingIndex].active,
      }
    } else {
      candidates.push({ ...demoCandidate })
    }
  }

  return {
    ...store,
    voters,
    candidates,
    votes,
  }
}

function migrateCandidate(candidate: Candidate & { post?: string }): Candidate | undefined {
  const postId = candidate.postId ?? getLegacyPostId(candidate.post, candidate.house, candidate.captainGender)
  const post = getElectionPost(postId)
  if (!post) return undefined

  return {
    ...candidate,
    postId: post.id,
    postLabel: post.label,
    house: post.kind === 'house' ? post.house : undefined,
    captainGender: post.kind === 'house' ? post.captainGender : undefined,
  }
}

function migrateVote(vote: Vote & { post?: string }, candidates: Candidate[]): Vote | undefined {
  const candidatePostId = candidates.find((candidate) => candidate.id === vote.candidateId)?.postId
  const postId = vote.postId ?? getLegacyPostId(vote.post) ?? candidatePostId
  if (!postId || !getElectionPost(postId)) return undefined
  return {
    ...vote,
    postId,
    post: getPostLabel(postId),
  }
}

function readStore(): ElectionStore {
  const fallback = createDefaultStore()

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fallback))
      return fallback
    }
    const parsed = JSON.parse(raw) as ElectionStore
    const migrated = migrateStore(parsed)
    if (JSON.stringify(parsed) !== JSON.stringify(migrated)) writeStore(migrated)
    return migrated
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

export function getVotingCandidates(postId?: ElectionPostId) {
  return getCandidates().filter((candidate) => {
    if (!candidate.approved || !candidate.active) return false
    if (!postId) return true
    return candidate.postId === postId
  })
}

export function getBallotPosts(voter: Voter) {
  return getPostsForVoter(voter)
}

export function saveCandidate(
  candidate: Partial<Candidate> & Pick<Candidate, 'name' | 'classSection' | 'postId'>,
) {
  const store = readStore()
  const index = candidate.id ? store.candidates.findIndex((item) => item.id === candidate.id) : -1
  const post = getElectionPost(candidate.postId)
  if (!post) throw new Error('Please select a valid post.')
  const next: Candidate = {
    id: candidate.id ?? createId('candidate'),
    name: candidate.name,
    classSection: candidate.classSection,
    rollNumber: candidate.rollNumber,
    postId: post.id,
    postLabel: post.label,
    house: post.kind === 'house' ? post.house : undefined,
    captainGender: post.kind === 'house' ? post.captainGender : undefined,
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
    house: voter.house,
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
  const used = new Set(existingIds)
  for (let attempt = 0; attempt < 2000; attempt += 1) {
    const votingId = String(Math.floor(Math.random() * 1000000)).padStart(6, '0')
    if (votingId === '000000') continue
    if (!used.has(votingId)) {
      used.add(votingId)
      return votingId
    }
  }
  throw new Error('Could not generate a unique Voting ID. Please try again.')
}

export function importVoters(voters: Array<Omit<Voter, 'id' | 'hasVoted' | 'active'> & Partial<Pick<Voter, 'id' | 'hasVoted' | 'active'>>>) {
  const store = readStore()
  const imported = voters.map((voter) => ({
    id: voter.id ?? createId('voter'),
    voterName: voter.voterName,
    voterType: voter.voterType,
    classSection: voter.classSection,
    rollNumber: voter.rollNumber,
    departmentOrRole: voter.departmentOrRole,
    house: voter.house,
    votingId: voter.votingId,
    hasVoted: voter.hasVoted ?? false,
    votedAt: voter.votedAt,
    active: voter.active ?? true,
  }))
  store.voters.unshift(...imported)
  writeStore(store)
  return imported
}

function houseLabel(house?: HouseId | 'all') {
  if (!house) return ''
  if (house === 'all') return 'All Houses'
  return houses[house].name
}

export function exportVotingIdListCsv(voters = getVoters()) {
  const rows = [
    ['Voter Name', 'Voter Type', 'Class & Section', 'Roll Number / Admission Number', 'House', 'Department / Role', 'Voting ID'],
    ...voters.map((voter) => [
      voter.voterName,
      voter.voterType,
      voter.classSection ?? '',
      voter.rollNumber ?? '',
      houseLabel(voter.house),
      voter.departmentOrRole ?? '',
      voter.votingId,
    ]),
  ]
  downloadCsv('vpps-election-2026-voting-id-list.csv', rows)
}

export function downloadVoterTemplateCsv() {
  downloadCsv('vpps-voter-import-template.csv', [
    ['Voter Name', 'Voter Type', 'Class & Section', 'Roll Number / Admission Number', 'House', 'Department / Role', 'Notes'],
    ['Test Student Name', 'Student', 'Class 10 A', '01', 'Red', '', ''],
    ['Test Teacher Name', 'Teacher', '', '', '', 'Mathematics', ''],
  ])
}

export function exportResultsCsv() {
  const rows = [
    ['Post ID', 'Post', 'House', 'Captain Category', 'Candidate', 'Class', 'Votes', 'Result'],
    ...getResults().flatMap((result) =>
      result.rows.map((row) => [
        result.post.id,
        result.post.label,
        houseLabel(row.candidate.house),
        row.candidate.captainGender ?? '',
        row.candidate.name,
        row.candidate.classSection,
        String(row.votes),
        row.isWinner ? 'Winner' : '',
      ]),
    ),
  ]
  downloadCsv('vpps-election-2026-results.csv', rows)
}

function countVotesForCandidate(votes: Vote[], candidate: Candidate) {
  return votes.filter((vote) => vote.candidateId === candidate.id).length
}

export function getResults(): PostResult[] {
  const store = readStore()
  const resultPosts = [...GENERAL_POSTS, ...HOUSE_CAPTAIN_POSTS]

  return resultPosts.map((post) => {
    const rows = store.candidates
      .filter((candidate) => {
        if (!candidate.approved || !candidate.active) return false
        return candidate.postId === post.id
      })
      .map((candidate) => ({
        candidate,
        votes: countVotesForCandidate(store.votes, candidate),
        isWinner: false,
      }))
      .sort((a, b) => b.votes - a.votes || a.candidate.name.localeCompare(b.candidate.name))
    const topVotes = rows[0]?.votes ?? 0
    const markedRows = rows.map((row) => ({ ...row, isWinner: topVotes > 0 && row.votes === topVotes }))
    return {
      post,
      totalVotes: rows.reduce((sum, row) => sum + row.votes, 0),
      winner: markedRows.find((row) => row.isWinner)?.candidate,
      rows: markedRows,
    }
  })
}

export function getHouseStats() {
  const voters = getVoters()
  return houseOrder.map((house) => ({
    house,
    voters: voters.filter((voter) => voter.house === house).length,
    voted: voters.filter((voter) => voter.house === house && voter.hasVoted).length,
  }))
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
  if (voter.voterType === 'student' && (!voter.house || voter.house === 'all')) {
    return { ok: false as const, message: 'House is not assigned for this student. Please contact the election desk.' }
  }
  return { ok: true as const, voter }
}

export function submitVote(votingId: string, selectedCandidateIds: Partial<Record<ElectionPostId, string>>) {
  const store = readStore()
  const voter = store.voters.find((item) => item.votingId === votingId)

  if (store.election.status !== 'voting_open') throw new Error('Voting is currently closed. Please contact the election incharge.')
  if (!voter || !voter.active) throw new Error('This Voting ID was not found. Please check and try again.')
  if (voter.hasVoted) throw new Error('This Voting ID has already been used for voting.')
  if (voter.voterType === 'student' && (!voter.house || voter.house === 'all')) throw new Error('House is not assigned for this student. Please contact the election desk.')

  const ballotPosts = getBallotPosts(voter)
  for (const post of ballotPosts) {
    const allowedForPost = store.candidates.filter((candidate) => {
      if (!candidate.approved || !candidate.active) return false
      return candidate.postId === post.id
    })
    const candidate = allowedForPost.find((item) => item.id === selectedCandidateIds[post.id])
    if (!candidate) throw new Error(`Please select one candidate for ${post.label}.`)
  }

  const timestamp = new Date().toISOString()
  const votes: Vote[] = ballotPosts.map((post) => ({
    id: createId('vote'),
    electionId: store.election.id,
    postId: post.id,
    post: post.label,
    candidateId: selectedCandidateIds[post.id] as string,
    timestamp,
  }))

  store.votes.push(...votes)
  store.voters = store.voters.map((item) =>
    item.votingId === votingId ? { ...item, hasVoted: true, votedAt: timestamp } : item,
  )
  writeStore(store)
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
