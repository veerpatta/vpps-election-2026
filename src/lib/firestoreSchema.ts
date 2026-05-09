import type { CouncilPost, ElectionStatus, VoterType } from '../types/election'

export const firestoreCollections = {
  elections: 'elections',
  candidates: 'candidates',
  voters: 'voters',
  votes: 'votes',
} as const

export type FirestoreCollectionName =
  (typeof firestoreCollections)[keyof typeof firestoreCollections]

export interface FirestoreElection {
  id: string
  title: string
  academicYear: string
  status: ElectionStatus
  resultsPublished: boolean
  createdAt: string
  updatedAt: string
}

export interface FirestoreCandidate {
  id: string
  name: string
  classSection: string
  rollNumber?: string
  post: CouncilPost
  photoUrl?: string
  symbol: string
  slogan?: string
  approved: boolean
  active: boolean
}

export interface FirestoreVoter {
  id: string
  voterName: string
  voterType: VoterType
  classSection?: string
  rollNumber?: string
  departmentOrRole?: string
  votingId: string
  hasVoted: boolean
  votedAt?: string
  active: boolean
}

// Vote documents intentionally do not contain voterName, votingId, or voterId.
export interface FirestoreVote {
  id: string
  electionId: string
  post: CouncilPost
  candidateId: string
  timestamp: string
}
