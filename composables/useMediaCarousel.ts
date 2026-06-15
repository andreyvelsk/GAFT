import type { ArticleMedia } from './useArticles'

/**
 * Composable for managing media carousel state
 */
export const useMediaCarousel = (media: Ref<ArticleMedia[]>) => {
  const currentIndex = ref(0)
  const isTransitioning = ref(false)

  const totalItems = computed(() => media.value.length)
  const hasMultipleItems = computed(() => totalItems.value > 1)
  const currentItem = computed(() => media.value[currentIndex.value])

  function next() {
    if (isTransitioning.value) return
    isTransitioning.value = true
    currentIndex.value = (currentIndex.value + 1) % totalItems.value
    setTimeout(() => {
      isTransitioning.value = false
    }, 300)
  }

  function prev() {
    if (isTransitioning.value) return
    isTransitioning.value = true
    currentIndex.value = (currentIndex.value - 1 + totalItems.value) % totalItems.value
    setTimeout(() => {
      isTransitioning.value = false
    }, 300)
  }

  function goTo(index: number) {
    if (isTransitioning.value || index === currentIndex.value) return
    isTransitioning.value = true
    currentIndex.value = index
    setTimeout(() => {
      isTransitioning.value = false
    }, 300)
  }

  // Touch handlers for mobile swipe
  let touchStartX = 0
  let touchEndX = 0

  function onTouchStart(e: TouchEvent) {
    touchStartX = e.changedTouches[0].screenX
  }

  function onTouchEnd(e: TouchEvent) {
    touchEndX = e.changedTouches[0].screenX
    handleSwipe()
  }

  function handleSwipe() {
    const swipeThreshold = 50
    const diff = touchStartX - touchEndX

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        next()
      } else {
        prev()
      }
    }
  }

  return {
    currentIndex,
    isTransitioning,
    totalItems,
    hasMultipleItems,
    currentItem,
    next,
    prev,
    goTo,
    onTouchStart,
    onTouchEnd
  }
}