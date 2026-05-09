import type { Candidate, CouncilPost, Election, Voter, Vote } from '../types/election'
import { houseCaptainPosts } from '../lib/houses'

const now = new Date().toISOString()

export const generalPosts: CouncilPost[] = [
  'Head Boy',
  'Head Girl',
  'Discipline Captain',
  'Sports Captain',
  'Cultural Captain',
]

export const requiredPosts = generalPosts

export const supportedPosts: CouncilPost[] = [
  ...generalPosts,
  'House Captain',
  ...houseCaptainPosts,
  'House Captain Boy',
  'House Captain Girl',
  'Vice Captain',
]

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
  { id: 'c-1', name: 'Aarav Singh', classSection: 'XII A', rollNumber: '07', post: 'Head Boy', symbol: 'Torch', slogan: 'Lead with honesty and discipline.', approved: true, active: true },
  { id: 'c-2', name: 'Kabir Rathore', classSection: 'XI B', rollNumber: '12', post: 'Head Boy', symbol: 'Shield', slogan: 'Respect for every student.', approved: true, active: true },
  { id: 'c-3', name: 'Ananya Sharma', classSection: 'XII B', rollNumber: '05', post: 'Head Girl', symbol: 'Lotus', slogan: 'Confidence, care, and clear action.', approved: true, active: true },
  { id: 'c-4', name: 'Meera Chouhan', classSection: 'XI A', rollNumber: '18', post: 'Head Girl', symbol: 'Book', slogan: 'Every voice matters.', approved: true, active: true },
  { id: 'c-5', name: 'Yash Solanki', classSection: 'X B', rollNumber: '21', post: 'Discipline Captain', symbol: 'Whistle', slogan: 'Discipline with respect.', approved: true, active: true },
  { id: 'c-6', name: 'Ritika Jain', classSection: 'XI C', rollNumber: '09', post: 'Discipline Captain', symbol: 'Compass', slogan: 'A fair school for all.', approved: true, active: true },
  { id: 'c-7', name: 'Devendra Rao', classSection: 'XII C', rollNumber: '14', post: 'Sports Captain', symbol: 'Medal', slogan: 'Play hard, play fair.', approved: true, active: true },
  { id: 'c-8', name: 'Nisha Kumari', classSection: 'XI B', rollNumber: '26', post: 'Sports Captain', symbol: 'Runner', slogan: 'Fitness and team spirit.', approved: true, active: true },
  { id: 'c-9', name: 'Sana Khan', classSection: 'X A', rollNumber: '11', post: 'Cultural Captain', symbol: 'Veena', slogan: 'Stage for every talent.', approved: true, active: true },
  { id: 'c-10', name: 'Harshita Patel', classSection: 'XI A', rollNumber: '03', post: 'Cultural Captain', symbol: 'Star', slogan: 'Celebrate our school spirit.', approved: true, active: true },
  { id: 'c-11', name: 'Pranav Meena', classSection: 'X C', rollNumber: '17', post: 'House Captain', house: 'red', symbol: 'Fort Flag', slogan: 'Courage and discipline for Rana Pratap House.', approved: true, active: true },
  { id: 'c-12', name: 'Kavya Rajput', classSection: 'IX B', rollNumber: '22', post: 'House Captain', house: 'red', symbol: 'Shield', slogan: 'Lead Rana Pratap House with pride.', approved: true, active: true },
  { id: 'c-14', name: 'Raghav Purohit', classSection: 'X B', rollNumber: '06', post: 'House Captain', house: 'blue', symbol: 'Vijay Stambh', slogan: 'Calm planning and strong teamwork.', approved: true, active: true },
  { id: 'c-15', name: 'Ishika Vyas', classSection: 'IX A', rollNumber: '16', post: 'House Captain', house: 'blue', symbol: 'Blue Banner', slogan: 'Every point, every event, together.', approved: true, active: true },
  { id: 'c-16', name: 'Daksh Sharma', classSection: 'X A', rollNumber: '24', post: 'House Captain', house: 'green', symbol: 'Sun Emblem', slogan: 'Strength, service, and house unity.', approved: true, active: true },
  { id: 'c-17', name: 'Pari Chundawat', classSection: 'VIII B', rollNumber: '09', post: 'House Captain', house: 'green', symbol: 'Green Standard', slogan: 'Make Bappa Rawal House shine.', approved: true, active: true },
  { id: 'c-18', name: 'Veer Singh', classSection: 'XI A', rollNumber: '20', post: 'House Captain', house: 'yellow', symbol: 'Golden Crown', slogan: 'Lead with courage and respect.', approved: true, active: true },
  { id: 'c-19', name: 'Aditi Sisodia', classSection: 'IX C', rollNumber: '04', post: 'House Captain', house: 'yellow', symbol: 'Royal Flag', slogan: 'Rana Sanga House, united and ready.', approved: true, active: true },
  { id: 'c-13', name: 'Lakshya Verma', classSection: 'X A', rollNumber: '15', post: 'Vice Captain', symbol: 'Pen', slogan: 'Ready to support and serve.', approved: false, active: true },
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
  { id: 'vote-1', electionId: defaultElection.id, post: 'Head Boy', candidateId: 'c-1', timestamp: now },
  { id: 'vote-2', electionId: defaultElection.id, post: 'Head Girl', candidateId: 'c-3', timestamp: now },
  { id: 'vote-3', electionId: defaultElection.id, post: 'Discipline Captain', candidateId: 'c-6', timestamp: now },
  { id: 'vote-4', electionId: defaultElection.id, post: 'Sports Captain', candidateId: 'c-7', timestamp: now },
  { id: 'vote-5', electionId: defaultElection.id, post: 'Cultural Captain', candidateId: 'c-9', timestamp: now },
  { id: 'vote-6', electionId: defaultElection.id, post: 'Rana Pratap House Captain', candidateId: 'c-11', timestamp: now },
  { id: 'vote-7', electionId: defaultElection.id, post: 'Head Boy', candidateId: 'c-2', timestamp: now },
  { id: 'vote-8', electionId: defaultElection.id, post: 'Head Girl', candidateId: 'c-4', timestamp: now },
  { id: 'vote-9', electionId: defaultElection.id, post: 'Discipline Captain', candidateId: 'c-6', timestamp: now },
  { id: 'vote-10', electionId: defaultElection.id, post: 'Sports Captain', candidateId: 'c-8', timestamp: now },
  { id: 'vote-11', electionId: defaultElection.id, post: 'Cultural Captain', candidateId: 'c-9', timestamp: now },
  { id: 'vote-12', electionId: defaultElection.id, post: 'Rana Pratap House Captain', candidateId: 'c-12', timestamp: now },
]

export function createDefaultStore() {
  return {
    election: { ...defaultElection, updatedAt: new Date().toISOString() },
    candidates: defaultCandidates.map((candidate) => ({ ...candidate })),
    voters: defaultVoters.map((voter) => ({ ...voter })),
    votes: defaultVotes.map((vote) => ({ ...vote })),
  }
}
