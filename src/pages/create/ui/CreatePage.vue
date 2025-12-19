<script setup lang="ts">
import { ref, computed, nextTick, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import MarkdownIt from 'markdown-it'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Icon } from '@/shared/ui/icon'
import { Combobox } from '@/shared/ui/combobox'
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
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
    return rendered.replace(/src="\/media\//g, `src="${baseUrl}/media/`)
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

const uploadAndInsert = async (file: File) => {
    try {
        isUploading.value = true
        const response = await uploadImage(file)

        // Insert markdown image syntax
        const imageMarkdown = `![](${response.url})\n`
        await insertContent(imageMarkdown)

    } catch (error) {
        console.error('Image upload failed:', error)
        alert('Failed to upload image')
    } finally {
        isUploading.value = false
    }
}

const handleImageUpload = async (event: Event) => {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (!file) return

    await uploadAndInsert(file)
    if (fileInput.value) fileInput.value.value = ''
}

const handlePaste = async (event: ClipboardEvent) => {
    const items = event.clipboardData?.items
    if (!items) return

    for (const item of items) {
        if (item.type.indexOf('image/') !== -1) {
            const file = item.getAsFile()
            if (file) {
                event.preventDefault() // Prevent default paste behavior
                await uploadAndInsert(file)
                return // Only upload the first image found
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

const handleComplete = () => {
    if (!title.value.trim() || !content.value.trim()) {
        alert('제목과 내용을 모두 입력해주세요.')
        return
    }

    if (!categoryId.value) {
        alert('카테고리를 선택해주세요.')
        return
    }

    createPost(
        {
            title: title.value,
            body: content.value,
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
            <button class="complete-btn" @click="handleComplete" :disabled="isSubmitting">
                {{ isSubmitting ? '작성 중...' : '완료' }}
            </button>
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
                <input ref="fileInput" type="file" accept="image/*" class="hidden-input" @change="handleImageUpload" />
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
    border-bottom: 1px solid #e0e0e0;
}

.nav-btn {
    background: none;
    border: none;
    padding: 4px;
    cursor: pointer;
}

.page-title {
    font-size: 18px;
    font-weight: 600;
}

.complete-btn {
    background: none;
    border: none;
    color: var(--color-blue-600);
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
}

.tabs {
    display: flex;
    border-bottom: 1px solid #e0e0e0;
}

.tab-btn {
    flex: 1;
    padding: 12px;
    background: none;
    border: none;
    font-size: 14px;
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
    font-size: 20px;
    font-weight: 600;
    border: none;
    border-bottom: 1px solid #e0e0e0;
    outline: none;
    margin-bottom: 16px;
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
    font-size: 16px;
    line-height: 1.5;
    padding-bottom: 60px;
    /* Space for upload button */
}

.upload-btn {
    position: absolute;
    bottom: 0;
    left: 0;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background-color: var(--color-gray-100);
    border: 1px solid #e0e0e0;
    border-radius: 20px;
    cursor: pointer;
    font-size: 14px;
}

.hidden-input {
    display: none;
}

.preview-title {
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 24px;
    padding-bottom: 12px;
    border-bottom: 1px solid #e0e0e0;
}

.markdown-body {
    font-size: 16px;
    line-height: 1.6;
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
}

:deep(.markdown-body p) {
    margin-bottom: 16px;
}
</style>
