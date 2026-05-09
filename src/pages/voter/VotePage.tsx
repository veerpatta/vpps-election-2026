import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Check, CheckCircle2, ShieldCheck, UserCheck, Vote } from 'lucide-react'
import { BrandHeader } from '../../components/brand/BrandHeader'
import { BrandLogo } from '../../components/brand/BrandLogo'
import { HouseBadge } from '../../components/house/HouseBadge'
import { HouseHeroCard } from '../../components/house/HouseHeroCard'
import { HouseShowcase } from '../../components/house/HouseShowcase'
import { CandidateCard } from '../../components/voter/CandidateCard'
import { Button, Card, PageBackground } from '../../components/ui/primitives'
import { getBallotPosts, getVotingCandidates, submitVote, validateVotingId } from '../../lib/electionStore'
import { getHouseByPost } from '../../lib/houses'
import type { CouncilPost, Voter as VoterRecord } from '../../types/election'

type Step = 'welcome' | 'id' | 'select' | 'review' | 'thanks'

const pageMotion = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -18 },
  transition: { duration: 0.28 },
}

export function VotePage() {
  const [step, setStep] = useState<Step>('welcome')
  const [votingId, setVotingId] = useState('')
  const [message, setMessage] = useState('')
  const [postIndex, setPostIndex] = useState(0)
  const [selected, setSelected] = useState<Partial<Record<CouncilPost, string>>>({})
  const [voter, setVoter] = useState<VoterRecord | null>(null)

  const ballotPosts = useMemo(() => (voter ? getBallotPosts(voter) : []), [voter])
  const currentPost = ballotPosts[postIndex]
  const currentHouse = currentPost ? getHouseByPost(currentPost) : undefined
  const candidates = useMemo(() => (currentPost ? getVotingCandidates(currentPost) : []), [currentPost])
  const selectedCandidate = currentPost ? candidates.find((candidate) => candidate.id === selected[currentPost]) : undefined
  const selectedRows = ballotPosts.map((post) => ({
    post,
    candidate: getVotingCandidates(post).find((candidate) => candidate.id === selected[post]),
  }))

  function resetFlow() {
    setStep('welcome')
    setVotingId('')
    setMessage('')
    setPostIndex(0)
    setSelected({})
    setVoter(null)
  }

  function handleIdSubmit() {
    const result = validateVotingId(votingId)
    if (!result.ok) {
      setMessage(result.message)
      return
    }
    setMessage('')
    setVoter(result.voter)
    setPostIndex(0)
    setSelected({})
    setStep('select')
  }

  function handleNextPost() {
    if (!currentPost) return
    if (!selected[currentPost]) {
      setMessage(`Please select one candidate for ${currentPost}.`)
      return
    }
    setMessage('')
    if (postIndex === ballotPosts.length - 1) setStep('review')
    else setPostIndex((value) => value + 1)
  }

  function handleSubmitFinalVote() {
    const complete = ballotPosts.every((post) => Boolean(selected[post]))
    if (!complete) {
      setMessage('Please complete every post before submitting your vote.')
      setStep('select')
      return
    }

    try {
      submitVote(votingId, selected)
      setStep('thanks')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Please try again.')
      setStep('id')
    }
  }

  return (
    <PageBackground>
      <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-6 sm:px-6">
        <AnimatePresence mode="wait">
          {step === 'welcome' ? (
            <motion.section key="welcome" {...pageMotion} className="mx-auto grid w-full max-w-5xl place-items-center text-center">
              <BrandLogo variant="full" animated className="h-40 w-full max-w-sm sm:h-48 sm:max-w-md" />
              <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12, duration: 0.45 }} className="mt-8 text-4xl font-black leading-tight text-vpps-navy sm:text-6xl">
                VPPS Student Council Election 2026
              </motion.h1>
              <motion.div initial={{ width: 0 }} animate={{ width: 180 }} transition={{ delay: 0.28, duration: 0.55 }} className="mt-5 h-1.5 rounded-full bg-vpps-gold" />
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.34 }} className="mt-6 text-lg font-semibold text-slate-600">
                अपना नेता चुनें • Vote with Responsibility
              </motion.p>
              <HouseShowcase compact className="mt-8 w-full text-left" />
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.48 }}>
                <Button type="button" onClick={() => setStep('id')} className="mt-10 min-w-48 text-base">
                  <Vote size={20} />
                  Start Voting
                </Button>
              </motion.div>
            </motion.section>
          ) : null}

          {step === 'id' ? (
            <motion.section key="id" {...pageMotion} className="mx-auto w-full max-w-xl">
              <BrandLogo variant="icon" animated className="mx-auto mb-5 h-20 w-20" showFallbackText={false} />
              <Card className="p-6 sm:p-8">
                <div className="flex items-center gap-4">
                  <div>
                    <h1 className="text-3xl font-black">Enter Your 6-Digit Voting ID</h1>
                    <p className="mt-2 text-sm leading-6 text-slate-600">Enter the 6-digit number given by your class teacher or election desk.</p>
                  </div>
                </div>
                <input
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={votingId}
                  onChange={(event) => {
                    setMessage('')
                    setVotingId(event.target.value.replace(/\D/g, '').slice(0, 6))
                  }}
                  placeholder="482913"
                  className="mt-8 h-16 w-full rounded-3xl border-2 border-vpps-navy/10 bg-vpps-soft px-5 text-center text-3xl font-black tracking-[0.35em] text-vpps-navy placeholder:text-slate-300"
                  aria-label="Voting ID"
                />
                {message ? <p className="mt-4 rounded-2xl bg-vpps-danger/10 px-4 py-3 text-sm font-bold text-red-700">{message}</p> : null}
                <Button type="button" disabled={votingId.length !== 6} onClick={handleIdSubmit} className="mt-6 w-full text-base">Continue</Button>
                <Button type="button" variant="quiet" onClick={resetFlow} className="mt-3 w-full">Back to Start</Button>
              </Card>
            </motion.section>
          ) : null}

          {step === 'select' && currentPost ? (
            <motion.section key={`select-${currentPost}`} {...pageMotion} className="w-full">
              <BrandHeader compact className="mb-6 rounded-3xl border border-white/80 bg-white/85 p-3 shadow-sm" />
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.22em] text-vpps-richGold">Step {postIndex + 1} of {ballotPosts.length}</p>
                  <h1 className="mt-2 text-3xl font-black sm:text-5xl">{currentPost}</h1>
                  <p className="mt-2 text-sm font-semibold text-slate-600">Select one candidate for this post.</p>
                </div>
                <div className="h-3 rounded-full bg-white shadow-inner sm:w-64">
                  <div className="h-full rounded-full bg-vpps-gold transition-all" style={{ width: `${((postIndex + 1) / ballotPosts.length) * 100}%` }} />
                </div>
              </div>
              {voter ? (
                <div className="mb-5 rounded-3xl border border-white/80 bg-white/90 p-4 shadow-sm backdrop-blur">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-2 rounded-full bg-vpps-navy/10 px-3 py-1.5 text-xs font-black text-vpps-navy">
                      <UserCheck size={14} />
                      Welcome, {voter.voterName}
                    </span>
                    {voter.voterType === 'student' ? (
                      <>
                        <span className="text-sm font-bold text-slate-600">Class: {voter.classSection}</span>
                        <HouseBadge house={voter.house} size="md" showHeroName />
                      </>
                    ) : (
                      <span className="rounded-full bg-vpps-gold/20 px-3 py-1.5 text-xs font-black text-amber-800">Teacher Voter</span>
                    )}
                  </div>
                  <p className="mt-3 text-sm font-semibold text-slate-600">
                    {voter.voterType === 'student'
                      ? 'Only your own House Captain screen will appear after the general posts.'
                      : 'You will see all four House Captain screens after the general posts.'}
                  </p>
                </div>
              ) : null}
              {currentHouse ? <HouseHeroCard house={currentHouse} selected className="mb-5" /> : null}
              {message ? <p className="mb-4 rounded-2xl bg-vpps-warning/10 px-4 py-3 text-sm font-bold text-orange-700">{message}</p> : null}
              {candidates.length === 0 ? (
                <Card className="border-vpps-danger/20 bg-red-50 text-sm font-bold text-red-700">No approved active candidates are available for this post. Please contact the election desk.</Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {candidates.map((candidate) => (
                    <CandidateCard
                      key={candidate.id}
                      candidate={candidate}
                      selected={selected[currentPost] === candidate.id}
                      onSelect={() => {
                        setMessage('')
                        setSelected((value) => ({ ...value, [currentPost]: candidate.id }))
                      }}
                    />
                  ))}
                </div>
              )}
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button type="button" variant="secondary" onClick={() => (postIndex === 0 ? setStep('id') : setPostIndex((value) => value - 1))}>
                  <ArrowLeft size={18} />
                  Back
                </Button>
                <Button type="button" onClick={handleNextPost}>
                  {postIndex === ballotPosts.length - 1 ? 'Review Vote' : 'Continue'}
                  {selectedCandidate ? <Check size={18} /> : null}
                </Button>
              </div>
            </motion.section>
          ) : null}

          {step === 'review' ? (
            <motion.section key="review" {...pageMotion} className="mx-auto w-full max-w-3xl">
              <Card className="p-6 sm:p-8">
                <BrandHeader compact className="mb-6 border-b border-dashed border-vpps-navy/15 pb-5" />
                <h1 className="text-3xl font-black">Review Your Vote</h1>
                <p className="mt-3 text-sm leading-6 text-slate-600">Please check your choices carefully. Once submitted, your vote cannot be changed.</p>
                <div className="mt-6 overflow-hidden rounded-3xl border border-dashed border-vpps-navy/25 bg-vpps-soft/50">
                  {selectedRows.map((row) => (
                    <div key={row.post} className="grid grid-cols-[1fr_1.15fr] gap-3 border-b border-vpps-navy/10 bg-white px-4 py-4 last:border-b-0">
                      <p className="text-sm font-black text-vpps-navy">{row.post}</p>
                      <p className="text-sm font-bold text-slate-700">{row.candidate?.name ?? 'Not selected'}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
                  <Button type="button" variant="secondary" onClick={() => setStep('select')}>Change Selection</Button>
                  <Button type="button" onClick={handleSubmitFinalVote}>Submit Final Vote</Button>
                </div>
              </Card>
            </motion.section>
          ) : null}

          {step === 'thanks' ? (
            <motion.section key="thanks" {...pageMotion} className="mx-auto w-full max-w-2xl text-center">
              <Card className="relative overflow-hidden p-8 sm:p-10">
                <div className="flex items-center justify-center gap-3">
                  <BrandLogo variant="icon" animated className="h-20 w-20" showFallbackText={false} />
                  <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 220, damping: 14 }} className="grid h-20 w-20 place-items-center rounded-full bg-vpps-success text-white">
                    <CheckCircle2 size={44} />
                  </motion.div>
                </div>
                <h1 className="mt-8 text-3xl font-black">Thank you! Your vote has been recorded.</h1>
                <p className="mt-3 text-xl font-bold text-vpps-navy">आपका मतदान सफलतापूर्वक दर्ज हो गया है।</p>
                <p className="mt-4 text-sm leading-6 text-slate-600">You cannot vote again using this ID.</p>
                <p className="mt-2 text-sm font-bold text-slate-500">Please call the next student or teacher.</p>
                <Button type="button" onClick={resetFlow} className="mt-8">
                  <ShieldCheck size={18} />
                  Back to Start
                </Button>
              </Card>
            </motion.section>
          ) : null}
        </AnimatePresence>
      </main>
    </PageBackground>
  )
}
