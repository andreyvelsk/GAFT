import type { ArticleMedia } from './useArticles'

/**
 * Composable for managing media carousel state
 */
export interface UseMediaCarouselReturn {
  currentIndex: Ref<number>
  isTransitioning: Ref<boolean>
  totalItems: ComputedRef<number>
  hasMultipleItems: ComputedRef<boolean>
  currentItem: ComputedRef<ArticleMedia | undefined>
  next: () => void
  prev: () => void
  goTo: (index: number) => void
  onTouchStart: (e: TouchEvent) => void
  onTouchEnd: (e: TouchEvent) => void
}

export const useMediaCarousel = (media: Ref<ArticleMedia[]>): UseMediaCarouselReturn => {
  const currentIndex = ref(0)
  const isTransitioning = ref(false)

  const totalItems = computed(() => media.value.length)
  const hasMultipleItems = computed(() => totalItems.value > 1)
  const currentItem = computed(() => media.value[currentIndex.value])

  function next(): void {
    if (isTransitioning.value) return
    isTransitioning.value = true
    currentIndex.value = (currentIndex.value + 1) % totalItems.value
    setTimeout(() => {
      isTransitioning.value = false
    }, 300)
  }

  function prev(): void {
    if (isTransitioning.value) return
    isTransitioning.value = true
    currentIndex.value = (currentIndex.value - 1 + totalItems.value) % totalItems.value
    setTimeout(() => {
      isTransitioning.value = false
    }, 300)
  }

  function goTo(index: number): void {
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

  function onTouchStart(e: TouchEvent): void {
    const touch = e.changedTouches[0]
    if (touch !== undefined) touchStartX = touch.screenX
  }

  function onTouchEnd(e: TouchEvent): void {
    const touch = e.changedTouches[0]
    if (touch !== undefined) touchEndX = touch.screenX
    handleSwipe()
  }

  function handleSwipe(): void {
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