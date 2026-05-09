import { Check } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
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
  const reducedMotion = useReducedMotion()
  const houseMeta = candidate.house ? getHouseMeta(candidate.house) : undefined
  const isHouseCandidate = isHouseCaptainPostId(candidate.postId) && Boolean(houseMeta)
  const accent = houseMeta?.primaryColor ?? '#0B1F3A'

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      title={candidate.name}
      aria-pressed={selected}
      aria-label={`Select ${candidate.name}`}
      layout
      whileHover={reducedMotion ? undefined : { y: -2 }}
      whileTap={reducedMotion ? undefined : { scale: 0.985 }}
      transition={{ type: 'spring', stiffness: 360, damping: 26 }}
      className={cn(
        'group relative flex w-full items-center gap-3 overflow-hidden rounded-2xl border bg-white px-3 py-2.5 text-left sm:px-4 sm:py-3',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-vpps-gold/70',
        selected ? 'border-transparent' : 'border-vpps-line shadow-card hover:border-vpps-navy/20 hover:shadow-soft',
      )}
      style={selected ? { boxShadow: `0 0 0 2px ${accent}, 0 12px 28px -16px ${accent}80` } : undefined}
    >
      {selected ? (
        <motion.span
          aria-hidden="true"
          layoutId={`ink-${candidate.id}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="pointer-events-none absolute inset-0 -z-0"
          style={{
            backgroundImage: `linear-gradient(135deg, ${accent}10 0%, transparent 60%)`,
          }}
        />
      ) : null}

      <div className="relative z-10 shrink-0">
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

      <div className="relative z-10 min-w-0 flex-1">
        <h3 className="text-[0.95rem] font-semibold leading-snug tracking-tight text-vpps-navy [overflow-wrap:anywhere] sm:text-base">
          {candidate.name}
        </h3>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.72rem] font-medium text-vpps-mute">
          <span className="inline-flex items-center gap-1">
            <span className="h-1 w-1 rounded-full bg-vpps-mute/50" />
            {candidate.classSection}
          </span>
          {isHouseCandidate && houseMeta ? (
            <span className="inline-flex items-center gap-1 font-semibold" style={{ color: accent }}>
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

      <motion.span
        aria-hidden="true"
        animate={
          reducedMotion
            ? undefined
            : selected
            ? { scale: 1, rotate: 0 }
            : { scale: 0.92, rotate: 0 }
        }
        transition={{ type: 'spring', stiffness: 380, damping: 22 }}
        className={cn(
          'relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full transition-colors duration-200',
          selected ? 'text-white' : 'border-2 border-vpps-line bg-white text-transparent group-hover:border-vpps-navy/30',
        )}
        style={selected ? { backgroundColor: accent } : undefined}
      >
        <motion.span
          initial={false}
          animate={selected ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          <Check size={18} strokeWidth={3} />
        </motion.span>
      </motion.span>
    </motion.button>
  )
}
