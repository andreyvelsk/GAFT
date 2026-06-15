<template>
  <div class="flex items-center gap-3">
    <label class="text-sm text-gray-400 font-medium">Sort by:</label>
    <div class="flex gap-1 bg-surface-200 rounded-lg p-1 border border-gray-700">
      <button
        v-for="option in sortOptions"
        :key="option.value"
        @click="emit('update:modelValue', option.value)"
        class="px-3 py-1.5 text-sm rounded-md transition-all duration-200"
        :class="modelValue === option.value
          ? 'bg-blue-500/20 text-blue-400 shadow-sm'
          : 'text-gray-400 hover:text-gray-200 hover:bg-surface-100'"
      >
        <span class="flex items-center gap-1.5">
          {{ option.label }}
        </span>
      </button>
    </div>

    <!-- Order toggle -->
    <button
      @click="emit('update:order', order === 'desc' ? 'asc' : 'desc')"
      class="p-2 rounded-lg bg-surface-200 border border-gray-700 text-gray-400 hover:text-gray-200 hover:border-gray-500 transition-all"
      :title="order === 'desc' ? 'Descending' : 'Ascending'"
    >
      <svg
        class="w-4 h-4 transition-transform duration-200"
        :class="{ 'rotate-180': order === 'asc' }"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import type { SortField, SortOrder } from '~/composables/useArticles'

defineProps<{
  modelValue: SortField
  order: SortOrder
}>()

const emit = defineEmits<{
  'update:modelValue': [value: SortField]
  'update:order': [value: SortOrder]
}>()

const sortOptions = [
  {
    value: 'date' as SortField,
    label: 'Date'
  },
  {
    value: 'title' as SortField,
    label: 'A-Z'
  }
]
</script>