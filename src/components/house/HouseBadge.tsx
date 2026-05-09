import { Shield } from 'lucide-react'
import { cn } from '../../lib/utils'
import { getHouseMeta } from '../../lib/houses'
import type { HouseId } from '../../types/election'

interface HouseBadgeProps {
  house?: HouseId | 'all'
  size?: 'sm' | 'md' | 'lg'
  showHero?: boolean
  className?: string
}

export function HouseBadge({ house, size = 'md', showHero = true, className }: HouseBadgeProps) {
  const meta = getHouseMeta(house)

  if (!meta) {
    return (
      <span className={cn('inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600', className)}>
        <Shield size={14} />
        All Houses
      </span>
    )
  }

  const sizes = {
    sm: 'px-2.5 py-1 text-[0.68rem]',
    md: 'px-3 py-1.5 text-xs',
    lg: 'px-4 py-2 text-sm',
  }

  return (
    <span
      className={cn('inline-flex items-center gap-2 rounded-full border font-black shadow-sm', sizes[size], className)}
      style={{
        backgroundColor: meta.softColor,
        borderColor: meta.borderColor,
        color: meta.primaryColor,
      }}
    >
      <span className="grid h-5 w-5 place-items-center rounded-full text-white" style={{ backgroundColor: meta.primaryColor }}>
        <Shield size={size === 'lg' ? 14 : 12} />
      </span>
      <span>{meta.colorName} - {meta.name}</span>
      {showHero ? <span className="font-semibold opacity-80">({meta.hero})</span> : null}
    </span>
  )
}
