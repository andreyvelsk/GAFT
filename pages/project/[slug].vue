<template>
  <article v-if="article" class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Back link -->
    <NuxtLink
      to="/"
      class="inline-flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors mb-8 group"
    >
      <svg class="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
      Back
    </NuxtLink>

    <!-- Article Header -->
    <header class="mb-8">
      <!-- Category & Date -->
      <div class="flex items-center gap-3 mb-4">
        <span class="text-sm text-gray-500">{{ formatDate(article.date) }}</span>
      </div>

      <!-- Title -->
      <h1 class="text-3xl md:text-4xl font-extrabold text-white mb-4">
        {{ article.title }}
      </h1>

      <!-- Description -->
      <p class="text-lg text-gray-400 leading-relaxed">
        {{ article.description }}
      </p>
    </header>

    <!-- Media Carousel -->
    <div v-if="article.media?.length" class="mb-10">
      <MediaCarousel :media="article.media" />
    </div>

    <!-- Article Content (Markdown rendered) -->
    <div class="prose mx-auto">
      <ContentRenderer :value="article">
        <template #empty>
          <div class="text-center py-12 text-gray-500">
            <p>Article content not found</p>
          </div>
        </template>
      </ContentRenderer>
    </div>

    <!-- Tags -->
    <div v-if="article.tags?.length" class="mt-10 pt-6 border-t border-gray-800">
      <div class="flex flex-wrap gap-2">
        <span
          v-for="tag in article.tags"
          :key="tag"
          class="px-3 py-1 text-xs font-medium rounded-full bg-surface-200 border border-gray-700 text-gray-400"
        >
          #{{ tag }}
        </span>
      </div>
    </div>
  </article>
  <div v-else class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
    <p class="text-gray-500">Article not found</p>
  </div>
</template>

<script setup lang="ts">
import type { Article } from '~/composables/useArticles'

const route = useRoute()
const slug = route.params.slug as string

const { getArticle } = useArticles()
const article = ref<Article | null>(null)
const likeCount = ref(0)
const isLiking = ref(false)

// Load article
const { data } = await useAsyncData(`article-${slug}`, () => getArticle(slug))
article.value = data.value as unknown as Article

// Like handler (local only, Firebase later)
function handleLike() {
  isLiking.value = true
  likeCount.value++
  setTimeout(() => {
    isLiking.value = false
  }, 500)
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// SEO
useHead({
  title: article.value?.title || 'Article',
  meta: [
    {
      name: 'description',
      content: article.value?.description || ''
    },
    { property: 'og:title', content: article.value?.title || '' },
    { property: 'og:description', content: article.value?.description || '' },
    {
      property: 'og:image',
      content: article.value?.media?.[0]?.url || ''
    },
    { property: 'og:type', content: 'article' },
    { property: 'article:published_time', content: article.value?.date || '' },
    { property: 'article:section', content: article.value?.category || '' }
  ]
})
</script>