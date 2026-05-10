import { useEffect, useState, type FormEvent } from 'react'
import { RefreshCcw, RotateCcw, Save, ShieldOff, ShieldCheck } from 'lucide-react'
import { Button, Field, Select, StatusPill, TextInput } from '../ui/primitives'
import { ClassSectionInput } from '../ui/ClassSectionInput'
import { Modal } from '../ui/Modal'
import { houseOrder, houses, normalizeHouse } from '../../lib/houses'
import { generateVotingId, resetVoterForDemo, saveVoter, toggleVoterActive } from '../../services/electionService'
import type { HouseId, Voter, VoterType } from '../../types/election'

interface VoterEditModalProps {
  open: boolean
  voter: Voter | null
  onClose: () => void
  onSaved: () => void
}

export function VoterEditModal({ open, voter, onClose, onSaved }: VoterEditModalProps) {
  const [form, setForm] = useState<Partial<Voter>>(voter ?? {})
  const [error, setError] = useState('')

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm(voter ?? {})
    setError('')
  }, [voter, open])

  if (!voter) return null

  async function handleSubmit(event?: FormEvent) {
    event?.preventDefault()
    if (!form.voterName?.trim()) return setError('Voter name is required.')
    if (!form.voterType) return setError('Voter type is required.')
    if (!form.votingId || form.votingId.length !== 6) return setError('Voting ID must be 6 digits.')

    const house = form.voterType === 'student' ? normalizeHouse(form.house) : normalizeHouse(form.house)
    if (form.voterType === 'student' && (!house || house === 'all')) {
      return setError('Students must have a specific house assigned.')
    }

    await saveVoter({
      id: form.id,
      voterName: form.voterName.trim(),
      voterType: form.voterType,
      classSection: form.classSection?.trim() || undefined,
      rollNumber: form.rollNumber?.trim() || undefined,
      departmentOrRole: form.departmentOrRole?.trim() || undefined,
      house,
      votingId: form.votingId,
      hasVoted: form.hasVoted ?? false,
      votedAt: form.votedAt,
      active: form.active ?? true,
    })
    onSaved()
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Edit voter — ${voter.voterName}`}
      description={`Voting ID ${voter.votingId} · ${voter.voterType}${voter.hasVoted ? ' · Already voted' : ''}`}
      size="md"
      footer={
        <>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="voter-edit-form">
            <Save size={16} />
            Save changes
          </Button>
        </>
      }
    >
      <form id="voter-edit-form" onSubmit={handleSubmit} className="grid gap-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Voter Name">
            <TextInput
              value={form.voterName ?? ''}
              onChange={(event) => setForm((value) => ({ ...value, voterName: event.target.value }))}
              autoFocus
            />
          </Field>
          <Field label="Voter Type">
            <Select
              value={form.voterType ?? 'student'}
              onChange={(event) => {
                const next = event.target.value as VoterType
                setForm((value) => ({
                  ...value,
                  voterType: next,
                  house: next === 'student' ? value.house ?? 'red' : value.house,
                }))
              }}
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </Select>
          </Field>
          <Field label="Class">
            <ClassSectionInput
              value={form.classSection ?? ''}
              onChange={(next) => setForm((value) => ({ ...value, classSection: next }))}
            />
          </Field>
          <Field label="Roll / Admission No.">
            <TextInput
              value={form.rollNumber ?? ''}
              onChange={(event) => setForm((value) => ({ ...value, rollNumber: event.target.value }))}
            />
          </Field>
          <Field label="House">
            <Select
              value={(form.house as HouseId | 'all' | undefined) ?? (form.voterType === 'teacher' ? 'all' : 'red')}
              onChange={(event) => setForm((value) => ({ ...value, house: event.target.value as HouseId | 'all' }))}
            >
              {form.voterType === 'teacher' ? <option value="all">All Houses (Teacher)</option> : null}
              {houseOrder.map((house) => (
                <option key={house} value={house}>
                  {houses[house].colorName} — {houses[house].name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="6-Digit Voting ID">
            <div className="flex items-center gap-2">
              <TextInput
                inputMode="numeric"
                maxLength={6}
                value={form.votingId ?? ''}
                onChange={(event) =>
                  setForm((value) => ({
                    ...value,
                    votingId: event.target.value.replace(/\D/g, '').slice(0, 6),
                  }))
                }
                className="flex-1"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  void generateVotingId().then((votingId) => {
                    setForm((value) => ({ ...value, votingId }))
                  })
                }}
                title="Generate a fresh Voting ID"
              >
                <RefreshCcw size={14} />
              </Button>
            </div>
          </Field>
          {form.voterType === 'teacher' ? (
            <Field label="Department / Role">
              <TextInput
                value={form.departmentOrRole ?? ''}
                onChange={(event) => setForm((value) => ({ ...value, departmentOrRole: event.target.value }))}
                placeholder="e.g. Mathematics, Office Staff"
              />
            </Field>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2 rounded-xl bg-vpps-soft px-3 py-2 ring-1 ring-vpps-line">
          <StatusPill tone={form.hasVoted ? 'green' : 'orange'}>
            {form.hasVoted ? 'Already voted' : 'Not voted yet'}
          </StatusPill>
          <StatusPill tone={form.active ? 'navy' : 'red'}>
            {form.active ? 'Active' : 'Inactive'}
          </StatusPill>
          <div className="ml-auto flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                void toggleVoterActive(voter.id)
                setForm((value) => ({ ...value, active: !value.active }))
                onSaved()
              }}
            >
              {form.active ? <ShieldOff size={14} /> : <ShieldCheck size={14} />}
              {form.active ? 'Mark inactive' : 'Mark active'}
            </Button>
            {form.hasVoted ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  void resetVoterForDemo(voter.id)
                  setForm((value) => ({ ...value, hasVoted: false, votedAt: undefined }))
                  onSaved()
                }}
              >
                <RotateCcw size={14} />
                Reset voted state
              </Button>
            ) : null}
          </div>
        </div>

        {error ? (
          <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700 ring-1 ring-red-100">
            {error}
          </p>
        ) : null}
      </form>
    </Modal>
  )
}
