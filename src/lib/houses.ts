import { houseOrder, houses, type HouseMeta } from '../data/houses'
import { getPostHouse, isHouseCaptainPostId } from '../data/electionPosts'
import type { HouseId } from '../types/election'

export type { HouseMeta }
export { houseOrder, houses }

export const houseCaptainPosts = houseOrder.map((house) => houses[house].captainPost)

export function getHouseMeta(house?: HouseId | 'all') {
  if (!house || house === 'all') return undefined
  return houses[house]
}

export function getHouseByPost(postId?: string) {
  return getPostHouse(postId) ?? houseOrder.find((house) => houses[house].captainPost === postId)
}

export function isHouseCaptainPost(postId?: string) {
  return postId === 'House Captain' || isHouseCaptainPostId(postId) || Boolean(postId && getHouseByPost(postId))
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
