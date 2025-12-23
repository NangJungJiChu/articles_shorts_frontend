import { onMounted, onUnmounted, type Ref } from 'vue'
import { interactWithPost } from '@/features/post-interaction'

export function useViewTracking(postId: number, cardRef: Ref<HTMLElement | null>) {
  let observer: IntersectionObserver | null = null
  let startTime: number = 0

  const reportViewDuration = () => {
    if (startTime !== 0) {
      const duration = Math.floor((Date.now() - startTime) / 1000)
      if (duration > 0) {
        interactWithPost(postId, 'VIEW', duration)
      }
      startTime = 0
    }
  }

  onMounted(() => {
    if (cardRef.value) {
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
  })

  onUnmounted(() => {
    if (observer) observer.disconnect()
    reportViewDuration()
  })
}
