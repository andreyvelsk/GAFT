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
interface Props {
  source?: string | null | undefined
  projectPage?: string | null | undefined
}

const props = defineProps<Props>()

const GITHUB_URL_RE = /^https?:\/\/(?:www\.)?github\.com\/([^/?#]+)\/([^/?#]+)/i

const projectPage = computed(() => props.projectPage?.trim() ?? '')
const source = computed(() => props.source?.trim() ?? '')

/**
 * Build an Obtainium deep link for a GitHub project:
 * obtainium://add?url=<repo URL>
 */
const deepLink = computed<string | null>(() => {
  const url = projectPage.value
  if (url === '') return null

  // Only GitHub project pages are supported
  const match = GITHUB_URL_RE.exec(url)
  if (match === null) return null

  const author: string = match[1] ?? ''
  const repo: string = (match[2] ?? '').replace(/\.git$/i, '')
  if (author === '' || repo === '') return null

  return `obtainium://add/https://github.com/${author}/${repo}`
})

const primaryAction = computed<{ url: string; label: string } | null>(() => {
  if (projectPage.value !== '') {
    return { url: projectPage.value, label: 'Open project' }
  }
  if (source.value !== '') {
    return { url: source.value, label: 'Open source' }
  }
  return null
})

const primaryIcon = computed(() =>
  projectPage.value.includes('github.com') ? 'github' : 'external'
)

// Tertiary link: source, unless it is already the primary action
const secondaryLinkUrl = computed(() =>
  projectPage.value !== '' ? source.value : ''
)
const secondaryLinkLabel = 'View source'

const hasActions = computed(
  () =>
    primaryAction.value !== null ||
    deepLink.value !== null ||
    secondaryLinkUrl.value !== ''
)
</script>
