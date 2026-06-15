// https://nuxt.com/docs/api/configuration/nuxt-config
import { generateRoutes } from './scripts/generate-routes'

export default defineNuxtConfig({
  modules: [
    '@nuxt/content',
    '@nuxtjs/tailwindcss'
  ],

  css: ['~/assets/css/main.css'],

  content: {
    // @nuxt/content v2 configuration
    highlight: {
      theme: 'monokai',
      preload: ['javascript', 'typescript', 'vue', 'css', 'bash', 'json', 'yaml']
    }
  },

  // Static Site Generation (SSG)
  ssr: true,

  nitro: {
    prerender: {
      autoSubfolderIndex: true,
      crawlLinks: true,
      routes: generateRoutes()
    }
  },

  // SEO
  app: {
    // Base path для GitHub Pages (/<repo-name>/), локально — '/'
    baseURL: process.env.NUXT_APP_BASE_URL || '/',

    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      htmlAttrs: {
        lang: 'en'
      },
      meta: [
        { name: 'yandex-verification', content: '' },
        { name: 'theme-color', content: '#11111b' }
      ],
      script: [
        {
          type: 'application/ld+json',
          children: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'Dual Screen Games & Apps for AYN Thor',
            description: 'Curated collection of games and apps that shine on the dual-screen AYN Thor handheld console — from companion app pairings to native dual-screen Android ports.',
            url: 'https://ayn-thor-games.pages.dev'
          })
        }
      ]
    }
  },

  // Runtime config — Firebase credentials are loaded from .env / environment variables
  // NUXT_PUBLIC_FIREBASE_* are exposed to the client side
  runtimeConfig: {
    public: {
      firebaseApiKey: process.env.NUXT_PUBLIC_FIREBASE_API_KEY || '',
      firebaseAuthDomain: process.env.NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
      firebaseProjectId: process.env.NUXT_PUBLIC_FIREBASE_PROJECT_ID || '',
      firebaseStorageBucket: process.env.NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
      firebaseMessagingSenderId: process.env.NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
      firebaseAppId: process.env.NUXT_PUBLIC_FIREBASE_APP_ID || ''
    }
  },

  compatibilityDate: '2026-06-15',

  // Tailwind CSS theme customization
  tailwindcss: {
    config: {
      theme: {
        extend: {
          colors: {
            primary: {
              50: '#e6f0ff',
              100: '#b3d4ff',
              200: '#80b8ff',
              300: '#4d9cff',
              400: '#1a80ff',
              500: '#0066e6',
              600: '#0052b3',
              700: '#003d80',
              800: '#00294d',
              900: '#00141a'
            },
            accent: {
              50: '#fce4ec',
              100: '#f8b4c8',
              200: '#f484a4',
              300: '#f05480',
              400: '#ec245c',
              500: '#d4145a',
              600: '#a80f48',
              700: '#7c0b36',
              800: '#500724',
              900: '#240312'
            },
            surface: {
              50: '#f8f9fa',
              100: '#1e1e2e',
              200: '#181825',
              300: '#11111b',
              400: '#0a0a14',
              500: '#05050d'
            }
          },
          fontFamily: {
            sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
            mono: ['JetBrains Mono', 'Fira Code', 'monospace']
          }
        }
      }
    }
  }
})