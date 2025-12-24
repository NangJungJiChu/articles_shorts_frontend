<script setup lang="ts">
import { ref, toRef, watch } from 'vue'
import { Icon } from '@/shared/ui/icon'
import { Modal } from '@/shared/ui/modal'
import { Button } from '@/shared/ui/button'
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

const emit = defineEmits<{
    (e: 'remove', id: number): void
}>()

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

const onReport = async () => {
    const success = await handleReport(reportReason.value)
    handleCloseReasonModal()
    if (success) {
        emit('remove', props.postId)
    }
}

const onNotInterested = async () => {
    const success = await handleNotInterested()
    if (success) {
        emit('remove', props.postId)
    }
}

const onDelete = async () => {
    const success = await handleDelete()
    if (success) {
        emit('remove', props.postId)
    }
}

const isReasonModalOpen = ref(false)
const reportReason = ref('')

const handleOpenReasonModal = () => {
    isReportModalOpen.value = false
    isReasonModalOpen.value = true
}

const handleCloseReasonModal = () => {
    isReasonModalOpen.value = false
    reportReason.value = ''
}

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

// 5. Local Comment Count (Optimistic Update)
const localCommentsCount = ref(Number(props.commentsCount))

watch(() => props.commentsCount, (newCount) => {
    localCommentsCount.value = Number(newCount)
})

const handleCommentAdded = () => {
    localCommentsCount.value++
}

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
                    class="icon"
                    name="favorite"
                    :type="localIsLiked ? 'filled' : 'outlined'"
                />
                <span class="count">{{ formatCount(localLikesCount) }}</span>
            </button>

            <!-- Comment Button -->
            <button class="action-btn" @click.stop="isCommentModalOpen = true">
                <Icon name="chat_bubble" class="icon" />
                <span class="count">{{ formatCount(localCommentsCount) }}</span>
            </button>

            <!-- More Options Button -->
            <button class="action-btn more-btn" @click.stop="isReportModalOpen = true">
                <Icon name="more_vert" class="icon" />
            </button>
        </div>

        <!-- 3. Modals -->
        <!-- Comment Modal -->
        <Modal
            :isOpen="isCommentModalOpen"
            title="댓글"
            @close="isCommentModalOpen = false"
        >
            <CommentList :postId="postId" @comment-added="handleCommentAdded" />
        </Modal>

        <Modal
            :isOpen="isReportModalOpen"
            title="더보기"
            @close="isReportModalOpen = false"
        >
            <div class="menu-list">
                <button v-if="isAuthor" class="menu-item delete-btn" @click="onDelete">
                    <Icon name="delete" />
                    <span>삭제하기</span>
                </button>
                <button class="menu-item" @click="handleOpenReasonModal">
                    <Icon name="report" />
                    <span>신고/차단하기</span>
                </button>
                <button class="menu-item" @click="onNotInterested">
                    <Icon name="visibility_off" />
                    <span>관심없음</span>
                </button>
            </div>
        </Modal>

        <!-- Report Reason Modal -->
        <Modal
            :isOpen="isReasonModalOpen"
            title="신고 사유 입력"
            @close="handleCloseReasonModal"
        >
            <div class="report-reason-container">
                <textarea
                    v-model="reportReason"
                    class="reason-input"
                    placeholder="신고 사유를 입력해주세요..."
                ></textarea>
                <div class="report-actions">
                    <Button variant="secondary" @click="handleCloseReasonModal">
                        취소
                    </Button>
                    <Button
                        variant="primary"
                        :disabled="!reportReason.trim()"
                        @click="onReport"
                    >
                        신고
                    </Button>
                </div>
            </div>
        </Modal>

        <!-- 4. Overlays -->
        <div v-if="isOverflowing && !isExpanded" class="expand-overlay">
            <span class="expand-text body-large-emphasize">Tap to expand</span>
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
    color: var(--color-black);
    margin: 0;
}

.post-content {
    font-family: var(--font-family-base);
    font-size: 14px;
    line-height: 1.5;
    color: var(--color-gray-800);
    padding-bottom: 40px;
}

/* Markdown Specifics */
:deep(img) {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    margin-top: 8px;
    background-color: var(--color-gray-100);
}

:deep(p) {
    margin: 0 0 8px 0;
    line-height: var(--font-body-large-line-height);
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
    color: var(--color-white);
    transition: transform 0.2s;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
}

.action-btn:active {
    transform: scale(0.9);
}

.action-btn .icon {
    font-size: 32px;
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
    background-color: var(--color-gray-100);
}

.menu-item.delete-btn {
    color: var(--color-danger);
}

/* Report Reason Styling */
.report-reason-container {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.reason-input {
    width: 100%;
    height: 120px;
    padding: 12px;
    border: 1px solid var(--color-gray-300);
    border-radius: 8px;
    resize: none;
    font-family: var(--font-family-base);
    font-size: var(--font-body-medium-size);
    box-sizing: border-box;
    color: var(--color-gray-900);
}

.reason-input::placeholder {
    color: var(--color-gray-500);
}

.report-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
}

/* Overlays */
.expand-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 120px;
    background: linear-gradient(to bottom, transparent 0%, var(--color-gray-200) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding-bottom: 58px;
    pointer-events: none;
}

.expand-text {
    color: var(--color-white);
    text-shadow: 0 2px 2px rgba(0, 0, 0, 0.5);
}
</style>
