
import { ref, computed, nextTick } from 'vue'
import MarkdownIt from 'markdown-it'

export function useMarkdownEditor() {
    const content = ref('')
    const textareaRef = ref<HTMLTextAreaElement | null>(null)

    const md = new MarkdownIt({
        html: false,
        breaks: true,
        linkify: true,
    })

    const parsedContent = computed(() => {
        const rendered = md.render(content.value)
        const s3BaseUrl = import.meta.env.VITE_S3_BASE_URL || 'https://njjc-media.s3.ap-northeast-2.amazonaws.com'
        // Replace /media/ with full URL for preview
        const updated = rendered.replace(/src="\/media\/([^"]+)"/g, `src="${s3BaseUrl}/$1"`)
        return updated
    })

    const insertContent = async (text: string) => {
        if (!textareaRef.value) {
            content.value += text
            return
        }

        const start = textareaRef.value.selectionStart
        const end = textareaRef.value.selectionEnd

        // Insert text at cursor position
        content.value = content.value.substring(0, start) + text + content.value.substring(end)

        // Restore focus and cursor position after DOM update
        await nextTick()
        if (textareaRef.value) {
            textareaRef.value.focus()
            const newCursorPos = start + text.length
            textareaRef.value.setSelectionRange(newCursorPos, newCursorPos)
        }
    }

    return {
        content,
        textareaRef,
        parsedContent,
        insertContent
    }
}
