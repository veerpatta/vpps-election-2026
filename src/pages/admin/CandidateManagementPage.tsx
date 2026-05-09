import { useMemo, useRef, useState, type ChangeEvent } from 'react'
import { CheckCircle2, ImagePlus, Pencil, Plus, Save, ShieldX, Trash2, Upload, UserRoundX, X } from 'lucide-react'
import { CandidateAvatar } from '../../components/candidates/CandidateAvatar'
import { HouseBadge } from '../../components/house/HouseBadge'
import { Button, Card, Eyebrow, Field, Select, StatusPill, TextInput } from '../../components/ui/primitives'
import { SUPPORTED_POSTS, getElectionPost, getPostLabel } from '../../data/electionPosts'
import { getCandidates, saveCandidate, toggleCandidate } from '../../lib/electionStore'
import { compressImageFile } from '../../lib/imageUpload'
import { houses } from '../../lib/houses'
import { cn } from '../../lib/utils'
import type { Candidate, ElectionPostId } from '../../types/election'

const blankCandidate: Partial<Candidate> = {
  name: '',
  classSection: '',
  rollNumber: '',
  postId: 'head-boy',
  photoUrl: '',
  approved: true,
  active: true,
}

export function CandidateManagementPage() {
  const [candidates, setCandidates] = useState(() => getCandidates())
  const [form, setForm] = useState<Partial<Candidate>>(blankCandidate)
  const [message, setMessage] = useState('')
  const [uploading, setUploading] = useState(false)
  const [filter, setFilter] = useState<'all' | ElectionPostId>('all')
  const [search, setSearch] = useState('')
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  function refresh() {
    setCandidates(getCandidates())
  }

  function resetForm() {
    setForm(blankCandidate)
    setMessage('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handleSave(event?: React.FormEvent) {
    event?.preventDefault()
    if (!form.name?.trim() || !form.classSection?.trim() || !form.postId) {
      setMessage('Please fill name, class & section, and post.')
      return
    }
    saveCandidate({
      id: form.id,
      name: form.name.trim(),
      classSection: form.classSection.trim(),
      rollNumber: form.rollNumber?.trim(),
      postId: form.postId,
      photoUrl: form.photoUrl,
      symbol: form.symbol,
      slogan: form.slogan,
      category: form.category,
      approved: form.approved ?? true,
      active: form.active ?? true,
    })
    resetForm()
    refresh()
  }

  async function handlePhotoFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      setUploading(true)
      setMessage('')
      const dataUrl = await compressImageFile(file)
      setForm((value) => ({ ...value, photoUrl: dataUrl }))
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not process this image.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleInlinePhotoUpload(candidate: Candidate, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    try {
      const dataUrl = await compressImageFile(file)
      saveCandidate({ ...candidate, photoUrl: dataUrl })
      refresh()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not process this image.')
    }
  }

  const filtered = useMemo(() => {
    return candidates.filter((candidate) => {
      if (filter !== 'all' && candidate.postId !== filter) return false
      if (search && !candidate.name.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [candidates, filter, search])

  const isEditing = Boolean(form.id)

  return (
    <section className="px-4 py-6 sm:px-8 lg:px-10">
      <Eyebrow>Candidate List</Eyebrow>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-vpps-navy sm:text-4xl">
        Candidate Management
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-vpps-mute">
        Approved and active candidates appear on the voting screen. Upload photos directly — no file renaming required.
      </p>

      <form onSubmit={handleSave} className="mt-6">
        <Card className="overflow-hidden p-0">
          <div className="flex items-center justify-between border-b border-vpps-line px-5 py-3">
            <div className="flex items-center gap-2">
              {isEditing ? <Pencil size={16} className="text-vpps-deepGold" /> : <Plus size={16} className="text-vpps-deepGold" />}
              <p className="text-sm font-semibold tracking-tight text-vpps-navy">
                {isEditing ? 'Edit candidate' : 'Add new candidate'}
              </p>
            </div>
            {isEditing ? (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium text-vpps-mute hover:bg-vpps-soft"
              >
                <X size={14} />
                Cancel edit
              </button>
            ) : null}
          </div>

          <div className="grid gap-5 p-5 lg:grid-cols-[200px_minmax(0,1fr)]">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-vpps-mute">Photo</p>
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-vpps-line bg-vpps-soft">
                {form.photoUrl ? (
                  <CandidateAvatar
                    name={form.name ?? 'Candidate'}
                    imageUrl={form.photoUrl}
                    house={form.house}
                    category={form.category}
                    shape="portrait"
                    className="!rounded-2xl"
                  />
                ) : (
                  <div className="grid h-full place-items-center text-center text-xs font-medium text-vpps-mute">
                    <div>
                      <ImagePlus size={28} className="mx-auto text-vpps-mute/70" />
                      <p className="mt-2">No photo yet</p>
                    </div>
                  </div>
                )}
                {uploading ? (
                  <div className="absolute inset-0 grid place-items-center bg-white/80 text-xs font-semibold text-vpps-navy">
                    Processing…
                  </div>
                ) : null}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoFile}
                className="hidden"
              />
              <div className="mt-2 grid gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  <Upload size={14} />
                  {form.photoUrl ? 'Replace photo' : 'Upload photo'}
                </Button>
                {form.photoUrl ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setForm((value) => ({ ...value, photoUrl: '' }))}
                  >
                    <Trash2 size={14} />
                    Remove
                  </Button>
                ) : null}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Student Name">
                <TextInput
                  value={form.name ?? ''}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  placeholder="e.g. Vaibhav Singh Rathore"
                  autoFocus
                />
              </Field>
              <Field label="Class & Section">
                <TextInput
                  value={form.classSection ?? ''}
                  onChange={(event) => setForm({ ...form, classSection: event.target.value })}
                  placeholder="e.g. 12 Arts"
                />
              </Field>
              <Field label="Roll Number">
                <TextInput
                  value={form.rollNumber ?? ''}
                  onChange={(event) => setForm({ ...form, rollNumber: event.target.value })}
                  placeholder="Optional"
                />
              </Field>
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
                  {SUPPORTED_POSTS.map((post) => (
                    <option key={post.id} value={post.id}>
                      {post.label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Category">
                <Select
                  value={form.category ?? ''}
                  onChange={(event) => setForm({ ...form, category: event.target.value || undefined })}
                >
                  <option value="">—</option>
                  <option value="Boy">Boy</option>
                  <option value="Girl">Girl</option>
                </Select>
              </Field>
              <div className="flex items-end gap-2">
                <Button type="submit" className="w-full">
                  <Save size={16} />
                  {isEditing ? 'Save changes' : 'Add Candidate'}
                </Button>
              </div>
              {form.house || form.captainGender ? (
                <div className="col-span-full flex flex-wrap items-center gap-2 rounded-xl bg-vpps-soft px-3 py-2 ring-1 ring-vpps-line">
                  {form.house ? <HouseBadge house={form.house} showHeroName /> : null}
                  {form.captainGender ? (
                    <StatusPill tone={form.captainGender === 'girls' ? 'orange' : 'navy'}>
                      {form.captainGender === 'girls' ? 'Girls Category' : 'Boys Category'}
                    </StatusPill>
                  ) : null}
                </div>
              ) : null}
              {message ? (
                <div className="col-span-full rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700 ring-1 ring-red-100">
                  {message}
                </div>
              ) : null}
            </div>
          </div>
        </Card>
      </form>

      <div className="mt-6 flex flex-wrap items-end gap-3">
        <Field label="Filter by post">
          <Select value={filter} onChange={(event) => setFilter(event.target.value as 'all' | ElectionPostId)}>
            <option value="all">All posts</option>
            {SUPPORTED_POSTS.map((post) => (
              <option key={post.id} value={post.id}>
                {post.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Search by name">
          <TextInput
            placeholder="Type a name…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="min-w-64"
          />
        </Field>
        <p className="ml-auto text-xs font-medium text-vpps-mute">
          Showing <span className="font-semibold text-vpps-navy">{filtered.length}</span> of {candidates.length}
        </p>
      </div>

      <div className="mt-4 grid gap-2">
        {filtered.map((candidate) => {
          const meta = candidate.house ? houses[candidate.house] : undefined
          return (
            <Card
              key={candidate.id}
              className={cn(
                'flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:gap-4 sm:p-4',
                meta ? 'ring-1' : '',
              )}
              style={meta ? { borderColor: meta.borderColor } : undefined}
            >
              <label className="relative cursor-pointer">
                <CandidateAvatar
                  name={candidate.name}
                  imageUrl={candidate.photoUrl}
                  house={candidate.house}
                  category={candidate.category}
                  size="md"
                  shape="circle"
                />
                <span className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full border-2 border-white bg-vpps-navy text-vpps-gold shadow-md transition group-hover:scale-105">
                  <ImagePlus size={12} />
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => handleInlinePhotoUpload(candidate, event)}
                />
              </label>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <h2 className="text-base font-semibold tracking-tight text-vpps-navy">{candidate.name}</h2>
                  <StatusPill tone={candidate.approved ? 'green' : 'orange'}>
                    {candidate.approved ? 'Approved' : 'Pending'}
                  </StatusPill>
                  <StatusPill tone={candidate.active ? 'navy' : 'red'}>
                    {candidate.active ? 'Active' : 'Inactive'}
                  </StatusPill>
                  {candidate.house ? <HouseBadge house={candidate.house} size="sm" /> : null}
                </div>
                <p className="mt-1 text-xs font-medium text-vpps-mute">
                  {candidate.classSection} · {getPostLabel(candidate.postId)}
                  {candidate.rollNumber ? <span> · Roll No. {candidate.rollNumber}</span> : null}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setForm(candidate)
                    setMessage('')
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                >
                  <Pencil size={14} />
                  Edit
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    toggleCandidate(candidate.id, 'approved')
                    refresh()
                  }}
                >
                  {candidate.approved ? <ShieldX size={14} /> : <CheckCircle2 size={14} />}
                  {candidate.approved ? 'Unapprove' : 'Approve'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    toggleCandidate(candidate.id, 'active')
                    refresh()
                  }}
                >
                  <UserRoundX size={14} />
                  {candidate.active ? 'Deactivate' : 'Activate'}
                </Button>
              </div>
            </Card>
          )
        })}
        {filtered.length === 0 ? (
          <Card className="text-center text-sm font-medium text-vpps-mute">
            No candidates match the current filter.
          </Card>
        ) : null}
      </div>
    </section>
  )
}
