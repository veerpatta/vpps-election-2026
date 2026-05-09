import { useState } from 'react'
import { getHouseMeta } from '../../lib/houses'
import { assetPath, cn, initials } from '../../lib/utils'
import type { HouseId } from '../../types/election'

interface CandidateAvatarProps {
  name: string
  imageUrl?: string
  house?: HouseId
  size?: 'sm' | 'md' | 'lg'
  selected?: boolean
  className?: string
}

const sizeClasses = {
  sm: 'h-10 w-10 text-sm',
  md: 'h-16 w-16 text-lg',
  lg: 'h-24 w-24 text-2xl',
}

export function CandidateAvatar({ name, imageUrl, house, size = 'md', selected = false, className }: CandidateAvatarProps) {
  const [failedImageUrl, setFailedImageUrl] = useState<string>()
  const houseMeta = house ? getHouseMeta(house) : undefined
  const hasImage = Boolean(imageUrl && failedImageUrl !== imageUrl)

  return (
    <span
      className={cn(
        'relative inline-grid shrink-0 place-items-center overflow-hidden rounded-2xl border-2 bg-vpps-navy font-black text-vpps-gold shadow-sm',
        sizeClasses[size],
        selected ? 'ring-4 ring-vpps-gold/25' : '',
        className,
      )}
      style={{
        borderColor: selected ? houseMeta?.primaryColor ?? '#f4b400' : houseMeta?.borderColor ?? 'rgba(11, 31, 58, 0.14)',
        backgroundColor: hasImage ? '#ffffff' : houseMeta?.primaryColor ?? '#0b1f3a',
        color: hasImage ? undefined : houseMeta ? '#ffffff' : '#f4b400',
      }}
      aria-label={`${name} photo`}
    >
      {hasImage ? (
        <img
          src={assetPath(imageUrl!)}
          alt={name}
          className="h-full w-full object-cover"
          onError={() => setFailedImageUrl(imageUrl)}
          draggable={false}
        />
      ) : (
        <span>{initials(name)}</span>
      )}
    </span>
  )
}
