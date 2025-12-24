<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import { Icon } from '@/shared/ui/icon'
import { Combobox } from '@/shared/ui/combobox'
import { Button } from '@/shared/ui/button'

import { useCategorySelect } from '../model/useCategorySelect'
import { useMarkdownEditor } from '../model/useMarkdownEditor'
import { useImageHandler } from '../model/useImageHandler'
import { usePostSubmit } from '../model/usePostSubmit'

const router = useRouter()
const activeTab = ref<'write' | 'preview'>('write')
const title = ref('')

// 1. Category Logic
const { categoryId, categoryOptions } = useCategorySelect()

// 2. Editor Logic
const { content, textareaRef, parsedContent, insertContent } = useMarkdownEditor()

// 3. Image Logic
const {
    isUploading,
    fileInput,
    pendingImages,
    handleImageUpload,
    handlePaste,
    triggerFileUpload
} = useImageHandler(insertContent)

// 4. Submission Logic
const { isSubmitting, submitPost } = usePostSubmit({
    title,
    content,
    categoryId,
    pendingImages
})

const handleBack = () => {
    router.back()
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
                    @click="submitPost"
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
                <div class="upload-actions">
                    <Button
                        variant="secondary"
                        size="small"
                        @click="triggerFileUpload"
                        :disabled="isUploading || isSubmitting"
                        class="upload-btn"
                    >
                        <div class="btn-content">
                            <Icon name="image" />
                            <span>{{ isUploading ? '업로드 중...' : '이미지 추가' }}</span>
                        </div>
                    </Button>
                </div>
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

/* Header Section */
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
    width: 80px;
    display: flex;
    justify-content: flex-end;
}

/* Tabs Section */
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
    font-weight: 500;
    color: var(--color-gray-600);
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: color 0.2s, border-color 0.2s;
}

.tab-btn.active {
    color: var(--color-blue-600);
    border-bottom-color: var(--color-blue-600);
}

/* Main Container Styles */
.write-container,
.preview-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 16px;
    padding-bottom: 58px; /* Safe area for bottom nav/actions if needed */
    overflow-y: auto;
}

/* Write Mode Styles */
.input-group {
    margin-bottom: 16px;
}

.title-input {
    width: 100%;
    padding: 12px 0;
    font-family: var(--font-family-base);
    font-size: var(--font-headline-small-size);
    font-weight: 600;
    border: none;
    border-bottom: 1px solid var(--color-gray-300);
    outline: none;
    color: var(--color-gray-900);
    background: transparent;
}

.title-input::placeholder {
    color: var(--color-gray-400);
}

.editor-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    position: relative;
    gap: 16px;
    margin-bottom: 20px;
}

.content-editor {
    flex: 1;
    width: 100%;
    resize: none;
    border: none;
    outline: none;
    font-family: var(--font-family-base);
    font-size: var(--font-body-large-size);
    line-height: 1.6;
    color: var(--color-gray-900);
    background: transparent;
}

.content-editor::placeholder {
    color: var(--color-gray-400);
}

/* Image Upload Styles */
.upload-actions {
    display: flex;
    justify-content: flex-start;
    width: 140px;
}


.btn-content {
    display: flex;
    align-items: center;
    gap: 8px;
}

.hidden-input {
    display: none;
}

/* Preview Mode Styles */
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

/* Deep Styles for Markdown Content */
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
