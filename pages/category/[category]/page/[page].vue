<template>
  <AppsList
    :page-number="pageNumber"
    :category="category"
  />
</template>

<script setup lang="ts">
import { getCategoryLabel } from '~/lib/categories'

const route = useRoute()

const rawCategory = route.params.category
const category = (Array.isArray(rawCategory) ? rawCategory[0] : rawCategory) ?? ''

const pageNumber = computed(() => {
  const raw = route.params.page
  const value = Array.isArray(raw) ? raw[0] : raw
  const parsed = Number.parseInt(value ?? '', 10)
  return Number.isNaN(parsed) ? 1 : parsed
})

const label = getCategoryLabel(category)

// SEO
useHead({
  title: `Page ${pageNumber.value} | ${label} for AYN Thor`,
  meta: [
    {
      name: 'description',
      content: `${label} for AYN Thor — page ${pageNumber.value}. Dual-screen ports, companion apps and game setups for the handheld.`
    },
    { property: 'og:title', content: `Page ${pageNumber.value} | ${label} for AYN Thor` },
    {
      property: 'og:description',
      content: `${label} for AYN Thor — page ${pageNumber.value}.`
    }
  ]
})
</script>
