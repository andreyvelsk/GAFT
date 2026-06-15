<template>
  <div class="min-h-screen flex flex-col bg-surface-300 text-gray-200">
    <!-- Header / Navbar -->
    <header class="sticky top-0 z-50 backdrop-blur-xl bg-surface-300/80 border-b border-gray-800">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <NuxtLink to="/" class="flex items-center gap-2 group">
            <span class="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Dual Screen Games
            </span>
          </NuxtLink>

          <!-- Navigation -->
          <nav class="flex items-center gap-6">
            <NuxtLink
              to="/"
              class="text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              Home
            </NuxtLink>
          </nav>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="border-t border-gray-800 bg-surface-400">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex flex-col md:flex-row items-center justify-between gap-4">
          <div class="text-sm text-gray-600">
            &copy; {{ new Date().getFullYear() }} Dual Screen Games for AYN Thor. Built with
            <a href="https://nuxt.com" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:text-blue-300 transition-colors">
              Nuxt 3
            </a>
            &
            <a href="https://content.nuxt.com" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:text-blue-300 transition-colors">
              Content v2
            </a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
// Reactive current year for footer
</script>