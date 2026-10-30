<template>
  <div
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
      This page was automatically generated from
      <template v-if="source && projectPage">
        a
        <a
          :href="source"
          target="_blank"
          rel="noopener noreferrer"
        >source</a>
        and a
        <a
          :href="projectPage"
          target="_blank"
          rel="noopener noreferrer"
        >project page</a>
      </template>
      <template v-else-if="source">
        a
        <a
          :href="source"
          target="_blank"
          rel="noopener noreferrer"
        >source</a>
      </template>
      <template v-else-if="projectPage">
        a
        <a
          :href="projectPage"
          target="_blank"
          rel="noopener noreferrer"
        >project page</a>
      </template>
      <template v-else>
        a source
      </template>
      and may contain inaccuracies or outdated information. Please verify
      details with the original source.
    </p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  source?: string | null | undefined
  projectPage?: string | null | undefined
}>()
</script>
