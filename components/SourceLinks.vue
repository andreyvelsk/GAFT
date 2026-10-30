<template>
  <div class="mb-8 flex flex-wrap gap-3">
    <a
      v-if="source"
      :href="source"
      target="_blank"
      rel="noopener noreferrer"
      class="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-surface-200 border border-gray-700 text-gray-300 hover:text-blue-400 hover:border-blue-500/50 hover:bg-surface-100 transition-colors"
    >
      <IconComponent name="external" />
      Source
    </a>
    <a
      v-if="projectPage"
      :href="projectPage"
      target="_blank"
      rel="noopener noreferrer"
      class="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-surface-200 border border-gray-700 text-gray-300 hover:text-blue-400 hover:border-blue-500/50 hover:bg-surface-100 transition-colors"
    >
      <IconComponent :name="isGithub ? 'github' : 'external'" />
      Project page
    </a>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  source?: string | undefined
  projectPage?: string | undefined
}>()

const isGithub = computed(() =>
  props.projectPage?.includes('github.com') ?? false
)
</script>
