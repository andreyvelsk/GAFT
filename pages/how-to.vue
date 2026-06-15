<template>
  <article v-if="doc" class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Back link -->
    <NuxtLink
      to="/"
      class="inline-flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors mb-8 group"
    >
      <svg class="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
      Back
    </NuxtLink>

    <!-- Article Header -->
    <header class="mb-8">
      <h1 class="text-3xl md:text-4xl font-extrabold text-white mb-4">
        {{ doc.title }}
      </h1>
      <p class="text-lg text-gray-400 leading-relaxed">
        {{ doc.description }}
      </p>
    </header>

    <!-- Article Content -->
    <div class="prose mx-auto">
      <ContentRenderer :value="doc">
        <template #empty>
          <div class="text-center py-12 text-gray-500">
            <p>Content not found</p>
          </div>
        </template>
      </ContentRenderer>
    </div>
  </article>
  <div v-else class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
    <p class="text-gray-500">Page not found</p>
  </div>
</template>

<script setup lang="ts">
const { data: doc } = await useAsyncData('how-to', () =>
  queryContent('how-to').findOne()
)

// SEO
useHead({
  title: 'How to Add a Project — Games & Apps for AYN Thor',
  meta: [
    {
      name: 'description',
      content: 'Step-by-step guide on how to contribute a new project to the Games & Apps for AYN Thor collection via GitHub Pull Request.'
    }
  ]
})
</script>
