<template>
  <AppsList :page-number="pageNumber" />
</template>

<script setup lang="ts">
const route = useRoute()

const pageNumber = computed(() => parseInt(route.params.page as string) || 1)

// SEO
useHead({
  title: `Page ${pageNumber.value} | Games & Apps for AYN Thor`,
  meta: [
    {
      name: 'description',
      content: `Games & Apps for AYN Thor — page ${pageNumber.value}. Companion app pairings, dual-screen Android ports, and game setups for the AYN Thor handheld.`
    },
    { property: 'og:title', content: `Page ${pageNumber.value} | Games & Apps for AYN Thor` },
    {
      property: 'og:description',
      content: `Games & Apps for AYN Thor — page ${pageNumber.value}. Companion app pairings, dual-screen Android ports, and game setups for the AYN Thor handheld.`
    }
  ]
})
</script>
