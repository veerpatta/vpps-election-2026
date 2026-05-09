import type { Candidate, Election, ElectionPostId, Voter, Vote } from '../types/election'
import { GENERAL_POSTS, SUPPORTED_POSTS } from './electionPosts'
import { realCandidates } from './realCandidates'
import { officialVoters, OFFICIAL_VOTER_DATASET_VERSION } from './officialVoters'

export { OFFICIAL_VOTER_DATASET_VERSION }

const now = new Date().toISOString()

export const generalPosts = GENERAL_POSTS.map((post) => post.id)
export const requiredPosts = generalPosts
export const supportedPosts = SUPPORTED_POSTS

function candidate(
  id: string,
  name: string,
  classSection: string,
  rollNumber: string,
  postId: ElectionPostId,
  extra: Pick<Partial<Candidate>, 'house' | 'captainGender' | 'category' | 'approved' | 'active' | 'photoUrl'> = {},
): Candidate {
  return {
    id,
    name,
    classSection,
    rollNumber,
    postId,
    house: extra.house,
    captainGender: extra.captainGender,
    category: extra.category,
    photoUrl: extra.photoUrl,
    approved: extra.approved ?? true,
    active: extra.active ?? true,
  }
}

export const defaultElection: Election = {
  id: 'vpps-election-2026',
  title: 'VPPS Student Council Election 2026',
  academicYear: '2026-27',
  status: 'voting_open',
  resultsPublished: false,
  createdAt: now,
  updatedAt: now,
}

const demoCandidates: Candidate[] = [
  candidate('c-1', 'Aarav Singh', 'XII A', '07', 'head-boy'),
  candidate('c-2', 'Kabir Rathore', 'XI B', '12', 'head-boy'),
  candidate('c-3', 'Ananya Sharma', 'XII B', '05', 'head-girl'),
  candidate('c-4', 'Meera Chouhan', 'XI A', '18', 'head-girl'),
  candidate('c-5', 'Yash Solanki', 'X B', '21', 'discipline-captain-boys', { captainGender: 'boys', category: 'Boy' }),
  candidate('c-6', 'Ritika Jain', 'XI C', '09', 'discipline-captain-girls', { captainGender: 'girls', category: 'Girl' }),
  candidate('c-7', 'Devendra Rao', 'XII C', '14', 'sports-captain-boys', { captainGender: 'boys', category: 'Boy' }),
  candidate('c-8', 'Nisha Kumari', 'XI B', '26', 'sports-captain-girls', { captainGender: 'girls', category: 'Girl' }),
  candidate('c-9', 'Armaan Khan', 'X A', '11', 'cultural-captain-boys', { captainGender: 'boys', category: 'Boy' }),
  candidate('c-10', 'Harshita Patel', 'XI A', '03', 'cultural-captain-girls', { captainGender: 'girls', category: 'Girl' }),

  candidate('c-11', 'Pranav Meena', 'X C', '17', 'red-boys-house-captain', { house: 'red', captainGender: 'boys' }),
  candidate('c-12', 'Arjun Rajput', 'IX B', '22', 'red-boys-house-captain', { house: 'red', captainGender: 'boys' }),
  candidate('c-13', 'Kavya Rajput', 'IX B', '12', 'red-girls-house-captain', { house: 'red', captainGender: 'girls' }),
  candidate('c-14', 'Mehak Rathore', 'X A', '08', 'red-girls-house-captain', { house: 'red', captainGender: 'girls' }),

  candidate('c-15', 'Raghav Purohit', 'X B', '06', 'blue-boys-house-captain', { house: 'blue', captainGender: 'boys' }),
  candidate('c-16', 'Vedant Vyas', 'IX A', '16', 'blue-boys-house-captain', { house: 'blue', captainGender: 'boys' }),
  candidate('c-17', 'Ishika Vyas', 'IX A', '19', 'blue-girls-house-captain', { house: 'blue', captainGender: 'girls' }),
  candidate('c-18', 'Tanya Jain', 'VIII B', '08', 'blue-girls-house-captain', { house: 'blue', captainGender: 'girls' }),

  candidate('c-19', 'Daksh Sharma', 'X A', '24', 'green-boys-house-captain', { house: 'green', captainGender: 'boys' }),
  candidate('c-20', 'Mohit Rathore', 'XII A', '19', 'green-boys-house-captain', { house: 'green', captainGender: 'boys' }),
  candidate('c-21', 'Pari Chundawat', 'VIII B', '09', 'green-girls-house-captain', { house: 'green', captainGender: 'girls' }),
  candidate('c-22', 'Bhavna Gurjar', 'VI C', '10', 'green-girls-house-captain', { house: 'green', captainGender: 'girls' }),

  candidate('c-23', 'Veer Singh', 'XI A', '20', 'yellow-boys-house-captain', { house: 'yellow', captainGender: 'boys' }),
  candidate('c-24', 'Lakshya Verma', 'X A', '15', 'yellow-boys-house-captain', { house: 'yellow', captainGender: 'boys' }),
  candidate('c-25', 'Aditi Sisodia', 'IX C', '04', 'yellow-girls-house-captain', { house: 'yellow', captainGender: 'girls' }),
  candidate('c-26', 'Simran Kaur', 'XI C', '06', 'yellow-girls-house-captain', { house: 'yellow', captainGender: 'girls' }),
]

