import { onMounted, onUnmounted, type Ref, type MaybeRefOrGetter, toValue, watch } from 'vue'
import { interactWithPost } from '@/features/post-interaction'

export function useViewTracking(
  postId: number,
  cardRef: Ref<HTMLElement | null>,
  enabled: MaybeRefOrGetter<boolean> = true
) {
  let observer: IntersectionObserver | null = null
  let startTime: number = 0

  const reportViewDuration = () => {
    if (!toValue(enabled)) {
      startTime = 0
      return
    }

    if (startTime !== 0) {
      const duration = Math.floor((Date.now() - startTime) / 1000)
      if (duration > 0) {
        interactWithPost(postId, 'VIEW', duration)
      }
      startTime = 0
    }
  }

  const setupObserver = () => {
    if (observer) {
      observer.disconnect()
      observer = null
    }

    if (cardRef.value && toValue(enabled)) {
      observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            startTime = Date.now()
          } else {
            reportViewDuration()
          }
        })
      }, { threshold: 0.0 })
      observer.observe(cardRef.value)
    }
  }

  watch(() => toValue(enabled), (isEnabled) => {
    if (!isEnabled) {
        if(observer) observer.disconnect()
        startTime = 0
    } else {
        setupObserver()
    }
  })

  onMounted(() => {
    setupObserver()
  })

  onUnmounted(() => {
    if (observer) observer.disconnect()
    reportViewDuration()
  })
}
