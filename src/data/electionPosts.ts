import { houseOrder, houses } from './houses'
import type {
  CaptainGender,
  ElectionPost,
  ElectionPostId,
  GeneralElectionPost,
  HouseCaptainElectionPost,
  HouseId,
  Voter,
} from '../types/election'

export const GENERAL_POSTS = [
  { id: 'head-boy', label: 'Head Boy', kind: 'general' },
  { id: 'head-girl', label: 'Head Girl', kind: 'general' },
  { id: 'discipline-captain', label: 'Discipline Captain', kind: 'general' },
  { id: 'sports-captain', label: 'Sports Captain', kind: 'general' },
  { id: 'cultural-captain', label: 'Cultural Captain', kind: 'general' },
] as const satisfies readonly GeneralElectionPost[]

const houseShortNames: Record<HouseId, string> = {
  red: 'Rana Pratap',
  blue: 'Rana Kumbha',
  green: 'Bappa Rawal',
  yellow: 'Rana Sanga',
}

const captainGenders = ['boys', 'girls'] as const satisfies readonly CaptainGender[]

export const HOUSE_CAPTAIN_POSTS = houseOrder.flatMap((house) =>
  captainGenders.map((captainGender) => ({
    id: `${house}-${captainGender}-house-captain`,
    label: `${houseShortNames[house]} ${captainGender === 'boys' ? 'Boys' : 'Girls'} House Captain`,
    kind: 'house',
    house,
    captainGender,
  })),
) as HouseCaptainElectionPost[]

export const ELECTION_POSTS: ElectionPost[] = [...GENERAL_POSTS, ...HOUSE_CAPTAIN_POSTS]

export const SUPPORTED_POSTS = ELECTION_POSTS

export function getElectionPost(postId?: string) {
  return ELECTION_POSTS.find((post) => post.id === postId)
}

export function getPostLabel(postId?: string) {
  return getElectionPost(postId)?.label ?? postId ?? ''
}

export function getHouseCaptainPostsForHouse(house?: HouseId | 'all') {
  if (!house || house === 'all') return []
  return HOUSE_CAPTAIN_POSTS.filter((post) => post.house === house)
}

export function getAllTeacherHouseCaptainPosts() {
  return HOUSE_CAPTAIN_POSTS
}

export function getPostsForVoter(voter: Voter): ElectionPost[] {
  if (voter.voterType === 'teacher') return [...GENERAL_POSTS, ...getAllTeacherHouseCaptainPosts()]
  if (voter.house && voter.house !== 'all') return [...GENERAL_POSTS, ...getHouseCaptainPostsForHouse(voter.house)]
  return [...GENERAL_POSTS]
}

export function isHouseCaptainPostId(postId?: string): postId is HouseCaptainElectionPost['id'] {
  return getElectionPost(postId)?.kind === 'house'
}

export function getPostHouse(postId?: string) {
  const post = getElectionPost(postId)
  return post?.kind === 'house' ? post.house : undefined
}

export function getPostCaptainGender(postId?: string) {
  const post = getElectionPost(postId)
  return post?.kind === 'house' ? post.captainGender : undefined
}

export function getLegacyPostId(post?: string, house?: HouseId, captainGender?: CaptainGender): ElectionPostId | undefined {
  const normalized = String(post ?? '').trim().toLowerCase()
  if (!normalized) return undefined

  const direct = ELECTION_POSTS.find((item) => item.label.toLowerCase() === normalized || item.id === normalized)
  if (direct) return direct.id

  if (normalized === 'house captain' && house) return `${house}-${captainGender ?? 'boys'}-house-captain` as ElectionPostId
  if ((normalized === 'house captain boy' || normalized === 'boys house captain') && house) return `${house}-boys-house-captain` as ElectionPostId
  if ((normalized === 'house captain girl' || normalized === 'girls house captain') && house) return `${house}-girls-house-captain` as ElectionPostId

  for (const houseId of houseOrder) {
    const houseName = houses[houseId].name.toLowerCase().replace(' house', '')
    if (normalized === `${houseName} house captain`) return `${houseId}-${captainGender ?? 'boys'}-house-captain` as ElectionPostId
    if (normalized === `${houseName} boys house captain`) return `${houseId}-boys-house-captain` as ElectionPostId
    if (normalized === `${houseName} girls house captain`) return `${houseId}-girls-house-captain` as ElectionPostId
  }

  return undefined
}
