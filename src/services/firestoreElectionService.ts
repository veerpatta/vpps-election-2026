import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  runTransaction,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type DocumentData,
  type DocumentReference,
} from 'firebase/firestore'
import { defaultCandidates, defaultElection, defaultVoters } from '../data/mockElectionData'
import { GENERAL_POSTS, HOUSE_CAPTAIN_POSTS, getElectionPost, getPostsForVoter } from '../data/electionPosts'
import { db } from '../lib/firebase'
import { houseOrder, houses } from '../lib/houses'
import { downloadCsv } from '../lib/utils'
import type { Candidate, Election, ElectionPostId, ElectionStatus, HouseId, PostResult, Voter, Vote } from '../types/election'
import { assertVoteSelectionsAreAllowed } from './electionRules'
import type { DashboardStats, ElectionService, HouseStats } from './types'

const CURRENT_ELECTION_DOC_ID = 'current'
const FIRESTORE_TIMEOUT_MS = 8000

function requireDb() {
  if (!db) throw new Error('Firestore is not configured.')
  return db
}

async function withFirestoreTimeout<T>(operation: Promise<T>) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error('Firestore live backend is not reachable. Confirm the Firebase project has a default Firestore database and the deployed rules are up to date.'))
    }, FIRESTORE_TIMEOUT_MS)
  })
  try {
    return await Promise.race([operation, timeout])
  } finally {
    if (timeoutId) clearTimeout(timeoutId)
  }
}

function createId(prefix: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return `${prefix}-${crypto.randomUUID()}`
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function dateString(value: unknown, fallback = new Date().toISOString()) {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
    return value.toDate().toISOString()
  }
  return fallback
}

function electionRef() {
  return doc(requireDb(), 'elections', CURRENT_ELECTION_DOC_ID) as DocumentReference<DocumentData>
}

function voterRef(voterId: string) {
  return doc(requireDb(), 'voters', voterId) as DocumentReference<DocumentData>
}

function candidateRef(candidateId: string) {
  return doc(requireDb(), 'candidates', candidateId) as DocumentReference<DocumentData>
}

function toElection(data?: DocumentData): Election {
  const fallback = {
    ...defaultElection,
    id: CURRENT_ELECTION_DOC_ID,
    status: 'draft' as ElectionStatus,
    resultsPublished: false,
    updatedAt: new Date().toISOString(),
  }
  if (!data) return fallback
  return {
    id: String(data.id ?? CURRENT_ELECTION_DOC_ID),
    title: String(data.title ?? fallback.title),
    academicYear: String(data.academicYear ?? fallback.academicYear),
    status: (data.status ?? fallback.status) as ElectionStatus,
    resultsPublished: Boolean(data.resultsPublished),
    createdAt: dateString(data.createdAt, fallback.createdAt),
    updatedAt: dateString(data.updatedAt, fallback.updatedAt),
  }
}

function toCandidate(id: string, data: DocumentData): Candidate {
  const post = getElectionPost(data.postId)
  return {
    id: String(data.id ?? id),
    name: String(data.name ?? ''),
    classSection: String(data.classSection ?? ''),
    rollNumber: data.rollNumber ? String(data.rollNumber) : undefined,
    postId: (post?.id ?? data.postId) as ElectionPostId,
    postLabel: data.postLabel ? String(data.postLabel) : post?.label,
    house: data.house as HouseId | undefined,
    captainGender: data.captainGender,
    category: data.category ? String(data.category) : undefined,
    photoUrl: data.photoUrl ?? data.imageUrl,
    symbol: data.symbol ? String(data.symbol) : undefined,
    slogan: data.slogan ? String(data.slogan) : undefined,
    approved: data.approved !== false,
    active: data.active !== false,
  }
}

