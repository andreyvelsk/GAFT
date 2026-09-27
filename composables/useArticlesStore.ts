import type { Article } from '~/composables/useArticles'

/**
 * Global reactive store for articles.
 *
 * Each article carries a `likes` count that is kept in sync by `useLikes`
 * via Firestore onSnapshot. Sort, filter and pagination all read from this
 * single source of truth so the UI re-renders automatically when like
 * counts change.
 */

// Internal reactive state
const articles = ref<Article[]>([])

export interface UseArticlesStoreReturn {
  articles: ComputedRef<Article[]>
  setArticles: (list: Article[]) => void
  updateLikes: (slug: string, count: number) => void
}

export function useArticlesStore(): UseArticlesStoreReturn {
  /**
   * Replace the full article list (e.g. after fetching from @nuxt/content).
   */
  function setArticles(list: Article[]): void {
    articles.value = list.map((a) => ({ ...a, likes: a.likes ?? 0 }))
  }

  /**
   * Update the like count for a single article by slug.
   * Called from `useLikes` whenever the Firestore snapshot fires.
   */
  function updateLikes(slug: string, count: number): void {
    const idx = articles.value.findIndex((a) => a.slug === slug)
    const current = articles.value[idx]
    if (idx === -1 || current === undefined || current.likes === count) return
    const updated = [...articles.value]
    updated[idx] = { ...current, likes: count }
    articles.value = updated
  }

  return {
    /** Readonly reactive list of articles */
    articles: computed(() => articles.value),
    setArticles,
    updateLikes,
  }
}
