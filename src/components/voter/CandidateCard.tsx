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
  const accent = houseMeta?.primaryColor ?? '#0B1F3A'

  return (
    <button
      type="button"
      onClick={onSelect}
      title={candidate.name}
      aria-pressed={selected}
      aria-label={`Select ${candidate.name}`}
      className={cn(
        'group relative flex w-full items-center gap-3 rounded-2xl border bg-white px-3 py-2.5 text-left transition-all duration-200 sm:px-4 sm:py-3',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-vpps-gold/70',
        selected
          ? 'border-transparent shadow-[0_12px_28px_-12px_rgba(11,31,58,0.35)]'
          : 'border-vpps-line shadow-card hover:-translate-y-0.5 hover:border-vpps-navy/20 hover:shadow-soft',
      )}
      style={selected ? { boxShadow: `0 0 0 2px ${accent}, 0 12px 28px -16px ${accent}80` } : undefined}
    >
      <div className="relative shrink-0">
        <CandidateAvatar
          name={candidate.name}
          imageUrl={candidate.photoUrl}
          house={candidate.house}
          category={candidate.category}
          shape="circle"
          size="md"
        />
        {isHouseCandidate && houseMeta ? (
          <span
            className="absolute -bottom-0.5 -right-0.5 grid h-5 w-5 place-items-center rounded-full border-2 border-white text-[0.55rem] font-bold uppercase text-white"
            style={{ backgroundColor: accent }}
            title={`${houseMeta.colorName} House`}
          >
            {houseMeta.colorName.charAt(0)}
          </span>
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <h3
          className="text-[0.95rem] font-semibold leading-snug tracking-tight text-vpps-navy [overflow-wrap:anywhere] sm:text-base"
        >
          {candidate.name}
        </h3>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.72rem] font-medium text-vpps-mute">
          <span className="inline-flex items-center gap-1">
            <span className="h-1 w-1 rounded-full bg-vpps-mute/50" />
            {candidate.classSection}
          </span>
          {isHouseCandidate && houseMeta ? (
            <span
              className="inline-flex items-center gap-1 font-semibold"
              style={{ color: accent }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accent }} />
              {houseMeta.colorName}
            </span>
          ) : null}
          {candidate.captainGender ? (
            <span className="inline-flex items-center gap-1">
              <span className="h-1 w-1 rounded-full bg-vpps-mute/50" />
              {candidate.captainGender === 'girls' ? 'Girls' : 'Boys'}
            </span>
          ) : null}
        </div>
      </div>

      <span
        aria-hidden="true"
        className={cn(
          'grid h-8 w-8 shrink-0 place-items-center rounded-full transition-all duration-200',
          selected ? 'scale-100 text-white' : 'scale-95 border-2 border-vpps-line bg-white text-transparent group-hover:border-vpps-navy/30',
        )}
        style={selected ? { backgroundColor: accent } : undefined}
      >
        <Check size={18} strokeWidth={3} />
      </span>
    </button>
  )
}
