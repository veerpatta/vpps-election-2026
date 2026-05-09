import { motion, useReducedMotion } from 'framer-motion'
import { Crown, Flag, Shield } from 'lucide-react'
import { useState } from 'react'
import { assetPath, cn, initials } from '../../lib/utils'
import { getHouseMeta } from '../../lib/houses'
import type { HouseId } from '../../types/election'
import { HouseLogo } from './HouseLogo'

interface HouseHeroCardProps {
  house?: HouseId | 'all'
  compact?: boolean
  selected?: boolean
  className?: string
}

export function HouseHeroCard({ house, compact = false, selected = false, className }: HouseHeroCardProps) {
  const [imageFailed, setImageFailed] = useState(false)
  const reducedMotion = useReducedMotion()
  const meta = getHouseMeta(house)

  if (!meta) return null

  return (
    <motion.article
      initial={reducedMotion ? false : { opacity: 0, y: 18 }}
      animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
      whileHover={reducedMotion ? undefined : { y: -3 }}
      transition={{ duration: 0.28 }}
      className={cn(
        'group relative overflow-hidden rounded-[1.65rem] border bg-vpps-navy text-white shadow-2xl',
        selected ? 'ring-4' : '',
        compact ? 'min-h-48' : 'min-h-[19rem]',
        meta.glowClass,
        meta.ringClass,
        className,
      )}
      style={{ borderColor: meta.borderColor }}
    >
      {!imageFailed ? (
        <img
          src={assetPath(meta.heroPath)}
          alt={meta.heroName}
          className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.025]"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <div className={cn('absolute inset-0 bg-gradient-to-br', meta.gradientClass)}>
          <div className="grid h-full place-items-center opacity-25">
            <Shield size={compact ? 70 : 104} />
          </div>
        </div>
      )}
      <div className={cn('absolute inset-0 bg-gradient-to-br', meta.gradientClass)} />
      <div className="absolute inset-0 bg-gradient-to-t from-vpps-navy via-vpps-navy/35 to-transparent" />
      <motion.div
        aria-hidden="true"
        className="absolute -right-20 -top-16 h-48 w-48 rounded-full blur-3xl"
        animate={reducedMotion ? undefined : { opacity: [0.18, 0.34, 0.18], scale: [1, 1.08, 1] }}
        transition={{ duration: 3.2, repeat: Infinity }}
        style={{ backgroundColor: meta.accentColor }}
      />
      <div className={cn('relative flex h-full flex-col justify-between', compact ? 'p-4' : 'p-5 sm:p-6')}>
        <div className="flex items-start justify-between gap-4">
          <HouseLogo house={house} size={compact ? 'md' : 'lg'} animated />
          <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/15 px-3 py-1 text-xs font-black text-white backdrop-blur">
            <Crown size={13} />
            {meta.colorName}
          </span>
        </div>
        <div className={compact ? 'pt-10' : 'pt-20'}>
          <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-vpps-gold backdrop-blur">
            <Flag size={14} />
            {meta.captainPost}
          </p>
          <h2 className={cn('mt-3 max-w-xl font-black leading-tight text-white drop-shadow', compact ? 'text-xl' : 'text-3xl sm:text-4xl')}>
            {meta.name}
          </h2>
          <p className={cn('mt-2 font-bold text-white/88', compact ? 'text-sm' : 'text-base')}>{meta.heroName}</p>
          {!compact ? (
            <p className="mt-4 max-w-md text-sm font-semibold leading-6 text-white/78">
              House Captain voting for this screen uses only eligible candidates from {meta.name}.
            </p>
          ) : null}
        </div>
      </div>
      {imageFailed ? (
        <span className="absolute bottom-4 right-4 rounded-xl bg-white/15 px-2 py-1 text-[0.65rem] font-black text-white/70">
          {initials(meta.name)}
        </span>
      ) : null}
    </motion.article>
  )
}
