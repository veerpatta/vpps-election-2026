import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion, type Variants } from 'framer-motion'
import { ArrowLeft, ArrowRight, Check, CheckCircle2, ShieldCheck, UserCheck, Vote } from 'lucide-react'
import { BrandLogo } from '../../components/brand/BrandLogo'
import { CandidateAvatar } from '../../components/candidates/CandidateAvatar'
import { HouseBadge } from '../../components/house/HouseBadge'
import { HouseLogo } from '../../components/house/HouseLogo'
import { ScreenFitShell } from '../../components/layout/ScreenFitShell'
import { CandidateCard } from '../../components/voter/CandidateCard'
import { Button, Card, Eyebrow, PageBackground } from '../../components/ui/primitives'
import { useEdgeAutoScroll } from '../../hooks/useEdgeAutoScroll'
import { getBallotPosts, getVotingCandidates, submitVote, validateVotingId } from '../../lib/electionStore'
import { cn } from '../../lib/utils'
import { houseOrder, getHouseMeta } from '../../lib/houses'
import type { ElectionPostId, Voter as VoterRecord } from '../../types/election'

type Step = 'welcome' | 'id' | 'confirm' | 'select' | 'review' | 'thanks'

const pageMotion = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.22 },
}

const listStagger: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.035,
      delayChildren: 0.05,
    },
  },
}

const itemFade: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 320, damping: 28 } },
}

function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }, (_, idx) => {
        const state = idx < current ? 'done' : idx === current ? 'now' : 'todo'
        return (
          <motion.span
            key={idx}
            layout
            className={cn(
              'h-1.5 rounded-full',
              state === 'now' ? 'w-6 bg-vpps-navy' : state === 'done' ? 'w-1.5 bg-vpps-gold' : 'w-1.5 bg-vpps-line',
            )}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          />
        )
      })}
    </div>
  )
}

function MiniHeader() {
  return (
    <div className="flex items-center gap-2.5 rounded-2xl border border-vpps-line bg-white/90 px-3 py-2 shadow-card backdrop-blur">
      <BrandLogo variant="icon" className="h-9 w-9 shrink-0" showFallbackText={false} />
      <div className="min-w-0">
        <p className="truncate text-[0.78rem] font-semibold tracking-tight text-vpps-navy">
          VPPS Student Council Election 2026
        </p>
        <p className="truncate text-[0.65rem] font-medium text-vpps-mute">Official Digital Ballot</p>
      </div>
    </div>
  )
}

function FooterBar({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-vpps-line bg-white/95 p-2 shadow-floating backdrop-blur">
      <div className="flex items-center gap-2">{children}</div>
    </div>
  )
}

function Confetti() {
  const pieces = Array.from({ length: 28 }, (_, idx) => idx)
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((idx) => {
        const left = (idx * 37) % 100
        const delay = (idx % 6) * 0.05
        const colors = ['#F4B400', '#0B1F3A', '#16A34A', '#1d4ed8', '#b91c1c']
        const color = colors[idx % colors.length]
        return (
          <motion.span
            key={idx}
            initial={{ y: -40, opacity: 0, rotate: 0 }}
            animate={{
              y: ['-10%', '120%'],
              opacity: [0, 1, 1, 0],
              rotate: [0, 220 + (idx % 3) * 80],
            }}
            transition={{ delay, duration: 2.4 + (idx % 5) * 0.2, ease: 'easeOut' }}
            className="absolute top-0 h-2 w-1.5 rounded-sm"
            style={{ left: `${left}%`, backgroundColor: color }}
          />
        )
      })}
    </div>
  )
}

