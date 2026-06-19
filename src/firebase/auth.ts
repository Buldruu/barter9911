import {
  GoogleAuthProvider,
  FacebookAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { requireAuth, requireDb } from './config'
import type { AppUser, Role } from '../types'

export interface RegisterInput {
  name: string
  email: string
  password: string
  phone?: string
  facebookUrl?: string
}

// Create (or refresh) the Firestore profile document for an authenticated user.
async function ensureUserDoc(
  user: FirebaseUser,
  extra: Partial<AppUser> = {}
): Promise<void> {
  const db = requireDb()
  const ref = doc(db, 'users', user.uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    const role: Role = 'user'
    await setDoc(ref, {
      name: extra.name ?? user.displayName ?? 'Member',
      email: user.email ?? extra.email ?? '',
      phone: extra.phone ?? '',
      facebookUrl: extra.facebookUrl ?? '',
      role,
      createdAt: serverTimestamp(),
    })
  }
}

export async function registerWithEmail(input: RegisterInput): Promise<void> {
  const auth = requireAuth()
  const cred = await createUserWithEmailAndPassword(
    auth,
    input.email.trim(),
    input.password
  )
  await updateProfile(cred.user, { displayName: input.name })
  await ensureUserDoc(cred.user, {
    name: input.name,
    email: input.email.trim(),
    phone: input.phone,
    facebookUrl: input.facebookUrl,
  })
}

export async function loginWithEmail(
  email: string,
  password: string
): Promise<void> {
  const auth = requireAuth()
  await signInWithEmailAndPassword(auth, email.trim(), password)
}

export async function loginWithGoogle(): Promise<void> {
  const auth = requireAuth()
  const provider = new GoogleAuthProvider()
  const cred = await signInWithPopup(auth, provider)
  await ensureUserDoc(cred.user)
}

export async function loginWithFacebook(): Promise<void> {
  const auth = requireAuth()
  const provider = new FacebookAuthProvider()
  const cred = await signInWithPopup(auth, provider)
  await ensureUserDoc(cred.user)
}

export async function logout(): Promise<void> {
  const auth = requireAuth()
  await signOut(auth)
}

// Friendly, localized-ish messages for common Firebase auth error codes.
export function authErrorMessage(err: unknown): string {
  const code =
    typeof err === 'object' && err !== null && 'code' in err
      ? String((err as { code: unknown }).code)
      : ''
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Incorrect email or password.'
    case 'auth/email-already-in-use':
      return 'This email is already registered.'
    case 'auth/invalid-email':
      return 'That email address looks invalid.'
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.'
    case 'auth/popup-closed-by-user':
      return 'Sign-in window was closed before completing.'
    case 'auth/operation-not-allowed':
      return 'This sign-in method is not enabled in Firebase.'
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection.'
    default:
      return err instanceof Error ? err.message : 'Something went wrong. Try again.'
  }
}
