<template>
  <nav v-if="totalPages > 1" class="flex items-center justify-center gap-2" aria-label="Pagination">
    <!-- Previous Button -->
    <NuxtLink
      v-if="currentPage > 1"
      :to="currentPage === 2 ? '/' : `/page/${currentPage - 1}`"
      class="flex items-center gap-1 px-4 py-2 rounded-lg bg-surface-200 border border-gray-700 text-gray-300 hover:border-blue-500/30 hover:text-blue-400 transition-all"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
      Previous
    </NuxtLink>

    <!-- Page Numbers -->
    <div class="flex gap-1">
      <button
        v-for="page in visiblePages"
        :key="page"
        @click="emit('changePage', page)"
        class="min-w-[2.5rem] h-10 rounded-lg text-sm font-medium transition-all"
        :class="page === currentPage
          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
          : 'bg-surface-200 border border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200'"
      >
        {{ page }}
      </button>
    </div>

    <!-- Next Button -->
    <NuxtLink
      v-if="currentPage < totalPages"
      :to="`/page/${currentPage + 1}`"
      class="flex items-center gap-1 px-4 py-2 rounded-lg bg-surface-200 border border-gray-700 text-gray-300 hover:border-blue-500/30 hover:text-blue-400 transition-all"
    >
      Next
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </NuxtLink>
  </nav>
</template>

<script setup lang="ts">
const props = defineProps<{
  currentPage: number
  totalPages: number
}>()

const emit = defineEmits<{
  changePage: [page: number]
}>()

const visiblePages = computed(() => {
  const pages: number[] = []
  const maxVisible = 5
  let start = Math.max(1, props.currentPage - Math.floor(maxVisible / 2))
  const end = Math.min(props.totalPages, start + maxVisible - 1)

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})
</script>