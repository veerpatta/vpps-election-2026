import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle2, ListRestart, Play, RotateCcw, Trash2, Trophy } from 'lucide-react'
import { Button, Card, Eyebrow, StatusPill } from '../../components/ui/primitives'
import {
  getDashboardStats,
  getElection,
  resetDemoData,
  resetElectionRun,
  seedDemoData,
  updateElectionStatus,
} from '../../services/electionService'
import { formatStatus } from '../../lib/utils'
import type { ElectionStatus } from '../../types/election'
import type { DashboardStats } from '../../services/types'

function statusTone(status: ElectionStatus) {
  if (status === 'voting_open') return 'green'
  if (status === 'voting_closed') return 'orange'
  if (status === 'results_published') return 'gold'
  return 'navy'
}

export function VotingControlPage() {
  const [election, setElection] = useState<Awaited<ReturnType<typeof getElection>> | null>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [confirmReset, setConfirmReset] = useState<'none' | 'run' | 'demo'>('none')
  const [feedback, setFeedback] = useState<string>('')
  const [loadError, setLoadError] = useState('')
  const [busy, setBusy] = useState(false)

  async function refresh() {
    try {
      const [nextElection, nextStats] = await Promise.all([getElection(), getDashboardStats()])
      setElection(nextElection)
      setStats(nextStats)
      setLoadError('')
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Could not load election controls.')
    }
  }

  useEffect(() => {
    let active = true
    Promise.all([getElection(), getDashboardStats()])
      .then(([nextElection, nextStats]) => {
        if (!active) return
        setElection(nextElection)
        setStats(nextStats)
        setLoadError('')
      })
      .catch((error) => {
        if (!active) return
        setLoadError(error instanceof Error ? error.message : 'Could not load election controls.')
      })
    return () => {
      active = false
    }
  }, [])

  async function applyStatus(status: ElectionStatus) {
    setBusy(true)
    try {
      setElection(await updateElectionStatus(status))
      setStats(await getDashboardStats())
      setFeedback('')
    } finally {
      setBusy(false)
    }
  }

  function closeVoting() {
    if (window.confirm('Close voting now? Voters will not be able to submit votes after this.')) {
      applyStatus('voting_closed')
    }
  }

  async function performResetRun() {
    setBusy(true)
    try {
      await resetElectionRun()
      await refresh()
      setConfirmReset('none')
      setFeedback('Election state reset. Every voter is back to "not voted" and votes were cleared. Voter and candidate lists are unchanged.')
    } finally {
      setBusy(false)
    }
  }

  async function performResetDemo() {
    setBusy(true)
    try {
      await resetDemoData()
      await refresh()
      setConfirmReset('none')
      setFeedback('Wiped to demo defaults. The official voter roster has been reseeded; admin-added voters or candidates were removed.')
    } finally {
      setBusy(false)
    }
  }

  async function performSeedFirestore() {
    if (!window.confirm('Seed Firestore with bundled election data? This will not overwrite existing Firestore data.')) return
    setBusy(true)
    try {
      await seedDemoData(false)
      await refresh()
      setFeedback('Firestore seeded with bundled election data.')
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Could not seed Firestore.')
    } finally {
      setBusy(false)
    }
  }

  const summary = useMemo(
    () => [
      { label: 'Voters', value: stats?.totalVoters ?? 0 },
      { label: 'Votes cast', value: stats?.votesCast ?? 0 },
      { label: 'Pending', value: stats?.pendingVotes ?? 0 },
      { label: 'Approved candidates', value: stats?.approvedCandidates ?? 0 },
    ],
    [stats],
  )

  if (!election || !stats) {
    return (
      <section className="px-4 py-6 sm:px-8 lg:px-10">
        <Card className={`text-sm font-semibold ${loadError ? 'text-red-700' : 'text-vpps-mute'}`}>
          {loadError || 'Loading election controls...'}
        </Card>
      </section>
    )
  }

  return (
    <section className="px-4 py-6 sm:px-8 lg:px-10">
      <Eyebrow>Voting Control</Eyebrow>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-vpps-navy sm:text-4xl">
        Election control room
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-vpps-mute">
        Use these controls only at the election desk. Status changes are visible to voters immediately.
      </p>

      <Card className="mt-6 overflow-hidden p-0">
        <div className="bg-vpps-navy p-6 text-white sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-vpps-gold/90">
                Current status
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight">
                {formatStatus(election.status)}
              </h2>
            </div>
            <StatusPill tone={statusTone(election.status)}>{formatStatus(election.status)}</StatusPill>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {summary.map((item) => (
              <div key={item.label} className="rounded-xl bg-white/5 px-3 py-2.5 ring-1 ring-white/10">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-white/60">
                  {item.label}
                </p>
                <p className="mt-1 font-display text-2xl font-semibold tracking-tight">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-2 p-4 sm:grid-cols-3">
          <Button type="button" disabled={busy} onClick={() => void applyStatus('voting_open')}>
            <Play size={16} />
            Open voting
          </Button>
          <Button type="button" disabled={busy} variant="secondary" onClick={closeVoting}>
            <CheckCircle2 size={16} />
            Close voting
          </Button>
          <Button type="button" disabled={busy} variant="secondary" onClick={() => void applyStatus('results_published')}>
            <Trophy size={16} />
            Publish results
          </Button>
        </div>
      </Card>

      {feedback ? (
        <p className="mt-5 rounded-xl bg-emerald-50 px-3.5 py-2.5 text-sm font-medium text-emerald-700 ring-1 ring-emerald-100">
          {feedback}
        </p>
      ) : null}

      <Card className="mt-6 overflow-hidden p-0">
        <div className="border-b border-vpps-line px-5 py-3">
          <p className="text-sm font-semibold tracking-tight text-vpps-navy">Reset options</p>
          <p className="mt-1 text-xs font-medium text-vpps-mute">
            Two separate actions. Election reset is the safe one to run on poll day; demo wipe is destructive.
          </p>
        </div>

        <div className="grid gap-3 p-4 lg:grid-cols-2">
          {/* Reset election run */}
          <div className="flex flex-col gap-3 rounded-2xl border border-orange-200 bg-orange-50/60 p-4">
            <div className="flex items-start gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-orange-500/10 text-orange-700">
                <ListRestart size={18} />
              </span>
              <div>
                <p className="text-sm font-semibold tracking-tight text-vpps-navy">Reset election state</p>
                <p className="mt-1 text-xs font-medium leading-5 text-vpps-navy/70">
                  Clears every vote and marks every voter as "not voted". Reopens voting. The voter roster and candidate list stay intact. Use this once before live voting begins.
                </p>
              </div>
            </div>
            {confirmReset === 'run' ? (
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="secondary" size="sm" onClick={() => setConfirmReset('none')}>
                  Cancel
                </Button>
                <Button type="button" variant="danger" size="sm" disabled={busy} onClick={() => void performResetRun()}>
                  Yes, reset election state
                </Button>
              </div>
            ) : (
              <Button type="button" variant="secondary" size="sm" className="self-start" onClick={() => setConfirmReset('run')}>
                <ListRestart size={14} />
                Reset election state
              </Button>
            )}
          </div>

          {/* Wipe to demo */}
          <div className="flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50/50 p-4">
            <div className="flex items-start gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-red-500/10 text-red-700">
                <Trash2 size={18} />
              </span>
              <div>
                <p className="text-sm font-semibold tracking-tight text-vpps-navy">Wipe to demo data</p>
                <p className="mt-1 text-xs font-medium leading-5 text-vpps-navy/70">
                  Destroys everything stored in this browser and reseeds from the bundled defaults — including the official voter roster. Any admin-added voters, candidates, or uploaded photos on this device will be lost.
                </p>
              </div>
            </div>
            {confirmReset === 'demo' ? (
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="secondary" size="sm" onClick={() => setConfirmReset('none')}>
                  Cancel
                </Button>
                <Button type="button" variant="danger" size="sm" disabled={busy} onClick={() => void performResetDemo()}>
                  Yes, wipe everything
                </Button>
              </div>
            ) : (
              <Button type="button" variant="secondary" size="sm" className="self-start" onClick={() => setConfirmReset('demo')}>
                <RotateCcw size={14} />
                Wipe to demo data
              </Button>
            )}
          </div>
        </div>
      </Card>

      <Card className="mt-6 border-vpps-navy/10 bg-white">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold tracking-tight text-vpps-navy">Firestore setup</p>
            <p className="mt-1 text-xs font-medium leading-5 text-vpps-navy/70">
              Use once only when the live backend is empty. It will stop if Firestore already contains election data.
            </p>
          </div>
          <Button type="button" variant="secondary" disabled={busy} onClick={() => void performSeedFirestore()}>
            Seed Firestore
          </Button>
        </div>
      </Card>

      <Card className="mt-6 border-orange-100 bg-orange-50/60">
        <div className="flex gap-3">
          <AlertTriangle className="mt-0.5 shrink-0 text-orange-500" />
          <div>
            <p className="text-sm font-semibold tracking-tight text-vpps-navy">Election desk reminder</p>
            <p className="mt-1 text-xs font-medium leading-5 text-vpps-navy/75">
              Results stay hidden from the voting screen until the election is closed and results are published. Voter names and Voting IDs are not saved with vote records.
            </p>
          </div>
        </div>
      </Card>
    </section>
  )
}
