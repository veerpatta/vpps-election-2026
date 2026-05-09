import { motion } from 'framer-motion'
import { Flag, Shield } from 'lucide-react'
import { useState } from 'react'
import { getHouseMeta } from '../../lib/houses'
import { assetPath, cn, initials } from '../../lib/utils'
import type { HouseId } from '../../types/election'

interface HouseLogoProps {
  house?: HouseId | 'all'
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
  className?: string
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-12 w-12',
  lg: 'h-20 w-20',
}

const iconSizes = {
  sm: 16,
  md: 22,
  lg: 34,
}

export function HouseLogo({ house, size = 'md', animated = false, className }: HouseLogoProps) {
  const [imageFailed, setImageFailed] = useState(false)
  const meta = getHouseMeta(house)
  const Icon = house === 'all' ? Flag : Shield

  const content = (
    <span
      className={cn(
        'relative inline-grid shrink-0 place-items-center overflow-hidden rounded-2xl border bg-white shadow-sm',
        sizeClasses[size],
        className,
      )}
      style={{
        borderColor: meta?.borderColor ?? 'rgba(11, 31, 58, 0.14)',
        color: meta?.primaryColor ?? '#0b1f3a',
      }}
      title={meta?.name ?? 'All Houses'}
    >
      {meta && !imageFailed ? (
        <img
          src={assetPath(meta.logoPath)}
          alt={`${meta.name} logo`}
          className="h-full w-full object-contain p-1.5"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span className="grid h-full w-full place-items-center bg-vpps-navy/5">
          <Icon size={iconSizes[size]} />
          {meta && size !== 'sm' ? (
            <span className="absolute bottom-1 text-[0.5rem] font-black leading-none">{initials(meta.name)}</span>
          ) : null}
        </span>
      )}
    </span>
  )

  if (!animated) return content

  return (
    <motion.span
      className="inline-flex"
      initial={{ opacity: 0, scale: 0.86 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.22 }}
    >
      {content}
    </motion.span>
  )
}
