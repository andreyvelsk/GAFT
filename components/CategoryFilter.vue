<template>
  <div class="flex flex-wrap items-center gap-2">
    <NuxtLink
      to="/"
      class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border whitespace-nowrap transition-colors"
      :class="modelValue === null
        ? 'bg-gray-200 text-gray-900 border-gray-200'
        : 'bg-gray-500/10 text-gray-300 border-gray-500/30 hover:text-white'"
    >
      All
    </NuxtLink>

    <CategoryBadge
      v-for="cat in PROJECT_CATEGORIES"
      :key="cat"
      :category="cat"
      :active="modelValue === cat"
    />
  </div>
</template>

<script setup lang="ts">
import { PROJECT_CATEGORIES } from '~/lib/categories'

defineProps<{
  modelValue: string | null
}>()
</script>
