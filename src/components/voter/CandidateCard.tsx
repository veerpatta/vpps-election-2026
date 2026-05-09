import { CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'
import type { Candidate } from '../../types/election'
import { cn } from '../../lib/utils'
import { getPostLabel, isHouseCaptainPostId } from '../../data/electionPosts'
import { getHouseMeta } from '../../lib/houses'
import { CandidateAvatar } from '../candidates/CandidateAvatar'
import { HouseBadge } from '../house/HouseBadge'
import { StatusPill } from '../ui/primitives'
import { Button, Card } from '../ui/primitives'

interface CandidateCardProps {
  candidate: Candidate
  selected: boolean
  onSelect: () => void
}

export function CandidateCard({ candidate, selected, onSelect }: CandidateCardProps) {
  const houseMeta = candidate.house ? getHouseMeta(candidate.house) : undefined
  const isHouseCandidate = isHouseCaptainPostId(candidate.postId) && houseMeta

  return (
    <motion.div animate={{ scale: selected ? 1.01 : 1 }} whileHover={{ y: -2 }} transition={{ type: 'spring', stiffness: 260, damping: 22 }}>
      <Card
        className={cn(
          'relative h-full overflow-hidden border-2 p-3 transition sm:p-4',
          selected ? 'shadow-2xl' : 'border-white/80',
          isHouseCandidate ? 'bg-gradient-to-br' : '',
          houseMeta?.softGradientClass,
        )}
        style={{
          borderColor: selected ? houseMeta?.primaryColor ?? '#f4b400' : undefined,
          boxShadow: selected ? `0 22px 50px ${houseMeta?.accentColor ?? '#f4b400'}33` : undefined,
        }}
      >
        {isHouseCandidate ? (
          <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-20 blur-3xl" style={{ backgroundColor: houseMeta.accentColor }} />
        ) : null}
        {selected ? (
          <div className="absolute right-3 top-3 rounded-full bg-vpps-success p-1 text-white">
            <CheckCircle2 size={20} />
          </div>
        ) : null}
        <div className="flex items-center gap-3">
          <CandidateAvatar name={candidate.name} imageUrl={candidate.photoUrl} house={candidate.house} selected={selected} />
          <div className="min-w-0 flex-1">
            <h3 className="truncate pr-8 text-lg font-black text-vpps-navy sm:text-xl">{candidate.name}</h3>
            <p className="mt-1 text-sm font-semibold text-slate-600">{candidate.classSection}</p>
            <p className="text-xs font-black uppercase tracking-[0.12em] text-vpps-richGold">{getPostLabel(candidate.postId)}</p>
            {isHouseCaptainPostId(candidate.postId) && candidate.house ? (
              <div className="mt-2 flex flex-wrap gap-2">
                <HouseBadge house={candidate.house} size="sm" />
                <StatusPill tone={candidate.captainGender === 'girls' ? 'orange' : 'navy'}>
                  {candidate.captainGender === 'girls' ? 'Girls' : 'Boys'}
                </StatusPill>
              </div>
            ) : null}
          </div>
        </div>
        <Button type="button" className="mt-3 w-full py-2.5" variant={selected ? 'secondary' : 'primary'} onClick={onSelect}>
          {selected ? 'Selected' : 'Select'}
        </Button>
      </Card>
    </motion.div>
  )
}
