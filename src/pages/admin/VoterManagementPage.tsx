import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import {
  Download,
  FileSpreadsheet,
  Pencil,
  Printer,
  RefreshCcw,
  RotateCcw,
  Upload,
  UserPlus,
  X,
} from 'lucide-react'
import { HouseBadge } from '../../components/house/HouseBadge'
import { HouseLogo } from '../../components/house/HouseLogo'
import { VoterEditModal } from '../../components/admin/VoterEditModal'
import { Button, Card, Eyebrow, Field, Select, StatusPill, TextInput } from '../../components/ui/primitives'
import { ClassSectionInput } from '../../components/ui/ClassSectionInput'
import { cn } from '../../lib/utils'
import {
  downloadVoterTemplateCsv,
  exportVotingIdListCsv,
  generateVotingId,
  getVoters,
  importVoters,
  resetVoterForDemo,
  saveVoter,
  toggleVoterActive,
} from '../../services/electionService'
import { houseOrder, houses, normalizeHouse } from '../../lib/houses'
import { importRowsToVoters, previewVoterImport, type VoterImportPreview } from '../../lib/voterImport'
import type { HouseId, Voter, VoterType } from '../../types/election'

const blankVoter: Partial<Voter> = {
  voterName: '',
  voterType: 'student',
  classSection: '',
  rollNumber: '',
  departmentOrRole: '',
  house: 'red',
  votingId: '',
  hasVoted: false,
  active: true,
}

type VoterTypeFilter = 'all' | VoterType
type HouseFilter = 'all' | HouseId

