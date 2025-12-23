import { ref, watch, type Ref } from 'vue'

export function useExpansion(containerRef: Ref<HTMLElement | null>) {
  const isExpanded = ref(false)
  const isOverflowing = ref(false)

  const checkOverflow = () => {
    const el = containerRef.value
    if (el) {
      isOverflowing.value = el.scrollHeight > el.clientHeight
    }
  }

  const toggleExpand = () => {
    if (isOverflowing.value) {
      isExpanded.value = !isExpanded.value
    }
  }

  watch(isExpanded, (newVal) => {
    if (!newVal && containerRef.value) {
      containerRef.value.scrollTop = 0
    }
  })

  return {
    isExpanded,
    isOverflowing,
    checkOverflow,
    toggleExpand,
  }
}
