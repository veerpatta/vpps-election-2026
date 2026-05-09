import { motion } from 'framer-motion'
import { HouseHeroCard } from './HouseHeroCard'
import { houseOrder } from '../../lib/houses'
import { cn } from '../../lib/utils'

interface HouseShowcaseProps {
  compact?: boolean
  className?: string
}

export function HouseShowcase({ compact = false, className }: HouseShowcaseProps) {
  return (
    <section className={cn('grid gap-4 md:grid-cols-2 xl:grid-cols-4', className)} aria-label="School houses">
      {houseOrder.map((house, index) => (
        <motion.div
          key={house}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.04, duration: 0.24 }}
        >
          <HouseHeroCard house={house} compact={compact} />
        </motion.div>
      ))}
    </section>
  )
}
