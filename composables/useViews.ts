import {
  doc,
  increment,
  serverTimestamp,
  setDoc,
  type Firestore
} from 'firebase/firestore'
import { useFirebase } from '~/lib/firebase'

/** Public API returned by {@link useViews}. */
export interface UseViewsReturn {
  /**
   * Register a view. Pass an explicit slug when the component is reused across
   * route changes (the bound slug would otherwise be stale).
   */
  registerView: (slugOverride?: string) => Promise<void>
}

const STORAGE_KEY = 'viewed_articles'

/**
 * Module-level guard: prevents double counting within the same session
 * (SPA navigation, HMR, multiple calls) even before localStorage is written.
 */
const registeredThisSession = new Set<string>()

// ─── localStorage helpers ──────────────────────────────────────────────

/**
 * Check whether localStorage is actually usable.
 * In private mode / with storage disabled `setItem` throws — in that case we
 * deliberately skip counting to avoid inflating the counter on every visit.
 */
function isStorageAvailable(): boolean {
  if (import.meta.server === true) return false
  try {
    const probe = '__views_probe__'
    localStorage.setItem(probe, '1')
    localStorage.removeItem(probe)
    return true
  } catch {
    return false
  }
}

/**
 * Read the list of already-viewed slugs.
 * Returns `null` when storage is unavailable (caller must not count).
 */
function getViewedSlugs(): string[] | null {
  if (import.meta.server === true) return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === null) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((item): item is string => typeof item === 'string')
  } catch {
    return null
  }
}

/**
 * Persist the slug as viewed. Returns `true` on success.
 */
function markViewed(slug: string): boolean {
  if (import.meta.server === true) return false
  try {
    const slugs = getViewedSlugs()
    if (slugs === null) return false
    if (!slugs.includes(slug)) {
      slugs.push(slug)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs))
    }
    return true
  } catch {
    return false
  }
}

// ─── Firestore helpers ─────────────────────────────────────────────────

/**
 * Atomically increment the view count for a slug.
 *
 * Uses `setDoc(..., { merge: true })` so the document is created on the first
 * view and incremented afterwards — a single write and zero reads.
 */
async function incrementView(db: Firestore, slug: string): Promise<void> {
  const ref = doc(db, 'views', slug)
  await setDoc(
    ref,
    {
      count: increment(1),
      updatedAt: serverTimestamp()
    },
    { merge: true }
  )
}

// ─── Public API ────────────────────────────────────────────────────────

/**
 * Composable for counting unique page views.
 *
 * Logic:
 *  - View count is stored in the Firestore `views` collection, document ID = slug.
 *  - Uniqueness is per browser, forever: the slug is saved to the
 *    `viewed_articles` array in localStorage after the first counted view.
 *  - No real-time subscription and no reads — only a single atomic write per
 *    unique browser, which keeps the free Spark quota usage minimal.
 *
 * @param articleSlug — article slug (unique identifier)
 */
export function useViews(articleSlug: string): UseViewsReturn {
  /**
   * Register a view for the article. Does nothing if the browser has already
   * been counted or if storage is unavailable.
   */
  async function registerView(slugOverride?: string): Promise<void> {
    const target = slugOverride ?? articleSlug

    if (import.meta.server === true) return
    if (target === '') return

    // Already handled in this session (SPA navigation / HMR / repeated calls)
    if (registeredThisSession.has(target)) return

    // Storage unavailable — skip counting to avoid inflating the counter
    if (!isStorageAvailable()) return

    const viewed = getViewedSlugs()
    if (viewed === null) return

    // Already counted for this browser — remember for the session and stop
    if (viewed.includes(target)) {
      registeredThisSession.add(target)
      return
    }

    // Optimistically mark for the session to avoid concurrent double writes
    registeredThisSession.add(target)

    try {
      const { db } = useFirebase()
      await incrementView(db, target)
      markViewed(target)
    } catch (error) {
      // Quota exceeded / offline — never break the page.
      console.error('[useViews] Failed to register view:', error)
      // Allow a retry on the next mount if the write failed
      registeredThisSession.delete(target)
    }
  }

  return { registerView }
}
