import { BrandLogo } from './BrandLogo'
import { cn } from '../../lib/utils'

interface BrandHeaderProps {
  className?: string
  title?: string
  subtitle?: string
  compact?: boolean
  logoVariant?: 'full' | 'icon' | 'square'
}

export function BrandHeader({
  className,
  title = 'VPPS Student Council Election 2026',
  subtitle = 'Veer Patta Senior Secondary School',
  compact = false,
  logoVariant = 'icon',
}: BrandHeaderProps) {
  return (
    <div className={cn('flex items-center gap-3', compact ? 'gap-3' : 'gap-4', className)}>
      <BrandLogo
        variant={logoVariant}
        className={cn('shrink-0', compact ? 'h-12 w-12' : logoVariant === 'full' ? 'h-20 w-56' : 'h-16 w-16')}
        showFallbackText={!compact}
      />
      <div className="min-w-0">
        <p className={cn('font-black leading-tight text-vpps-navy', compact ? 'text-sm' : 'text-lg')}>{title}</p>
        <p className={cn('mt-1 leading-tight text-slate-600', compact ? 'text-xs' : 'text-sm')}>{subtitle}</p>
      </div>
    </div>
  )
}
