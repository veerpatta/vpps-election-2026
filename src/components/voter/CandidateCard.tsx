import { Check } from 'lucide-react'
import type { Candidate } from '../../types/election'
import { cn } from '../../lib/utils'
import { isHouseCaptainPostId } from '../../data/electionPosts'
import { getHouseMeta } from '../../lib/houses'
import { CandidateAvatar } from '../candidates/CandidateAvatar'

interface CandidateCardProps {
  candidate: Candidate
  selected: boolean
  onSelect: () => void
}

export function CandidateCard({ candidate, selected, onSelect }: CandidateCardProps) {
  const houseMeta = candidate.house ? getHouseMeta(candidate.house) : undefined
  const isHouseCandidate = isHouseCaptainPostId(candidate.postId) && Boolean(houseMeta)
  const accent = houseMeta?.primaryColor ?? '#0b1f3a'

  return (
    <button
      type="button"
      onClick={onSelect}
      title={candidate.name}
      aria-pressed={selected}
      aria-label={`Select ${candidate.name}`}
      className={cn(
        'group relative flex h-full w-full flex-col overflow-hidden rounded-2xl border bg-white text-left',
        'transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-vpps-gold/70',
        selected
          ? 'shadow-[0_18px_36px_rgba(11,31,58,0.18)]'
          : 'border-slate-200/80 shadow-sm hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md',
      )}
      style={{
        borderColor: selected ? accent : undefined,
        borderWidth: selected ? 2 : 1,
      }}
    >
      <div className="relative bg-gradient-to-b from-slate-100 to-slate-50">
        <CandidateAvatar
          name={candidate.name}
          imageUrl={candidate.photoUrl}
          house={candidate.house}
          category={candidate.category}
          shape="portrait"
          selected={selected}
          className="!rounded-none !shadow-none"
        />
        {isHouseCandidate && houseMeta ? (
          <span
            className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.6rem] font-black uppercase tracking-[0.14em] text-white shadow-sm"
            style={{ backgroundColor: accent }}
          >
            {houseMeta.colorName}
          </span>
        ) : null}
        {selected ? (
          <span
            className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full text-white shadow-md"
            style={{ backgroundColor: accent }}
          >
            <Check size={16} strokeWidth={3} />
          </span>
        ) : null}
        <span className="pointer-events-none absolute inset-x-3 bottom-0 h-px bg-gradient-to-r from-transparent via-vpps-gold/60 to-transparent" />
      </div>

      <div className="flex flex-1 flex-col gap-1.5 px-3 py-3">
        <h3
          className="min-h-[2.6rem] text-[0.95rem] font-black leading-snug text-vpps-navy [overflow-wrap:anywhere] [hyphens:auto]"
        >
          {candidate.name}
        </h3>
        <div className="flex flex-wrap items-center gap-1.5 text-[0.7rem] font-bold text-slate-600">
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-700">
            {candidate.classSection}
          </span>
          {candidate.captainGender ? (
            <span
              className={cn(
                'rounded-full px-2 py-0.5',
                candidate.captainGender === 'girls'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-vpps-navy/10 text-vpps-navy',
              )}
            >
              {candidate.captainGender === 'girls' ? 'Girls' : 'Boys'}
            </span>
          ) : null}
        </div>
        <div className="mt-auto pt-2">
          <span
            className={cn(
              'flex w-full items-center justify-center gap-1 rounded-xl px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] transition',
              selected
                ? 'text-white'
                : 'border border-vpps-navy/15 bg-white text-vpps-navy group-hover:border-vpps-navy/30',
            )}
            style={selected ? { backgroundColor: accent } : undefined}
          >
            {selected ? (
              <>
                <Check size={14} strokeWidth={3} /> Selected
              </>
            ) : (
              'Select'
            )}
          </span>
        </div>
      </div>
    </button>
  )
}
