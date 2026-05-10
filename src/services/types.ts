import type { Candidate, Election, ElectionPost, ElectionPostId, ElectionStatus, HouseId, PostResult, Voter } from '../types/election'

export interface DashboardStats {
  election: Election
  totalVoters: number
  studentVoters: number
  teacherVoters: number
  votesCast: number
  pendingVotes: number
  approvedCandidates: number
  turnout: number
}

export interface HouseStats {
  house: HouseId
  voters: number
  voted: number
}

export type VotingIdValidationResult =
  | { ok: true; voter: Voter }
  | { ok: false; message: string }

export interface DataMode {
  mode: 'firestore' | 'local'
  label: 'Firestore Live Backend' | 'Demo Browser Storage'
  isLive: boolean
  warning: string
}

export interface ElectionService {
  dataMode: DataMode
  getElection: () => Promise<Election>
  updateElectionStatus: (status: ElectionStatus) => Promise<Election>
  getCandidates: () => Promise<Candidate[]>
  getVotingCandidates: (postId?: ElectionPostId) => Promise<Candidate[]>
  getBallotPosts: (voter: Voter) => ElectionPost[]
  saveCandidate: (candidate: Partial<Candidate> & Pick<Candidate, 'name' | 'classSection' | 'postId'>) => Promise<Candidate>
  toggleCandidate: (candidateId: string, key: 'approved' | 'active') => Promise<void>
  getVoters: () => Promise<Voter[]>
  getVoterByVotingId: (votingId: string) => Promise<Voter | null>
  saveVoter: (voter: Partial<Voter> & Pick<Voter, 'voterName' | 'voterType' | 'votingId'>) => Promise<Voter>
  generateVotingId: (existingIds?: string[]) => Promise<string>
  importVoters: (voters: Array<Omit<Voter, 'id' | 'hasVoted' | 'active'> & Partial<Pick<Voter, 'id' | 'hasVoted' | 'active'>>>) => Promise<Voter[]>
  exportVotingIdListCsv: (voters?: Voter[]) => Promise<void>
  downloadVoterTemplateCsv: () => Promise<void>
  exportResultsCsv: () => Promise<void>
  getResults: () => Promise<PostResult[]>
  getHouseStats: () => Promise<HouseStats[]>
  toggleVoterActive: (voterId: string) => Promise<void>
  resetVoterForDemo: (voterId: string) => Promise<void>
  validateVotingId: (votingId: string) => Promise<VotingIdValidationResult>
  submitVote: (votingId: string, selectedCandidateIds: Partial<Record<ElectionPostId, string>>) => Promise<void>
  getDashboardStats: () => Promise<DashboardStats>
  resetDemoData: () => Promise<void>
  resetElectionRun: () => Promise<void>
  seedDemoData: (overwrite?: boolean) => Promise<void>
}
