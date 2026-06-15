import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { getAnalytics, type Analytics } from 'firebase/analytics'

// Firebase configuration — values are injected via Nuxt runtime config
// See: https://nuxt.com/docs/guide/recipes/runtime-config
// and: https://firebase.google.com/docs/web/setup

let app: FirebaseApp | null = null
let db: Firestore | null = null
let analytics: Analytics | null = null

export function useFirebase(): { app: FirebaseApp; db: Firestore } {
  if (app && db) {
    return { app, db }
  }

  const config = useRuntimeConfig()

  const firebaseConfig = {
    apiKey: config.public.firebaseApiKey as string,
    authDomain: config.public.firebaseAuthDomain as string,
    projectId: config.public.firebaseProjectId as string,
    storageBucket: config.public.firebaseStorageBucket as string,
    messagingSenderId: config.public.firebaseMessagingSenderId as string,
    appId: config.public.firebaseAppId as string
  }

  app = initializeApp(firebaseConfig)
  db = getFirestore(app)

  return { app, db }
}

/**
 * Initialize Firebase Analytics (client-side only).
 * Returns null if called on the server or if measurementId is not configured.
 *
 * IMPORTANT: `useFirebase()` must be called first to initialize the app.
 */
export function useFirebaseAnalytics(): Analytics | null {
  // Analytics only works in the browser
  if (import.meta.server) {
    return null
  }

  if (analytics) {
    return analytics
  }

  const config = useRuntimeConfig()
  const measurementId = config.public.firebaseMeasurementId as string

  if (!measurementId) {
    console.warn('[Firebase Analytics] measurementId is not configured. Analytics disabled.')
    return null
  }

  // Ensure Firebase app is initialized
  if (!app) {
    useFirebase()
  }

  // getAnalytics expects @firebase/app's FirebaseApp type;
  // the module-level `app` is compatible at runtime despite the TS mismatch.
  analytics = getAnalytics(app as unknown as import('@firebase/app').FirebaseApp)

  return analytics
}
