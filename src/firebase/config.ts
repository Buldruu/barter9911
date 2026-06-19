import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { getStorage, type FirebaseStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

/**
 * True only when the essential keys are present. The whole app is built to
 * degrade gracefully (clear "connect Firebase" states) when this is false, so
 * the site never crashes to a white screen before keys are added.
 */
export const isFirebaseConfigured: boolean = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.appId &&
    firebaseConfig.authDomain
)

let app: FirebaseApp | undefined
let authInstance: Auth | undefined
let dbInstance: Firestore | undefined
let storageInstance: FirebaseStorage | undefined

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig)
    authInstance = getAuth(app)
    dbInstance = getFirestore(app)
    storageInstance = getStorage(app)
  } catch (err) {
    // Never let a config problem take down the whole UI.
    console.error('Firebase initialization failed:', err)
  }
}

export const auth = authInstance
export const db = dbInstance
export const storage = storageInstance

export function requireAuth(): Auth {
  if (!auth) throw new Error('Firebase Auth is not configured. Add your keys to .env.')
  return auth
}

export function requireDb(): Firestore {
  if (!db) throw new Error('Firestore is not configured. Add your keys to .env.')
  return db
}

export function requireStorage(): FirebaseStorage {
  if (!storage)
    throw new Error('Firebase Storage is not configured. Add your keys to .env.')
  return storage
}
