<template>
  <button
    @click.stop="handleLike"
    :disabled="hasLiked || isSubmitting"
    class="inline-flex items-center gap-1.5 transition-all duration-200 group/like"
    :class="[
      variant === 'card'
        ? 'px-2.5 py-1 text-xs rounded-full border'
          + (hasLiked
            ? ' bg-pink-500/20 border-pink-500/40 text-pink-400'
            : ' bg-surface-200 border-gray-700 text-gray-500 hover:border-pink-500/40 hover:text-pink-400')
        : 'px-3 py-1.5 text-sm rounded-lg'
          + (hasLiked
            ? ' bg-pink-500/20 text-pink-400'
            : ' bg-surface-200 border border-gray-700 text-gray-400 hover:bg-pink-500/10 hover:border-pink-500/30 hover:text-pink-400'),
      isSubmitting ? 'cursor-wait' : ''
    ]"
    :title="hasLiked ? 'You already liked this' : 'Like this article'"
  >
    <!-- Heart icon -->
    <span
      class="inline-block transition-transform duration-300"
      :class="{ 'scale-125 animate-pulse': isSubmitting, 'scale-110': hasLiked }"
    >
      <svg
        class="w-4 h-4"
        :class="hasLiked ? 'fill-pink-400' : 'fill-none stroke-current'"
        stroke-width="2"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </span>

    <!-- Count -->
    <span
      v-if="!isLoading && firestoreLikes > 0"
      class="font-medium tabular-nums"
    >
      {{ formatCount(firestoreLikes) }}
    </span>

    <!-- Loading skeleton -->
    <span
      v-if="isLoading"
      class="w-4 h-3 bg-gray-700 rounded animate-pulse"
    />
  </button>
</template>

<script setup lang="ts">
const props = defineProps<{
  /** Unique article identifier (slug) */
  slug: string
  /** Visual variant: 'card' for article cards, 'inline' for article page header */
  variant?: 'card' | 'inline'
}>()

const {
  firestoreLikes,
  hasLiked,
  isLoading,
  isSubmitting,
  initLikes,
  like,
  destroyLikes
} = useLikes(props.slug)

/** Format large numbers: 1000 -> 1K, 1500 -> 1.5K */
function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

async function handleLike() {
  await like()
}

onMounted(() => {
  initLikes()
})

onUnmounted(() => {
  destroyLikes()
})
</script>
