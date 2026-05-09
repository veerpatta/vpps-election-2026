import { useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle2, ListRestart, Play, RotateCcw, Trash2, Trophy } from 'lucide-react'
import { Button, Card, Eyebrow, StatusPill } from '../../components/ui/primitives'
import {
  getDashboardStats,
  getElection,
  resetDemoData,
  resetElectionRun,
  updateElectionStatus,
} from '../../lib/electionStore'
import { formatStatus } from '../../lib/utils'
import type { ElectionStatus } from '../../types/election'

function statusTone(status: ElectionStatus) {
  if (status === 'voting_open') return 'green'
  if (status === 'voting_closed') return 'orange'
  if (status === 'results_published') return 'gold'
  return 'navy'
}

export function VotingControlPage() {
  const [election, setElection] = useState(() => getElection())
  const [stats, setStats] = useState(() => getDashboardStats())
  const [confirmReset, setConfirmReset] = useState<'none' | 'run' | 'demo'>('none')
  const [feedback, setFeedback] = useState<string>('')

  function refresh() {
    setElection(getElection())
    setStats(getDashboardStats())
  }

  function applyStatus(status: ElectionStatus) {
    setElection(updateElectionStatus(status))
    setStats(getDashboardStats())
    setFeedback('')
  }

  function closeVoting() {
    if (window.confirm('Close voting now? Voters will not be able to submit votes after this.')) {
      applyStatus('voting_closed')
    }
  }

  function performResetRun() {
    resetElectionRun()
    refresh()
    setConfirmReset('none')
    setFeedback('Election state reset. Every voter is back to "not voted" and votes were cleared. Voter and candidate lists are unchanged.')
  }

  function performResetDemo() {
    resetDemoData()
    refresh()
    setConfirmReset('none')
    setFeedback('Wiped to demo defaults. The official voter roster has been reseeded; admin-added voters or candidates were removed.')
  }

  const summary = useMemo(
    () => [
      { label: 'Voters', value: stats.totalVoters },
      { label: 'Votes cast', value: stats.votesCast },
      { label: 'Pending', value: stats.pendingVotes },
      { label: 'Approved candidates', value: stats.approvedCandidates },
    ],
    [stats],
  )

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
          <Button type="button" onClick={() => applyStatus('voting_open')}>
            <Play size={16} />
            Open voting
          </Button>
          <Button type="button" variant="secondary" onClick={closeVoting}>
            <CheckCircle2 size={16} />
            Close voting
          </Button>
          <Button type="button" variant="secondary" onClick={() => applyStatus('results_published')}>
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
                <Button type="button" variant="danger" size="sm" onClick={performResetRun}>
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
                <Button type="button" variant="danger" size="sm" onClick={performResetDemo}>
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
