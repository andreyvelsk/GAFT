/* eslint-disable @typescript-eslint/no-explicit-any */

declare module 'firebase/app' {
  export interface FirebaseApp {
    name: string
    options: Record<string, any>
  }
  export function initializeApp(config: Record<string, string>): FirebaseApp
}

declare module 'firebase/firestore' {
  export interface Firestore {}

  export function getFirestore(app: any): Firestore
  export function doc(db: Firestore, collection: string, ...pathSegments: string[]): any
  export function getDoc(reference: any): Promise<any>
  export function setDoc(reference: any, data: any): Promise<void>
  export function updateDoc(reference: any, data: any): Promise<void>
  export function onSnapshot(reference: any, callback: (snapshot: any) => void): () => void
  export function increment(n: number): any
  export function serverTimestamp(): any
}
