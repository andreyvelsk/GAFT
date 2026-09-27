<template>
  <AppsList :page-number="pageNumber" />
</template>

<script setup lang="ts">
const route = useRoute()

const pageNumber = computed(() => {
  const raw = route.params.page
  const value = Array.isArray(raw) ? raw[0] : raw
  const parsed = Number.parseInt(value ?? '', 10)
  return Number.isNaN(parsed) ? 1 : parsed
})

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
