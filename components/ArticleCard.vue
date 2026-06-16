<template>
  <article class="group relative flex flex-col bg-surface-200 rounded-xl border border-gray-800 overflow-hidden hover:border-blue-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5">
    <!-- Media Carousel -->
    <MediaCarousel v-if="article.media?.length" :media="article.media" />

    <!-- Content -->
    <div class="p-5 flex flex-col grow justify-between relative">
      <!-- Title -->
      <div>
        <h3 class="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
          {{ article.title }}
        </h3>

        <!-- Description -->
        <p class="text-sm text-gray-400 mb-4 line-clamp-2">
          {{ article.description }}
        </p>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-between text-xs text-gray-500">
        <div class="flex items-center gap-3">
          <!-- Date -->
          <span class="flex items-center gap-1">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {{ formatDate(article.date) }}
          </span>
        </div>

        <!-- Like button (z-30 stays above the overlay link) -->
        <div class="relative z-30">
          <LikeButton :slug="article.slug" variant="card" />
        </div>
      </div>

      <!-- Full-area overlay link covering everything except media -->
      <NuxtLink
        :to="`/project/${article.slug}`"
        class="absolute inset-0 z-20"
        :aria-label="article.title"
      />
    </div>
  </article>
</template>

<script setup lang="ts">
import type { Article } from '~/composables/useArticles'

defineProps<{
  article: Article
}>()

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>