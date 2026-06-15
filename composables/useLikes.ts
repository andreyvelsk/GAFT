import {
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
  increment,
  serverTimestamp,
  setDoc,
  type Firestore
} from 'firebase/firestore'
import { useFirebase } from '~/lib/firebase'

/**
 * Composable for handling likes.
 *
 * Logic:
 *  - Like count is stored in the Firestore `likes` collection, document ID = article slug.
 *  - To prevent a user from liking more than once,
 *    we use localStorage: the slug is saved to the `liked_articles` array
 *    when the user clicks the button.
 *  - Real-time subscription via onSnapshot — the UI updates instantly.
 *
 * @param articleSlug — article slug (unique identifier)
 */
export function useLikes(articleSlug: string) {
  const firestoreLikes = ref<number>(0)
  const hasLiked = ref<boolean>(false)
  const isLoading = ref<boolean>(true)
  const isSubmitting = ref<boolean>(false)

  let unsubscribe: (() => void) | null = null
  const STORAGE_KEY = 'liked_articles'
  const { updateLikes } = useArticlesStore()

  // ─── localStorage helpers ────────────────────────────────────────────

  function getLikedSlugs(): string[] {
    if (import.meta.server) return []
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  }

  function markLiked(slug: string) {
    if (import.meta.server) return
    try {
      const slugs = getLikedSlugs()
      if (!slugs.includes(slug)) {
        slugs.push(slug)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs))
      }
    } catch {
      // localStorage may be unavailable — ignore
    }
  }

  // ─── Firestore helpers ──────────────────────────────────────────────

  /**
   * Ensure the `likes/<slug>` document exists.
   * If it doesn't — create with count = 0.
   */
  async function ensureDocExists(db: Firestore, slug: string) {
    const ref = doc(db, 'likes', slug)
    const snap = await getDoc(ref)
    if (!snap.exists()) {
      await setDoc(ref, {
        count: 0,
        updatedAt: serverTimestamp()
      })
    }
  }

  /**
   * Subscribe to real-time updates for the likes document.
   */
  function subscribeToLikes(db: Firestore, slug: string) {
    const ref = doc(db, 'likes', slug)
    unsubscribe = onSnapshot(ref, (snapshot: any) => {
      if (snapshot.exists()) {
        firestoreLikes.value = (snapshot.data().count as number) ?? 0
      } else {
        firestoreLikes.value = 0
      }
      isLoading.value = false
      // Push into global store so sorting by likes works in real-time
      updateLikes(slug, firestoreLikes.value)
    })
  }

  /**
   * Increment the like count by 1 (atomic operation).
   */
  async function incrementLike(db: Firestore, slug: string) {
    const ref = doc(db, 'likes', slug)
    await updateDoc(ref, {
      count: increment(1),
      updatedAt: serverTimestamp()
    })
  }

  // ─── Public API ─────────────────────────────────────────────────────

  /**
   * Initialize the subscription and check whether the user has already liked the article.
   * Should be called in onMounted (client-side only).
   */
  async function initLikes() {
    if (import.meta.server) return

    try {
      const { db } = useFirebase()

      // Check localStorage
      hasLiked.value = getLikedSlugs().includes(articleSlug)

      // Ensure the document exists
      await ensureDocExists(db, articleSlug)

      // Subscribe to updates
      subscribeToLikes(db, articleSlug)
    } catch (error) {
      console.error('[useLikes] Failed to init:', error)
      isLoading.value = false
    }
  }

  /**
   * Like the article. Does nothing if already liked.
   */
  async function like() {
    if (hasLiked.value || isSubmitting.value || import.meta.server) return

    isSubmitting.value = true
    try {
      const { db } = useFirebase()
      await incrementLike(db, articleSlug)
      markLiked(articleSlug)
      hasLiked.value = true
    } catch (error) {
      console.error('[useLikes] Failed to like:', error)
    } finally {
      isSubmitting.value = false
    }
  }

  /**
   * Unsubscribe from the snapshot listener (call in onUnmounted).
   */
  function destroyLikes() {
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }
  }

  return {
    firestoreLikes: readonly(firestoreLikes),
    hasLiked: readonly(hasLiked),
    isLoading: readonly(isLoading),
    isSubmitting: readonly(isSubmitting),
    initLikes,
    like,
    destroyLikes
  }
}
