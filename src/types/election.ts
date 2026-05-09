export type ElectionStatus =
  | 'draft'
  | 'voting_open'
  | 'voting_closed'
  | 'results_published'

export type VoterType = 'student' | 'teacher'

export type HouseId = 'red' | 'blue' | 'green' | 'yellow'

export type CouncilPost =
  | 'Head Boy'
  | 'Head Girl'
  | 'Discipline Captain'
  | 'Sports Captain'
  | 'Cultural Captain'
  | 'House Captain'
  | 'Rana Pratap House Captain'
  | 'Rana Kumbha House Captain'
  | 'Bappa Rawal House Captain'
  | 'Rana Sanga House Captain'
  | 'House Captain Boy'
  | 'House Captain Girl'
  | 'Vice Captain'

export interface Election {
  id: string
  title: string
  academicYear: string
  status: ElectionStatus
  resultsPublished: boolean
  createdAt: string
  updatedAt: string
}

export interface Candidate {
  id: string
  name: string
  classSection: string
  rollNumber?: string
  post: CouncilPost
  house?: HouseId
  photoUrl?: string
  symbol?: string
  slogan?: string
  approved: boolean
  active: boolean
}

export interface Voter {
  id: string
  voterName: string
  voterType: VoterType
  classSection?: string
  rollNumber?: string
  departmentOrRole?: string
  house?: HouseId | 'all'
  votingId: string
  hasVoted: boolean
  votedAt?: string
  active: boolean
}

export interface Vote {
  id: string
  electionId: string
  post: CouncilPost
  candidateId: string
  timestamp: string
}

export interface ElectionStore {
  election: Election
  candidates: Candidate[]
  voters: Voter[]
  votes: Vote[]
}

export interface ResultRow {
  candidate: Candidate
  votes: number
  isWinner: boolean
}

export interface PostResult {
  post: CouncilPost
  totalVotes: number
  winner?: Candidate
  rows: ResultRow[]
}
