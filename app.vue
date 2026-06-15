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
      ? `${titleChunk} | Games & Apps for AYN Thor`
      : 'Games & Apps for AYN Thor — Perfect Pairings & Android Ports'
  }
})
</script>