<script setup lang="ts">
import { ref, toRef } from 'vue'
import { Icon } from '@/shared/ui/icon'
import { Modal } from '@/shared/ui/modal'
import { CommentList } from '@/features/comment'
import { useMarkdown } from '@/entities/post/lib/useMarkdown'
import { usePostInteractions } from '@/entities/post/lib/usePostInteractions'
import { useExpansion } from '../lib/useExpansion'
import { useViewTracking } from '@/entities/post/lib/useViewTracking'

interface Props {
    title: string
    content: string
    likesCount?: number | string
    commentsCount?: number | string
    isLiked?: boolean
    postId: number
    author: string
}

const props = withDefaults(defineProps<Props>(), {
    likesCount: 0,
    commentsCount: 0,
    isLiked: false,
})

// Refs for composables
const cardRef = ref<HTMLElement | null>(null)
const contentRef = ref<HTMLElement | null>(null)

// 1. Post Interactions (Like, Delete, Report, etc.)
const {
    localIsLiked,
    localLikesCount,
    isReportModalOpen,
    isCommentModalOpen,
    isAuthor,
    handleLike,
    handleReport,
    handleNotInterested,
    handleDelete
} = usePostInteractions(props)

// 2. Expansion Logic
const {
    isExpanded,
    isOverflowing,
    checkOverflow,
    toggleExpand
} = useExpansion(contentRef)

// 3. Markdown Rendering & Image Tracking
const { renderedContent } = useMarkdown(toRef(props, 'content'), contentRef, checkOverflow)

// 4. View Tracking
useViewTracking(props.postId, cardRef)

// --- Helper ---
const formatCount = (count: number | string) => {
    if (typeof count === 'string') return count
    return new Intl.NumberFormat('en-US', {
        notation: 'compact',
        maximumFractionDigits: 1
    }).format(Number(count))
}
</script>

<template>
    <article
        ref="cardRef"
        class="shorts-card"
        :class="{ 'is-expanded': isExpanded, 'is-overflowing': isOverflowing }"
        @click="toggleExpand"
    >
        <!-- 1. Content Area -->
        <div ref="contentRef" class="shorts-content-wrapper">
            <header class="post-header">
                <h2 class="post-title">{{ title }}</h2>
            </header>
            <div class="post-content markdown-body" v-html="renderedContent"></div>
        </div>

        <!-- 2. Interaction Bar -->
        <div class="actions-container" @click.stop>
            <!-- Like Button -->
            <button class="action-btn" @click="handleLike">
                <Icon
                    name="favorite"
                    :type="localIsLiked ? 'filled' : 'outlined'"
                    :class="{ 'is-liked': localIsLiked }"
                />
                <span class="count">{{ formatCount(localLikesCount) }}</span>
            </button>

            <!-- Comment Button -->
            <button class="action-btn" @click.stop="isCommentModalOpen = true">
                <Icon name="chat_bubble" />
                <span class="count">{{ formatCount(commentsCount) }}</span>
            </button>

            <!-- More Options Button -->
            <button class="action-btn more-btn" @click.stop="isReportModalOpen = true">
                <Icon name="more_vert" />
            </button>
        </div>

        <!-- 3. Modals -->
        <!-- Comment Modal -->
        <Modal
            :isOpen="isCommentModalOpen"
            title="댓글"
            @close="isCommentModalOpen = false"
        >
            <CommentList :postId="postId" />
        </Modal>

        <!-- More Options Modal -->
        <Modal
            :isOpen="isReportModalOpen"
            title="더보기"
            @close="isReportModalOpen = false"
        >
            <button v-if="isAuthor" class="menu-item delete-btn" @click="handleDelete">
                <Icon name="delete" />
                <span>삭제하기</span>
            </button>
            <button class="menu-item" @click="handleReport">
                <Icon name="report" />
                <span>신고하기</span>
            </button>
            <button class="menu-item" @click="handleNotInterested">
                <Icon name="visibility_off" />
                <span>관심없음</span>
            </button>
        </Modal>

        <!-- 4. Overlays -->
        <div v-if="isOverflowing && !isExpanded" class="expand-overlay">
            <span class="expand-text">Tap to expand</span>
        </div>
    </article>
</template>

<style scoped>
.shorts-card {
    position: relative;
    width: 100%;
    height: 100dvh;
    background: var(--color-white);
    overflow: hidden;
    cursor: pointer;
}

/* Content Area */
.shorts-content-wrapper {
    height: 100%;
    padding: 24px 16px;
    padding-bottom: calc(58px + 104px); /* Space for expansion overlay & interaction padding */
    overflow: hidden;
    box-sizing: border-box;
}

.shorts-card.is-expanded .shorts-content-wrapper {
    overflow-y: auto;
    -ms-overflow-style: none;
    scrollbar-width: none;
}

.shorts-card.is-expanded .shorts-content-wrapper::-webkit-scrollbar {
    display: none;
}

.post-header {
    margin-bottom: 16px;
}

.post-title {
    font-family: var(--font-family-base);
    font-size: 24px;
    font-weight: 700;
    color: var(--color-black, #000);
    margin: 0;
}

.post-content {
    font-family: var(--font-family-base);
    font-size: 14px;
    line-height: 1.5;
    color: var(--color-gray-800, #333);
    padding-bottom: 40px;
}

/* Markdown Specifics */
:deep(img) {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    margin-top: 8px;
    background-color: var(--color-gray-100, #f0f0f0);
}

:deep(p) {
    margin: 0 0 8px 0;
    line-height: var(--font-body-large-line-height, 1.5);
}

:deep(p:last-child) {
    margin-bottom: 0;
}

/* Interaction Bar */
.actions-container {
    position: absolute;
    bottom: 50%;
    right: 16px;
    display: flex;
    flex-direction: column;
    gap: 24px;
    align-items: center;
    z-index: 10;
    transform: translateY(50%);
}

.action-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    background: none;
    border: none;
    cursor: pointer;
    color: var(--color-gray-900);
}

.action-btn .icon {
    font-size: 32px;
}

.action-btn .icon.is-liked {
    color: var(--color-red-500, #ff4d4f);
}

.count {
    font-size: 12px;
    font-weight: 600;
}

/* Modals & Menu Items */
.menu-item {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    padding: 12px;
    background: none;
    border: none;
    font-size: 16px;
    cursor: pointer;
    border-radius: 8px;
    transition: background-color 0.2s;
    color: var(--color-gray-900);
}

.menu-item:hover {
    background-color: var(--color-gray-100, #f5f5f5);
}

.menu-item.delete-btn {
    color: var(--color-red-500, #ff4d4f);
}

/* Overlays */
.expand-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 120px;
    background: linear-gradient(to bottom, transparent 0%, var(--color-white) 100%);
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding-bottom: 24px;
    pointer-events: none;
}

.expand-text {
    font-family: var(--font-family-base);
    font-size: 14px;
    font-weight: 600;
    color: var(--color-gray-900);
}
</style>
