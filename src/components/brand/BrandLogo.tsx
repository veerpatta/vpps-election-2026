import { useState } from 'react'
import { motion } from 'framer-motion'
import { assetPath, cn } from '../../lib/utils'

type BrandLogoVariant = 'full' | 'icon' | 'square'

interface BrandLogoProps {
  variant: BrandLogoVariant
  className?: string
  showFallbackText?: boolean
  animated?: boolean
}

const logoSources: Record<BrandLogoVariant, string> = {
  full: '/brand/vpps-logo-full.png',
  icon: '/brand/vpps-logo-icon.png',
  square: '/brand/vpps-logo-square.png',
}

const fallbackLabels: Record<BrandLogoVariant, string> = {
  full: 'Veer Patta Senior Secondary School',
  icon: 'VPPS',
  square: 'Veer Patta Senior Secondary School',
}

export function BrandLogo({ variant, className, showFallbackText = true, animated = false }: BrandLogoProps) {
  const [imageFailed, setImageFailed] = useState(false)
  const content = imageFailed ? (
    <div className="grid h-full w-full place-items-center rounded-xl border border-vpps-gold/40 bg-white px-3 py-2 text-center text-vpps-navy">
      <span className="text-xs font-black leading-tight sm:text-sm">
        {showFallbackText ? fallbackLabels[variant] : 'VPPS'}
      </span>
    </div>
  ) : (
    <img
      src={assetPath(logoSources[variant])}
      alt="Veer Patta Senior Secondary School logo"
      className="h-full w-full object-contain"
      draggable={false}
      onError={() => setImageFailed(true)}
    />
  )

  if (animated) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
        className={cn('select-none', className)}
      >
        {content}
      </motion.div>
    )
  }

  return <div className={cn('select-none', className)}>{content}</div>
}
