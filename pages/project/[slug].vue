<template>
  <article
    v-if="article"
    class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
  >
    <!-- Back link -->
    <NuxtLink
      to="/"
      class="inline-flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors mb-8 group"
    >
      <svg
        class="w-4 h-4 transition-transform group-hover:-translate-x-1"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M15 19l-7-7 7-7"
        />
      </svg>
      Back
    </NuxtLink>

    <!-- AI-generated content disclaimer -->
    <div
      v-if="article.generated === 'ai'"
      class="flex items-start gap-3 mb-8 p-4 rounded-lg bg-amber-500/10 border border-amber-500/30"
    >
      <svg
        class="w-5 h-5 flex-shrink-0 text-amber-400 mt-0.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
        />
      </svg>
      <p class="text-sm text-amber-200/90 leading-relaxed">
        <span class="font-semibold text-amber-300">AI-generated page.</span>
        This page was automatically generated from a source and may contain
        inaccuracies or outdated information. Please verify details with the
        original source.
      </p>
    </div>

    <!-- Article Header -->
    <header class="mb-8">
      <!-- Category & Date & Like -->
      <div class="flex items-center gap-3 mb-4">
        <span class="text-sm text-gray-500">{{ formatDate(article.date) }}</span>
        <span class="text-gray-700">·</span>
        <LikeButton
          :slug="article.slug"
          variant="inline"
        />
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
    <div
      v-if="article.media?.length"
      class="mb-10"
    >
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
    <div
      v-if="article.tags?.length"
      class="mt-10 pt-6 border-t border-gray-800"
    >
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
  <div
    v-else
    class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center"
  >
    <p class="text-gray-500">
      Article not found
    </p>
  </div>
</template>

<script setup lang="ts">
import type { Article } from '~/composables/useArticles'

const { resolveUrl } = useResolveUrl()

const route = useRoute()
const rawSlug = route.params.slug
const slug = (Array.isArray(rawSlug) ? rawSlug[0] : rawSlug) ?? ''

const { getArticle } = useArticles()
const article = ref<Article | null>(null)

// Load article
const { data } = await useAsyncData(`article-${slug}`, () => getArticle(slug))
article.value = data.value

// Count unique page views (client-side only, no UI output)
const { registerView } = useViews(slug)

onMounted(() => {
  void registerView()
})

// The component is reused when navigating between projects — count the new slug
watch(
  () => route.params.slug,
  (newSlug) => {
    const next = (Array.isArray(newSlug) ? newSlug[0] : newSlug) ?? ''
    void registerView(next)
  }
)

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// SEO
const articleTitle = article.value?.title ?? 'Article'
const articleDescription = article.value?.description ?? ''
const articleDate = article.value?.date ?? ''
const articleCategory = article.value?.category ?? ''
const articleMedia = article.value?.media ?? []
const firstMedia = articleMedia[0]
const ogImage = firstMedia !== undefined ? resolveUrl(firstMedia.url) : ''

useHead({
  title: articleTitle,
  meta: [
    { name: 'description', content: articleDescription },
    { property: 'og:title', content: articleTitle },
    { property: 'og:description', content: articleDescription },
    { property: 'og:image', content: ogImage },
    { property: 'og:type', content: 'article' },
    { property: 'article:published_time', content: articleDate },
    { property: 'article:section', content: articleCategory }
  ]
})
</script>