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

export function useArticlesStore() {
  /**
   * Replace the full article list (e.g. after fetching from @nuxt/content).
   */
  function setArticles(list: Article[]) {
    articles.value = list.map((a) => ({ ...a, likes: a.likes ?? 0 }))
  }

  /**
   * Update the like count for a single article by slug.
   * Called from `useLikes` whenever the Firestore snapshot fires.
   */
  function updateLikes(slug: string, count: number) {
    const idx = articles.value.findIndex((a) => a.slug === slug)
    if (idx !== -1 && articles.value[idx].likes !== count) {
      const updated = [...articles.value]
      updated[idx] = { ...updated[idx], likes: count }
      articles.value = updated
    }
  }

  return {
    /** Readonly reactive list of articles */
    articles: readonly(articles),
    setArticles,
    updateLikes,
  }
}
