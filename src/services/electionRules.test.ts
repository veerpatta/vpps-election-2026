import { describe, expect, it } from 'vitest'
import { assertVoteSelectionsAreAllowed } from './electionRules'
import { getPostsForVoter } from '../data/electionPosts'
import type { Candidate, Voter } from '../types/election'

const baseVoter: Voter = {
  id: 'voter-1',
  voterName: 'Test Student',
  voterType: 'student',
  classSection: 'Class 10',
  rollNumber: '01',
  house: 'red',
  votingId: '111111',
  hasVoted: false,
  active: true,
}

function candidate(postId: Candidate['postId'], suffix = '1'): Candidate {
  return {
    id: `${postId}-${suffix}`,
    name: `${postId} candidate`,
    classSection: 'Class 10',
    postId,
    house: postId.startsWith('red-') ? 'red' : postId.startsWith('blue-') ? 'blue' : undefined,
    captainGender: postId.includes('-girls-') || postId.endsWith('-girls') ? 'girls' : postId.includes('-boys-') || postId.endsWith('-boys') ? 'boys' : undefined,
    approved: true,
    active: true,
  }
}

const ownBallotPosts = getPostsForVoter(baseVoter)
const candidates = [
  ...ownBallotPosts.map((post) => candidate(post.id)),
  candidate('blue-boys-house-captain'),
]

describe('assertVoteSelectionsAreAllowed', () => {
  it('allows a student to vote for general posts and own-house posts only', () => {
    const selections = Object.fromEntries(
      ownBallotPosts.map((post) => [post.id, `${post.id}-1`]),
    )

    expect(() =>
      assertVoteSelectionsAreAllowed(baseVoter, candidates, selections),
    ).not.toThrow()
  })

  it('blocks a student selection for another house captain post', () => {
    const selections = Object.fromEntries(
      ownBallotPosts.map((post) => [post.id, `${post.id}-1`]),
    )

    expect(() =>
      assertVoteSelectionsAreAllowed(baseVoter, candidates, {
        ...selections,
        'red-boys-house-captain': 'blue-boys-1',
      }),
    ).toThrow('Please select one candidate for Rana Pratap Boys House Captain.')
  })
})
