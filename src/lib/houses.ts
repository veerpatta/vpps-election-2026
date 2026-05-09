import type { CouncilPost, HouseId } from '../types/election'
import { houseOrder, houses, type HouseMeta } from '../data/houses'

export type { HouseMeta }
export { houseOrder, houses }

export const houseCaptainPosts = houseOrder.map((house) => houses[house].captainPost)

export function getHouseMeta(house?: HouseId | 'all') {
  if (!house || house === 'all') return undefined
  return houses[house]
}

export function getHouseByPost(post: CouncilPost) {
  return houseOrder.find((house) => houses[house].captainPost === post)
}

export function isHouseCaptainPost(post?: CouncilPost) {
  return post === 'House Captain' || Boolean(post && getHouseByPost(post))
}

export function normalizeHouse(value: unknown): HouseId | 'all' | undefined {
  const raw = String(value ?? '').trim().toLowerCase()
  if (!raw) return undefined
  const compact = raw.replace(/\s+/g, ' ')
  if (compact === 'all') return 'all'
  if (['red', 'rana pratap', 'rana pratap house', 'maharana pratap', 'maharana pratap house'].includes(compact)) return 'red'
  if (['blue', 'rana kumbha', 'rana kumbha house'].includes(compact)) return 'blue'
  if (['green', 'bappa rawal', 'bappa rawal house'].includes(compact)) return 'green'
  if (['yellow', 'gold', 'rana sanga', 'rana sanga house'].includes(compact)) return 'yellow'
  return undefined
}
