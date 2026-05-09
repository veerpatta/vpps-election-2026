import { useCallback, useEffect, useMemo, useState, type PropsWithChildren } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth'
import { auth } from '../lib/firebase'
import { AuthContext } from './auth'

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(Boolean(auth))

  useEffect(() => {
    if (!auth) {
      return undefined
    }

    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser)
      setLoading(false)
    })
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    if (!auth) {
      throw new Error('Firebase Auth is not configured.')
    }
    await signInWithEmailAndPassword(auth, email.trim(), password)
  }, [])

  const logout = useCallback(async () => {
    if (!auth) {
      setUser(null)
      return
    }
    await signOut(auth)
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      logout,
    }),
    [loading, login, logout, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
