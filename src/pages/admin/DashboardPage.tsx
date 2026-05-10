import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { CheckCircle2, Clock3, GraduationCap, Shield, Trophy, UserCheck, Users, Vote } from 'lucide-react'
import { HouseShowcase } from '../../components/house/HouseShowcase'
import { Card, StatusPill } from '../../components/ui/primitives'
import { getDashboardStats, getHouseStats } from '../../services/electionService'
import { houses } from '../../lib/houses'
import { formatStatus } from '../../lib/utils'
import type { DashboardStats, HouseStats } from '../../services/types'

function CountUp({ value, suffix = '' }: { value: number; suffix?: string }) {
  const motionValue = useMotionValue(0)
  const springValue = useSpring(motionValue, { stiffness: 80, damping: 18 })
  const display = useTransform(springValue, (latest) => `${Math.round(latest)}${suffix}`)
  useEffect(() => {
    motionValue.set(value)
  }, [motionValue, value])
  return <motion.span>{display}</motion.span>
}

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [houseStats, setHouseStats] = useState<HouseStats[]>([])
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    let active = true
    Promise.all([getDashboardStats(), getHouseStats()])
      .then(([nextStats, nextHouseStats]) => {
        if (!active) return
        setStats(nextStats)
        setHouseStats(nextHouseStats)
      })
      .catch((error) => {
        if (!active) return
        setLoadError(error instanceof Error ? error.message : 'Could not load election dashboard.')
      })
    return () => {
      active = false
    }
  }, [])

  if (!stats) {
    return (
      <section className="px-4 py-6 sm:px-8 lg:px-10">
        <Card className={`text-sm font-semibold ${loadError ? 'text-red-700' : 'text-vpps-mute'}`}>
          {loadError || 'Loading election dashboard...'}
        </Card>
      </section>
    )
  }

  const cards = [
    { label: 'Voting Status', value: formatStatus(stats.election.status), icon: Shield, tone: 'gold' as const },
    { label: 'Total Voters', value: stats.totalVoters, icon: Users },
    { label: 'Student Voters', value: stats.studentVoters, icon: GraduationCap },
    { label: 'Teacher Voters', value: stats.teacherVoters, icon: UserCheck },
    { label: 'Votes Cast', value: stats.votesCast, icon: Vote },
    { label: 'Pending Votes', value: stats.pendingVotes, icon: Clock3 },
    { label: 'Approved Candidates', value: stats.approvedCandidates, icon: CheckCircle2 },
    { label: 'Current Turnout %', value: stats.turnout, icon: Trophy, suffix: '%' },
  ]
  return (
    <section className="px-4 py-6 sm:px-8 lg:px-10">
      <p className="text-sm font-black uppercase tracking-[0.22em] text-vpps-richGold">Shri Veer Patta Senior Secondary School</p>
      <h1 className="mt-2 text-3xl font-black sm:text-5xl">VPPS Election Control Room</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Simple overview for the election desk. Staff can see voting progress, not candidate choices by voter.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card, index) => {
          const Icon = card.icon
          return (
            <motion.div key={card.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
              <Card className="min-h-40">
                <div className="flex items-center justify-between gap-4">
                  <div className="rounded-2xl bg-vpps-navy p-3 text-vpps-gold"><Icon size={24} /></div>
                  {card.tone ? <StatusPill tone={card.tone}>Live</StatusPill> : null}
                </div>
                <p className="mt-6 text-sm font-bold text-slate-500">{card.label}</p>
                <p className="mt-2 text-3xl font-black text-vpps-navy">{typeof card.value === 'number' ? <CountUp value={card.value} suffix={card.suffix} /> : card.value}</p>
              </Card>
            </motion.div>
          )
        })}
      </div>
      <div className="mt-8 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div>
          <h2 className="text-xl font-black text-vpps-navy">House Showcase</h2>
          <HouseShowcase compact className="mt-4" />
        </div>
        <Card>
          <h2 className="text-xl font-black text-vpps-navy">House Voter Status</h2>
          <div className="mt-4 grid gap-3">
            {houseStats.map((row) => {
              const meta = houses[row.house]
              const pct = row.voters ? Math.round((row.voted / row.voters) * 100) : 0
              return (
                <div key={row.house} className="rounded-2xl border p-3" style={{ borderColor: meta.borderColor, backgroundColor: meta.softColor }}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-black" style={{ color: meta.primaryColor }}>{meta.name}</p>
                    <StatusPill tone="navy">{row.voted}/{row.voters}</StatusPill>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-white">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: meta.primaryColor }} />
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>
    </section>
  )
}
