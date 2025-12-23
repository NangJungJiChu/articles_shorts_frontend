<script setup lang="ts">
import { ref, computed, nextTick, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import MarkdownIt from 'markdown-it'

import { Icon } from '@/shared/ui/icon'
import { Combobox } from '@/shared/ui/combobox'
import { Button } from '@/shared/ui/button'
import { uploadImage } from '@/features/upload/api/uploadImage'
import { useCreatePostMutation, useCategoryListQuery } from '@/entities/post'

const router = useRouter()
const activeTab = ref<'write' | 'preview'>('write')
const title = ref('')
const content = ref('')
const categoryId = ref<string | null>(null)
const isUploading = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const pendingImages = ref<Map<string, File>>(new Map())


// Queries
const { data: categories } = useCategoryListQuery()

// Options for Combobox
const categoryOptions = computed(() => {
    return categories.value?.map(cat => ({
        id: cat.id,
        label: cat.name
    })) || []
})

// Set default category if available
watchEffect(() => {
    if (!categoryId.value && categoryOptions.value.length > 0) {
        // Default to 'mildlyinteresting' if exists, else first one
        const defaultCat = categoryOptions.value.find(c => c.id === 'mildlyinteresting') || categoryOptions.value[0]
        if (defaultCat) {
            categoryId.value = String(defaultCat.id)
        }
    }
})

// Mutation
const { mutate: createPost, isPending: isSubmitting } = useCreatePostMutation()

const md = new MarkdownIt({
    html: false,
    breaks: true,
    linkify: true,
})

// ... (existing computed and methods) ...
const parsedContent = computed(() => {
    // Replace /media/ with full URL for preview
    const rendered = md.render(content.value)
    // For blob URLs, they work natively in browser, so no replacement needed for them.
    // However, if we have existing images from server?
    // The user said "preview should show images saved in website memory".
    // That means the blob URLs should just work.

    // But we also need to support S3 display for existing posts if we ever edit them here?
    // Or just unrelated.
    // The previous code replaced /media/. Let's keep S3 replacement just in case.
    const s3BaseUrl = import.meta.env.VITE_S3_BASE_URL || 'https://njjc-media.s3.ap-northeast-2.amazonaws.com'

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
                // Don't prevent default immediately if we want to allow text paste too?
                // But usually if image is mixed, we might just want the image.
                // Let's prevent default to handle custom insertion.
                event.preventDefault()
                await previewAndInsertImage(file)
            }
        }
    }
}

const triggerFileUpload = () => {
    fileInput.value?.click()
}

const handleBack = () => {
    router.back()
}

const handleComplete = async () => {
    if (!title.value.trim() || !content.value.trim()) {
        alert('제목과 내용을 모두 입력해주세요.')
        return
    }

    if (!categoryId.value) {
        alert('카테고리를 선택해주세요.')
        return
    }

    try {
        isUploading.value = true
        let finalContent = content.value

        // Process pending images
        // Find all blob URLs in the content
        // We iterate through our map to find which ones are actually used
        // (User might have deleted some from the text area)

        // filesToUpload array to preserve order for bulk upload
        const filesToUpload: File[] = []
        const blobUrlsToReplace: string[] = []

        for (const [blobUrl, file] of pendingImages.value.entries()) {
            if (finalContent.includes(blobUrl)) {
                filesToUpload.push(file)
                blobUrlsToReplace.push(blobUrl)
            } else {
                // unused blob, revoke it
                URL.revokeObjectURL(blobUrl)
            }
        }

        if (filesToUpload.length > 0) {
            const responseList = await uploadImage(filesToUpload)

            // Replace blobs with returned IDs
            // Assuming responseList order matches filesToUpload order
            responseList.forEach((response, index) => {
                const blobUrl = blobUrlsToReplace[index]
                // response is { id: string, url: string }
                const replacement = `/media/${response.id}.png`
                if (blobUrl) {
                    finalContent = finalContent.split(blobUrl).join(replacement)
                    URL.revokeObjectURL(blobUrl)
                }
            })
        }

        // Clear pending images map
        pendingImages.value.clear()

        createPost(
            {
                title: title.value,
                body: finalContent,
                category: categoryId.value
            },
            {
                onSuccess: () => {
                    alert('게시글이 작성되었습니다.')
                    router.push('/')
                },
                onError: (error) => {
                    console.error('Failed to create post:', error)
                    alert('게시글 작성에 실패했습니다.')
                }
            }
        )
    } catch (e) {
        console.error('Upload error', e)
        alert('이미지 업로드 중 오류가 발생했습니다.')
    } finally {
        isUploading.value = false
    }
}

</script>

