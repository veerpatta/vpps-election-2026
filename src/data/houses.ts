import type { HouseId } from '../types/election'

export interface HouseMeta {
  id: HouseId
  colorName: string
  name: string
  heroName: string
  captainPost: string
  logoPath: string
  heroPath: string
  primaryColor: string
  accentColor: string
  softColor: string
  borderColor: string
  textClass: string
  bgClass: string
  borderClass: string
  ringClass: string
  gradientClass: string
  softGradientClass: string
  glowClass: string
  hero: string
  postLabel: string
  imagePath: string
}

export const houseOrder: HouseId[] = ['red', 'blue', 'green', 'yellow']

export const houses: Record<HouseId, HouseMeta> = {
  red: {
    id: 'red',
    colorName: 'Red',
    name: 'Rana Pratap House',
    heroName: 'Maharana Pratap',
    captainPost: 'Rana Pratap House Captain',
    logoPath: '/houses/logos/rana-pratap-house-logo.png',
    heroPath: '/houses/heroes/rana-pratap-hero.png',
    primaryColor: '#b91c1c',
    accentColor: '#ef4444',
    softColor: '#fef2f2',
    borderColor: '#fecaca',
    textClass: 'text-red-700',
    bgClass: 'bg-red-700',
    borderClass: 'border-red-300',
    ringClass: 'ring-red-500/30',
    gradientClass: 'from-red-950/95 via-red-900/70 to-vpps-navy/92',
    softGradientClass: 'from-red-50 via-white to-amber-50',
    glowClass: 'shadow-red-600/25',
    hero: 'Maharana Pratap',
    postLabel: 'Rana Pratap House Captain',
    imagePath: '/houses/heroes/rana-pratap-hero.png',
  },
  blue: {
    id: 'blue',
    colorName: 'Blue',
    name: 'Rana Kumbha House',
    heroName: 'Rana Kumbha',
    captainPost: 'Rana Kumbha House Captain',
    logoPath: '/houses/logos/rana-kumbha-house-logo.png',
    heroPath: '/houses/heroes/rana-kumbha-hero.png',
    primaryColor: '#1d4ed8',
    accentColor: '#3b82f6',
    softColor: '#eff6ff',
    borderColor: '#bfdbfe',
    textClass: 'text-blue-700',
    bgClass: 'bg-blue-700',
    borderClass: 'border-blue-300',
    ringClass: 'ring-blue-500/30',
    gradientClass: 'from-blue-950/95 via-blue-900/70 to-vpps-navy/92',
    softGradientClass: 'from-blue-50 via-white to-amber-50',
    glowClass: 'shadow-blue-600/25',
    hero: 'Rana Kumbha',
    postLabel: 'Rana Kumbha House Captain',
    imagePath: '/houses/heroes/rana-kumbha-hero.png',
  },
  green: {
    id: 'green',
    colorName: 'Green',
    name: 'Bappa Rawal House',
    heroName: 'Bappa Rawal',
    captainPost: 'Bappa Rawal House Captain',
    logoPath: '/houses/logos/bappa-rawal-house-logo.png',
    heroPath: '/houses/heroes/bappa-rawal-hero.png',
    primaryColor: '#15803d',
    accentColor: '#22c55e',
    softColor: '#f0fdf4',
    borderColor: '#bbf7d0',
    textClass: 'text-green-700',
    bgClass: 'bg-green-700',
    borderClass: 'border-green-300',
    ringClass: 'ring-green-500/30',
    gradientClass: 'from-green-950/95 via-emerald-900/70 to-vpps-navy/92',
    softGradientClass: 'from-green-50 via-white to-amber-50',
    glowClass: 'shadow-green-600/25',
    hero: 'Bappa Rawal',
    postLabel: 'Bappa Rawal House Captain',
    imagePath: '/houses/heroes/bappa-rawal-hero.png',
  },
  yellow: {
    id: 'yellow',
    colorName: 'Yellow',
    name: 'Rana Sanga House',
    heroName: 'Rana Sanga',
    captainPost: 'Rana Sanga House Captain',
    logoPath: '/houses/logos/rana-sanga-house-logo.png',
    heroPath: '/houses/heroes/rana-sanga-hero.png',
    primaryColor: '#a16207',
    accentColor: '#f4b400',
    softColor: '#fffbeb',
    borderColor: '#fde68a',
    textClass: 'text-amber-700',
    bgClass: 'bg-amber-600',
    borderClass: 'border-amber-300',
    ringClass: 'ring-amber-500/30',
    gradientClass: 'from-amber-950/95 via-yellow-800/70 to-vpps-navy/92',
    softGradientClass: 'from-amber-50 via-white to-yellow-50',
    glowClass: 'shadow-amber-500/25',
    hero: 'Rana Sanga',
    postLabel: 'Rana Sanga House Captain',
    imagePath: '/houses/heroes/rana-sanga-hero.png',
  },
}
