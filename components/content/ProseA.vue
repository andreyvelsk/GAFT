<script setup lang="ts">
const props = defineProps({
  href: {
    type: String,
    default: ''
  },
  blank: {
    type: Boolean,
    default: false
  }
})

const isExternal = computed(() => {
  return props.href.startsWith('http://') || props.href.startsWith('https://')
})
</script>

<template>
  <a
    v-if="isExternal"
    :href="href"
    target="_blank"
    rel="noopener noreferrer nofollow"
  >
    <slot />
  </a>

  <NuxtLink v-else :to="href">
    <slot />
  </NuxtLink>
</template>
