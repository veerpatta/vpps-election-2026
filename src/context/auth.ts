import { createContext, useContext } from 'react'
import type { User } from 'firebase/auth'

export interface AuthContextValue {
  user: User | null
  loading: boolean
  isAllowedAdmin: boolean
  loginWithGoogle: () => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider.')
  }
  return context
}
