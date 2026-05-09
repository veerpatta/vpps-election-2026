import { useMemo, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Check, CheckCircle2, ShieldCheck, UserCheck, Vote } from 'lucide-react'
import { BrandHeader } from '../../components/brand/BrandHeader'
import { BrandLogo } from '../../components/brand/BrandLogo'
import { CandidateAvatar } from '../../components/candidates/CandidateAvatar'
import { HouseBadge } from '../../components/house/HouseBadge'
import { HouseHeroCard } from '../../components/house/HouseHeroCard'
import { HouseLogo } from '../../components/house/HouseLogo'
import { ScreenFitShell } from '../../components/layout/ScreenFitShell'
import { CandidateCard } from '../../components/voter/CandidateCard'
import { Button, Card, PageBackground } from '../../components/ui/primitives'
import { getBallotPosts, getVotingCandidates, submitVote, validateVotingId } from '../../lib/electionStore'
import { cn } from '../../lib/utils'
import { getHouseByPost, houseOrder } from '../../lib/houses'
import type { CouncilPost, Voter as VoterRecord } from '../../types/election'

type Step = 'welcome' | 'id' | 'confirm' | 'select' | 'review' | 'thanks'

const pageMotion = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -14 },
  transition: { duration: 0.24 },
}

function StepProgress({ current, total }: { current: number; total: number }) {
  return (
    <div className="h-2 rounded-full bg-white shadow-inner">
      <div className="h-full rounded-full bg-vpps-gold transition-all" style={{ width: `${(current / total) * 100}%` }} />
    </div>
  )
}

function VoteHeader({ compact = false }: { compact?: boolean }) {
  return (
    <BrandHeader
      compact
      className={cn('rounded-2xl border border-white/80 bg-white/90 p-2.5 shadow-sm backdrop-blur', compact ? 'sm:p-3' : 'sm:p-4')}
      title="VPPS Student Council Election 2026"
      subtitle="Vote with Responsibility"
    />
  )
}

