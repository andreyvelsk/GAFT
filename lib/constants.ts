/**
 * Shared constants used by both the Nuxt app (composables, pages) and the
 * build-time scripts (e.g. `scripts/generate-routes.js`), so the pagination
 * size can never drift between the UI and the prerender route generator.
 */

/**
 * Number of articles shown per page in the listing and on category pages.
 *
 * Imported by `composables/useArticles.ts` (client-side pagination) and by
 * `scripts/generate-routes.js` (to emit the right number of paginated routes).
 */
export const ARTICLES_PER_PAGE = 18;
