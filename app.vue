<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk
      ? `${titleChunk} | Dual Screen Games for AYN Thor`
      : 'Dual Screen Games for AYN Thor — Perfect Pairings & Android Ports'
  }
})
</script>