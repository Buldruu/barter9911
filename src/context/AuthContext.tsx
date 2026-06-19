import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth'
import { auth, isFirebaseConfigured } from '../firebase/config'
import { getUserProfile } from '../firebase/firestore'
import type { AppUser } from '../types'

interface AuthContextValue {
  firebaseUser: FirebaseUser | null
  profile: AppUser | null
  loading: boolean
  isAdmin: boolean
  configured: boolean
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function fallbackProfile(u: FirebaseUser): AppUser {
  return {
    id: u.uid,
    name: u.displayName ?? 'Member',
    email: u.email ?? '',
    phone: u.phoneNumber ?? '',
    facebookUrl: '',
    role: 'user',
    createdAt: Date.now(),
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [profile, setProfile] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = useCallback(async (u: FirebaseUser | null) => {
    if (!u) {
      setProfile(null)
      return
    }
    try {
      const p = await getUserProfile(u.uid)
      setProfile(p ?? fallbackProfile(u))
    } catch (err) {
      console.error('Failed to load profile:', err)
      setProfile(fallbackProfile(u))
    }
  }, [])

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setLoading(false)
      return
    }
    const unsub = onAuthStateChanged(auth, async (u) => {
      setFirebaseUser(u)
      await loadProfile(u)
      setLoading(false)
    })
    return () => unsub()
  }, [loadProfile])

  const refreshProfile = useCallback(async () => {
    await loadProfile(firebaseUser)
  }, [firebaseUser, loadProfile])

  const value: AuthContextValue = {
    firebaseUser,
    profile,
    loading,
    isAdmin: profile?.role === 'admin',
    configured: isFirebaseConfigured,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