export const defaultCandidates: Candidate[] = realCandidates.length ? realCandidates : demoCandidates

const demoVoters: Voter[] = [
  { id: 'v-1', voterName: 'Test Student 001', voterType: 'student', classSection: 'Class 10', rollNumber: '01', house: 'red', votingId: '111111', hasVoted: false, active: true },
  { id: 'v-2', voterName: 'Test Student 002', voterType: 'student', classSection: 'Class 9', rollNumber: '02', house: 'blue', votingId: '222222', hasVoted: false, active: true },
  { id: 'v-3', voterName: 'Test Teacher 001', voterType: 'teacher', departmentOrRole: 'Mathematics', house: 'all', votingId: '333333', hasVoted: false, active: true },
  { id: 'v-4', voterName: 'Test Teacher 002', voterType: 'teacher', departmentOrRole: 'Science', house: 'all', votingId: '444444', hasVoted: false, active: true },
]

export const defaultVoters: Voter[] = officialVoters.length ? officialVoters : demoVoters

const demoVotes: Vote[] = [
  { id: 'vote-1', electionId: defaultElection.id, postId: 'head-boy', candidateId: 'c-1', timestamp: now },
  { id: 'vote-2', electionId: defaultElection.id, postId: 'head-girl', candidateId: 'c-3', timestamp: now },
  { id: 'vote-3', electionId: defaultElection.id, postId: 'discipline-captain-girls', candidateId: 'c-6', timestamp: now },
  { id: 'vote-4', electionId: defaultElection.id, postId: 'sports-captain-boys', candidateId: 'c-7', timestamp: now },
  { id: 'vote-5', electionId: defaultElection.id, postId: 'cultural-captain-boys', candidateId: 'c-9', timestamp: now },
  { id: 'vote-6', electionId: defaultElection.id, postId: 'red-boys-house-captain', candidateId: 'c-11', timestamp: now },
  { id: 'vote-7', electionId: defaultElection.id, postId: 'red-girls-house-captain', candidateId: 'c-13', timestamp: now },
  { id: 'vote-8', electionId: defaultElection.id, postId: 'head-boy', candidateId: 'c-2', timestamp: now },
  { id: 'vote-9', electionId: defaultElection.id, postId: 'head-girl', candidateId: 'c-4', timestamp: now },
  { id: 'vote-10', electionId: defaultElection.id, postId: 'discipline-captain-girls', candidateId: 'c-6', timestamp: now },
  { id: 'vote-11', electionId: defaultElection.id, postId: 'sports-captain-girls', candidateId: 'c-8', timestamp: now },
  { id: 'vote-12', electionId: defaultElection.id, postId: 'cultural-captain-boys', candidateId: 'c-9', timestamp: now },
  { id: 'vote-13', electionId: defaultElection.id, postId: 'blue-boys-house-captain', candidateId: 'c-15', timestamp: now },
  { id: 'vote-14', electionId: defaultElection.id, postId: 'blue-girls-house-captain', candidateId: 'c-17', timestamp: now },
]

export const defaultVotes: Vote[] = realCandidates.length ? [] : demoVotes

export function createDefaultStore() {
  return {
    election: { ...defaultElection, updatedAt: new Date().toISOString() },
    candidates: defaultCandidates.map((candidate) => ({ ...candidate })),
    voters: defaultVoters.map((voter) => ({ ...voter })),
    votes: defaultVotes.map((vote) => ({ ...vote })),
  }
}
