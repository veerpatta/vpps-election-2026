import { getPostsForVoter } from '../data/electionPosts'
import type { Candidate, ElectionPostId, Voter } from '../types/election'

export function assertVoteSelectionsAreAllowed(
  voter: Voter,
  candidates: Candidate[],
  selectedCandidateIds: Partial<Record<ElectionPostId, string>>,
) {
  const ballotPosts = getPostsForVoter(voter)

  for (const post of ballotPosts) {
    const selectedCandidateId = selectedCandidateIds[post.id]
    const candidate = candidates.find((item) => {
      if (!item.approved || !item.active) return false
      return item.postId === post.id && item.id === selectedCandidateId
    })

    if (!candidate) {
      throw new Error(`Please select one candidate for ${post.label}.`)
    }
  }
}
