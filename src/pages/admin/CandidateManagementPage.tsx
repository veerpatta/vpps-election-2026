import { useState } from 'react'
import { CheckCircle2, Pencil, Plus, ShieldX, UserRoundX } from 'lucide-react'
import { CandidateAvatar } from '../../components/candidates/CandidateAvatar'
import { HouseBadge } from '../../components/house/HouseBadge'
import { Button, Card, Field, Select, StatusPill, TextInput } from '../../components/ui/primitives'
import { SUPPORTED_POSTS, getElectionPost, getPostLabel } from '../../data/electionPosts'
import { getCandidates, saveCandidate, toggleCandidate } from '../../lib/electionStore'
import { houses } from '../../lib/houses'
import type { Candidate, ElectionPostId } from '../../types/election'

const blankCandidate = {
  name: '',
  classSection: '',
  rollNumber: '',
  postId: 'head-boy' as ElectionPostId,
  photoUrl: '',
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
    if (!form.name || !form.classSection || !form.postId) return
    saveCandidate({
      id: form.id,
      name: form.name,
      classSection: form.classSection,
      rollNumber: form.rollNumber,
      postId: form.postId,
      photoUrl: form.photoUrl,
      symbol: form.symbol,
      slogan: form.slogan,
      category: form.category,
      approved: form.approved ?? true,
      active: form.active ?? true,
    })
    setMessage('')
    setForm(blankCandidate)
    refresh()
  }

  return (
    <section className="px-4 py-5 sm:px-8 lg:px-10">
      <p className="text-sm font-black uppercase tracking-[0.22em] text-vpps-richGold">Candidate List</p>
      <h1 className="mt-2 text-3xl font-black sm:text-4xl">Candidate Management</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Approved and active candidates appear on the voting screen.</p>

      <Card className="mt-5">
        <div className="grid gap-4 lg:grid-cols-6">
          <Field label="Student Name"><TextInput value={form.name ?? ''} onChange={(event) => setForm({ ...form, name: event.target.value })} /></Field>
          <Field label="Class & Section"><TextInput value={form.classSection ?? ''} onChange={(event) => setForm({ ...form, classSection: event.target.value })} /></Field>
          <Field label="Roll Number"><TextInput value={form.rollNumber ?? ''} onChange={(event) => setForm({ ...form, rollNumber: event.target.value })} /></Field>
          <Field label="Post Applied For">
            <Select
              value={form.postId}
              onChange={(event) => {
                const postId = event.target.value as ElectionPostId
                const post = getElectionPost(postId)
                setMessage('')
                setForm({
                  ...form,
                  postId,
                  house: post?.kind === 'house' ? post.house : undefined,
                  captainGender: post?.captainGender,
                })
              }}
            >
              {SUPPORTED_POSTS.map((post) => <option key={post.id} value={post.id}>{post.label}</option>)}
            </Select>
          </Field>
          <Field label="Candidate Photo"><TextInput value={form.photoUrl ?? ''} onChange={(event) => setForm({ ...form, photoUrl: event.target.value })} placeholder="Image URL optional" /></Field>
          <div className="flex items-end">
            <Button type="button" onClick={handleSave} className="w-full"><Plus size={18} />{form.id ? 'Save Candidate' : 'Add Candidate'}</Button>
          </div>
        </div>
        {form.house || form.captainGender ? (
          <div className="mt-4 flex flex-wrap gap-2 rounded-3xl border border-vpps-navy/10 bg-vpps-soft/70 p-4">
            {form.house ? <HouseBadge house={form.house} showHeroName /> : null}
            {form.captainGender ? (
              <StatusPill tone={form.captainGender === 'girls' ? 'orange' : 'navy'}>
                {form.captainGender === 'girls' ? 'Girls Category' : 'Boys Category'}
              </StatusPill>
            ) : null}
          </div>
        ) : null}
        {message ? <p className="mt-4 rounded-2xl bg-vpps-danger/10 px-4 py-3 text-sm font-bold text-red-700">{message}</p> : null}
      </Card>

      <div className="mt-5 grid gap-3">
        {candidates.map((candidate) => {
          const meta = candidate.house ? houses[candidate.house] : undefined
          return (
            <Card
              key={candidate.id}
              className={meta ? `border-2 bg-gradient-to-br p-4 ${meta.softGradientClass}` : 'p-4'}
              style={meta ? { borderColor: meta.borderColor } : undefined}
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-4">
                  <CandidateAvatar name={candidate.name} imageUrl={candidate.photoUrl} house={candidate.house} size="md" />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-black">{candidate.name}</h2>
                      <StatusPill tone={candidate.approved ? 'green' : 'orange'}>{candidate.approved ? 'Approved' : 'Not Approved'}</StatusPill>
                      <StatusPill tone={candidate.active ? 'navy' : 'red'}>{candidate.active ? 'Active' : 'Inactive'}</StatusPill>
                      {candidate.house ? <HouseBadge house={candidate.house} size="sm" /> : null}
                    </div>
                    <p className="mt-2 text-sm font-semibold text-slate-600">{candidate.classSection} - {getPostLabel(candidate.postId)}</p>
                    {candidate.rollNumber ? <p className="mt-1 text-xs font-bold text-slate-500">Roll No. {candidate.rollNumber}</p> : null}
                    {candidate.captainGender ? (
                      <StatusPill tone={candidate.captainGender === 'girls' ? 'orange' : 'navy'}>
                        {candidate.captainGender === 'girls' ? 'Girls' : 'Boys'}
                      </StatusPill>
                    ) : null}
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
