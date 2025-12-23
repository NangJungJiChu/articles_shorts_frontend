import { computed, nextTick, watch, type Ref } from 'vue'
import MarkdownIt from 'markdown-it'

export function useMarkdown(content: Ref<string>, containerRef: Ref<HTMLElement | null>, onMediaLoad?: () => void) {
  const md = new MarkdownIt({
    html: false,
    breaks: true,
    linkify: true,
  })

  const renderedContent = computed(() => {
    const rendered = md.render(content.value)
    const s3BaseUrl = import.meta.env.VITE_S3_BASE_URL || 'https://njjc-media.s3.ap-northeast-2.amazonaws.com'

    let updated = rendered.replace(/src="\/media\/([^"]+)"/g, `src="${s3BaseUrl}/$1"`)
    updated = updated.replace(/src="(?!(http|\/))([^"]+)"/g, `src="${s3BaseUrl}/$2"`)

    return updated
  })

  const attachLoadListeners = () => {
    if (!containerRef.value || !onMediaLoad) return

    const images = containerRef.value.querySelectorAll('img')
    images.forEach((img) => {
      if (img.complete) {
        onMediaLoad()
      } else {
        img.addEventListener('load', onMediaLoad)
      }
    })
    onMediaLoad()
  }

  watch(renderedContent, () => {
    if (onMediaLoad) {
      nextTick(attachLoadListeners)
    }
  }, { immediate: true })

  return {
    renderedContent,
  }
}
