import { useState } from 'react'
import { AlertTriangle, CheckCircle2, Play, RotateCcw, Trophy } from 'lucide-react'
import { Button, Card, StatusPill } from '../../components/ui/primitives'
import { getElection, resetDemoData, updateElectionStatus } from '../../lib/electionStore'
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

  function applyStatus(status: ElectionStatus) {
    setElection(updateElectionStatus(status))
  }

  function closeVoting() {
    if (window.confirm('Close voting now? Voters will not be able to submit votes after this.')) applyStatus('voting_closed')
  }

  function resetData() {
    if (window.confirm('Reset demo data? This will restore the sample voters, candidates, and votes.')) setElection(resetDemoData().election)
  }

  return (
    <section className="px-4 py-6 sm:px-8 lg:px-10">
      <p className="text-sm font-black uppercase tracking-[0.22em] text-vpps-richGold">Voting Control</p>
      <h1 className="mt-2 text-3xl font-black sm:text-5xl">Voting Control</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Use these controls only at the election desk.</p>
      <Card className="mt-8 overflow-hidden p-0">
        <div className="bg-vpps-navy p-6 text-white sm:p-8">
          <p className="text-sm font-bold text-white/65">Current status</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h2 className="text-3xl font-black">{formatStatus(election.status)}</h2>
            <StatusPill tone={statusTone(election.status)}>{formatStatus(election.status)}</StatusPill>
          </div>
        </div>
        <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4">
          <Button type="button" onClick={() => applyStatus('voting_open')}><Play size={18} />Open Voting</Button>
          <Button type="button" variant="secondary" onClick={closeVoting}><CheckCircle2 size={18} />Close Voting</Button>
          <Button type="button" variant="secondary" onClick={() => applyStatus('results_published')}><Trophy size={18} />Publish Results</Button>
          <Button type="button" variant="danger" onClick={resetData}><RotateCcw size={18} />Reset Demo Data</Button>
        </div>
      </Card>
      <Card className="mt-6 border-vpps-warning/20 bg-orange-50">
        <div className="flex gap-3">
          <AlertTriangle className="mt-1 shrink-0 text-vpps-warning" />
          <div>
            <h2 className="font-black">Election desk reminder</h2>
            <p className="mt-1 text-sm leading-6 text-slate-700">Results remain hidden from the voting side until the election is closed and results are published. Voter names and Voting IDs are not saved with vote records.</p>
          </div>
        </div>
      </Card>
    </section>
  )
}
