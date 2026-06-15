<template>
  <div
    class="relative overflow-hidden rounded-xl bg-surface-200 border border-gray-800"
    @touchstart="onTouchStart"
    @touchend="onTouchEnd"
  >
    <!-- Media Display -->
    <div class="aspect-video relative overflow-hidden">
      <!-- Image -->
      <img
        v-if="currentItem?.type === 'image'"
        :src="currentItem?.url"
        :alt="`Slide ${currentIndex + 1}`"
        class="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
      />

      <!-- YouTube Video Embed -->
      <iframe
        v-else-if="currentItem?.type === 'video'"
        :src="getYouTubeEmbedUrl(currentItem?.url || '')"
        class="w-full h-full"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
      />

      <!-- Placeholder if no media -->
      <div
        v-else
        class="w-full h-full flex items-center justify-center bg-gradient-to-br from-surface-200 to-surface-300"
      >
        <span class="text-4xl text-gray-600">[ ]</span>
      </div>

      <!-- Navigation Arrows -->
      <button
        v-if="hasMultipleItems"
        @click="prev"
        class="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-all hover:scale-110 backdrop-blur-sm"
        aria-label="Previous"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        v-if="hasMultipleItems"
        @click="next"
        class="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-all hover:scale-110 backdrop-blur-sm"
        aria-label="Next"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <!-- Dots Indicator -->
      <div
        v-if="hasMultipleItems"
        class="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2"
      >
        <button
          v-for="(_, index) in totalItems"
          :key="index"
          @click="goTo(index)"
          class="w-2 h-2 rounded-full transition-all duration-300"
          :class="index === currentIndex ? 'bg-white w-6' : 'bg-white/40 hover:bg-white/60'"
          :aria-label="`Go to slide ${index + 1}`"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ArticleMedia } from '~/composables/useArticles'

const props = defineProps<{
  media: ArticleMedia[]
}>()

const {
  currentIndex,
  totalItems,
  hasMultipleItems,
  currentItem,
  next,
  prev,
  goTo,
  onTouchStart,
  onTouchEnd
} = useMediaCarousel(toRef(props, 'media'))

function getYouTubeEmbedUrl(url: string): string {
  // Support various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) {
      return `https://www.youtube.com/embed/${match[1]}?autoplay=0&rel=0`
    }
  }

  return url
}
</script>