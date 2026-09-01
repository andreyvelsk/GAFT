import type { Article, SortField, SortOrder } from '~/composables/useArticles'

/**
 * Shared list state for the home page and paginated pages (/page/[page]).
 * Search query and sort settings are kept in useState so they survive
 * navigation between '/' and '/page/N'.
 */
export async function useArticlesList(pageNumber: Ref<number>) {
  const router = useRouter()

  // Shared state — survives navigation between pages
  const searchQuery = useState<string>('articles-search', () => '')
  const sortField = useState<SortField>('articles-sort-field', () => 'date')
  const sortOrder = useState<SortOrder>('articles-sort-order', () => 'desc')

  // Local (per-page) state
  const articles = ref<Article[]>([])
  const totalPages = ref(1)
  const totalCount = ref(0)

  const { getArticles, filterArticles, sortArticles, paginateArticles, ARTICLES_PER_PAGE } = useArticles()
  const { setArticles, articles: storeArticles } = useArticlesStore()

  // Await is REQUIRED: without it SSR renders an empty list while the client
  // gets data from the payload, causing a hydration mismatch
  const { data: allArticles } = await useAsyncData('articles-list', () => getArticles())

  // Populate the global store so useLikes can update likes in-place
  if (allArticles.value) {
    setArticles(allArticles.value as Article[])
  }

  function applyFilterAndPaginate() {
    const raw = (storeArticles.value.length ? storeArticles.value : allArticles.value ?? []) as Article[]
    const sorted = sortArticles(raw, sortField.value, sortOrder.value)
    const filtered = filterArticles(sorted, searchQuery.value)
    totalCount.value = filtered.length
    totalPages.value = Math.max(1, Math.ceil(filtered.length / ARTICLES_PER_PAGE))
    articles.value = paginateArticles(filtered, pageNumber.value, ARTICLES_PER_PAGE)
  }

  function navigateToPage(page: number) {
    const path = page === 1 ? '/' : `/page/${page}`
    if (router.currentRoute.value.path !== path) {
      router.push(path)
    } else {
      applyFilterAndPaginate()
    }
    if (import.meta.client) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // Search: reset to page 1 immediately when not on page 1,
  // otherwise debounce and re-apply in place
  let searchTimeout: ReturnType<typeof setTimeout>
  watch(searchQuery, () => {
    if (pageNumber.value !== 1) {
      navigateToPage(1)
      return
    }
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(applyFilterAndPaginate, 300)
  })

  // Sort changes always reset to page 1
  watch([sortField, sortOrder], () => {
    navigateToPage(1)
  })

  // React to page changes (pagination navigation)
  watch(pageNumber, () => {
    applyFilterAndPaginate()
  })

  // Apply on initial render
  applyFilterAndPaginate()

  return {
    searchQuery,
    sortField,
    sortOrder,
    articles,
    totalPages,
    totalCount,
    navigateToPage,
  }
}
