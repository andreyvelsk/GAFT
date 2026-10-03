<template>
  <NuxtLink
    :to="`/category/${category}`"
    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border whitespace-nowrap transition-transform duration-200 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
    :class="{ 'ring-1 ring-white/20': active }"
    :style="badgeStyle"
    :title="`Show all ${label}`"
    @click.stop
  >
    {{ label }}
  </NuxtLink>
</template>

<script setup lang="ts">
import { getCategoryColor, getCategoryLabel } from '~/lib/categories'

const props = withDefaults(defineProps<{
  category: string
  active?: boolean
}>(), {
  active: false,
})

const color = computed(() => getCategoryColor(props.category))
const label = computed(() => getCategoryLabel(props.category))

const badgeStyle = computed(() => {
  const c = color.value
  if (props.active) {
    return {
      color: '#11111b',
      backgroundColor: c.text,
      borderColor: c.text,
    }
  }
  return {
    color: c.text,
    backgroundColor: c.bg,
    borderColor: c.border,
  }
})
</script>
