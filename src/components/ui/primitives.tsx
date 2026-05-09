import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'quiet'
}

export function Button({ className, variant = 'primary', ...props }: ButtonProps) {
  const styles = {
    primary: 'bg-vpps-gold text-vpps-navy shadow-lg shadow-vpps-gold/25 hover:bg-vpps-richGold',
    secondary: 'border border-vpps-richGold/40 bg-white text-vpps-navy shadow-sm hover:border-vpps-richGold',
    danger: 'bg-vpps-danger text-white shadow-lg shadow-red-600/20 hover:bg-red-700',
    quiet: 'text-vpps-navy hover:bg-vpps-navy/5',
  }
  return (
    <button
      className={cn(
        'inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50',
        styles[variant],
        className,
      )}
      {...props}
    />
  )
}

export function Card({ children, className }: PropsWithChildren<{ className?: string }>) {
  return (
    <div className={cn('rounded-[1.65rem] border border-white/80 bg-white/95 p-5 shadow-soft', className)}>
      {children}
    </div>
  )
}

export function SchoolMark({ small = false }: { small?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.45 }}
      className={cn(
        'grid place-items-center rounded-full border border-vpps-gold/50 bg-vpps-navy text-center text-vpps-gold shadow-2xl shadow-vpps-navy/20',
        small ? 'h-12 w-12 text-xs' : 'h-24 w-24 text-sm',
      )}
      aria-label="VPPS school emblem"
    >
      <span className="font-black leading-none">VPPS</span>
    </motion.div>
  )
}

export function StatusPill({
  children,
  tone = 'navy',
}: PropsWithChildren<{ tone?: 'navy' | 'green' | 'orange' | 'red' | 'gold' }>) {
  const tones = {
    navy: 'bg-vpps-navy/10 text-vpps-navy',
    green: 'bg-vpps-success/10 text-green-700',
    orange: 'bg-vpps-warning/10 text-orange-700',
    red: 'bg-vpps-danger/10 text-red-700',
    gold: 'bg-vpps-gold/20 text-amber-800',
  }
  return <span className={cn('inline-flex items-center rounded-full px-3 py-1 text-xs font-bold', tones[tone])}>{children}</span>
}

export function Field({ label, children }: PropsWithChildren<{ label: string }>) {
  return (
    <label className="grid gap-2 text-sm font-bold text-vpps-navy">
      <span>{label}</span>
      {children}
    </label>
  )
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'min-h-12 rounded-2xl border border-vpps-navy/15 bg-white px-4 text-base text-vpps-navy shadow-inner shadow-vpps-navy/5 placeholder:text-slate-400',
        props.className,
      )}
      {...props}
    />
  )
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        'min-h-12 rounded-2xl border border-vpps-navy/15 bg-white px-4 text-base text-vpps-navy shadow-inner shadow-vpps-navy/5',
        props.className,
      )}
      {...props}
    />
  )
}

export function PageBackground({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-vpps-soft text-vpps-navy">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 left-[-15%] h-96 w-96 rounded-full bg-vpps-gold/15 blur-3xl" />
        <div className="absolute right-[-20%] top-24 h-[28rem] w-[28rem] rounded-full bg-vpps-navy/10 blur-3xl" />
      </div>
      <div className="relative">{children}</div>
    </div>
  )
}
