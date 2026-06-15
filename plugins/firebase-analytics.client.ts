/**
 * Firebase Analytics client plugin.
 *
 * - Initializes Firebase Analytics on the client side.
 * - Automatically logs a `page_view` event on every route change.
 * - Exposes `$trackEvent()` on the Nuxt app for custom event tracking.
 *
 * The `.client.ts` suffix ensures this plugin only runs in the browser.
 */
import { logEvent } from 'firebase/analytics'
import { useFirebaseAnalytics } from '~/lib/firebase'

export default defineNuxtPlugin(() => {
  const analytics = useFirebaseAnalytics()

  if (!analytics) {
    // Analytics is not configured or running on the server — skip silently.
    return
  }

  const router = useRouter()

  /**
   * Log the first page view (the page the user landed on).
   */
  const trackPageView = (path: string) => {
    logEvent(analytics, 'page_view', {
      page_path: path,
      page_title: document?.title || '',
    })
  }

  // Track initial page
  if (import.meta.client) {
    trackPageView(router.currentRoute.value.fullPath)
  }

  // Track subsequent navigations
  router.afterEach((to) => {
    trackPageView(to.fullPath)
  })

  return {
    provide: {
      /**
       * Custom event tracking helper.
       *
       * Usage in components:
       * ```ts
       * const { $trackEvent } = useNuxtApp()
       * $trackEvent('like_clicked', { article: 'skyrim' })
       * ```
       */
      trackEvent: (eventName: string, params?: Record<string, string | number | boolean>) => {
        logEvent(analytics, eventName, params)
      },
    },
  }
})
