import type { CouncilPost, HouseId } from '../types/election'

export interface HouseMeta {
  id: HouseId
  name: string
  colorName: string
  hero: string
  postLabel: CouncilPost
  imagePath: string
  primaryColor: string
  accentColor: string
  softColor: string
  borderColor: string
}

export const houseOrder: HouseId[] = ['red', 'blue', 'green', 'yellow']

export const houses: Record<HouseId, HouseMeta> = {
  red: {
    id: 'red',
    name: 'Rana Pratap House',
    colorName: 'Red',
    hero: 'Maharana Pratap',
    postLabel: 'Rana Pratap House Captain',
    imagePath: '/houses/rana-pratap.png',
    primaryColor: '#b91c1c',
    accentColor: '#ef4444',
    softColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  blue: {
    id: 'blue',
    name: 'Rana Kumbha House',
    colorName: 'Blue',
    hero: 'Rana Kumbha',
    postLabel: 'Rana Kumbha House Captain',
    imagePath: '/houses/rana-kumbha.png',
    primaryColor: '#1d4ed8',
    accentColor: '#3b82f6',
    softColor: '#eff6ff',
    borderColor: '#bfdbfe',
  },
  green: {
    id: 'green',
    name: 'Bappa Rawal House',
    colorName: 'Green',
    hero: 'Bappa Rawal',
    postLabel: 'Bappa Rawal House Captain',
    imagePath: '/houses/bappa-rawal.png',
    primaryColor: '#15803d',
    accentColor: '#22c55e',
    softColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  yellow: {
    id: 'yellow',
    name: 'Rana Sanga House',
    colorName: 'Yellow',
    hero: 'Rana Sanga',
    postLabel: 'Rana Sanga House Captain',
    imagePath: '/houses/rana-sanga.png',
    primaryColor: '#a16207',
    accentColor: '#f4b400',
    softColor: '#fffbeb',
    borderColor: '#fde68a',
  },
}

export const houseCaptainPosts = houseOrder.map((house) => houses[house].postLabel)

export function getHouseMeta(house?: HouseId | 'all') {
  if (!house || house === 'all') return undefined
  return houses[house]
}

export function getHouseByPost(post: CouncilPost) {
  return houseOrder.find((house) => houses[house].postLabel === post)
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
