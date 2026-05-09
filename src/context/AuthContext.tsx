import { useCallback, useEffect, useMemo, useState, type PropsWithChildren } from 'react'
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth'
import { auth } from '../lib/firebase'
import { AuthContext } from './auth'

const ALLOWED_ADMIN_EMAIL = 'raj@vpps.co.in'

function isApprovedAdmin(user: User | null) {
  return user?.email?.toLowerCase() === ALLOWED_ADMIN_EMAIL
}

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

  const loginWithGoogle = useCallback(async () => {
    if (!auth) {
      throw new Error('Firebase Auth is not configured.')
    }
    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({
      prompt: 'select_account',
    })
    await signInWithPopup(auth, provider)
  }, [])

  const logout = useCallback(async () => {
    if (!auth) {
      setUser(null)
      return
    }
    await signOut(auth)
  }, [])

  const isAllowedAdmin = isApprovedAdmin(user)

  const value = useMemo(
    () => ({
      user,
      loading,
      isAllowedAdmin,
      loginWithGoogle,
      logout,
    }),
    [isAllowedAdmin, loading, loginWithGoogle, logout, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