function toVoter(id: string, data: DocumentData): Voter {
  return {
    id: String(data.id ?? id),
    voterName: String(data.voterName ?? ''),
    voterType: data.voterType === 'teacher' ? 'teacher' : 'student',
    classSection: data.classSection ? String(data.classSection) : undefined,
    rollNumber: data.rollNumber ? String(data.rollNumber) : undefined,
    departmentOrRole: data.departmentOrRole ? String(data.departmentOrRole) : undefined,
    house: data.house,
    votingId: String(data.votingId ?? ''),
    hasVoted: Boolean(data.hasVoted),
    votedAt: data.votedAt ? dateString(data.votedAt) : undefined,
    active: data.active !== false,
  }
}

function toVote(id: string, data: DocumentData): Vote {
  return {
    id: String(data.id ?? id),
    electionId: String(data.electionId ?? CURRENT_ELECTION_DOC_ID),
    postId: data.postId as ElectionPostId,
    candidateId: String(data.candidateId ?? ''),
    timestamp: dateString(data.createdAt ?? data.timestamp),
  }
}

function serializeElection(election: Election) {
  return {
    id: election.id,
    title: election.title,
    academicYear: election.academicYear,
    status: election.status,
    resultsPublished: election.resultsPublished,
    createdAt: election.createdAt,
    updatedAt: election.updatedAt,
  }
}

