import type { ButtonHTMLAttributes, HTMLAttributes, PropsWithChildren } from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'quiet'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({ className, variant = 'primary', size = 'md', ...props }: ButtonProps) {
  const variants = {
    primary:
      'bg-vpps-navy text-white shadow-[0_8px_20px_-10px_rgba(11,31,58,0.55)] ring-1 ring-vpps-navy/30 hover:bg-vpps-navySoft active:translate-y-px',
    secondary:
      'bg-white text-vpps-navy ring-1 ring-vpps-line shadow-sm hover:ring-vpps-navy/30 hover:shadow active:translate-y-px',
    ghost:
      'bg-transparent text-vpps-navy hover:bg-vpps-navy/[0.04] active:translate-y-px',
    danger:
      'bg-vpps-danger text-white shadow-[0_8px_20px_-10px_rgba(220,38,38,0.55)] hover:bg-red-700 active:translate-y-px',
    quiet:
      'bg-vpps-soft text-vpps-navy ring-1 ring-vpps-line hover:bg-white active:translate-y-px',
  }
  const sizes = {
    sm: 'h-9 px-3 text-xs',
    md: 'h-11 px-5 text-sm',
    lg: 'h-12 px-6 text-base',
  }
  return (
    <button
      className={cn(
        'inline-flex select-none items-center justify-center gap-2 rounded-xl font-semibold tracking-tight transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-40',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  )
}

export function Card({ children, className, ...props }: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-vpps-line bg-white p-5 shadow-card',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function SchoolMark({ small = false }: { small?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className={cn(
        'grid place-items-center rounded-full border border-vpps-gold/40 bg-vpps-navy text-center text-vpps-gold shadow-floating',
        small ? 'h-12 w-12 text-xs' : 'h-24 w-24 text-sm',
      )}
      aria-label="VPPS school emblem"
    >
      <span className="font-bold leading-none">VPPS</span>
    </motion.div>
  )
}

type PillTone = 'navy' | 'green' | 'orange' | 'red' | 'gold' | 'slate'

export function StatusPill({
  children,
  tone = 'navy',
}: PropsWithChildren<{ tone?: PillTone }>) {
  const tones: Record<PillTone, string> = {
    navy: 'bg-vpps-navy/[0.06] text-vpps-navy ring-vpps-navy/15',
    green: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
    orange: 'bg-orange-50 text-orange-800 ring-orange-200',
    red: 'bg-red-50 text-red-700 ring-red-200',
    gold: 'bg-amber-50 text-amber-800 ring-amber-200',
    slate: 'bg-slate-100 text-slate-700 ring-slate-200',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.7rem] font-semibold ring-1 ring-inset',
        tones[tone],
      )}
    >
      {children}
    </span>
  )
}

export function Field({ label, children }: PropsWithChildren<{ label: string }>) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-vpps-navy">
      <span className="text-xs font-semibold uppercase tracking-wide text-vpps-mute">{label}</span>
      {children}
    </label>
  )
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        'h-11 rounded-xl border border-vpps-line bg-white px-3.5 text-sm text-vpps-navy shadow-inset placeholder:text-slate-400 focus:border-vpps-navy/40',
        props.className,
      )}
    />
  )
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        'h-11 rounded-xl border border-vpps-line bg-white px-3.5 text-sm text-vpps-navy shadow-inset focus:border-vpps-navy/40',
        props.className,
      )}
    />
  )
}

export function PageBackground({ children }: PropsWithChildren) {
  return (
    <div className="relative min-h-screen bg-vpps-soft text-vpps-navy">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 bg-paper-grain bg-paper-grain opacity-60"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 h-[420px]"
        style={{
          background:
            'radial-gradient(80% 60% at 50% 0%, rgba(244, 180, 0, 0.10) 0%, rgba(244, 180, 0, 0) 55%)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 -bottom-32 h-[320px]"
        style={{
          background:
            'radial-gradient(70% 50% at 50% 100%, rgba(11, 31, 58, 0.06) 0%, rgba(11, 31, 58, 0) 70%)',
        }}
      />
      <div className="relative">{children}</div>
    </div>
  )
}

export function Eyebrow({ children, className }: PropsWithChildren<{ className?: string }>) {
  return (
    <p
      className={cn(
        'inline-flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-vpps-deepGold',
        className,
      )}
    >
      <span className="h-px w-5 bg-vpps-deepGold/60" />
      {children}
    </p>
  )
}
