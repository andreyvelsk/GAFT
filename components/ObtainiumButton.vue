<template>
  <a
    v-if="deepLink"
    :href="deepLink"
    class="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-surface-200 border border-gray-700 text-gray-300 hover:text-purple-400 hover:border-purple-500/50 hover:bg-surface-100 transition-colors"
  >
    <IconObtainium />
    Add to Obtainium
  </a>
</template>

<script setup lang="ts">
interface Props {
  /** Project page URL — the button is rendered only for GitHub links */
  projectPage?: string
}

const props = defineProps<Props>()

/**
 * Build an Obtainium deep link for a GitHub project:
 * obtainium://add?url=<repo URL>
 */
const GITHUB_URL_RE = /^https?:\/\/(?:www\.)?github\.com\/([^/?#]+)\/([^/?#]+)/i

const deepLink = computed<string | null>(() => {
  const url = props.projectPage?.trim() ?? ''
  if (url === '') return null

  // Only GitHub project pages are supported
  const match = GITHUB_URL_RE.exec(url)
  if (match === null) return null

  const author: string = match[1] ?? ''
  const repo: string = (match[2] ?? '').replace(/\.git$/i, '')
  if (author === '' || repo === '') return null

  return `obtainium://add/https://github.com/${author}/${repo}`
})
</script>
