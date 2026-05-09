export type ElectionStatus =
  | 'draft'
  | 'voting_open'
  | 'voting_closed'
  | 'results_published'

export type VoterType = 'student' | 'teacher'

export type HouseId = 'red' | 'blue' | 'green' | 'yellow'

export type CaptainGender = 'boys' | 'girls'

export type GeneralPostId =
  | 'head-boy'
  | 'head-girl'
  | 'discipline-captain'
  | 'sports-captain'
  | 'cultural-captain'

export type HouseCaptainPostId =
  | 'red-boys-house-captain'
  | 'red-girls-house-captain'
  | 'blue-boys-house-captain'
  | 'blue-girls-house-captain'
  | 'green-boys-house-captain'
  | 'green-girls-house-captain'
  | 'yellow-boys-house-captain'
  | 'yellow-girls-house-captain'

export type ElectionPostId = GeneralPostId | HouseCaptainPostId
export type CouncilPost = ElectionPostId

export interface GeneralElectionPost {
  id: GeneralPostId
  label: string
  kind: 'general'
}

export interface HouseCaptainElectionPost {
  id: HouseCaptainPostId
  label: string
  kind: 'house'
  house: HouseId
  captainGender: CaptainGender
}

export type ElectionPost = GeneralElectionPost | HouseCaptainElectionPost

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
  postId: ElectionPostId
  post?: string
  postLabel?: string
  house?: HouseId
  captainGender?: CaptainGender
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
  postId: ElectionPostId
  post?: string
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
  post: ElectionPost
  totalVotes: number
  winner?: Candidate
  rows: ResultRow[]
}
