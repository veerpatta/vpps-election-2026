import type { Candidate, Election, ElectionPostId, Voter, Vote } from '../types/election'
import { GENERAL_POSTS, SUPPORTED_POSTS } from './electionPosts'

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
  extra: Pick<Partial<Candidate>, 'house' | 'captainGender' | 'approved' | 'active' | 'photoUrl'> = {},
): Candidate {
  return {
    id,
    name,
    classSection,
    rollNumber,
    postId,
    house: extra.house,
    captainGender: extra.captainGender,
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

export const defaultCandidates: Candidate[] = [
  candidate('c-1', 'Aarav Singh', 'XII A', '07', 'head-boy'),
  candidate('c-2', 'Kabir Rathore', 'XI B', '12', 'head-boy'),
  candidate('c-3', 'Ananya Sharma', 'XII B', '05', 'head-girl'),
  candidate('c-4', 'Meera Chouhan', 'XI A', '18', 'head-girl'),
  candidate('c-5', 'Yash Solanki', 'X B', '21', 'discipline-captain'),
  candidate('c-6', 'Ritika Jain', 'XI C', '09', 'discipline-captain'),
  candidate('c-7', 'Devendra Rao', 'XII C', '14', 'sports-captain'),
  candidate('c-8', 'Nisha Kumari', 'XI B', '26', 'sports-captain'),
  candidate('c-9', 'Sana Khan', 'X A', '11', 'cultural-captain'),
  candidate('c-10', 'Harshita Patel', 'XI A', '03', 'cultural-captain'),

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

export const defaultVoters: Voter[] = [
  { id: 'v-1', voterName: 'Test Student 001', voterType: 'student', classSection: 'X A', rollNumber: '01', house: 'red', votingId: '111111', hasVoted: false, active: true },
  { id: 'v-2', voterName: 'Test Student 002', voterType: 'student', classSection: 'IX A', rollNumber: '02', house: 'blue', votingId: '222222', hasVoted: false, active: true },
  { id: 'v-3', voterName: 'Test Teacher 001', voterType: 'teacher', departmentOrRole: 'Mathematics', votingId: '333333', hasVoted: false, active: true },
  { id: 'v-4', voterName: 'Test Teacher 002', voterType: 'teacher', departmentOrRole: 'Science', votingId: '444444', hasVoted: false, active: true },
  { id: 'v-5', voterName: 'Kunal Meena', voterType: 'student', classSection: 'IX B', rollNumber: '13', house: 'green', votingId: '482913', hasVoted: true, votedAt: now, active: true },
  { id: 'v-6', voterName: 'Simran Kaur', voterType: 'student', classSection: 'XI C', rollNumber: '06', house: 'yellow', votingId: '104728', hasVoted: false, active: true },
  { id: 'v-7', voterName: 'Aditya Soni', voterType: 'student', classSection: 'VIII A', rollNumber: '25', house: 'red', votingId: '739250', hasVoted: true, votedAt: now, active: true },
  { id: 'v-8', voterName: 'Tanya Jain', voterType: 'student', classSection: 'VII B', rollNumber: '08', house: 'blue', votingId: '620184', hasVoted: false, active: true },
  { id: 'v-9', voterName: 'Mohit Rathore', voterType: 'student', classSection: 'XII A', rollNumber: '19', house: 'green', votingId: '581406', hasVoted: false, active: true },
  { id: 'v-10', voterName: 'Bhavna Gurjar', voterType: 'student', classSection: 'VI C', rollNumber: '10', house: 'yellow', votingId: '906317', hasVoted: false, active: true },
  { id: 'v-11', voterName: 'Rajesh Sir', voterType: 'teacher', departmentOrRole: 'Social Science', votingId: '715294', hasVoted: true, votedAt: now, active: true },
  { id: 'v-12', voterName: 'Kavita Maam', voterType: 'teacher', departmentOrRole: 'English', votingId: '863520', hasVoted: false, active: true },
]

export const defaultVotes: Vote[] = [
  { id: 'vote-1', electionId: defaultElection.id, postId: 'head-boy', candidateId: 'c-1', timestamp: now },
  { id: 'vote-2', electionId: defaultElection.id, postId: 'head-girl', candidateId: 'c-3', timestamp: now },
  { id: 'vote-3', electionId: defaultElection.id, postId: 'discipline-captain', candidateId: 'c-6', timestamp: now },
  { id: 'vote-4', electionId: defaultElection.id, postId: 'sports-captain', candidateId: 'c-7', timestamp: now },
  { id: 'vote-5', electionId: defaultElection.id, postId: 'cultural-captain', candidateId: 'c-9', timestamp: now },
  { id: 'vote-6', electionId: defaultElection.id, postId: 'red-boys-house-captain', candidateId: 'c-11', timestamp: now },
  { id: 'vote-7', electionId: defaultElection.id, postId: 'red-girls-house-captain', candidateId: 'c-13', timestamp: now },
  { id: 'vote-8', electionId: defaultElection.id, postId: 'head-boy', candidateId: 'c-2', timestamp: now },
  { id: 'vote-9', electionId: defaultElection.id, postId: 'head-girl', candidateId: 'c-4', timestamp: now },
  { id: 'vote-10', electionId: defaultElection.id, postId: 'discipline-captain', candidateId: 'c-6', timestamp: now },
  { id: 'vote-11', electionId: defaultElection.id, postId: 'sports-captain', candidateId: 'c-8', timestamp: now },
  { id: 'vote-12', electionId: defaultElection.id, postId: 'cultural-captain', candidateId: 'c-9', timestamp: now },
  { id: 'vote-13', electionId: defaultElection.id, postId: 'blue-boys-house-captain', candidateId: 'c-15', timestamp: now },
  { id: 'vote-14', electionId: defaultElection.id, postId: 'blue-girls-house-captain', candidateId: 'c-17', timestamp: now },
]

export function createDefaultStore() {
  return {
    election: { ...defaultElection, updatedAt: new Date().toISOString() },
    candidates: defaultCandidates.map((candidate) => ({ ...candidate })),
    voters: defaultVoters.map((voter) => ({ ...voter })),
    votes: defaultVotes.map((vote) => ({ ...vote })),
  }
}