export function VoterManagementPage() {
  const [voters, setVoters] = useState<Voter[]>([])
  const [form, setForm] = useState<Partial<Voter>>(blankVoter)
  const [addError, setAddError] = useState('')
  const [typeFilter, setTypeFilter] = useState<VoterTypeFilter>('all')
  const [houseFilter, setHouseFilter] = useState<HouseFilter>('all')
  const [search, setSearch] = useState('')
  const [preview, setPreview] = useState<VoterImportPreview | null>(null)
  const [importMessage, setImportMessage] = useState('')
  const [loadError, setLoadError] = useState('')
  const [editing, setEditing] = useState<Voter | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const filteredVoters = useMemo(() => {
    const query = search.trim().toLowerCase()
    return voters.filter((voter) => {
      if (typeFilter !== 'all' && voter.voterType !== typeFilter) return false
      if (houseFilter !== 'all' && voter.house !== houseFilter) return false
      if (!query) return true
      return [
        voter.voterName,
        voter.classSection,
        voter.rollNumber,
        voter.departmentOrRole,
        voter.votingId,
        voter.house && voter.house !== 'all' ? houses[voter.house].name : '',
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(query)
    })
  }, [houseFilter, search, typeFilter, voters])

  async function refresh() {
    try {
      setVoters(await getVoters())
      setLoadError('')
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Could not load voters.')
    }
  }

  useEffect(() => {
    let active = true
    getVoters()
      .then((nextVoters) => {
        if (!active) return
        setVoters(nextVoters)
        setLoadError('')
      })
      .catch((error) => {
        if (!active) return
        setLoadError(error instanceof Error ? error.message : 'Could not load voters.')
      })
    return () => {
      active = false
    }
  }, [])

  async function handleAdd(event?: FormEvent) {
    event?.preventDefault()
    if (!form.voterName?.trim()) return setAddError('Please enter a voter name.')
    if (!form.voterType) return setAddError('Please choose Student or Teacher.')
    if (!form.votingId || form.votingId.length !== 6) return setAddError('Voting ID must be 6 digits.')

    const house = normalizeHouse(form.house)
    if (form.voterType === 'student' && (!house || house === 'all')) {
      return setAddError('Students must have a specific house assigned.')
    }

    await saveVoter({
      voterName: form.voterName.trim(),
      voterType: form.voterType,
      classSection: form.classSection?.trim() || undefined,
      rollNumber: form.rollNumber?.trim() || undefined,
      departmentOrRole: form.departmentOrRole?.trim() || undefined,
      house,
      votingId: form.votingId,
      hasVoted: false,
      active: true,
    })
    setAddError('')
    setForm(blankVoter)
    await refresh()
  }

  async function handleFile(file?: File) {
    if (!file) return
    setImportMessage('')
    const nextPreview = await previewVoterImport(file, voters)
    setPreview(nextPreview)
  }

  async function handleImportValidVoters() {
    if (!preview) return
    const validVoters = importRowsToVoters(preview.rows)
    await importVoters(validVoters)
    setPreview(null)
    setImportMessage(
      `${validVoters.length} voter${validVoters.length === 1 ? '' : 's'} imported with generated Voting IDs.`,
    )
    await refresh()
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <section className="px-4 py-6 sm:px-8 lg:px-10">
      <div className="no-print">
        <Eyebrow>Voter List</Eyebrow>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-vpps-navy sm:text-4xl">
          Voter Management
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-vpps-mute">
          Students and teachers use the same simple 6-digit Voting ID. Click any voter to edit details directly.
        </p>
        {loadError ? (
          <Card className="mt-5 border-red-100 bg-red-50 text-sm font-semibold text-red-700">
            {loadError}
          </Card>
        ) : null}
      </div>

      <form onSubmit={handleAdd} className="no-print">
        <Card className="mt-6 overflow-hidden p-0">
          <div className="flex items-center justify-between border-b border-vpps-line px-5 py-3">
            <div className="flex items-center gap-2">
              <UserPlus size={16} className="text-vpps-deepGold" />
              <p className="text-sm font-semibold tracking-tight text-vpps-navy">Add new voter</p>
            </div>
          </div>
          <div className="grid gap-4 p-5 lg:grid-cols-2">
            <Field label="Voter Name">
              <TextInput
                value={form.voterName ?? ''}
                onChange={(event) => setForm({ ...form, voterName: event.target.value })}
                placeholder="Full name"
              />
            </Field>
            <Field label="Voter Type">
              <Select
                value={form.voterType}
                onChange={(event) =>
                  setForm({
                    ...form,
                    voterType: event.target.value as VoterType,
                    house: event.target.value === 'student' ? form.house ?? 'red' : form.house,
                  })
                }
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
              </Select>
            </Field>
            <Field label="Class">
              <ClassSectionInput
                value={form.classSection ?? ''}
                onChange={(next) => setForm({ ...form, classSection: next })}
              />
            </Field>
            <Field label="Roll / Admission No.">
              <TextInput
                value={form.rollNumber ?? ''}
                onChange={(event) => setForm({ ...form, rollNumber: event.target.value })}
                placeholder="Optional"
              />
            </Field>
            <Field label="House">
              <Select
                value={form.house as string}
                onChange={(event) => setForm({ ...form, house: event.target.value as HouseId | 'all' })}
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
              <div className="flex gap-2">
                <TextInput
                  inputMode="numeric"
                  maxLength={6}
                  value={form.votingId ?? ''}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      votingId: event.target.value.replace(/\D/g, '').slice(0, 6),
                    })
                  }
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    void generateVotingId(voters.map((voter) => voter.votingId)).then((votingId) => {
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
                  onChange={(event) => setForm({ ...form, departmentOrRole: event.target.value })}
                  placeholder="e.g. Mathematics, Office Staff"
                />
              </Field>
            ) : null}
            <div className="flex items-end">
              <Button type="submit" className="w-full">
                <UserPlus size={16} />
                Add Voter
              </Button>
            </div>
          </div>
          {addError ? (
            <div className="mx-5 mb-4 rounded-xl bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700 ring-1 ring-red-100">
              {addError}
            </div>
          ) : null}
        </Card>
      </form>

      <Card className="no-print mt-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm font-semibold tracking-tight text-vpps-navy">Bulk voter import</p>
            <p className="mt-1 text-xs font-medium text-vpps-mute">Upload Excel/CSV, preview validation, then import only after review.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => void downloadVoterTemplateCsv()}>
              <Download size={14} />
              Template
            </Button>
            <Button type="button" variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
              <Upload size={14} />
              Upload Excel
            </Button>
            <Button type="button" variant="secondary" size="sm" onClick={() => void exportVotingIdListCsv(filteredVoters)}>
              <FileSpreadsheet size={14} />
              Export Voting IDs
            </Button>
            <Button type="button" size="sm" onClick={() => window.print()}>
              <Printer size={14} />
              Print
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={(event) => void handleFile(event.target.files?.[0])}
          />
        </div>
        {importMessage ? (
          <p className="mt-4 rounded-xl bg-emerald-50 px-3.5 py-2.5 text-sm font-medium text-emerald-700 ring-1 ring-emerald-100">
            {importMessage}
          </p>
        ) : null}
        {preview ? (
          <div className="mt-5 rounded-2xl border border-vpps-line bg-vpps-soft/40 p-4">
            <div className="grid gap-2 sm:grid-cols-4">
              <StatusPill tone="navy">Total rows: {preview.totalRows}</StatusPill>
              <StatusPill tone="green">Valid: {preview.validRows}</StatusPill>
              <StatusPill tone="red">Errors: {preview.errorRows}</StatusPill>
              <StatusPill tone="orange">Warnings: {preview.warningRows}</StatusPill>
            </div>
            <div className="mt-4 max-h-[24rem] overflow-auto rounded-xl border border-vpps-line bg-white">
              <div className="grid min-w-[58rem] grid-cols-[1.2fr_0.7fr_0.9fr_0.8fr_1fr_0.9fr_1.4fr] gap-3 border-b border-vpps-line bg-vpps-navy px-4 py-2.5 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-white">
                <span>Name</span><span>Type</span><span>Class</span><span>Roll No</span><span>House</span><span>Voting ID</span><span>Status</span>
              </div>
              {preview.rows.map((row) => (
                <div
                  key={row.rowNumber}
                  className="grid min-w-[58rem] grid-cols-[1.2fr_0.7fr_0.9fr_0.8fr_1fr_0.9fr_1.4fr] gap-3 border-b border-vpps-line/60 px-4 py-2 text-sm last:border-b-0"
                >
                  <span className="font-semibold">{row.voterName || '-'}</span>
                  <span className="capitalize">{row.voterType ?? '-'}</span>
                  <span>{row.classSection || '-'}</span>
                  <span>{row.rollNumber || '-'}</span>
                  <span>{row.house && row.house !== 'all' ? <HouseBadge house={row.house} size="sm" showHero={false} /> : '-'}</span>
                  <span className="font-mono text-sm tracking-[0.16em]">{row.votingId ?? '-'}</span>
                  <span className="text-xs">
                    {row.errors.length ? (
                      <span className="font-medium text-red-700">{row.errors.join('; ')}</span>
                    ) : (
                      <span className="font-medium text-emerald-700">Valid</span>
                    )}
                    {row.warnings.length ? (
                      <span className="block text-orange-700">{row.warnings.join('; ')}</span>
                    ) : null}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => setPreview(null)}>
                <X size={14} />
                Cancel
              </Button>
              <Button type="button" size="sm" disabled={preview.validRows === 0} onClick={() => void handleImportValidVoters()}>
                <Upload size={14} />
                Import valid voters
              </Button>
            </div>
          </div>
        ) : null}
      </Card>

      <Card className="no-print mt-6">
        <div className="grid gap-4 lg:grid-cols-[0.7fr_1.6fr_1fr_auto] lg:items-end">
          <Field label="Voter Type">
            <Select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as VoterTypeFilter)}>
              <option value="all">All</option>
              <option value="student">Students</option>
              <option value="teacher">Teachers</option>
            </Select>
          </Field>
          <div className="grid gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-vpps-mute">House</span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setHouseFilter('all')}
                className={cn(
                  'inline-flex h-10 items-center gap-1.5 rounded-xl border px-3 text-xs font-semibold transition',
                  houseFilter === 'all'
                    ? 'border-vpps-navy bg-vpps-navy text-white'
                    : 'border-vpps-line bg-white text-vpps-navy hover:border-vpps-navy/40',
                )}
              >
                All
              </button>
              {houseOrder.map((house) => {
                const meta = houses[house]
                const active = houseFilter === house
                return (
                  <button
                    key={house}
                    type="button"
                    onClick={() => setHouseFilter(house)}
                    className={cn(
                      'inline-flex h-10 items-center gap-1.5 rounded-xl border bg-white px-3 text-xs font-semibold transition',
                      active ? 'shadow-card' : 'hover:border-vpps-navy/30',
                    )}
                    style={{
                      borderColor: active ? meta.primaryColor : '#E5E9F2',
                      color: active ? meta.primaryColor : '#0B1F3A',
                    }}
                  >
                    <HouseLogo house={house} size="sm" />
                    {meta.colorName}
                  </button>
                )
              })}
            </div>
          </div>
          <Field label="Search">
            <TextInput
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Name, class, roll, Voting ID"
            />
          </Field>
          <p className="text-xs font-medium text-vpps-mute lg:text-right">
            Showing <span className="font-semibold text-vpps-navy">{filteredVoters.length}</span> of {voters.length}
          </p>
        </div>
      </Card>

      <div className="print-area mt-6 overflow-hidden rounded-2xl border border-vpps-line bg-white shadow-card print:shadow-none">
        <div className="hidden grid-cols-[1.2fr_0.5fr_0.9fr_0.9fr_0.7fr_0.9fr_auto] gap-3 border-b border-vpps-line bg-vpps-soft/60 px-5 py-3 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-vpps-mute lg:grid">
          <span>Name</span><span>Type</span><span>Class / Role</span><span>House</span><span>Voting ID</span><span>Status</span><span className="no-print">Actions</span>
        </div>
        {filteredVoters.map((voter) => (
          <div
            key={voter.id}
            className="group grid gap-3 border-b border-vpps-line/70 px-5 py-3 last:border-b-0 lg:grid-cols-[1.2fr_0.5fr_0.9fr_0.9fr_0.7fr_0.9fr_auto] lg:items-center"
          >
            <div>
              <p className="text-sm font-semibold tracking-tight text-vpps-navy">{voter.voterName}</p>
              {voter.rollNumber ? (
                <p className="text-[0.7rem] font-medium text-vpps-mute">Roll {voter.rollNumber}</p>
              ) : null}
            </div>
            <p className="text-sm font-medium capitalize text-vpps-navy/80">{voter.voterType}</p>
            <p className="text-sm text-vpps-navy/70">{voter.classSection || voter.departmentOrRole || '—'}</p>
            <div>
              {voter.house && voter.house !== 'all' ? (
                <HouseBadge house={voter.house} size="sm" />
              ) : (
                <HouseBadge house="all" size="sm" />
              )}
            </div>
            <p className="font-mono text-base font-semibold tracking-[0.18em] text-vpps-navy">{voter.votingId}</p>
            <div className="flex flex-wrap gap-1">
              <StatusPill tone={voter.hasVoted ? 'green' : 'orange'}>
                {voter.hasVoted ? 'Voted' : 'Not voted'}
              </StatusPill>
              <StatusPill tone={voter.active ? 'navy' : 'red'}>
                {voter.active ? 'Active' : 'Inactive'}
              </StatusPill>
            </div>
            <div className="no-print flex flex-wrap justify-end gap-1">
              <Button type="button" variant="secondary" size="sm" onClick={() => setEditing(voter)}>
                <Pencil size={14} />
                Edit
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  void toggleVoterActive(voter.id).then(refresh)
                }}
              >
                {voter.active ? 'Inactive' : 'Active'}
              </Button>
              {voter.hasVoted ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    void resetVoterForDemo(voter.id).then(refresh)
                  }}
                  title="Reset voted status"
                >
                  <RotateCcw size={14} />
                </Button>
              ) : null}
            </div>
          </div>
        ))}
        {filteredVoters.length === 0 ? (
          <p className="px-5 py-6 text-center text-sm font-medium text-vpps-mute">
            No voters match the current filter.
          </p>
        ) : null}
      </div>

      <VoterEditModal
        open={Boolean(editing)}
        voter={editing}
        onClose={() => setEditing(null)}
        onSaved={refresh}
      />
    </section>
  )
}