<template>
    <div class="create-page">
        <!-- Header -->
        <header class="header">
            <button class="nav-btn" @click="handleBack">
                <Icon name="arrow_back" />
            </button>
            <h1 class="page-title">새 게시글</h1>
            <div class="header-actions">
                <Button
                    size="small"
                    variant="primary"
                    class="complete-btn"
                    @click="handleComplete"
                    :disabled="isSubmitting"
                >
                    {{ isSubmitting ? '작성 중...' : '완료' }}
                </Button>
            </div>
        </header>

        <!-- Tabs -->
        <div class="tabs">
            <button class="tab-btn" :class="{ active: activeTab === 'write' }" @click="activeTab = 'write'">
                작성
            </button>
            <button class="tab-btn" :class="{ active: activeTab === 'preview' }" @click="activeTab = 'preview'">
                미리보기
            </button>
        </div>

        <!-- Write Mode -->
        <div v-show="activeTab === 'write'" class="write-container">
            <div class="input-group">
                <Combobox v-model="categoryId" :options="categoryOptions" placeholder="카테고리 선택"
                    search-placeholder="카테고리 검색..." class="category-select" />
            </div>
            <div class="input-group">
                <input v-model="title" type="text" placeholder="제목을 입력하세요" class="title-input" />
            </div>
            <div class="editor-container">
                <textarea ref="textareaRef" v-model="content" placeholder="내용을 입력하세요 (Markdown 지원)"
                    class="content-editor" @paste="handlePaste"></textarea>

                <!-- Image Upload Button -->
                <button class="upload-btn" @click="triggerFileUpload" :disabled="isUploading || isSubmitting">
                    <Icon name="image" />
                    <span>{{ isUploading ? '업로드 중...' : '이미지 추가' }}</span>
                </button>
                <input ref="fileInput" type="file" accept="image/*" multiple class="hidden-input"
                    @change="handleImageUpload" />
            </div>
        </div>

        <!-- Preview Mode -->
        <div v-show="activeTab === 'preview'" class="preview-container">
            <h2 class="preview-title">{{ title || '제목 없음' }}</h2>
            <div class="markdown-body" v-html="parsedContent"></div>
        </div>
    </div>
</template>

<style scoped>
.create-page {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: var(--color-white);
}

.header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-bottom: 1px solid var(--color-gray-300);
}

.nav-btn {
    background: none;
    border: none;
    padding: 4px;
    cursor: pointer;
    color: var(--color-gray-900);
}

.page-title {
    font-family: var(--font-family-base);
    font-size: var(--font-title-large-size);
    line-height: var(--font-title-large-line-height);
    font-weight: 500;
    color: var(--color-gray-900);
}

.header-actions {
    width: 80px; /* Constrain button width */
}

/* Override button styles if needed, but try to rely on component defaults */

.tabs {
    display: flex;
    border-bottom: 1px solid var(--color-gray-300);
}

.tab-btn {
    flex: 1;
    padding: 12px;
    background: none;
    border: none;
    font-family: var(--font-family-base);
    font-size: var(--font-label-large-size);
    line-height: var(--font-label-large-line-height);
    font-weight: 500;
    color: var(--color-gray-600);
    cursor: pointer;
    border-bottom: 2px solid transparent;
}

.tab-btn.active {
    color: var(--color-blue-600);
    border-bottom-color: var(--color-blue-600);
}

.write-container,
.preview-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 16px;
    padding-bottom: 58px;
    overflow-y: auto;
}

.title-input {
    width: 100%;
    padding: 12px 0;
    font-family: var(--font-family-base);
    font-size: var(--font-headline-small-size);
    line-height: var(--font-headline-small-line-height);
    font-weight: 600;
    border: none;
    border-bottom: 1px solid var(--color-gray-300);
    outline: none;
    margin-bottom: 16px;
    color: var(--color-gray-900);
}

.title-input::placeholder {
    color: var(--color-gray-400);
}

.editor-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    position: relative;
}

.content-editor {
    flex: 1;
    width: 100%;
    resize: none;
    border: none;
    outline: none;
    font-family: var(--font-family-base);
    font-size: var(--font-body-large-size);
    line-height: var(--font-body-large-line-height);
    color: var(--color-gray-900);
    padding-bottom: 60px;
    /* Space for upload button */
}

.content-editor::placeholder {
    color: var(--color-gray-400);
}

.upload-btn {
    position: absolute;
    bottom: 0;
    left: 0;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background-color: var(--color-gray-100);
    border: 1px solid var(--color-gray-300);
    border-radius: 20px;
    cursor: pointer;

    font-family: var(--font-family-base);
    font-size: var(--font-label-medium-size);
    font-weight: 500;
    color: var(--color-gray-700);
    transition: background-color 0.2s;
}

.upload-btn:hover {
    background-color: var(--color-gray-200);
}

.hidden-input {
    display: none;
}

.preview-title {
    font-family: var(--font-family-base);
    font-size: var(--font-headline-large-size);
    font-weight: 700;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--color-gray-300);
    color: var(--color-gray-900);
}

.markdown-body {
    font-family: var(--font-family-base);
    font-size: var(--font-body-large-size);
    line-height: 1.6;
    color: var(--color-gray-900);
}

/* Basic Markdown Styles */
:deep(.markdown-body img) {
    max-width: 100%;
    border-radius: 8px;
    margin: 12px 0;
}

:deep(.markdown-body h1),
:deep(.markdown-body h2),
:deep(.markdown-body h3) {
    margin-top: 24px;
    margin-bottom: 16px;
    font-weight: 600;
    color: var(--color-gray-900);
}

:deep(.markdown-body p) {
    margin-bottom: 16px;
}
</style>
