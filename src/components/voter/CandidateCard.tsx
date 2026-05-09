import { CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'
import type { Candidate } from '../../types/election'
import { initials, cn } from '../../lib/utils'
import { getHouseMeta, isHouseCaptainPost } from '../../lib/houses'
import { HouseBadge } from '../house/HouseBadge'
import { HouseLogo } from '../house/HouseLogo'
import { Button, Card } from '../ui/primitives'

interface CandidateCardProps {
  candidate: Candidate
  selected: boolean
  onSelect: () => void
}

export function CandidateCard({ candidate, selected, onSelect }: CandidateCardProps) {
  const houseMeta = candidate.house ? getHouseMeta(candidate.house) : undefined
  const isHouseCandidate = isHouseCaptainPost(candidate.post) && houseMeta

  return (
    <motion.div animate={{ scale: selected ? 1.02 : 1 }} whileHover={{ y: -3 }} transition={{ type: 'spring', stiffness: 260, damping: 22 }}>
      <Card
        className={cn(
          'relative h-full overflow-hidden border-2 transition',
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
          <div className="absolute right-4 top-4 rounded-full bg-vpps-success p-1 text-white">
            <CheckCircle2 size={22} />
          </div>
        ) : null}
        <div className="flex items-start gap-4">
          <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-vpps-navy text-lg font-black text-vpps-gold">
            {candidate.photoUrl ? <img src={candidate.photoUrl} alt={candidate.name} className="h-full w-full object-cover" /> : initials(candidate.name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-vpps-richGold">{candidate.symbol}</p>
            <h3 className="mt-1 text-xl font-black text-vpps-navy">{candidate.name}</h3>
            <p className="text-sm font-semibold text-slate-600">{candidate.classSection} - {candidate.post}</p>
            {isHouseCaptainPost(candidate.post) && candidate.house ? (
              <HouseBadge house={candidate.house} size="sm" className="mt-3" />
            ) : null}
          </div>
          {isHouseCandidate ? <HouseLogo house={candidate.house} size="md" className="hidden sm:grid" /> : null}
        </div>
        <p className="mt-5 rounded-2xl bg-vpps-soft p-4 text-sm font-semibold leading-6 text-slate-700">{candidate.slogan}</p>
        <Button type="button" className="mt-5 w-full" variant={selected ? 'secondary' : 'primary'} onClick={onSelect}>
          {selected ? 'Selected' : 'Select'}
        </Button>
      </Card>
    </motion.div>
  )
}
