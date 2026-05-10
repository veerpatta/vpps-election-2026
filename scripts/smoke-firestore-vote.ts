import { readFileSync } from 'node:fs'
import { initializeApp } from 'firebase/app'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  runTransaction,
  where,
} from 'firebase/firestore'
import { getPostsForVoter } from '../src/data/electionPosts'
import { assertVoteSelectionsAreAllowed } from '../src/services/electionRules'
import type { Candidate, Election, ElectionPostId, Voter } from '../src/types/election'

function loadLocalEnv() {
  const raw = readFileSync('.env.local', 'utf8')
  return Object.fromEntries(
    raw
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#') && line.includes('='))
      .map((line) => {
        const [key, ...value] = line.split('=')
        return [key, value.join('=')]
      }),
  )
}

const env = loadLocalEnv()
const app = initializeApp({
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
})
const db = getFirestore(app)
const votingId = process.argv[2] ?? '111111'

function dataWithId<T>(id: string, value: Record<string, unknown>) {
  return { id, ...value } as T
}

async function getVoterByVotingId(id: string) {
  const snapshot = await getDocs(query(collection(db, 'voters'), where('votingId', '==', id)))
  if (snapshot.size > 1) throw new Error(`Voting ID ${id} is duplicated.`)
  const voter = snapshot.docs[0]
  return voter ? dataWithId<Voter>(voter.id, voter.data()) : null
}

async function submitOnce() {
  const electionSnapshot = await getDoc(doc(db, 'elections', 'current')).catch((error) => {
    throw new Error(`Read election failed: ${error instanceof Error ? error.message : String(error)}`)
  })
  const candidateSnapshot = await getDocs(collection(db, 'candidates')).catch((error) => {
    throw new Error(`Read candidates failed: ${error instanceof Error ? error.message : String(error)}`)
  })
  const voter = await getVoterByVotingId(votingId).catch((error) => {
    throw new Error(`Read voter failed: ${error instanceof Error ? error.message : String(error)}`)
  })
  if (!electionSnapshot.exists()) throw new Error('Election document elections/current is missing.')
  if (!voter) throw new Error(`Voting ID ${votingId} was not found.`)

  const election = dataWithId<Election>(electionSnapshot.id, electionSnapshot.data())
  const candidates = candidateSnapshot.docs.map((item) => dataWithId<Candidate>(item.id, item.data()))
  const ballotPosts = getPostsForVoter(voter)
  const selections = Object.fromEntries(
    ballotPosts.map((post) => {
      const candidate = candidates.find((item) => item.approved && item.active && item.postId === post.id)
      if (!candidate) throw new Error(`No active candidate found for ${post.label}.`)
      return [post.id, candidate.id]
    }),
  ) as Partial<Record<ElectionPostId, string>>

  assertVoteSelectionsAreAllowed(voter, candidates, selections)

  const createdVoteIds: string[] = []
  await runTransaction(db, async (transaction) => {
    const voterRef = doc(db, 'voters', voter.id)
    const currentVoterSnapshot = await transaction.get(voterRef)
    const currentElectionSnapshot = await transaction.get(doc(db, 'elections', 'current'))
    const currentVoter = dataWithId<Voter>(currentVoterSnapshot.id, currentVoterSnapshot.data() ?? {})
    const currentElection = dataWithId<Election>(currentElectionSnapshot.id, currentElectionSnapshot.data() ?? {})

    if (currentElection.status !== 'voting_open') throw new Error('Voting is currently closed.')
    if (!currentVoter.active) throw new Error('Voter is inactive.')
    if (currentVoter.hasVoted) throw new Error('This Voting ID has already been used for voting.')

    const timestamp = new Date().toISOString()
    for (const post of ballotPosts) {
      const voteRef = doc(collection(db, 'votes'))
      createdVoteIds.push(voteRef.id)
      transaction.set(voteRef, {
        id: voteRef.id,
        electionId: election.id,
        postId: post.id,
        candidateId: selections[post.id],
        createdAt: timestamp,
      })
    }
    transaction.update(voterRef, {
      hasVoted: true,
      votedAt: timestamp,
    })
  }).catch((error) => {
    throw new Error(`Vote transaction failed: ${error instanceof Error ? error.message : String(error)}`)
  })

  return createdVoteIds
}

const firstVoteIds = await submitOnce()
let duplicateBlocked = false
try {
  await submitOnce()
} catch (error) {
  duplicateBlocked = error instanceof Error && error.message.includes('already been used')
}

const voterAfter = await getVoterByVotingId(votingId)

console.log(JSON.stringify({
  votingId,
  firstVoteDocuments: firstVoteIds.length,
  duplicateBlocked,
  hasVoted: voterAfter?.hasVoted,
  voteIds: firstVoteIds,
}, null, 2))

if (!duplicateBlocked) throw new Error('Duplicate Voting ID attempt was not blocked.')
