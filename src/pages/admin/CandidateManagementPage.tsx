import { useState } from 'react'
import { CheckCircle2, Pencil, Plus, ShieldX, UserRoundX } from 'lucide-react'
import { HouseBadge } from '../../components/house/HouseBadge'
import { HouseLogo } from '../../components/house/HouseLogo'
import { Button, Card, Field, Select, StatusPill, TextInput } from '../../components/ui/primitives'
import { supportedPosts } from '../../data/mockElectionData'
import { getCandidates, saveCandidate, toggleCandidate } from '../../lib/electionStore'
import { getHouseByPost, houseOrder, houses, isHouseCaptainPost } from '../../lib/houses'
import type { Candidate, CouncilPost, HouseId } from '../../types/election'

const blankCandidate = {
  name: '',
  classSection: '',
  rollNumber: '',
  post: 'Head Boy' as CouncilPost,
  house: undefined as HouseId | undefined,
  symbol: '',
  slogan: '',
  approved: true,
  active: true,
}

export function CandidateManagementPage() {
  const [candidates, setCandidates] = useState(() => getCandidates())
  const [form, setForm] = useState<Partial<Candidate>>(blankCandidate)
  const [message, setMessage] = useState('')

  function refresh() {
    setCandidates(getCandidates())
  }

  function handleSave() {
    if (!form.name || !form.classSection || !form.post || !form.symbol) return
    if (isHouseCaptainPost(form.post) && !form.house) {
      setMessage('Please select the candidate house for House Captain.')
      return
    }
    saveCandidate({
      id: form.id,
      name: form.name,
      classSection: form.classSection,
      rollNumber: form.rollNumber,
      post: form.post,
      house: isHouseCaptainPost(form.post) ? form.house : undefined,
      symbol: form.symbol,
      slogan: form.slogan,
      approved: form.approved ?? true,
      active: form.active ?? true,
    })
    setMessage('')
    setForm(blankCandidate)
    refresh()
  }

  return (
    <section className="px-4 py-6 sm:px-8 lg:px-10">
      <p className="text-sm font-black uppercase tracking-[0.22em] text-vpps-richGold">Candidate List</p>
      <h1 className="mt-2 text-3xl font-black sm:text-5xl">Candidate Management</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Approved and active candidates appear on the voting screen.</p>

      <Card className="mt-8">
        <div className="grid gap-4 lg:grid-cols-6">
          <Field label="Student Name"><TextInput value={form.name ?? ''} onChange={(event) => setForm({ ...form, name: event.target.value })} /></Field>
          <Field label="Class & Section"><TextInput value={form.classSection ?? ''} onChange={(event) => setForm({ ...form, classSection: event.target.value })} /></Field>
          <Field label="Roll Number"><TextInput value={form.rollNumber ?? ''} onChange={(event) => setForm({ ...form, rollNumber: event.target.value })} /></Field>
          <Field label="Post Applied For">
            <Select
              value={form.post}
              onChange={(event) => {
                const post = event.target.value as CouncilPost
                const house = getHouseByPost(post)
                setMessage('')
                setForm({ ...form, post, house: isHouseCaptainPost(post) ? house ?? form.house : undefined })
              }}
            >
              {supportedPosts.map((post) => <option key={post}>{post}</option>)}
            </Select>
          </Field>
          {isHouseCaptainPost(form.post) ? (
            <Field label="House">
              <Select value={form.house ?? ''} onChange={(event) => { setMessage(''); setForm({ ...form, house: event.target.value as HouseId }) }}>
                <option value="">Select House</option>
                {houseOrder.map((house) => <option key={house} value={house}>{houses[house].colorName} - {houses[house].name}</option>)}
              </Select>
            </Field>
          ) : null}
          <Field label="Election Symbol"><TextInput value={form.symbol ?? ''} onChange={(event) => setForm({ ...form, symbol: event.target.value })} /></Field>
          <div className="flex items-end">
            <Button type="button" onClick={handleSave} className="w-full"><Plus size={18} />{form.id ? 'Save Candidate' : 'Add Candidate'}</Button>
          </div>
        </div>
        {isHouseCaptainPost(form.post) && form.house ? (
          <div className="mt-4 rounded-3xl border border-vpps-navy/10 bg-vpps-soft/70 p-4">
            <HouseBadge house={form.house} showHeroName />
          </div>
        ) : null}
        {message ? <p className="mt-4 rounded-2xl bg-vpps-danger/10 px-4 py-3 text-sm font-bold text-red-700">{message}</p> : null}
        <div className="mt-4">
          <Field label="Short promise/slogan optional"><TextInput value={form.slogan ?? ''} onChange={(event) => setForm({ ...form, slogan: event.target.value })} /></Field>
        </div>
      </Card>

      <div className="mt-6 grid gap-4">
        {candidates.map((candidate) => {
          const meta = candidate.house ? houses[candidate.house] : undefined
          return (
            <Card
              key={candidate.id}
              className={meta ? `border-2 bg-gradient-to-br ${meta.softGradientClass}` : undefined}
              style={meta ? { borderColor: meta.borderColor } : undefined}
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-4">
                  {candidate.house ? <HouseLogo house={candidate.house} size="lg" /> : null}
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-black">{candidate.name}</h2>
                      <StatusPill tone={candidate.approved ? 'green' : 'orange'}>{candidate.approved ? 'Approved' : 'Not Approved'}</StatusPill>
                      <StatusPill tone={candidate.active ? 'navy' : 'red'}>{candidate.active ? 'Active' : 'Inactive'}</StatusPill>
                      {candidate.house ? <HouseBadge house={candidate.house} size="sm" /> : null}
                    </div>
                    <p className="mt-2 text-sm font-semibold text-slate-600">{candidate.classSection} - {candidate.post} - {candidate.symbol}</p>
                    <p className="mt-1 text-sm text-slate-500">{candidate.slogan}</p>
                  </div>
                </div>
                <div className="grid gap-2 sm:grid-cols-3">
                  <Button type="button" variant="secondary" onClick={() => setForm(candidate)}><Pencil size={17} />Edit</Button>
                  <Button type="button" variant="secondary" onClick={() => { toggleCandidate(candidate.id, 'approved'); refresh() }}>
                    {candidate.approved ? <ShieldX size={17} /> : <CheckCircle2 size={17} />}
                    {candidate.approved ? 'Unapprove' : 'Approve'}
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => { toggleCandidate(candidate.id, 'active'); refresh() }}>
                    <UserRoundX size={17} />
                    {candidate.active ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