function serializeCandidate(candidate: Candidate) {
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

function serializeVoter(voter: Voter) {
  return {
    id: voter.id,
    voterName: voter.voterName,
    voterType: voter.voterType,
    classSection: voter.classSection ?? null,
    rollNumber: voter.rollNumber ?? null,
    house: voter.house ?? null,
    departmentOrRole: voter.departmentOrRole ?? null,
    votingId: voter.votingId,
    hasVoted: voter.hasVoted,
    votedAt: voter.votedAt ?? null,
    active: voter.active,
  }
}

async function getElection() {
  const snapshot = await withFirestoreTimeout(getDoc(electionRef()))
  return toElection(snapshot.data())
}

async function getCandidates() {
  const snapshot = await withFirestoreTimeout(getDocs(collection(requireDb(), 'candidates')))
  return snapshot.docs.map((item) => toCandidate(item.id, item.data()))
}

async function getVoters() {
  const snapshot = await withFirestoreTimeout(getDocs(collection(requireDb(), 'voters')))
  return snapshot.docs.map((item) => toVoter(item.id, item.data()))
}

async function getVotes() {
  const snapshot = await withFirestoreTimeout(getDocs(collection(requireDb(), 'votes')))
  return snapshot.docs.map((item) => toVote(item.id, item.data()))
}

function houseLabel(house?: HouseId | 'all') {
  if (!house) return ''
  if (house === 'all') return 'All Houses'
  return houses[house].name
}

function countVotesForCandidate(votes: Vote[], candidate: Candidate) {
  return votes.filter((vote) => vote.candidateId === candidate.id).length
}

async function getResults(): Promise<PostResult[]> {
  const [candidates, votes] = await Promise.all([getCandidates(), getVotes()])
  const resultPosts = [...GENERAL_POSTS, ...HOUSE_CAPTAIN_POSTS]

  return resultPosts.map((post) => {
    const rows = candidates
      .filter((candidate) => candidate.approved && candidate.active && candidate.postId === post.id)
      .map((candidate) => ({
        candidate,
        votes: countVotesForCandidate(votes, candidate),
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

async function getDashboardStats(): Promise<DashboardStats> {
  const [election, voters, candidates] = await Promise.all([getElection(), getVoters(), getCandidates()])
  const activeVoters = voters.filter((voter) => voter.active)
  const votesCast = voters.filter((voter) => voter.hasVoted).length
  return {
    election,
    totalVoters: voters.length,
    studentVoters: voters.filter((voter) => voter.voterType === 'student').length,
    teacherVoters: voters.filter((voter) => voter.voterType === 'teacher').length,
    votesCast,
    pendingVotes: Math.max(activeVoters.length - votesCast, 0),
    approvedCandidates: candidates.filter((candidate) => candidate.approved && candidate.active).length,
    turnout: activeVoters.length ? Math.round((votesCast / activeVoters.length) * 100) : 0,
  }
}

async function getHouseStats(): Promise<HouseStats[]> {
  const voters = await getVoters()
  return houseOrder.map((house) => ({
    house,
    voters: voters.filter((voter) => voter.house === house).length,
    voted: voters.filter((voter) => voter.house === house && voter.hasVoted).length,
  }))
}

async function getVoterByVotingId(votingId: string) {
  const snapshot = await withFirestoreTimeout(getDocs(query(collection(requireDb(), 'voters'), where('votingId', '==', votingId), limit(2))))
  if (snapshot.size > 1) throw new Error('This Voting ID is duplicated in Firestore. Please contact the election desk.')
  const voterDoc = snapshot.docs[0]
  return voterDoc ? toVoter(voterDoc.id, voterDoc.data()) : null
}

async function assertUniqueVotingId(voter: Partial<Voter> & Pick<Voter, 'votingId'>) {
  const snapshot = await withFirestoreTimeout(getDocs(query(collection(requireDb(), 'voters'), where('votingId', '==', voter.votingId), limit(2))))
  const conflict = snapshot.docs.find((item) => item.id !== voter.id)
  if (conflict) throw new Error('This Voting ID is already assigned to another voter.')
}

async function saveVoter(voter: Partial<Voter> & Pick<Voter, 'voterName' | 'voterType' | 'votingId'>) {
  await assertUniqueVotingId(voter)
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
  await withFirestoreTimeout(setDoc(voterRef(next.id), serializeVoter(next), { merge: true }))
  return next
}

async function saveCandidate(candidate: Partial<Candidate> & Pick<Candidate, 'name' | 'classSection' | 'postId'>) {
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
    captainGender: post.captainGender,
    category: candidate.category,
    photoUrl: candidate.photoUrl,
    symbol: candidate.symbol,
    slogan: candidate.slogan,
    approved: candidate.approved ?? true,
    active: candidate.active ?? true,
  }
  await withFirestoreTimeout(setDoc(candidateRef(next.id), serializeCandidate(next), { merge: true }))
  return next
}

async function generateVotingId(existingIds?: string[]) {
  const used = new Set(existingIds ?? (await getVoters()).map((voter) => voter.votingId))
  for (let attempt = 0; attempt < 2000; attempt += 1) {
    const votingId = String(Math.floor(Math.random() * 1000000)).padStart(6, '0')
    if (votingId === '000000') continue
    if (!used.has(votingId)) return votingId
  }
  throw new Error('Could not generate a unique Voting ID. Please try again.')
}

async function validateVotingId(votingId: string) {
  const [election, voter] = await Promise.all([getElection(), getVoterByVotingId(votingId)])
  if (election.status !== 'voting_open') return { ok: false as const, message: 'Voting is currently closed. Please contact the election incharge.' }
  if (!voter || !voter.active) return { ok: false as const, message: 'This Voting ID was not found. Please check and try again.' }
  if (voter.hasVoted) return { ok: false as const, message: 'This Voting ID has already been used for voting.' }
  if (voter.voterType === 'student' && (!voter.house || voter.house === 'all')) {
    return { ok: false as const, message: 'House is not assigned for this student. Please contact the election desk.' }
  }
  return { ok: true as const, voter }
}

async function submitVote(votingId: string, selectedCandidateIds: Partial<Record<ElectionPostId, string>>) {
  const voter = await getVoterByVotingId(votingId)
  if (!voter) throw new Error('This Voting ID was not found. Please check and try again.')

  const database = requireDb()
  const voterDocumentRef = voterRef(voter.id)
  const electionDocumentRef = electionRef()
  const selectedCandidates = await getCandidates()

  await withFirestoreTimeout(runTransaction(database, async (transaction) => {
    const [electionSnapshot, voterSnapshot] = await Promise.all([
      transaction.get(electionDocumentRef),
      transaction.get(voterDocumentRef),
    ])
    const election = toElection(electionSnapshot.data())
    const latestVoter = voterSnapshot.exists() ? toVoter(voterSnapshot.id, voterSnapshot.data()) : null

    if (election.status !== 'voting_open') throw new Error('Voting is currently closed. Please contact the election incharge.')
    if (!latestVoter || !latestVoter.active) throw new Error('This Voting ID was not found. Please check and try again.')
    if (latestVoter.hasVoted) throw new Error('This Voting ID has already been used for voting.')
    if (latestVoter.votingId !== votingId) throw new Error('This Voting ID could not be verified. Please contact the election desk.')
    if (latestVoter.voterType === 'student' && (!latestVoter.house || latestVoter.house === 'all')) {
      throw new Error('House is not assigned for this student. Please contact the election desk.')
    }

    assertVoteSelectionsAreAllowed(latestVoter, selectedCandidates, selectedCandidateIds)

    const timestamp = new Date().toISOString()
    for (const post of getPostsForVoter(latestVoter)) {
      const voteDocumentRef = doc(collection(database, 'votes'))
      transaction.set(voteDocumentRef, {
        id: voteDocumentRef.id,
        electionId: election.id,
        postId: post.id,
        candidateId: selectedCandidateIds[post.id],
        createdAt: timestamp,
      })
    }
    transaction.update(voterDocumentRef, {
      hasVoted: true,
      votedAt: timestamp,
    })
  }))
}

async function updateElectionStatus(status: ElectionStatus) {
  const previous = await getElection()
  const next: Election = {
    ...previous,
    status,
    resultsPublished: status === 'results_published',
    updatedAt: new Date().toISOString(),
  }
  await withFirestoreTimeout(setDoc(electionRef(), serializeElection(next), { merge: true }))
  return next
}

async function toggleCandidate(candidateId: string, key: 'approved' | 'active') {
  const snapshot = await withFirestoreTimeout(getDoc(candidateRef(candidateId)))
  if (!snapshot.exists()) return
  await withFirestoreTimeout(updateDoc(candidateRef(candidateId), { [key]: !snapshot.data()[key] }))
}

async function deleteCandidate(candidateId: string) {
  await withFirestoreTimeout(deleteDoc(candidateRef(candidateId)))
}

async function toggleVoterActive(voterId: string) {
  const snapshot = await withFirestoreTimeout(getDoc(voterRef(voterId)))
  if (!snapshot.exists()) return
  await withFirestoreTimeout(updateDoc(voterRef(voterId), { active: !snapshot.data().active }))
}

async function deleteVoter(voterId: string) {
  await withFirestoreTimeout(deleteDoc(voterRef(voterId)))
}

async function resetVoterForDemo(voterId: string) {
  await withFirestoreTimeout(updateDoc(voterRef(voterId), { hasVoted: false, votedAt: null }))
}

async function commitInChunks<T>(items: T[], writeItem: (batch: ReturnType<typeof writeBatch>, item: T) => void) {
  const database = requireDb()
  for (let index = 0; index < items.length; index += 450) {
    const batch = writeBatch(database)
    items.slice(index, index + 450).forEach((item) => writeItem(batch, item))
    await withFirestoreTimeout(batch.commit())
  }
}

async function deleteCollection(collectionName: 'candidates' | 'voters' | 'votes') {
  const snapshot = await withFirestoreTimeout(getDocs(collection(requireDb(), collectionName)))
  await commitInChunks(snapshot.docs, (batch, item) => batch.delete(item.ref))
}

async function seedDemoData(overwrite = false) {
  const [candidateSnapshot, voterSnapshot, voteSnapshot, electionSnapshot] = await Promise.all([
    withFirestoreTimeout(getDocs(collection(requireDb(), 'candidates'))),
    withFirestoreTimeout(getDocs(collection(requireDb(), 'voters'))),
    withFirestoreTimeout(getDocs(collection(requireDb(), 'votes'))),
    withFirestoreTimeout(getDoc(electionRef())),
  ])
  const hasData = candidateSnapshot.size > 0 || voterSnapshot.size > 0 || voteSnapshot.size > 0 || electionSnapshot.exists()
  if (hasData && !overwrite) throw new Error('Firestore already has election data. Confirm overwrite before seeding demo data.')

  if (overwrite) {
    await Promise.all([deleteCollection('candidates'), deleteCollection('voters'), deleteCollection('votes')])
  }

  const now = new Date().toISOString()
  await withFirestoreTimeout(setDoc(electionRef(), serializeElection({ ...defaultElection, id: CURRENT_ELECTION_DOC_ID, updatedAt: now })))
  await commitInChunks(defaultCandidates, (batch, candidate) => batch.set(candidateRef(candidate.id), serializeCandidate(candidate)))
  await commitInChunks(defaultVoters, (batch, voter) => batch.set(voterRef(voter.id), serializeVoter({ ...voter, hasVoted: false, votedAt: undefined })))
}

async function importVoters(voters: Array<Omit<Voter, 'id' | 'hasVoted' | 'active'> & Partial<Pick<Voter, 'id' | 'hasVoted' | 'active'>>>) {
  const existing = new Set((await getVoters()).map((voter) => voter.votingId))
  const imported: Voter[] = voters.map((voter) => {
    if (existing.has(voter.votingId)) throw new Error(`Voting ID ${voter.votingId} is already assigned.`)
    existing.add(voter.votingId)
    return {
      id: voter.id ?? createId('voter'),
      voterName: voter.voterName,
      voterType: voter.voterType,
      classSection: voter.classSection,
      rollNumber: voter.rollNumber,
      departmentOrRole: voter.departmentOrRole,
      house: voter.house,
      votingId: voter.votingId,
      hasVoted: voter.hasVoted ?? false,
      active: voter.active ?? true,
    }
  })
  await commitInChunks(imported, (batch, voter) => batch.set(voterRef(voter.id), serializeVoter(voter)))
  return imported
}

async function resetElectionRun() {
  await deleteCollection('votes')
  const voters = await getVoters()
  await commitInChunks(voters, (batch, voter) => batch.update(voterRef(voter.id), { hasVoted: false, votedAt: null }))
  await updateElectionStatus('voting_open')
}

async function resetDemoData() {
  await seedDemoData(true)
}

async function exportVotingIdListCsv(voters?: Voter[]) {
  const exportVoters = voters ?? (await getVoters())
  const rows = [
    ['Voter Name', 'Voter Type', 'Class & Section', 'Roll Number / Admission Number', 'House', 'Department / Role', 'Voting ID'],
    ...exportVoters.map((voter) => [
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

async function downloadVoterTemplateCsv() {
  downloadCsv('vpps-voter-import-template.csv', [
    ['Voter Name', 'Voter Type', 'Class & Section', 'Roll Number / Admission Number', 'House', 'Department / Role', 'Notes'],
    ['Test Student Name', 'Student', 'Class 10 A', '01', 'Red', '', ''],
    ['Test Teacher Name', 'Teacher', '', '', '', 'Mathematics', ''],
  ])
}

async function exportResultsCsv() {
  const rows = [
    ['Post ID', 'Post', 'House', 'Captain Category', 'Candidate', 'Class', 'Votes', 'Result'],
    ...(await getResults()).flatMap((result) =>
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

export const firestoreElectionService: ElectionService = {
  dataMode: {
    mode: 'firestore',
    label: 'Firestore Live Backend',
    isLive: true,
    warning: 'Live backend connected.',
  },
  getElection,
  updateElectionStatus,
  getCandidates,
  getVotingCandidates: async (postId) => {
    const candidates = await getCandidates()
    return candidates.filter((candidate) => candidate.approved && candidate.active && (!postId || candidate.postId === postId))
  },
  getBallotPosts: getPostsForVoter,
  saveCandidate,
  toggleCandidate,
  deleteCandidate,
  getVoters,
  getVoterByVotingId,
  saveVoter,
  generateVotingId,
  importVoters,
  exportVotingIdListCsv,
  downloadVoterTemplateCsv,
  exportResultsCsv,
  getResults,
  getHouseStats,
  toggleVoterActive,
  deleteVoter,
  resetVoterForDemo,
  validateVotingId,
  submitVote,
  getDashboardStats,
  resetDemoData,
  resetElectionRun,
  seedDemoData,
}
