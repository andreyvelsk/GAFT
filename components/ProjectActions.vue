<template>
  <div
    v-if="hasActions"
    class="flex flex-wrap items-center gap-3"
  >
    <!-- Primary CTA -->
    <a
      v-if="primaryAction !== null"
      :href="primaryAction.url"
      target="_blank"
      rel="noopener noreferrer"
      class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-500 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
    >
      <IconComponent :name="primaryIcon" />
      {{ primaryAction.label }}
    </a>

    <!-- Secondary CTA -->
    <a
      v-if="deepLink !== null"
      :href="deepLink"
      target="_blank"
      rel="noopener noreferrer"
      class="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-surface-200 border border-gray-700 text-gray-300 hover:text-purple-400 hover:border-purple-500/50 hover:bg-surface-100 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-400"
      aria-label="Add to Obtainium (opens Obtainium app)"
    >
      <IconComponent name="obtainium" />
      Add to Obtainium
    </a>

    <!-- Tertiary inline link -->
    <a
      v-if="secondaryLinkUrl !== ''"
      :href="secondaryLinkUrl"
      target="_blank"
      rel="noopener noreferrer"
      class="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-blue-400 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
    >
      {{ secondaryLinkLabel }}
      <IconComponent name="external" />
    </a>
  </div>
</template>

<script setup lang="ts">
import { getProjectActionsState } from '~/composables/useProjectActions'

interface Props {
  source?: string | null | undefined
  projectPage?: string | null | undefined
}

const props = defineProps<Props>()
const state = computed(() => getProjectActionsState(props))
const deepLink = computed(() => state.value.deepLink)
const primaryAction = computed(() => state.value.primaryAction)
const primaryIcon = computed(() => state.value.primaryIcon)
const secondaryLinkUrl = computed(() => state.value.secondaryLinkUrl)
const secondaryLinkLabel = state.value.secondaryLinkLabel
const hasActions = computed(() => state.value.hasActions)
</script>
