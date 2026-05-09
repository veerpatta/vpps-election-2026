import { motion, useReducedMotion } from 'framer-motion'
import { Flag } from 'lucide-react'
import { cn } from '../../lib/utils'
import { getHouseMeta } from '../../lib/houses'
import type { HouseId } from '../../types/election'
import { HouseLogo } from './HouseLogo'

interface HouseBadgeProps {
  house?: HouseId | 'all'
  showLogo?: boolean
  showHeroName?: boolean
  showHero?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function HouseBadge({
  house,
  size = 'md',
  showLogo = true,
  showHeroName,
  showHero,
  className,
}: HouseBadgeProps) {
  const reducedMotion = useReducedMotion()
  const meta = getHouseMeta(house)
  const shouldShowHeroName = showHeroName ?? showHero ?? true
  const sizes = {
    sm: 'gap-1.5 px-2.5 py-1 text-[0.68rem]',
    md: 'gap-2 px-3 py-1.5 text-xs',
    lg: 'gap-2.5 px-4 py-2 text-sm',
  }
  const logoSize = size === 'lg' ? 'md' : 'sm'

  if (!meta) {
    return (
      <motion.span
        initial={reducedMotion ? false : { opacity: 0, scale: 0.96 }}
        animate={reducedMotion ? undefined : { opacity: 1, scale: 1 }}
        className={cn('inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600', className)}
      >
        <Flag size={14} />
        Teacher voter
      </motion.span>
    )
  }

  return (
    <motion.span
      initial={reducedMotion ? false : { opacity: 0, scale: 0.96 }}
      animate={reducedMotion ? undefined : { opacity: 1, scale: 1 }}
      transition={{ duration: 0.18 }}
      className={cn('inline-flex max-w-full items-center rounded-full border font-black shadow-sm', sizes[size], className)}
      style={{
        backgroundColor: meta.softColor,
        borderColor: meta.borderColor,
        color: meta.primaryColor,
      }}
    >
      {showLogo ? <HouseLogo house={house} size={logoSize} /> : null}
      <span className="truncate">{meta.colorName} - {meta.name}</span>
      {shouldShowHeroName ? <span className="hidden font-semibold opacity-80 sm:inline">({meta.heroName})</span> : null}
    </motion.span>
  )
}
