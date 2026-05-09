import { useEffect, useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { LockKeyhole, Mail } from 'lucide-react'
import { BrandLogo } from '../../components/brand/BrandLogo'
import { Button, Card, Field, PageBackground, TextInput } from '../../components/ui/primitives'
import { useAuth } from '../../context/auth'

export function AdminLoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, loading, login } = useAuth()
  const [email, setEmail] = useState('raj@vpps.co.in')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const fromPath =
    (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ??
    '/admin/dashboard'

  useEffect(() => {
    if (!loading && user) {
      navigate(fromPath, { replace: true })
    }
  }, [fromPath, loading, navigate, user])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await login(email, password)
      navigate(fromPath, { replace: true })
    } catch {
      setError('Login failed. Please check email and password.')
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
            <h1 className="mt-6 text-3xl font-black">Staff Login</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">Enter the election control room.</p>
          </div>
          <div className="mt-8 grid gap-4">
            <Field label="Email">
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 text-slate-400" size={20} />
                <TextInput
                  className="w-full pl-12"
                  type="email"
                  placeholder="raj@vpps.co.in"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
            </Field>
            <Field label="Password">
              <div className="relative">
                <LockKeyhole className="absolute left-4 top-3.5 text-slate-400" size={20} />
                <TextInput
                  className="w-full pl-12"
                  type="password"
                  placeholder="Enter password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>
            </Field>
            {error ? (
              <p className="rounded-2xl bg-vpps-danger/10 px-4 py-3 text-sm font-bold text-red-700">
                {error}
              </p>
            ) : null}
            <Button type="submit" disabled={isSubmitting || loading} className="mt-2 w-full">
              {isSubmitting ? 'Checking...' : 'Login to Election Control Room'}
            </Button>
          </div>
          </Card>
        </form>
      </main>
    </PageBackground>
  )
}
