import { useMemo, useRef, useState } from 'react'
import { Download, FileSpreadsheet, Filter, Printer, RefreshCcw, RotateCcw, Search, Upload, UserPlus, X } from 'lucide-react'
import { HouseBadge } from '../../components/house/HouseBadge'
import { Button, Card, Field, Select, StatusPill, TextInput } from '../../components/ui/primitives'
import {
  downloadVoterTemplateCsv,
  exportVotingIdListCsv,
  generateVotingId,
  getVoters,
  importVoters,
  resetVoterForDemo,
  saveVoter,
  toggleVoterActive,
} from '../../lib/electionStore'
import { houseOrder, houses, normalizeHouse } from '../../lib/houses'
import { importRowsToVoters, previewVoterImport, type VoterImportPreview } from '../../lib/voterImport'
import type { HouseId, Voter, VoterType } from '../../types/election'

const blankVoter = {
  voterName: '',
  voterType: 'student' as VoterType,
  classSection: '',
  rollNumber: '',
  departmentOrRole: '',
  house: 'red' as HouseId,
  votingId: '',
  hasVoted: false,
  active: true,
}

type VoterTypeFilter = 'all' | VoterType
type HouseFilter = 'all' | HouseId

export function VoterManagementPage() {
  const [voters, setVoters] = useState(() => getVoters())
  const [form, setForm] = useState<Partial<Voter>>(blankVoter)
  const [typeFilter, setTypeFilter] = useState<VoterTypeFilter>('all')
  const [houseFilter, setHouseFilter] = useState<HouseFilter>('all')
  const [search, setSearch] = useState('')
  const [preview, setPreview] = useState<VoterImportPreview | null>(null)
  const [importMessage, setImportMessage] = useState('')
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

  function refresh() {
    setVoters(getVoters())
  }

  function handleSave() {
    if (!form.voterName || !form.voterType || !form.votingId || form.votingId.length !== 6) return
    const house = form.voterType === 'student' ? normalizeHouse(form.house) : undefined
    if (form.voterType === 'student' && (!house || house === 'all')) return
    saveVoter({
      id: form.id,
      voterName: form.voterName,
      voterType: form.voterType,
      classSection: form.classSection,
      rollNumber: form.rollNumber,
      departmentOrRole: form.departmentOrRole,
      house,
      votingId: form.votingId,
      hasVoted: form.hasVoted ?? false,
      votedAt: form.votedAt,
      active: form.active ?? true,
    })
    setForm(blankVoter)
    refresh()
  }

  async function handleFile(file?: File) {
    if (!file) return
    setImportMessage('')
    const nextPreview = await previewVoterImport(file, voters)
    setPreview(nextPreview)
  }

  function handleImportValidVoters() {
    if (!preview) return
    const validVoters = importRowsToVoters(preview.rows)
    importVoters(validVoters)
    setPreview(null)
    setImportMessage(`${validVoters.length} voter${validVoters.length === 1 ? '' : 's'} imported with generated Voting IDs.`)
    refresh()
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <section className="px-4 py-6 sm:px-8 lg:px-10">
      <div className="no-print">
        <p className="text-sm font-black uppercase tracking-[0.22em] text-vpps-richGold">Voter List</p>
        <h1 className="mt-2 text-3xl font-black sm:text-5xl">Voter Management</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Students and teachers use the same simple 6-digit Voting ID. Student house is stored here and never selected on the voting screen.</p>
      </div>

      <Card className="no-print mt-8">
        <div className="grid gap-4 lg:grid-cols-7">
          <Field label="Voter Name"><TextInput value={form.voterName ?? ''} onChange={(event) => setForm({ ...form, voterName: event.target.value })} /></Field>
          <Field label="Voter Type">
            <Select
              value={form.voterType}
              onChange={(event) => setForm({ ...form, voterType: event.target.value as VoterType, house: event.target.value === 'student' ? form.house ?? 'red' : undefined })}
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </Select>
          </Field>
          <Field label="Class & Section"><TextInput value={form.classSection ?? ''} onChange={(event) => setForm({ ...form, classSection: event.target.value })} /></Field>
          <Field label="Roll / Admission No."><TextInput value={form.rollNumber ?? ''} onChange={(event) => setForm({ ...form, rollNumber: event.target.value })} /></Field>
          <Field label="House">
            <Select
              value={form.house ?? ''}
              disabled={form.voterType === 'teacher'}
              onChange={(event) => setForm({ ...form, house: event.target.value as HouseId })}
            >
              {houseOrder.map((house) => <option key={house} value={house}>{houses[house].colorName} - {houses[house].name}</option>)}
            </Select>
          </Field>
          <Field label="6-Digit Voting ID">
            <TextInput inputMode="numeric" maxLength={6} value={form.votingId ?? ''} onChange={(event) => setForm({ ...form, votingId: event.target.value.replace(/\D/g, '').slice(0, 6) })} />
          </Field>
          <div className="flex items-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setForm({ ...form, votingId: generateVotingId() })} aria-label="Generate random 6-digit Voting ID"><RefreshCcw size={18} /></Button>
            <Button type="button" onClick={handleSave} className="flex-1"><UserPlus size={18} />{form.id ? 'Save' : 'Add'}</Button>
          </div>
        </div>
        <div className="mt-4">
          <Field label="Department / Role for teachers"><TextInput value={form.departmentOrRole ?? ''} onChange={(event) => setForm({ ...form, departmentOrRole: event.target.value })} /></Field>
        </div>
      </Card>

      <Card className="no-print mt-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h2 className="text-xl font-black text-vpps-navy">Bulk Voter Import</h2>
            <p className="mt-2 text-sm font-semibold text-slate-600">Upload Excel/CSV, preview validation, then import only after review.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" onClick={downloadVoterTemplateCsv}><Download size={18} />Download Template</Button>
            <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()}><Upload size={18} />Upload Excel</Button>
            <Button type="button" variant="secondary" onClick={() => exportVotingIdListCsv(filteredVoters)}><FileSpreadsheet size={18} />Export Voting ID List</Button>
            <Button type="button" onClick={() => window.print()}><Printer size={18} />Print List</Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={(event) => void handleFile(event.target.files?.[0])}
          />
        </div>
        {importMessage ? <p className="mt-4 rounded-2xl bg-vpps-success/10 px-4 py-3 text-sm font-bold text-green-700">{importMessage}</p> : null}
        {preview ? (
          <div className="mt-5 rounded-3xl border border-vpps-navy/10 bg-vpps-soft/60 p-4">
            <div className="grid gap-3 sm:grid-cols-4">
              <StatusPill tone="navy">Total rows: {preview.totalRows}</StatusPill>
              <StatusPill tone="green">Valid: {preview.validRows}</StatusPill>
              <StatusPill tone="red">Errors: {preview.errorRows}</StatusPill>
              <StatusPill tone="orange">Warnings: {preview.warningRows}</StatusPill>
            </div>
            <div className="mt-4 max-h-[28rem] overflow-auto rounded-2xl border border-white bg-white">
              <div className="grid min-w-[58rem] grid-cols-[1.2fr_0.7fr_0.9fr_0.8fr_1fr_0.9fr_1.4fr] gap-3 border-b bg-vpps-navy px-4 py-3 text-xs font-black uppercase tracking-[0.1em] text-white">
                <span>Name</span><span>Type</span><span>Class</span><span>Roll No</span><span>House</span><span>Voting ID</span><span>Status</span>
              </div>
              {preview.rows.map((row) => (
                <div key={row.rowNumber} className="grid min-w-[58rem] grid-cols-[1.2fr_0.7fr_0.9fr_0.8fr_1fr_0.9fr_1.4fr] gap-3 border-b px-4 py-3 text-sm last:border-b-0">
                  <span className="font-bold">{row.voterName || '-'}</span>
                  <span className="capitalize">{row.voterType ?? '-'}</span>
                  <span>{row.classSection || '-'}</span>
                  <span>{row.rollNumber || '-'}</span>
                  <span>{row.house && row.house !== 'all' ? <HouseBadge house={row.house} size="sm" showHero={false} /> : '-'}</span>
                  <span className="font-black tracking-[0.16em]">{row.votingId ?? '-'}</span>
                  <span className="text-xs font-bold">
                    {row.errors.length ? <span className="text-red-700">{row.errors.join('; ')}</span> : <span className="text-green-700">Valid</span>}
                    {row.warnings.length ? <span className="block text-orange-700">{row.warnings.join('; ')}</span> : null}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setPreview(null)}><X size={18} />Cancel</Button>
              <Button type="button" disabled={preview.validRows === 0} onClick={handleImportValidVoters}><Upload size={18} />Import Valid Voters</Button>
            </div>
          </div>
        ) : null}
      </Card>

      <Card className="no-print mt-6">
        <div className="grid gap-4 lg:grid-cols-[0.8fr_0.8fr_1fr_1.4fr] lg:items-end">
          <Field label="Voter Type">
            <Select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as VoterTypeFilter)}>
              <option value="all">All</option>
              <option value="student">Students</option>
              <option value="teacher">Teachers</option>
            </Select>
          </Field>
          <Field label="House">
            <Select value={houseFilter} onChange={(event) => setHouseFilter(event.target.value as HouseFilter)}>
              <option value="all">All</option>
              {houseOrder.map((house) => <option key={house} value={house}>{houses[house].colorName}</option>)}
            </Select>
          </Field>
          <Field label="Search">
            <TextInput value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Name, class, roll, Voting ID" />
          </Field>
          <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
            <Filter size={18} />
            Showing {filteredVoters.length} of {voters.length}
            <Search size={18} className="ml-auto text-slate-400" />
          </div>
        </div>
      </Card>

      <div className="print-area mt-6 overflow-hidden rounded-[1.65rem] bg-white shadow-soft print:shadow-none">
        <div className="hidden grid-cols-[1.1fr_0.6fr_0.8fr_1fr_0.8fr_0.8fr_0.9fr] gap-3 border-b border-slate-100 px-5 py-4 text-xs font-black uppercase tracking-[0.12em] text-slate-500 lg:grid">
          <span>Name</span><span>Type</span><span>Class / Role</span><span>House</span><span>Voting ID</span><span>Status</span><span className="no-print">Actions</span>
        </div>
        {filteredVoters.map((voter) => (
          <div key={voter.id} className="grid gap-3 border-b border-slate-100 px-5 py-4 last:border-b-0 lg:grid-cols-[1.1fr_0.6fr_0.8fr_1fr_0.8fr_0.8fr_0.9fr] lg:items-center">
            <div><p className="font-black">{voter.voterName}</p><p className="text-xs font-semibold text-slate-500">{voter.rollNumber}</p></div>
            <p className="text-sm font-bold capitalize">{voter.voterType}</p>
            <p className="text-sm text-slate-600">{voter.classSection || voter.departmentOrRole || '-'}</p>
            <div>{voter.house && voter.house !== 'all' ? <HouseBadge house={voter.house} size="sm" /> : <span className="text-sm font-semibold text-slate-500">Teacher / all houses</span>}</div>
            <p className="text-lg font-black tracking-[0.18em]">{voter.votingId}</p>
            <div className="flex flex-wrap gap-2">
              <StatusPill tone={voter.hasVoted ? 'green' : 'orange'}>{voter.hasVoted ? 'Voted' : 'Not Voted'}</StatusPill>
              <StatusPill tone={voter.active ? 'navy' : 'red'}>{voter.active ? 'Active' : 'Inactive'}</StatusPill>
            </div>
            <div className="no-print flex flex-wrap gap-2">
              <Button type="button" variant="secondary" onClick={() => setForm(voter)}>Edit</Button>
              <Button type="button" variant="secondary" onClick={() => { toggleVoterActive(voter.id); refresh() }}>{voter.active ? 'Inactive' : 'Active'}</Button>
              <Button type="button" variant="secondary" onClick={() => { resetVoterForDemo(voter.id); refresh() }}><RotateCcw size={16} />Reset</Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
