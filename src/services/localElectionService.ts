import * as store from '../lib/electionStore'
import type { ElectionService } from './types'

export const localElectionService: ElectionService = {
  dataMode: {
    mode: 'local',
    label: 'Demo Browser Storage',
    isLive: false,
    warning: 'Demo browser storage only. Votes are not shared across devices.',
  },
  getElection: async () => store.getElection(),
  updateElectionStatus: async (status) => store.updateElectionStatus(status),
  getCandidates: async () => store.getCandidates(),
  getVotingCandidates: async (postId) => store.getVotingCandidates(postId),
  getBallotPosts: store.getBallotPosts,
  saveCandidate: async (candidate) => store.saveCandidate(candidate),
  toggleCandidate: async (candidateId, key) => store.toggleCandidate(candidateId, key),
  deleteCandidate: async (candidateId) => store.deleteCandidate(candidateId),
  getVoters: async () => store.getVoters(),
  getVoterByVotingId: async (votingId) => store.getVoters().find((voter) => voter.votingId === votingId) ?? null,
  saveVoter: async (voter) => store.saveVoter(voter),
  generateVotingId: async (existingIds) => store.generateVotingId(existingIds),
  importVoters: async (voters) => store.importVoters(voters),
  exportVotingIdListCsv: async (voters) => store.exportVotingIdListCsv(voters),
  downloadVoterTemplateCsv: async () => store.downloadVoterTemplateCsv(),
  exportResultsCsv: async () => store.exportResultsCsv(),
  getResults: async () => store.getResults(),
  getHouseStats: async () => store.getHouseStats(),
  toggleVoterActive: async (voterId) => store.toggleVoterActive(voterId),
  deleteVoter: async (voterId) => store.deleteVoter(voterId),
  resetVoterForDemo: async (voterId) => store.resetVoterForDemo(voterId),
  validateVotingId: async (votingId) => store.validateVotingId(votingId),
  submitVote: async (votingId, selectedCandidateIds) => store.submitVote(votingId, selectedCandidateIds),
  getDashboardStats: async () => store.getDashboardStats(),
  resetDemoData: async () => {
    store.resetDemoData()
  },
  resetElectionRun: async () => {
    store.resetElectionRun()
  },
  seedDemoData: async (overwrite = false) => {
    if (overwrite) store.resetDemoData()
  },
}
