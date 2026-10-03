import { SYSTEM_CATEGORIES } from '~/lib/categories'
import { ARTICLES_PER_PAGE } from '~/lib/constants'

export interface ArticleMedia {
  type: 'image' | 'video'
  url: string
}

export interface Article {
  id: string
  title: string
  description: string
  date: string
  slug: string
  category: string
  media: ArticleMedia[]
  tags?: string[]
  status?: string
  // Marks content generated automatically from a source (e.g. "ai")
  generated?: string
  // Rendered article body
  body?: string
  // Like count — kept in sync by useLikes via useArticlesStore
  likes?: number
}

export type SortField = 'date' | 'title' | 'likes'
export type SortOrder = 'asc' | 'desc'

interface FetchArticlesOptions {
  sortField?: SortField
  sortOrder?: SortOrder
  searchQuery?: string
  page?: number
  pageSize?: number
}

export interface UseArticlesReturn {
  getArticles: (options?: FetchArticlesOptions) => Promise<Article[]>
  getArticle: (slug: string) => Promise<Article | null>
  getArticlesCount: () => Promise<number>
  filterArticles: (articles: Article[], searchQuery: string) => Article[]
  filterByCategory: (articles: Article[], category: string | null) => Article[]
  sortArticles: (list: Article[], sortField: SortField, sortOrder: SortOrder) => Article[]
  paginateArticles: (articles: Article[], page: number, pageSize: number) => Article[]
  ARTICLES_PER_PAGE: number
}

export const useArticles = (): UseArticlesReturn => {
  /**
   * Fetch all articles with sorting and search support
   */
  const getArticles = (options: FetchArticlesOptions = {}): Promise<Article[]> => {
    const {
      sortField = 'date',
      sortOrder = 'desc',
    } = options

    // Build query for @nuxt/content — exclude system pages (e.g. how-to guide).
    // @nuxt/content v2 has no `$nin`, so negate `$in` instead.
    const query = queryContent<Article>('/').where({
      category: { $not: { $in: [...SYSTEM_CATEGORIES] } },
    })

    // Sorting
    switch (sortField) {
      case 'date':
        query.sort({ date: sortOrder === 'asc' ? 1 : -1 })
        break
      case 'title':
        query.sort({ title: sortOrder === 'asc' ? 1 : -1 })
        break
      case 'likes':
        // Likes sorting will work after Firebase integration
        // Fallback to date sorting for now
        query.sort({ date: -1 })
        break
      default:
        query.sort({ date: -1 })
    }

    // Always fetch all articles — client-side filtering and pagination
    // are handled by the caller for case-insensitive search support
    return query.find()
  }

  /**
   * Filter articles by a case-insensitive search query
   */
  const filterArticles = (articles: Article[], searchQuery: string): Article[] => {
    if (!searchQuery) return articles
    const lowerQuery = searchQuery.toLowerCase()
    return articles.filter((article) =>
      article.title.toLowerCase().includes(lowerQuery) ||
      article.description.toLowerCase().includes(lowerQuery) ||
      (article.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery)) ?? false)
    )
  }

  /**
   * Filter articles by category. `null` (or an empty string) returns the list
   * unchanged, which represents the "All" state of the category filter.
   */
  const filterByCategory = (articles: Article[], category: string | null): Article[] => {
    if (category === null || category === '') return articles
    return articles.filter((article) => article.category === category)
  }

  /**
   * Sort articles client-side.
   * Reads `likes` from each Article (kept in sync by useArticlesStore).
   */
  const sortArticles = (
    list: Article[],
    sortField: SortField,
    sortOrder: SortOrder,
  ): Article[] => {
    return [...list].sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
          break
        case 'title':
          comparison = a.title.localeCompare(b.title)
          break
        case 'likes':
          comparison = (a.likes ?? 0) - (b.likes ?? 0)
          break
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })
  }

  /**
   * Paginate an array of articles
   */
  const paginateArticles = (articles: Article[], page: number, pageSize: number): Article[] => {
    const offset = (page - 1) * pageSize
    return articles.slice(offset, offset + pageSize)
  }

  /**
   * Fetch a single article by slug
   */
  const getArticle = (slug: string): Promise<Article | null> => {
    return queryContent<Article>('/')
      .where({ slug: { $contains: slug } })
      .findOne()
  }

  /**
   * Get total article count
   */
  const getArticlesCount = (): Promise<number> => {
    return queryContent<Article>('/').count()
  }

  return {
    getArticles,
    getArticle,
    getArticlesCount,
    filterArticles,
    filterByCategory,
    sortArticles,
    paginateArticles,
    ARTICLES_PER_PAGE
  }
}