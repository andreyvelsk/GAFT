<template>
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Breadcrumb -->
    <nav class="mb-6 text-sm text-gray-500">
      <NuxtLink to="/" class="hover:text-blue-400 transition-colors">Home</NuxtLink>
      <span class="mx-2">/</span>
      <span class="text-gray-400">Page {{ pageNumber }}</span>
    </nav>

    <!-- Page title -->
    <h1 class="text-2xl font-bold text-white mb-8">
      Page {{ pageNumber }}
    </h1>

    <!-- Search -->
    <div class="mb-6">
      <SearchBar v-model="searchQuery" />
    </div>

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

      <div v-else class="text-center py-16">
        <div class="text-5xl mb-4 text-gray-600">[ ]</div>
        <h3 class="text-xl font-semibold text-gray-300 mb-2">No apps here</h3>
        <p class="text-gray-500">This page has no entries yet</p>
      </div>
    </section>

    <!-- Pagination -->
    <section class="mt-10 mb-8">
      <PaginationNav
        :current-page="pageNumber"
        :total-pages="totalPages"
        @change-page="navigateToPage"
      />
    </section>
  </div>
</template>

<script setup lang="ts">
import type { Article } from '~/composables/useArticles'

const route = useRoute()
const router = useRouter()

const pageNumber = computed(() => {
  return parseInt(route.params.page as string) || 1
})

const searchQuery = ref('')
const articles = ref<Article[]>([])
const totalPages = ref(1)

const { getArticles, filterArticles, paginateArticles, ARTICLES_PER_PAGE } = useArticles()

// Load articles for this page
async function loadArticles() {
  const allArticles = await getArticles({
    sortField: 'date',
    sortOrder: 'desc'
  })
  const filtered = filterArticles(allArticles, searchQuery.value)
  totalPages.value = Math.ceil(filtered.length / ARTICLES_PER_PAGE)
  articles.value = paginateArticles(filtered, pageNumber.value, ARTICLES_PER_PAGE)
}

// Debounced search
let searchTimeout: ReturnType<typeof setTimeout>
watch(searchQuery, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    loadArticles()
  }, 300)
})

function navigateToPage(page: number) {
  const path = page === 1 ? '/' : `/page/${page}`
  router.push(path)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Initial load
onMounted(() => {
  loadArticles()
})

// SEO
useHead({
  title: `Page ${pageNumber.value} | Dual Screen Games for AYN Thor`,
  meta: [
    {
      name: 'description',
      content: `Dual Screen Games for AYN Thor — page ${pageNumber.value}. Companion app pairings, dual-screen Android ports, and game setups for the AYN Thor handheld.`
    },
    { property: 'og:title', content: `Page ${pageNumber.value} | Dual Screen Games for AYN Thor` },
    {
      property: 'og:description',
      content: `Dual Screen Games for AYN Thor — page ${pageNumber.value}. Companion app pairings, dual-screen Android ports, and game setups for the AYN Thor handheld.`
    }
  ]
})
</script>