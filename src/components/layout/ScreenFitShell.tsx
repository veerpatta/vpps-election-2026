import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface ScreenFitShellProps {
  header?: ReactNode
  children: ReactNode
  footer?: ReactNode
  className?: string
  mainClassName?: string
  footerClassName?: string
}

export function ScreenFitShell({
  header,
  children,
  footer,
  className,
  mainClassName,
  footerClassName,
}: ScreenFitShellProps) {
  return (
    <section className={cn('mx-auto grid h-dvh w-full max-w-6xl grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden px-3 pb-3 pt-3 sm:px-6 sm:pt-4', className)}>
      {header ? <div className="min-h-0 shrink-0">{header}</div> : <div />}
      <div className={cn('min-h-0 overflow-hidden py-2.5 sm:py-3', mainClassName)}>{children}</div>
      {footer ? (
        <div className={cn('shrink-0 pb-[max(0.25rem,env(safe-area-inset-bottom))]', footerClassName)}>
          {footer}
        </div>
      ) : (
        <div />
      )}
    </section>
  )
}
