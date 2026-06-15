<template>
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Hero Section -->
    <section class="mb-10">
      <div class="text-center mb-8">
        <h1 class="text-4xl md:text-5xl font-extrabold mb-4">
          <span class="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Dual Screen Games for AYN Thor
          </span>
        </h1>
        <p class="text-lg text-gray-400 max-w-2xl mx-auto">
          A curated collection of games and apps that truly shine on the AYN Thor's dual screens.
          From companion app pairings to native dual-screen Android ports
        </p>
      </div>
    </section>

    <!-- Controls Section -->
    <section class="mb-8 space-y-4">
      <!-- Search -->
      <SearchBar v-model="searchQuery" />

      <!-- Sort & Filter row -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <SortControls
          v-model="sortField"
          v-model:order="sortOrder"
        />
        <div class="text-sm text-gray-500">
          Apps found:
          <span class="text-gray-300 font-semibold">{{ articles.length }}</span>
        </div>
      </div>
    </section>

    <!-- Articles Grid -->
    <section>
      <div
        v-if="articles.length"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <ArticleCard
          v-for="article in articles"
          :key="article.slug"
          :article="article"
        />
      </div>

      <!-- Empty State -->
      <div
        v-else
        class="text-center py-16"
      >
        <div class="text-5xl mb-4 text-gray-600">[ ? ]</div>
        <h3 class="text-xl font-semibold text-gray-300 mb-2">Nothing found</h3>
        <p class="text-gray-500">
          Try changing your search query or resetting filters
        </p>
      </div>
    </section>

    <!-- Pagination -->
    <section class="mt-10 mb-8">
      <PaginationNav
        :current-page="currentPage"
        :total-pages="totalPages"
        @change-page="navigateToPage"
      />
    </section>
  </div>
</template>

<script setup lang="ts">
import type { Article, ArticleMedia, SortField, SortOrder } from '~/composables/useArticles'

const route = useRoute()
const router = useRouter()

// State
const searchQuery = ref('')
const sortField = ref<SortField>('date')
const sortOrder = ref<SortOrder>('desc')
const currentPage = ref(1)
const articles = ref<Article[]>([])
const totalPages = ref(1)

const { getArticles, filterArticles, paginateArticles, ARTICLES_PER_PAGE } = useArticles()

// Debounced search
let searchTimeout: ReturnType<typeof setTimeout>
watch(searchQuery, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    loadArticles()
  }, 300)
})

// Watchers for sort changes
watch([sortField, sortOrder], () => {
  currentPage.value = 1
  loadArticles()
})

// Load articles
async function loadArticles() {
  const allArticles = await getArticles({
    sortField: sortField.value,
    sortOrder: sortOrder.value
  })
  const filtered = filterArticles(allArticles, searchQuery.value)
  totalPages.value = Math.ceil(filtered.length / ARTICLES_PER_PAGE)
  articles.value = paginateArticles(filtered, currentPage.value, ARTICLES_PER_PAGE)
}

// Navigate to page
function navigateToPage(page: number) {
  currentPage.value = page
  loadArticles()

  // Update URL
  const path = page === 1 ? '/' : `/page/${page}`
  router.push(path)

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Initial load
onMounted(() => {
  loadArticles()
})

// SEO
useHead({
  title: 'Dual Screen Games for AYN Thor — Companion App Pairings & Android Ports',
  meta: [
    {
      name: 'description',
      content: 'Discover games and apps that make the most of the AYN Thor dual-screen design. Companion app pairings, native Android dual-screen ports, and more.'
    },
    { property: 'og:title', content: 'Dual Screen Games for AYN Thor — Companion App Pairings & Android Ports' },
    {
      property: 'og:description',
      content: 'Discover games and apps that make the most of the AYN Thor dual-screen design. Companion app pairings, native Android dual-screen ports, and more.'
    },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: 'Dual Screen Games for AYN Thor' }
  ]
})
</script>