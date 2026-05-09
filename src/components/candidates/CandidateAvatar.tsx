import { useEffect, useState } from 'react'
import { getHouseMeta } from '../../lib/houses'
import { assetPath, cn, initials } from '../../lib/utils'
import type { HouseId } from '../../types/election'

type AvatarShape = 'rounded' | 'portrait'

interface CandidateAvatarProps {
  name: string
  imageUrl?: string
  house?: HouseId
  category?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  shape?: AvatarShape
  selected?: boolean
  className?: string
}

const sizeClasses = {
  sm: 'h-10 w-10 text-xs',
  md: 'h-16 w-16 text-base',
  lg: 'h-24 w-24 text-xl',
  xl: 'h-full w-full text-3xl',
}

const portraitRatio = 'aspect-[4/5]'

export function CandidateAvatar({
  name,
  imageUrl,
  house,
  category,
  size = 'md',
  shape = 'rounded',
  selected = false,
  className,
}: CandidateAvatarProps) {
  const [failedImageUrl, setFailedImageUrl] = useState<string>()
  useEffect(() => {
    setFailedImageUrl(undefined)
  }, [imageUrl])

  const houseMeta = house ? getHouseMeta(house) : undefined
  const hasImage = Boolean(imageUrl && failedImageUrl !== imageUrl)
  const accent = houseMeta?.primaryColor ?? '#0b1f3a'

  const isPortrait = shape === 'portrait'
  const baseClasses = isPortrait
    ? cn('relative w-full overflow-hidden rounded-2xl', portraitRatio)
    : cn('relative inline-grid place-items-center overflow-hidden rounded-2xl', sizeClasses[size])

  const ringStyle = selected
    ? `0 0 0 2px ${accent}, 0 14px 30px rgba(11, 31, 58, 0.18)`
    : `0 0 0 1px rgba(11, 31, 58, 0.10)`

  return (
    <span
      className={cn(
        'shrink-0 bg-white text-vpps-navy',
        baseClasses,
        className,
      )}
      style={{ boxShadow: ringStyle }}
      aria-label={`${name} portrait`}
    >
      {hasImage ? (
        <img
          src={assetPath(imageUrl!)}
          alt={name}
          loading="lazy"
          decoding="async"
          draggable={false}
          onError={() => setFailedImageUrl(imageUrl)}
          className={cn(
            'h-full w-full object-cover',
            isPortrait ? 'object-[center_18%]' : 'object-[center_top]',
          )}
        />
      ) : (
        <PlaceholderArt
          name={name}
          accent={accent}
          category={category}
          isPortrait={isPortrait}
        />
      )}
      {selected ? (
        <span
          className="pointer-events-none absolute inset-0 ring-2 ring-inset"
          style={{ boxShadow: `inset 0 0 0 2px ${accent}` }}
        />
      ) : null}
    </span>
  )
}

function PlaceholderArt({
  name,
  accent,
  category,
  isPortrait,
}: {
  name: string
  accent: string
  category?: string
  isPortrait: boolean
}) {
  const tone = category === 'Girl' ? '#fef3c7' : '#e6ecf5'
  return (
    <span
      className={cn(
        'flex h-full w-full flex-col items-center justify-center gap-1 bg-gradient-to-b from-white to-slate-50 text-vpps-navy',
        isPortrait ? '' : 'p-1',
      )}
      style={{ backgroundImage: `linear-gradient(180deg, ${tone}, #ffffff 70%)` }}
    >
      <span
        className={cn(
          'grid place-items-center rounded-full font-black tracking-wide',
          isPortrait ? 'h-20 w-20 text-2xl' : 'h-9 w-9 text-sm',
        )}
        style={{ backgroundColor: accent, color: '#f4b400' }}
      >
        {initials(name) || 'V'}
      </span>
      {isPortrait ? (
        <span className="mt-2 text-[0.65rem] font-black uppercase tracking-[0.2em] text-vpps-navy/70">
          VPPS
        </span>
      ) : null}
    </span>
  )
}
