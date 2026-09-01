<template>
  <AppsList :page-number="pageNumber" />
</template>

<script setup lang="ts">
const route = useRoute()

const pageNumber = computed(() => parseInt(route.params.page as string) || 1)

// SEO
useHead({
  title: 'Games & Apps for AYN Thor — Companion App Pairings & Android Ports',
  meta: [
    {
      name: 'description',
      content: 'Discover games and apps that make the most of the AYN Thor dual-screen design. Companion app pairings, native Android dual-screen ports, and more.'
    },
    { property: 'og:title', content: 'Games & Apps for AYN Thor — Companion App Pairings & Android Ports' },
    {
      property: 'og:description',
      content: 'Discover games and apps that make the most of the AYN Thor dual-screen design. Companion app pairings, native Android dual-screen ports, and more.'
    },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: 'Games & Apps for AYN Thor' }
  ]
})
</script>
