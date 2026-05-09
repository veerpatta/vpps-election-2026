import { useState } from 'react'
import { RefreshCcw, RotateCcw, UserPlus } from 'lucide-react'
import { Button, Card, Field, Select, StatusPill, TextInput } from '../../components/ui/primitives'
import { generateVotingId, getVoters, resetVoterForDemo, saveVoter, toggleVoterActive } from '../../lib/electionStore'
import type { Voter, VoterType } from '../../types/election'

const blankVoter = {
  voterName: '',
  voterType: 'student' as VoterType,
  classSection: '',
  rollNumber: '',
  departmentOrRole: '',
  votingId: '',
  hasVoted: false,
  active: true,
}

export function VoterManagementPage() {
  const [voters, setVoters] = useState(() => getVoters())
  const [form, setForm] = useState<Partial<Voter>>(blankVoter)

  function refresh() {
    setVoters(getVoters())
  }

  function handleSave() {
    if (!form.voterName || !form.voterType || !form.votingId || form.votingId.length !== 6) return
    saveVoter({
      id: form.id,
      voterName: form.voterName,
      voterType: form.voterType,
      classSection: form.classSection,
      rollNumber: form.rollNumber,
      departmentOrRole: form.departmentOrRole,
      votingId: form.votingId,
      hasVoted: form.hasVoted ?? false,
      votedAt: form.votedAt,
      active: form.active ?? true,
    })
    setForm(blankVoter)
    refresh()
  }

  return (
    <section className="px-4 py-6 sm:px-8 lg:px-10">
      <p className="text-sm font-black uppercase tracking-[0.22em] text-vpps-richGold">Voter List</p>
      <h1 className="mt-2 text-3xl font-black sm:text-5xl">Voter Management</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Students and teachers use the same simple 6-digit Voting ID.</p>

      <Card className="mt-8">
        <div className="grid gap-4 lg:grid-cols-6">
          <Field label="Voter Name"><TextInput value={form.voterName ?? ''} onChange={(event) => setForm({ ...form, voterName: event.target.value })} /></Field>
          <Field label="Voter Type">
            <Select value={form.voterType} onChange={(event) => setForm({ ...form, voterType: event.target.value as VoterType })}>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </Select>
          </Field>
          <Field label="Class & Section"><TextInput value={form.classSection ?? ''} onChange={(event) => setForm({ ...form, classSection: event.target.value })} /></Field>
          <Field label="Roll / Admission No."><TextInput value={form.rollNumber ?? ''} onChange={(event) => setForm({ ...form, rollNumber: event.target.value })} /></Field>
          <Field label="6-Digit Voting ID">
            <TextInput inputMode="numeric" maxLength={6} value={form.votingId ?? ''} onChange={(event) => setForm({ ...form, votingId: event.target.value.replace(/\D/g, '').slice(0, 6) })} />
          </Field>
          <div className="flex items-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setForm({ ...form, votingId: generateVotingId() })} aria-label="Generate random 6-digit Voting ID"><RefreshCcw size={18} /></Button>
            <Button type="button" onClick={handleSave} className="flex-1"><UserPlus size={18} />Add voter</Button>
          </div>
        </div>
        <div className="mt-4">
          <Field label="Department / Role for teachers"><TextInput value={form.departmentOrRole ?? ''} onChange={(event) => setForm({ ...form, departmentOrRole: event.target.value })} /></Field>
        </div>
      </Card>

      <div className="mt-6 overflow-hidden rounded-[1.65rem] bg-white shadow-soft">
        <div className="hidden grid-cols-[1.2fr_0.7fr_0.8fr_0.8fr_0.9fr_0.9fr] gap-3 border-b border-slate-100 px-5 py-4 text-xs font-black uppercase tracking-[0.12em] text-slate-500 lg:grid">
          <span>Name</span><span>Type</span><span>Class / Role</span><span>Voting ID</span><span>Status</span><span>Actions</span>
        </div>
        {voters.map((voter) => (
          <div key={voter.id} className="grid gap-3 border-b border-slate-100 px-5 py-4 last:border-b-0 lg:grid-cols-[1.2fr_0.7fr_0.8fr_0.8fr_0.9fr_0.9fr] lg:items-center">
            <div><p className="font-black">{voter.voterName}</p><p className="text-xs font-semibold text-slate-500">{voter.rollNumber}</p></div>
            <p className="text-sm font-bold capitalize">{voter.voterType}</p>
            <p className="text-sm text-slate-600">{voter.classSection || voter.departmentOrRole || '-'}</p>
            <p className="text-lg font-black tracking-[0.18em]">{voter.votingId}</p>
            <div className="flex flex-wrap gap-2">
              <StatusPill tone={voter.hasVoted ? 'green' : 'orange'}>{voter.hasVoted ? 'Voted' : 'Not Voted'}</StatusPill>
              <StatusPill tone={voter.active ? 'navy' : 'red'}>{voter.active ? 'Active' : 'Inactive'}</StatusPill>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="secondary" onClick={() => { toggleVoterActive(voter.id); refresh() }}>{voter.active ? 'Inactive' : 'Active'}</Button>
              <Button type="button" variant="secondary" onClick={() => { resetVoterForDemo(voter.id); refresh() }}><RotateCcw size={16} />Reset</Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
