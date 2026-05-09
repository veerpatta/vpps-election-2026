import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Lock, Printer, Trophy } from 'lucide-react'
import { BrandHeader } from '../../components/brand/BrandHeader'
import { BrandLogo } from '../../components/brand/BrandLogo'
import { HouseBadge } from '../../components/house/HouseBadge'
import { Button, Card, StatusPill } from '../../components/ui/primitives'
import { exportResultsCsv, getElection, getResults } from '../../lib/electionStore'
import { getHouseByPost, houses } from '../../lib/houses'
import { formatStatus } from '../../lib/utils'

export function ResultsPage() {
  const [election] = useState(() => getElection())
  const results = useMemo(() => getResults(), [])
  const canShowResults = election.status === 'voting_closed' || election.status === 'results_published'
  const resultDate = useMemo(() => new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }), [])

  return (
    <section className="px-4 py-6 sm:px-8 lg:px-10">
      <div className="no-print flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <BrandHeader compact className="mb-6" />
          <p className="text-sm font-black uppercase tracking-[0.22em] text-vpps-richGold">Results</p>
          <h1 className="mt-2 text-3xl font-black sm:text-5xl">Election Results</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Candidate totals are shown only after voting is closed.</p>
        </div>
        <StatusPill tone={election.status === 'results_published' ? 'gold' : 'navy'}>{formatStatus(election.status)}</StatusPill>
      </div>

      {!canShowResults ? (
        <Card className="mt-8 grid place-items-center gap-3 py-10 text-center">
          <div className="rounded-2xl bg-vpps-gold/15 p-3 text-vpps-richGold"><Lock size={30} /></div>
          <h2 className="text-xl font-black">Results are hidden</h2>
          <p className="max-w-md text-sm leading-6 text-slate-600">Close voting before viewing candidate totals. This keeps the election fair while voting is active.</p>
        </Card>
      ) : (
        <div className="print-area mt-8">
          <div className="no-print mb-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" onClick={exportResultsCsv}><Trophy size={18} />Download Result</Button>
            <Button type="button" onClick={() => window.print()}><Printer size={18} />Print Result Sheet</Button>
          </div>
          <div className="mb-6 rounded-3xl border border-vpps-navy/10 bg-white p-5 text-center shadow-soft print:border-0 print:p-0 print:shadow-none">
            <BrandLogo variant="full" className="mx-auto h-28 w-full max-w-sm print:h-24" />
            <p className="mt-4 text-xl font-black text-vpps-navy">Veer Patta Senior Secondary School</p>
            <p className="mt-1 text-sm font-bold text-slate-600">VPPS Student Council Election 2026</p>
            <h2 className="mt-3 text-2xl font-black text-vpps-navy">Final Result Sheet</h2>
            <p className="mt-1 text-sm font-semibold text-slate-600">Date: {resultDate}</p>
          </div>
          <div className="grid gap-6">
            {results.map((result) => {
              const house = getHouseByPost(result.post)
              const meta = house ? houses[house] : undefined
              return (
              <Card key={result.post} className={meta ? 'border-2' : undefined} style={meta ? { borderColor: meta.borderColor } : undefined}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-black uppercase tracking-[0.18em] text-vpps-richGold">{result.post}</p>
                    <h2 className="mt-2 text-2xl font-black">{result.winner ? result.winner.name : 'No winner yet'}</h2>
                    <p className="mt-1 text-sm font-semibold text-slate-600">Total votes: {result.totalVotes}</p>
                    {house ? <HouseBadge house={house} className="mt-3" /> : null}
                  </div>
                  {result.winner ? (
                    <motion.div className="rounded-3xl px-5 py-4 text-vpps-navy" style={{ backgroundColor: meta?.softColor ?? 'rgba(244,180,0,0.20)' }}>
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-800">Winner</p>
                      <p className="mt-1 text-lg font-black">{result.winner.classSection}</p>
                    </motion.div>
                  ) : null}
                </div>
                <div className="mt-5 overflow-hidden rounded-3xl border border-vpps-navy/10">
                  <div className="hidden grid-cols-[1.2fr_0.7fr_0.8fr_0.5fr_0.6fr] gap-3 bg-vpps-navy px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-white lg:grid">
                    <span>Candidate</span><span>Class</span><span>House</span><span>Votes</span><span>Result</span>
                  </div>
                  {result.rows.map((row) => (
                    <div key={row.candidate.id} className="grid gap-2 border-b border-slate-100 bg-white px-4 py-4 last:border-b-0 lg:grid-cols-[1.2fr_0.7fr_0.8fr_0.5fr_0.6fr] lg:items-center">
                      <p className="font-black">{row.candidate.name}</p>
                      <p className="text-sm font-semibold text-slate-600">{row.candidate.classSection}</p>
                      <div>{row.candidate.house ? <HouseBadge house={row.candidate.house} size="sm" showHero={false} /> : <span className="text-sm font-semibold text-slate-500">General</span>}</div>
                      <p className="text-xl font-black">{row.votes}</p>
                      <div>{row.isWinner ? <StatusPill tone="green">Winner</StatusPill> : <span className="text-sm font-semibold text-slate-500">-</span>}</div>
                    </div>
                  ))}
                </div>
              </Card>
            )})}
          </div>
        </div>
      )}
    </section>
  )
}
