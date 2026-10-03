<template>
  <AppsList
    :page-number="1"
    :category="category"
  />
</template>

<script setup lang="ts">
import { getCategoryLabel } from '~/lib/categories'

const route = useRoute()

const rawCategory = route.params.category
const category = (Array.isArray(rawCategory) ? rawCategory[0] : rawCategory) ?? ''

const label = getCategoryLabel(category)

// SEO
useHead({
  title: `${label} for AYN Thor — Games & Apps`,
  meta: [
    {
      name: 'description',
      content: `All ${label} that make the most of the AYN Thor dual-screen handheld — companion app pairings, native dual-screen ports and more.`
    },
    { property: 'og:title', content: `${label} for AYN Thor — Games & Apps` },
    {
      property: 'og:description',
      content: `All ${label} that make the most of the AYN Thor dual-screen handheld.`
    },
    { property: 'og:type', content: 'website' }
  ]
})
</script>
