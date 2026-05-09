import { Crown, Flag, Shield } from 'lucide-react'
import { useState } from 'react'
import { cn, initials } from '../../lib/utils'
import { getHouseMeta } from '../../lib/houses'
import type { HouseId } from '../../types/election'

interface HouseHeroCardProps {
  house?: HouseId | 'all'
  compact?: boolean
  className?: string
}

export function HouseHeroCard({ house, compact = false, className }: HouseHeroCardProps) {
  const [imageFailed, setImageFailed] = useState(false)
  const meta = getHouseMeta(house)

  if (!meta) return null

  return (
    <div
      className={cn('overflow-hidden rounded-3xl border bg-white shadow-soft', compact ? 'p-4' : 'p-5', className)}
      style={{ borderColor: meta.borderColor }}
    >
      <div className={cn('grid gap-4', compact ? 'grid-cols-[4.5rem_1fr]' : 'sm:grid-cols-[8rem_1fr] sm:items-center')}>
        <div
          className={cn('relative grid place-items-center overflow-hidden rounded-3xl border', compact ? 'h-20 w-20' : 'h-28 w-28')}
          style={{
            borderColor: meta.borderColor,
            background: `linear-gradient(145deg, ${meta.softColor}, #ffffff)`,
          }}
        >
          {!imageFailed ? (
            <img
              src={meta.imagePath}
              alt={meta.hero}
              className="h-full w-full object-cover"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <div className="grid h-full w-full place-items-center">
              <div className="relative grid h-16 w-16 place-items-center rounded-2xl text-white" style={{ backgroundColor: meta.primaryColor }}>
                <Shield size={compact ? 28 : 34} />
                <span className="absolute text-[0.6rem] font-black tracking-wide text-white">{initials(meta.hero)}</span>
              </div>
            </div>
          )}
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full px-3 py-1 text-xs font-black text-white" style={{ backgroundColor: meta.primaryColor }}>
              {meta.colorName} House
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-vpps-gold/20 px-3 py-1 text-xs font-black text-amber-800">
              <Crown size={13} />
              House Captain Vote
            </span>
          </div>
          <h2 className={cn('mt-3 font-black text-vpps-navy', compact ? 'text-lg' : 'text-2xl')}>{meta.name}</h2>
          <p className="mt-1 text-sm font-semibold text-slate-600">{meta.hero}</p>
          {!compact ? (
            <p className="mt-3 inline-flex items-center gap-2 text-sm font-bold" style={{ color: meta.primaryColor }}>
              <Flag size={16} />
              Only candidates from this house are shown here.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