function FooterBar({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/80 bg-white/95 p-2.5 shadow-2xl shadow-vpps-navy/10 backdrop-blur">
      <div className="flex gap-2 sm:justify-between">{children}</div>
    </div>
  )
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
    setStep('confirm')
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
      <main className="h-dvh overflow-hidden">
        <AnimatePresence mode="wait">
          {step === 'welcome' ? (
            <motion.div key="welcome" {...pageMotion}>
              <ScreenFitShell
                mainClassName="grid place-items-center"
                footer={
                  <FooterBar>
                    <Button type="button" onClick={() => setStep('id')} className="w-full text-base sm:ml-auto sm:w-auto">
                      <Vote size={20} />
                      Start Voting
                    </Button>
                  </FooterBar>
                }
              >
                <div className="grid h-full w-full max-w-4xl place-items-center text-center">
                  <div>
                    <BrandLogo variant="full" animated className="mx-auto h-28 w-full max-w-xs sm:h-36 sm:max-w-sm" />
                    <h1 className="mt-5 text-3xl font-black leading-tight text-vpps-navy sm:text-5xl">
                      VPPS Student Council Election 2026
                    </h1>
                    <motion.div initial={{ width: 0 }} animate={{ width: 150 }} transition={{ delay: 0.16, duration: 0.45 }} className="mx-auto mt-4 h-1.5 rounded-full bg-vpps-gold" />
                    <p className="mt-4 text-base font-semibold text-slate-600 sm:text-lg">Vote with Responsibility</p>
                    <div className="mt-5 grid grid-cols-4 gap-2 sm:mt-7 sm:gap-3">
                      {houseOrder.map((house) => (
                        <div key={house} className="grid place-items-center rounded-2xl border border-white/80 bg-white/80 px-2 py-3 shadow-sm">
                          <HouseLogo house={house} size="md" animated />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ScreenFitShell>
            </motion.div>
          ) : null}

          {step === 'id' ? (
            <motion.div key="id" {...pageMotion}>
              <ScreenFitShell
                header={<VoteHeader compact />}
                mainClassName="grid place-items-center"
                footer={
                  <FooterBar>
                    <Button type="button" variant="secondary" onClick={resetFlow} className="flex-1 sm:flex-none">
                      <ArrowLeft size={18} />
                      Back
                    </Button>
                    <Button type="button" disabled={votingId.length !== 6} onClick={handleIdSubmit} className="flex-1 sm:flex-none">
                      Continue
                    </Button>
                  </FooterBar>
                }
              >
                <Card className="w-full max-w-xl p-5 sm:p-7">
                  <h1 className="text-2xl font-black sm:text-3xl">Enter Your 6-Digit Voting ID</h1>
                  <p className="mt-2 text-sm leading-6 text-slate-600">Enter the number given by your class teacher or election desk.</p>
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
                    className="mt-6 h-16 w-full rounded-2xl border-2 border-vpps-navy/10 bg-vpps-soft px-4 text-center text-3xl font-black tracking-[0.32em] text-vpps-navy placeholder:text-slate-300"
                    aria-label="Voting ID"
                  />
                  {message ? <p className="mt-4 rounded-2xl bg-vpps-danger/10 px-4 py-3 text-sm font-bold text-red-700">{message}</p> : null}
                </Card>
              </ScreenFitShell>
            </motion.div>
          ) : null}

          {step === 'confirm' && voter ? (
            <motion.div key="confirm" {...pageMotion}>
              <ScreenFitShell
                header={<VoteHeader compact />}
                mainClassName="grid place-items-center"
                footer={
                  <FooterBar>
                    <Button type="button" variant="secondary" onClick={() => setStep('id')} className="flex-1 sm:flex-none">
                      <ArrowLeft size={18} />
                      Back
                    </Button>
                    <Button type="button" onClick={() => setStep('select')} className="flex-1 sm:flex-none">
                      Continue
                      <Check size={18} />
                    </Button>
                  </FooterBar>
                }
              >
                <Card className="w-full max-w-2xl p-5 sm:p-7">
                  <div className="flex items-start gap-4">
                    <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-vpps-navy text-vpps-gold">
                      <UserCheck size={28} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-black uppercase tracking-[0.18em] text-vpps-richGold">Confirm Voter</p>
                      <h1 className="mt-1 text-2xl font-black sm:text-3xl">{voter.voterName}</h1>
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm font-bold text-slate-600">
                        <span className="rounded-full bg-vpps-navy/10 px-3 py-1.5 capitalize text-vpps-navy">{voter.voterType}</span>
                        {voter.classSection ? <span>Class {voter.classSection}</span> : null}
                        {voter.departmentOrRole ? <span>{voter.departmentOrRole}</span> : null}
                        {voter.house && voter.house !== 'all' ? <HouseBadge house={voter.house} size="sm" showHeroName /> : null}
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 rounded-2xl border border-vpps-navy/10 bg-vpps-soft/80 p-4">
                    <p className="text-sm font-bold text-slate-700">
                      {voter.voterType === 'student'
                        ? 'You will vote for general posts and only your own House Captain.'
                        : 'You will vote for general posts and all four House Captains.'}
                    </p>
                    <p className="mt-2 text-xs font-bold text-slate-500">Total screens: {ballotPosts.length}</p>
                  </div>
                </Card>
              </ScreenFitShell>
            </motion.div>
          ) : null}

          {step === 'select' && currentPost ? (
            <motion.div key={`select-${currentPost}`} {...pageMotion}>
              <ScreenFitShell
                header={
                  <div className="grid gap-2">
                    <VoteHeader compact />
                    <div className="rounded-2xl border border-white/80 bg-white/90 p-3 shadow-sm backdrop-blur">
                      <div className="flex items-end justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-black uppercase tracking-[0.18em] text-vpps-richGold">Step {postIndex + 1} of {ballotPosts.length}</p>
                          <h1 className="truncate text-2xl font-black sm:text-3xl">{currentPost}</h1>
                        </div>
                        {voter ? (
                          <div className="hidden shrink-0 items-center gap-2 text-xs font-bold text-slate-600 sm:flex">
                            <UserCheck size={15} />
                            <span className="max-w-48 truncate">{voter.voterName}</span>
                          </div>
                        ) : null}
                      </div>
                      <div className="mt-3">
                        <StepProgress current={postIndex + 1} total={ballotPosts.length} />
                      </div>
                    </div>
                  </div>
                }
                footer={
                  <FooterBar>
                    <Button type="button" variant="secondary" onClick={() => (postIndex === 0 ? setStep('confirm') : setPostIndex((value) => value - 1))} className="flex-1 sm:flex-none">
                      <ArrowLeft size={18} />
                      Back
                    </Button>
                    <Button type="button" onClick={handleNextPost} className="flex-1 sm:flex-none">
                      {postIndex === ballotPosts.length - 1 ? 'Review Vote' : 'Continue'}
                      {selectedCandidate ? <Check size={18} /> : null}
                    </Button>
                  </FooterBar>
                }
              >
                <div className="grid h-full min-h-0 gap-3 lg:grid-cols-[18rem_minmax(0,1fr)]">
                  <aside className="hidden min-h-0 overflow-hidden lg:block">
                    {currentHouse ? <HouseHeroCard house={currentHouse} compact selected className="h-full min-h-0" /> : (
                      <Card className="h-full p-4">
                        <p className="text-sm font-black uppercase tracking-[0.18em] text-vpps-richGold">Candidate Selection</p>
                        <h2 className="mt-2 text-2xl font-black">{currentPost}</h2>
                        <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">Select one candidate. Your choice can be reviewed before final submission.</p>
                      </Card>
                    )}
                  </aside>
                  <div className="flex min-h-0 flex-col gap-3">
                    {currentHouse ? <HouseHeroCard house={currentHouse} compact selected className="!h-24 !min-h-0 lg:hidden" /> : null}
                    {message ? <p className="rounded-2xl bg-vpps-warning/10 px-4 py-3 text-sm font-bold text-orange-700">{message}</p> : null}
                    {candidates.length === 0 ? (
                      <Card className="border-vpps-danger/20 bg-red-50 text-sm font-bold text-red-700">No approved active candidates are available for this post. Please contact the election desk.</Card>
                    ) : (
                      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                        <div className="grid gap-3 pb-1 md:grid-cols-2 xl:grid-cols-3">
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
                      </div>
                    )}
                  </div>
                </div>
              </ScreenFitShell>
            </motion.div>
          ) : null}

          {step === 'review' ? (
            <motion.div key="review" {...pageMotion}>
              <ScreenFitShell
                header={<VoteHeader compact />}
                footer={
                  <FooterBar>
                    <Button type="button" variant="secondary" onClick={() => setStep('select')} className="flex-1 sm:flex-none">Change</Button>
                    <Button type="button" onClick={handleSubmitFinalVote} className="flex-1 sm:flex-none">Submit Final Vote</Button>
                  </FooterBar>
                }
              >
                <Card className="mx-auto grid h-full w-full max-w-3xl grid-rows-[auto_minmax(0,1fr)] p-5 sm:p-6">
                  <div>
                    <h1 className="text-2xl font-black sm:text-3xl">Review Your Vote</h1>
                    <p className="mt-2 text-sm leading-6 text-slate-600">Please check your choices carefully. Once submitted, your vote cannot be changed.</p>
                  </div>
                  <div className="mt-4 min-h-0 overflow-y-auto rounded-2xl border border-dashed border-vpps-navy/20 bg-vpps-soft/60">
                    {selectedRows.map((row) => (
                      <div key={row.post} className="flex items-center gap-3 border-b border-vpps-navy/10 bg-white px-3 py-3 last:border-b-0">
                        <CandidateAvatar name={row.candidate?.name ?? 'Not selected'} imageUrl={row.candidate?.photoUrl} house={row.candidate?.house} size="sm" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-black text-vpps-navy">{row.post}</p>
                          <p className="truncate text-sm font-bold text-slate-700">{row.candidate?.name ?? 'Not selected'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </ScreenFitShell>
            </motion.div>
          ) : null}

          {step === 'thanks' ? (
            <motion.div key="thanks" {...pageMotion}>
              <ScreenFitShell
                mainClassName="grid place-items-center"
                footer={
                  <FooterBar>
                    <Button type="button" onClick={resetFlow} className="w-full sm:mx-auto sm:w-auto">
                      <ShieldCheck size={18} />
                      Back to Start
                    </Button>
                  </FooterBar>
                }
              >
                <Card className="w-full max-w-2xl p-6 text-center sm:p-8">
                  <div className="flex items-center justify-center gap-3">
                    <BrandLogo variant="icon" animated className="h-16 w-16 sm:h-20 sm:w-20" showFallbackText={false} />
                    <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 220, damping: 14 }} className="grid h-16 w-16 place-items-center rounded-full bg-vpps-success text-white sm:h-20 sm:w-20">
                      <CheckCircle2 size={42} />
                    </motion.div>
                  </div>
                  <h1 className="mt-6 text-2xl font-black sm:text-3xl">Thank you! Your vote has been recorded.</h1>
                  <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">You cannot vote again using this ID. Please call the next student or teacher.</p>
                </Card>
              </ScreenFitShell>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </main>
    </PageBackground>
  )
}
