<template>
  <div class="relative">
    <div class="relative">
      <svg
        class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        ref="inputEl"
        :value="modelValue"
        @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        type="text"
        placeholder="Search games and apps..."
        class="w-full pl-10 pr-4 py-3 bg-surface-200 border border-gray-700 rounded-xl text-gray-200 placeholder-gray-500 appearance-none focus:outline-none focus:bg-surface-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-[border-color,box-shadow] duration-200"
      />
      <!-- Clear button -->
      <button
        v-if="modelValue"
        @click="emit('update:modelValue', '')"
        class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
        aria-label="Clear search"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const inputEl = ref<HTMLInputElement | null>(null)

// Flag shared across page navigations: was the search input focused
// right before the current component instance was unmounted?
const searchFocusPending = useState<boolean>('search-focus-pending', () => false)

onBeforeUnmount(() => {
  if (import.meta.client && document.activeElement === inputEl.value) {
    searchFocusPending.value = true
  }
})

onMounted(() => {
  if (import.meta.client && searchFocusPending.value) {
    searchFocusPending.value = false
    inputEl.value?.focus()
    // Move the caret to the end of the input
    const len = props.modelValue.length
    inputEl.value?.setSelectionRange(len, len)
  }
})
</script>