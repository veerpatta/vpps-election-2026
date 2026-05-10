import { useEffect, useState } from 'react'
import { getHouseMeta } from '../../lib/houses'
import { assetPath, cn, initials } from '../../lib/utils'
import type { HouseId } from '../../types/election'

type AvatarShape = 'circle' | 'rounded' | 'portrait'

interface CandidateAvatarProps {
  name: string
  imageUrl?: string
  house?: HouseId
  category?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'fill'
  shape?: AvatarShape
  selected?: boolean
  className?: string
}

const sizeClasses: Record<NonNullable<CandidateAvatarProps['size']>, string> = {
  xs: 'h-9 w-9 text-[0.65rem]',
  sm: 'h-12 w-12 text-xs',
  md: 'h-16 w-16 text-base',
  lg: 'h-20 w-20 text-lg',
  xl: 'h-28 w-28 text-xl',
  fill: 'h-full w-full text-2xl',
}

export function CandidateAvatar({
  name,
  imageUrl,
  house,
  category,
  size = 'md',
  shape = 'circle',
  selected = false,
  className,
}: CandidateAvatarProps) {
  const [failedImageUrl, setFailedImageUrl] = useState<string>()

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFailedImageUrl(undefined)
  }, [imageUrl])

  const houseMeta = house ? getHouseMeta(house) : undefined
  const hasImage = Boolean(imageUrl && failedImageUrl !== imageUrl)
  const accent = houseMeta?.primaryColor ?? '#0B1F3A'

  const shapeClasses =
    shape === 'circle'
      ? 'rounded-full'
      : shape === 'portrait'
      ? 'aspect-[4/5] rounded-2xl w-full'
      : 'rounded-2xl'

  const isPortrait = shape === 'portrait'

  const ringStyle = selected
    ? `0 0 0 2px #ffffff, 0 0 0 4px ${accent}`
    : `0 0 0 1px rgba(11, 31, 58, 0.10)`

  return (
    <span
      className={cn(
        'relative inline-grid shrink-0 place-items-center overflow-hidden bg-white text-vpps-navy',
        shapeClasses,
        !isPortrait ? sizeClasses[size] : '',
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
        <PlaceholderArt name={name} accent={accent} category={category} isPortrait={isPortrait} />
      )}
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
  const tone = category === 'Girl' ? '#fde68a' : '#bfdbfe'
  return (
    <span
      className="flex h-full w-full items-center justify-center text-vpps-navy"
      style={{
        backgroundImage: `linear-gradient(135deg, ${tone}40 0%, #ffffff 60%, ${tone}30 100%)`,
      }}
    >
      <span
        className={cn(
          'grid place-items-center rounded-full font-bold tracking-tight',
          isPortrait ? 'h-20 w-20 text-2xl' : 'h-[68%] w-[68%]',
        )}
        style={{ backgroundColor: accent, color: '#F4B400' }}
      >
        {initials(name) || 'V'}
      </span>
    </span>
  )
}
