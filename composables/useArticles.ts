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

export const useArticles = () => {
  const ARTICLES_PER_PAGE = 100

  /**
   * Fetch all articles with sorting and search support
   */
  const getArticles = (options: FetchArticlesOptions = {}) => {
    const {
      sortField = 'date',
      sortOrder = 'desc',
    } = options

    // Build query for @nuxt/content — exclude standalone pages (e.g. how-to guide)
    const query = queryContent<Article>('/').where({ category: { $ne: 'guide' } })

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
      (article.tags && article.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)))
    )
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
  const getArticle = (slug: string) => {
    return queryContent<Article>('/')
      .where({ slug: { $contains: slug } })
      .findOne()
  }

  /**
   * Get total article count
   */
  const getArticlesCount = () => {
    return queryContent<Article>('/').count()
  }

  return {
    getArticles,
    getArticle,
    getArticlesCount,
    filterArticles,
    sortArticles,
    paginateArticles,
    ARTICLES_PER_PAGE
  }
}