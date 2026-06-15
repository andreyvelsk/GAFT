import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getFirestore, type Firestore } from 'firebase/firestore'

// Firebase configuration — values are injected via Nuxt runtime config
// See: https://nuxt.com/docs/guide/recipes/runtime-config
// and: https://firebase.google.com/docs/web/setup

let app: FirebaseApp | null = null
let db: Firestore | null = null

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
