<template>
  <!-- eslint-disable-next-line vue/no-v-html -- SVG content is bundled at build time, not user input -->
  <span
    class="icon inline-block w-4 h-4 [&>svg]:w-full [&>svg]:h-full"
    aria-hidden="true"
    v-html="svg"
  />
</template>

<script setup lang="ts">
interface Props {
  /** Icon name — file name in `assets/svg/icons/` without the `.svg` extension */
  name: string
}

const props = defineProps<Props>()

const icons = import.meta.glob<string>('~/assets/svg/icons/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true
})

function resolveIcon (name: string): string {
  const entry = Object.entries(icons).find(([path]) => path.endsWith(`/${name}.svg`))
  if (entry === undefined) return ''
  const [, content] = entry
  return content
}

const svg = computed(() => resolveIcon(props.name))
</script>
