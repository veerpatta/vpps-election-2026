import { isFirebaseReady } from '../lib/firebase'
import { firestoreElectionService } from './firestoreElectionService'
import { localElectionService } from './localElectionService'

export const electionService = isFirebaseReady ? firestoreElectionService : localElectionService
export const dataMode = electionService.dataMode

export const getElection = electionService.getElection
export const updateElectionStatus = electionService.updateElectionStatus
export const getCandidates = electionService.getCandidates
export const getVotingCandidates = electionService.getVotingCandidates
export const getBallotPosts = electionService.getBallotPosts
export const saveCandidate = electionService.saveCandidate
export const toggleCandidate = electionService.toggleCandidate
export const getVoters = electionService.getVoters
export const getVoterByVotingId = electionService.getVoterByVotingId
export const saveVoter = electionService.saveVoter
export const generateVotingId = electionService.generateVotingId
export const importVoters = electionService.importVoters
export const exportVotingIdListCsv = electionService.exportVotingIdListCsv
export const downloadVoterTemplateCsv = electionService.downloadVoterTemplateCsv
export const exportResultsCsv = electionService.exportResultsCsv
export const getResults = electionService.getResults
export const getHouseStats = electionService.getHouseStats
export const toggleVoterActive = electionService.toggleVoterActive
export const resetVoterForDemo = electionService.resetVoterForDemo
export const validateVotingId = electionService.validateVotingId
export const submitVote = electionService.submitVote
export const getDashboardStats = electionService.getDashboardStats
export const resetDemoData = electionService.resetDemoData
export const resetElectionRun = electionService.resetElectionRun
export const seedDemoData = electionService.seedDemoData
