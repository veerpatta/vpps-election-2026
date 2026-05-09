import { Navigate, useLocation } from 'react-router-dom'
import { Card, PageBackground } from '../ui/primitives'
import { useAuth } from '../../context/auth'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <PageBackground>
        <main className="grid min-h-screen place-items-center px-4">
          <Card className="text-center">
            <p className="text-sm font-bold text-slate-600">Opening Election Control Room...</p>
          </Card>
        </main>
      </PageBackground>
    )
  }

  if (!user) {
    return <Navigate to="/admin" replace state={{ from: location }} />
  }

  return children
}
