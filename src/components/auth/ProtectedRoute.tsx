import { Navigate, useLocation } from 'react-router-dom'
import { BrandLogo } from '../brand/BrandLogo'
import { Button, Card, PageBackground } from '../ui/primitives'
import { useAuth } from '../../context/auth'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, isAllowedAdmin, logout } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <PageBackground>
        <main className="grid min-h-screen place-items-center px-4">
          <Card className="grid place-items-center text-center">
            <BrandLogo variant="icon" animated className="h-20 w-20" showFallbackText={false} />
            <p className="mt-4 text-sm font-bold text-slate-600">Opening Election Control Room...</p>
          </Card>
        </main>
      </PageBackground>
    )
  }

  if (!user) {
    return <Navigate to="/admin" replace state={{ from: location }} />
  }

  if (!isAllowedAdmin) {
    return (
      <PageBackground>
        <main className="mx-auto grid min-h-screen w-full max-w-lg place-items-center px-4 py-8">
          <Card className="text-center">
            <BrandLogo variant="icon" className="mx-auto h-20 w-20" showFallbackText={false} />
            <h1 className="mt-5 text-2xl font-black">Access denied</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              This Google account is not allowed for election admin access. Please use the approved school admin account.
            </p>
            <Button type="button" onClick={logout} className="mt-6 w-full">
              Logout
            </Button>
          </Card>
        </main>
      </PageBackground>
    )
  }

  return children
}
