
import { ref } from 'vue'

export function useImageHandler(insertContent: (text: string) => Promise<void>) {
    const isUploading = ref(false)
    const fileInput = ref<HTMLInputElement | null>(null)
    const pendingImages = ref<Map<string, File>>(new Map())

    const previewAndInsertImage = async (file: File) => {
        try {
            // Create local preview URL
            const blobUrl = URL.createObjectURL(file)
            pendingImages.value.set(blobUrl, file)

            // Insert markdown image syntax with blob URL
            const imageMarkdown = `![](${blobUrl})\n`
            await insertContent(imageMarkdown)

        } catch (error) {
            console.error('Image processing failed:', error)
            alert('Failed to process image')
        }
    }

    const handleImageUpload = async (event: Event) => {
        const files = (event.target as HTMLInputElement).files
        if (!files || files.length === 0) return

        for (let i = 0; i < files.length; i++) {
            if (files[i]) {
                await previewAndInsertImage(files[i]!)
            }
        }

        if (fileInput.value) fileInput.value.value = ''
    }

    const handlePaste = async (event: ClipboardEvent) => {
        const items = event.clipboardData?.items
        if (!items) return

        for (const item of items) {
            if (item.type.indexOf('image/') !== -1) {
                const file = item.getAsFile()
                if (file) {
                    event.preventDefault()
                    await previewAndInsertImage(file)
                }
            }
        }
    }

    const triggerFileUpload = () => {
        fileInput.value?.click()
    }

    return {
        isUploading,
        fileInput,
        pendingImages,
        handleImageUpload,
        handlePaste,
        triggerFileUpload
    }
}
