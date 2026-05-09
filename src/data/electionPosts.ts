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
  { id: 'discipline-captain-boys', label: 'Discipline Captain Boys', kind: 'general', captainGender: 'boys' },
  { id: 'discipline-captain-girls', label: 'Discipline Captain Girls', kind: 'general', captainGender: 'girls' },
  { id: 'cultural-captain-boys', label: 'Cultural Captain Boys', kind: 'general', captainGender: 'boys' },
  { id: 'cultural-captain-girls', label: 'Cultural Captain Girls', kind: 'general', captainGender: 'girls' },
  { id: 'sports-captain-boys', label: 'Sports Captain Boys', kind: 'general', captainGender: 'boys' },
  { id: 'sports-captain-girls', label: 'Sports Captain Girls', kind: 'general', captainGender: 'girls' },
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

function inferGender(value?: string, fallback?: CaptainGender): CaptainGender | undefined {
  const normalized = String(value ?? '').trim().toLowerCase()
  if (/\b(boys?|male)\b/.test(normalized)) return 'boys'
  if (/\b(girls?|female)\b/.test(normalized)) return 'girls'
  return fallback
}

function getGenderSeparatedPostId(post: string, captainGender?: CaptainGender): ElectionPostId | undefined {
  const gender = inferGender(post, captainGender)
  if (!gender) return undefined
  if (/\b(discipline|dicipline|disciplinary)\b/.test(post)) return `discipline-captain-${gender}` as ElectionPostId
  if (/\b(cultural|cluthural|culture)\b/.test(post)) return `cultural-captain-${gender}` as ElectionPostId
  if (/\b(sports?|sport)\b/.test(post)) return `sports-captain-${gender}` as ElectionPostId
  return undefined
}

export function getLegacyPostId(post?: string, house?: HouseId, captainGender?: CaptainGender, category?: string): ElectionPostId | undefined {
  const normalized = String(post ?? '').trim().toLowerCase()
  if (!normalized) return undefined

  const direct = ELECTION_POSTS.find((item) => item.label.toLowerCase() === normalized || item.id === normalized)
  if (direct) return direct.id

  const genderSeparated = getGenderSeparatedPostId(normalized, inferGender(category, captainGender))
  if (genderSeparated) return genderSeparated

  if (normalized === 'discipline-captain') return `discipline-captain-${inferGender(category, captainGender) ?? 'boys'}` as ElectionPostId
  if (normalized === 'cultural-captain') return `cultural-captain-${inferGender(category, captainGender) ?? 'boys'}` as ElectionPostId
  if (normalized === 'sports-captain') return `sports-captain-${inferGender(category, captainGender) ?? 'boys'}` as ElectionPostId

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
