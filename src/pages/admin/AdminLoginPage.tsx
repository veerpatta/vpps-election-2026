import { useEffect, useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import { BrandLogo } from '../../components/brand/BrandLogo'
import { Button, Card, PageBackground } from '../../components/ui/primitives'
import { useAuth } from '../../context/auth'
import { firebaseSetupMessage, isFirebaseReady } from '../../lib/firebase'

export function AdminLoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, loading, isAllowedAdmin, loginWithGoogle, logout } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const fromPath =
    (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ??
    '/admin/dashboard'

  useEffect(() => {
    if (!loading && user && isAllowedAdmin) {
      navigate(fromPath, { replace: true })
    }
  }, [fromPath, isAllowedAdmin, loading, navigate, user])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    if (!isFirebaseReady) {
      return
    }

    setIsSubmitting(true)

    try {
      await loginWithGoogle()
    } catch {
      setError('Login failed. Please try again with the approved school Google account.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <PageBackground>
      <main className="mx-auto grid min-h-screen w-full max-w-md place-items-center px-4 py-8">
        <form onSubmit={handleSubmit} className="w-full">
          <Card className="w-full p-6 sm:p-8">
            <div className="grid place-items-center text-center">
              <BrandLogo variant="full" animated className="h-36 w-full max-w-xs" />
              <h1 className="mt-6 text-3xl font-black">VPPS Election Control Room</h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Admin access for Student Council Election 2026
              </p>
            </div>
            <div className="mt-8 grid gap-4">
              {!isFirebaseReady ? (
                <div className="rounded-2xl bg-vpps-warning/10 px-4 py-3 text-sm font-bold leading-6 text-orange-700">
                  {firebaseSetupMessage}
                </div>
              ) : null}
              {user && !isAllowedAdmin ? (
                <div className="rounded-2xl bg-vpps-danger/10 px-4 py-3 text-sm font-bold leading-6 text-red-700">
                  This Google account is not allowed for election admin access. Please use the approved school admin account.
                </div>
              ) : null}
              {!user && error ? (
                <p className="rounded-2xl bg-vpps-danger/10 px-4 py-3 text-sm font-bold text-red-700">
                  {error}
                </p>
              ) : null}
              <Button type="submit" disabled={isSubmitting || loading || !isFirebaseReady} className="mt-2 w-full">
                <LogIn size={18} />
                {isSubmitting ? 'Opening Google...' : 'Continue with Google'}
              </Button>
              {user && !isAllowedAdmin ? (
                <Button type="button" variant="secondary" onClick={logout} className="w-full">
                  Logout
                </Button>
              ) : null}
              <p className="text-center text-xs font-semibold text-slate-500">
                Use the approved school admin Google account.
              </p>
            </div>
          </Card>
        </form>
      </main>
    </PageBackground>
  )
}