export function VotePage() {
  const reducedMotion = useReducedMotion()
  const [step, setStep] = useState<Step>('welcome')
  const [votingId, setVotingId] = useState('')
  const [message, setMessage] = useState('')
  const [postIndex, setPostIndex] = useState(0)
  const [selected, setSelected] = useState<Partial<Record<ElectionPostId, string>>>({})
  const [voter, setVoter] = useState<VoterRecord | null>(null)

  const candidatePanelRef = useRef<HTMLDivElement | null>(null)
  useEdgeAutoScroll(candidatePanelRef, {
    enabled: step === 'select',
    edgeSizeRatio: 0.18,
    maxSpeed: 1.4,
    minSpeed: 0.2,
  })

  const reviewPanelRef = useRef<HTMLDivElement | null>(null)
  useEdgeAutoScroll(reviewPanelRef, {
    enabled: step === 'review',
    edgeSizeRatio: 0.18,
    maxSpeed: 1.0,
    minSpeed: 0.18,
  })

  const ballotPosts = useMemo(() => (voter ? getBallotPosts(voter) : []), [voter])
  const currentPost = ballotPosts[postIndex]
  const currentHouse = currentPost?.kind === 'house' ? currentPost.house : undefined
  const currentHouseMeta = currentHouse ? getHouseMeta(currentHouse) : undefined
  const candidates = useMemo(() => (currentPost ? getVotingCandidates(currentPost.id) : []), [currentPost])
  const selectedCandidate = currentPost ? candidates.find((candidate) => candidate.id === selected[currentPost.id]) : undefined
  const selectedRows = ballotPosts.map((post) => ({
    post,
    candidate: getVotingCandidates(post.id).find((candidate) => candidate.id === selected[post.id]),
  }))

  function resetFlow() {
    setStep('welcome')
    setVotingId('')
    setMessage('')
    setPostIndex(0)
    setSelected({})
    setVoter(null)
  }

  function handleIdSubmit(event?: FormEvent) {
    event?.preventDefault()
    const result = validateVotingId(votingId)
    if (!result.ok) {
      setMessage(result.message)
      return
    }
    setMessage('')
    setVoter(result.voter)
    setPostIndex(0)
    setSelected({})
    setStep('confirm')
  }

  function handleNextPost(event?: FormEvent) {
    event?.preventDefault()
    if (!currentPost) return
    if (!selected[currentPost.id]) {
      setMessage(`Please select one candidate for ${currentPost.label}.`)
      return
    }
    setMessage('')
    if (postIndex === ballotPosts.length - 1) setStep('review')
    else setPostIndex((value) => value + 1)
  }

  function handleSubmitFinalVote(event?: FormEvent) {
    event?.preventDefault()
    const complete = ballotPosts.every((post) => Boolean(selected[post.id]))
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

  // Global Enter handler: trigger primary action of current step.
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key !== 'Enter') return
      const target = event.target as HTMLElement | null
      if (target) {
        const tag = target.tagName
        if (tag === 'TEXTAREA') return
        // Inside our handled forms, native submit takes care of it
        if (tag === 'INPUT' || tag === 'BUTTON' || tag === 'SELECT') return
      }
      event.preventDefault()
      if (step === 'welcome') setStep('id')
      else if (step === 'confirm') setStep('select')
      else if (step === 'select') handleNextPost()
      else if (step === 'review') handleSubmitFinalVote()
      else if (step === 'thanks') resetFlow()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, postIndex, selected, ballotPosts, votingId])

  return (
    <PageBackground>
      <main className="h-dvh overflow-hidden">
        <AnimatePresence mode="wait">
          {step === 'welcome' ? (
            <motion.div key="welcome" {...pageMotion}>
              <ScreenFitShell
                mainClassName="grid place-items-center"
                footer={
                  <FooterBar>
                    <Button type="button" size="lg" onClick={() => setStep('id')} className="ml-auto">
                      <Vote size={18} />
                      Start Voting
                      <ArrowRight size={16} />
                    </Button>
                  </FooterBar>
                }
              >
                <div className="mx-auto grid w-full max-w-3xl place-items-center text-center">
                  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: 'easeOut' }}>
                    <BrandLogo variant="full" animated className="mx-auto h-24 w-full max-w-xs sm:h-32 sm:max-w-sm" />
                    <Eyebrow className="mx-auto mt-6">Veer Patta Public School</Eyebrow>
                    <h1 className="mt-3 font-display text-3xl font-semibold leading-[1.1] tracking-tight text-vpps-navy sm:text-5xl">
                      Student Council Election
                      <span className="block text-vpps-deepGold">2026</span>
                    </h1>
                    <p className="mx-auto mt-4 max-w-md text-sm font-medium leading-6 text-vpps-mute sm:text-base">
                      A clean, secure digital ballot for every student and teacher. Vote with responsibility.
                    </p>
                    <p className="mx-auto mt-3 inline-flex items-center gap-2 rounded-full border border-vpps-line bg-white px-3 py-1 text-[0.7rem] font-medium text-vpps-mute shadow-card">
                      <span className="grid h-5 w-5 place-items-center rounded bg-vpps-navy text-[0.6rem] font-semibold text-vpps-gold">↵</span>
                      Press Enter to begin
                    </p>
                    <motion.div
                      variants={listStagger}
                      initial="hidden"
                      animate="show"
                      className="mx-auto mt-7 grid max-w-md grid-cols-4 gap-2 sm:gap-3"
                    >
                      {houseOrder.map((house) => (
                        <motion.div
                          key={house}
                          variants={itemFade}
                          className="grid place-items-center rounded-2xl border border-vpps-line bg-white px-2 py-3 shadow-card"
                        >
                          <HouseLogo house={house} size="md" animated />
                        </motion.div>
                      ))}
                    </motion.div>
                  </motion.div>
                </div>
              </ScreenFitShell>
            </motion.div>
          ) : null}

          {step === 'id' ? (
            <motion.div key="id" {...pageMotion}>
              <ScreenFitShell
                header={<MiniHeader />}
                mainClassName="grid place-items-center"
                footer={
                  <FooterBar>
                    <Button type="button" variant="secondary" onClick={resetFlow} className="flex-1 sm:flex-none">
                      <ArrowLeft size={16} />
                      Back
                    </Button>
                    <Button
                      type="submit"
                      form="vote-id-form"
                      disabled={votingId.length !== 6}
                      className="flex-1 sm:ml-auto sm:flex-none"
                    >
                      Continue
                      <ArrowRight size={16} />
                    </Button>
                  </FooterBar>
                }
              >
                <Card className="w-full max-w-md p-6 sm:p-8">
                  <Eyebrow>Voter Identification</Eyebrow>
                  <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-vpps-navy sm:text-3xl">
                    Enter your 6-digit Voting ID
                  </h1>
                  <p className="mt-1.5 text-sm leading-6 text-vpps-mute">
                    Use the number shared by your class teacher or the election desk.
                  </p>
                  <form id="vote-id-form" onSubmit={handleIdSubmit}>
                    <input
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      autoFocus
                      value={votingId}
                      onChange={(event) => {
                        setMessage('')
                        setVotingId(event.target.value.replace(/\D/g, '').slice(0, 6))
                      }}
                      placeholder="• • • • • •"
                      className="mt-6 h-16 w-full rounded-2xl border border-vpps-line bg-vpps-soft px-4 text-center font-mono text-3xl font-semibold tracking-[0.4em] text-vpps-navy placeholder:text-slate-300 focus:border-vpps-navy/40"
                      aria-label="Voting ID"
                    />
                    {message ? (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 rounded-xl bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700 ring-1 ring-red-100"
                      >
                        {message}
                      </motion.p>
                    ) : (
                      <p className="mt-4 inline-flex items-center gap-2 text-[0.7rem] font-medium text-vpps-mute">
                        <span className="grid h-5 w-5 place-items-center rounded bg-vpps-navy text-[0.6rem] font-semibold text-vpps-gold">↵</span>
                        Press Enter to continue
                      </p>
                    )}
                  </form>
                </Card>
              </ScreenFitShell>
            </motion.div>
          ) : null}

          {step === 'confirm' && voter ? (
            <motion.div key="confirm" {...pageMotion}>
              <ScreenFitShell
                header={<MiniHeader />}
                mainClassName="grid place-items-center"
                footer={
                  <FooterBar>
                    <Button type="button" variant="secondary" onClick={() => setStep('id')} className="flex-1 sm:flex-none">
                      <ArrowLeft size={16} />
                      Back
                    </Button>
                    <Button type="button" onClick={() => setStep('select')} className="flex-1 sm:ml-auto sm:flex-none">
                      Begin Ballot
                      <ArrowRight size={16} />
                    </Button>
                  </FooterBar>
                }
              >
                <Card className="w-full max-w-xl overflow-hidden p-0">
                  <div className="relative bg-vpps-navy px-6 py-5 text-white sm:px-8 sm:py-6">
                    <motion.span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 opacity-30"
                      style={{
                        backgroundImage:
                          'radial-gradient(40% 60% at 90% 0%, rgba(244,180,0,0.6) 0%, rgba(244,180,0,0) 60%)',
                      }}
                      animate={reducedMotion ? undefined : { opacity: [0.18, 0.32, 0.18] }}
                      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <div className="relative flex items-center gap-3 text-vpps-gold">
                      <UserCheck size={18} />
                      <span className="text-[0.7rem] font-semibold uppercase tracking-[0.18em]">Confirm voter</span>
                    </div>
                    <h1 className="relative mt-2 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                      {voter.voterName}
                    </h1>
                    <div className="relative mt-3 flex flex-wrap items-center gap-2 text-xs font-medium text-white/80">
                      <span className="rounded-full bg-white/10 px-2.5 py-1 capitalize ring-1 ring-white/15">{voter.voterType}</span>
                      {voter.classSection ? (
                        <span className="rounded-full bg-white/10 px-2.5 py-1 ring-1 ring-white/15">Class {voter.classSection}</span>
                      ) : null}
                      {voter.departmentOrRole ? (
                        <span className="rounded-full bg-white/10 px-2.5 py-1 ring-1 ring-white/15">{voter.departmentOrRole}</span>
                      ) : null}
                      {voter.house && voter.house !== 'all' ? <HouseBadge house={voter.house} size="sm" showHeroName /> : null}
                    </div>
                  </div>
                  <div className="px-6 py-5 sm:px-8 sm:py-6">
                    <p className="text-sm leading-6 text-vpps-navy/80">
                      {voter.voterType === 'student'
                        ? 'You will vote for Head Boy, Head Girl, the Boys/Girls categories for Discipline, Cultural and Sports captains, and your own house captains.'
                        : 'You will vote for Head Boy, Head Girl, the Boys/Girls categories for Discipline, Cultural, Sports, and all House Captain contests.'}
                    </p>
                    <div className="mt-4 flex items-center gap-3 rounded-xl bg-vpps-soft px-3.5 py-3 ring-1 ring-vpps-line">
                      <span className="grid h-8 w-8 place-items-center rounded-full bg-vpps-gold/15 text-vpps-deepGold">
                        <Vote size={16} />
                      </span>
                      <p className="text-sm font-medium text-vpps-navy">
                        Total ballot screens: <span className="font-semibold">{ballotPosts.length}</span>
                      </p>
                      <span className="ml-auto inline-flex items-center gap-1.5 text-[0.7rem] font-medium text-vpps-mute">
                        <span className="grid h-5 w-5 place-items-center rounded bg-vpps-navy text-[0.6rem] font-semibold text-vpps-gold">↵</span>
                        Enter to begin
                      </span>
                    </div>
                  </div>
                </Card>
              </ScreenFitShell>
            </motion.div>
          ) : null}

          {step === 'select' && currentPost ? (
            <motion.div key={`select-${currentPost.id}`} {...pageMotion}>
              <ScreenFitShell
                header={
                  <div className="flex flex-col gap-2">
                    <MiniHeader />
                    <div className="rounded-2xl border border-vpps-line bg-white px-3.5 py-3 shadow-card sm:px-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-vpps-mute">
                            <span>Step {postIndex + 1} of {ballotPosts.length}</span>
                            {currentHouseMeta ? (
                              <span
                                className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-white"
                                style={{ backgroundColor: currentHouseMeta.primaryColor }}
                              >
                                <span className="h-1.5 w-1.5 rounded-full bg-white" />
                                {currentHouseMeta.colorName}
                              </span>
                            ) : null}
                          </div>
                          <h1 className="mt-1 truncate font-display text-xl font-semibold tracking-tight text-vpps-navy sm:text-2xl">
                            {currentPost.label}
                          </h1>
                        </div>
                        <div className="hidden shrink-0 sm:block">
                          <StepDots current={postIndex} total={ballotPosts.length} />
                        </div>
                      </div>
                    </div>
                  </div>
                }
                footer={
                  <FooterBar>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => (postIndex === 0 ? setStep('confirm') : setPostIndex((value) => value - 1))}
                      className="flex-1 sm:flex-none"
                    >
                      <ArrowLeft size={16} />
                      Back
                    </Button>
                    <div className="hidden flex-1 items-center justify-center text-xs font-medium text-vpps-mute sm:flex">
                      {selectedCandidate ? (
                        <span className="inline-flex items-center gap-1.5 text-vpps-navy">
                          <Check size={14} className="text-vpps-success" />
                          <span className="max-w-[20rem] truncate">{selectedCandidate.name}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5">
                          Select one candidate · press
                          <span className="grid h-5 w-5 place-items-center rounded bg-vpps-navy text-[0.6rem] font-semibold text-vpps-gold">↵</span>
                        </span>
                      )}
                    </div>
                    <Button type="button" onClick={() => handleNextPost()} className="flex-1 sm:flex-none">
                      {postIndex === ballotPosts.length - 1 ? 'Review Vote' : 'Continue'}
                      <ArrowRight size={16} />
                    </Button>
                  </FooterBar>
                }
              >
                <div className="flex h-full min-h-0 flex-col gap-2.5">
                  <AnimatePresence>
                    {message ? (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="rounded-xl bg-orange-50 px-3.5 py-2.5 text-sm font-medium text-orange-700 ring-1 ring-orange-100"
                      >
                        {message}
                      </motion.p>
                    ) : null}
                  </AnimatePresence>
                  {candidates.length === 0 ? (
                    <Card className="border-red-100 bg-red-50/50 text-sm font-medium text-red-700">
                      No approved active candidates are available for this post. Please contact the election desk.
                    </Card>
                  ) : (
                    <div
                      ref={candidatePanelRef}
                      className="min-h-0 flex-1 overflow-y-auto rounded-2xl border border-vpps-line bg-white/60 p-2.5 shadow-inset [scrollbar-gutter:stable] sm:p-3"
                    >
                      <motion.div
                        key={currentPost.id}
                        variants={listStagger}
                        initial="hidden"
                        animate="show"
                        className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3"
                      >
                        {candidates.map((candidate) => (
                          <motion.div key={candidate.id} variants={itemFade}>
                            <CandidateCard
                              candidate={candidate}
                              selected={selected[currentPost.id] === candidate.id}
                              onSelect={() => {
                                setMessage('')
                                setSelected((value) => ({ ...value, [currentPost.id]: candidate.id }))
                              }}
                            />
                          </motion.div>
                        ))}
                      </motion.div>
                    </div>
                  )}
                </div>
              </ScreenFitShell>
            </motion.div>
          ) : null}

          {step === 'review' ? (
            <motion.div key="review" {...pageMotion}>
              <ScreenFitShell
                header={<MiniHeader />}
                footer={
                  <FooterBar>
                    <Button type="button" variant="secondary" onClick={() => setStep('select')} className="flex-1 sm:flex-none">
                      <ArrowLeft size={16} />
                      Change
                    </Button>
                    <Button type="submit" form="vote-review-form" className="flex-1 sm:ml-auto sm:flex-none">
                      Submit Final Vote
                      <Check size={16} />
                    </Button>
                  </FooterBar>
                }
              >
                <form id="vote-review-form" onSubmit={handleSubmitFinalVote} className="contents">
                  <Card className="mx-auto grid h-full w-full max-w-2xl grid-rows-[auto_minmax(0,1fr)] overflow-hidden p-0">
                    <div className="border-b border-vpps-line px-5 py-4 sm:px-6 sm:py-5">
                      <Eyebrow>Official Vote Slip</Eyebrow>
                      <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-vpps-navy sm:text-3xl">
                        Review your vote
                      </h1>
                      <p className="mt-1 text-sm leading-6 text-vpps-mute">
                        Please check your choices carefully. Once submitted, your vote cannot be changed.
                      </p>
                    </div>
                    <div ref={reviewPanelRef} className="min-h-0 overflow-y-auto bg-vpps-soft/60 [scrollbar-gutter:stable]">
                      <motion.div variants={listStagger} initial="hidden" animate="show">
                        {selectedRows.map((row, index) => {
                          const meta = row.candidate?.house ? getHouseMeta(row.candidate.house) : undefined
                          const accent = meta?.primaryColor ?? '#0B1F3A'
                          return (
                            <motion.div
                              key={row.post.id}
                              variants={itemFade}
                              className="flex items-center gap-3 border-b border-vpps-line/70 bg-white px-4 py-3 last:border-b-0 sm:px-6"
                            >
                              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-vpps-soft text-[0.65rem] font-semibold text-vpps-mute ring-1 ring-vpps-line">
                                {index + 1}
                              </span>
                              <CandidateAvatar
                                name={row.candidate?.name ?? '—'}
                                imageUrl={row.candidate?.photoUrl}
                                house={row.candidate?.house}
                                category={row.candidate?.category}
                                size="sm"
                                shape="circle"
                              />
                              <div className="min-w-0 flex-1">
                                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-vpps-mute">
                                  {row.post.label}
                                </p>
                                <p className="truncate text-sm font-semibold tracking-tight text-vpps-navy">
                                  {row.candidate?.name ?? 'Not selected'}
                                </p>
                                {row.candidate ? (
                                  <p className="text-xs font-medium text-vpps-mute">{row.candidate.classSection}</p>
                                ) : null}
                              </div>
                              {row.candidate ? (
                                <span
                                  className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-white"
                                  style={{ backgroundColor: accent }}
                                >
                                  <Check size={14} strokeWidth={3} />
                                </span>
                              ) : (
                                <span className="text-[0.65rem] font-semibold uppercase tracking-wide text-red-600">
                                  Missing
                                </span>
                              )}
                            </motion.div>
                          )
                        })}
                      </motion.div>
                    </div>
                  </Card>
                </form>
              </ScreenFitShell>
            </motion.div>
          ) : null}

          {step === 'thanks' ? (
            <motion.div key="thanks" {...pageMotion}>
              <ScreenFitShell
                mainClassName="grid place-items-center"
                footer={
                  <FooterBar>
                    <Button type="button" onClick={resetFlow} className="mx-auto">
                      <ShieldCheck size={16} />
                      Back to Start
                    </Button>
                  </FooterBar>
                }
              >
                <div className="relative w-full max-w-lg">
                  {!reducedMotion ? <Confetti /> : null}
                  <Card className="overflow-hidden p-0 text-center">
                    <div className="relative bg-gradient-to-b from-emerald-50 to-white px-6 py-8 sm:px-10 sm:py-10">
                      <motion.div
                        initial={{ scale: 0.4, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 220, damping: 14 }}
                        className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-500 text-white shadow-[0_18px_40px_-12px_rgba(16,185,129,0.55)]"
                      >
                        <CheckCircle2 size={44} />
                      </motion.div>
                      <motion.h1
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="mt-6 font-display text-2xl font-semibold tracking-tight text-vpps-navy sm:text-3xl"
                      >
                        Vote recorded
                      </motion.h1>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.25 }}
                        className="mt-2 text-base font-medium text-vpps-navy/80"
                      >
                        आपका मतदान सफलतापूर्वक दर्ज हो गया है।
                      </motion.p>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.35 }}
                        className="mt-2 text-sm leading-6 text-vpps-mute"
                      >
                        Thank you. You cannot vote again using this ID. Please call the next student or teacher.
                      </motion.p>
                    </div>
                  </Card>
                </div>
              </ScreenFitShell>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </main>
    </PageBackground>
  )
}
