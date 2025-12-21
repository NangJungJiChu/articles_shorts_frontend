<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import MarkdownIt from 'markdown-it'
import { Icon } from '@/shared/ui/icon'
import { Modal } from '@/shared/ui/modal'
import { CommentList } from '@/features/comment'
import { toggleLikePost } from '@/features/post-interaction'

interface Props {
    title: string
    content: string
    likesCount?: number | string
    commentsCount?: number | string
    isLiked?: boolean
    postId: number
}

const props = withDefaults(defineProps<Props>(), {
    likesCount: 0,
    commentsCount: 0,
    isLiked: false,
})

const localIsLiked = ref(props.isLiked)
const localLikesCount = ref(Number(props.likesCount))
const isReportModalOpen = ref(false)
const isCommentModalOpen = ref(false)

watch(() => props.isLiked, (val) => localIsLiked.value = val)
watch(() => props.likesCount, (val) => localLikesCount.value = Number(val))

const md = new MarkdownIt({
    html: false,
    breaks: true,
    linkify: true,
})

const renderedContent = computed(() => {
    // Replace /media/ with full URL for preview
    const rendered = md.render(props.content)
    const s3BaseUrl = import.meta.env.VITE_S3_BASE_URL || 'https://njjc-media.s3.ap-northeast-2.amazonaws.com'

    let updated = rendered.replace(/src="\/media\/([^"]+)"/g, `src="${s3BaseUrl}/$1"`)
    updated = updated.replace(/src="(?!(http|\/))([^"]+)"/g, `src="${s3BaseUrl}/$2"`)

    return updated
})

const formatCount = (count: number | string) => {
    if (typeof count === 'string') return count
    return new Intl.NumberFormat('en-US', {
        notation: 'compact',
        maximumFractionDigits: 1
    }).format(count)
}

const handleLike = async () => {
    const prevIsLiked = localIsLiked.value
    const prevCount = localLikesCount.value

    localIsLiked.value = !localIsLiked.value
    localLikesCount.value += localIsLiked.value ? 1 : -1

    try {
        const response = await toggleLikePost(props.postId)
        localIsLiked.value = response.is_liked
        localLikesCount.value = response.like_count
    } catch (error) {
        console.error('Like toggle failed:', error)
        localIsLiked.value = prevIsLiked
        localLikesCount.value = prevCount
        alert('Failed to like post')
    }
}

const handleReport = () => {
    alert('신고가 접수되었습니다.')
    isReportModalOpen.value = false
}

const isExpanded = ref(false)
const isOverflowing = ref(false)
const contentRef = ref<HTMLElement | null>(null)

const toggleExpand = () => {
    if (isOverflowing.value) {
        isExpanded.value = !isExpanded.value
    }
}

const checkOverflow = () => {
    const el = contentRef.value
    if (el) {
        isOverflowing.value = el.scrollHeight > el.clientHeight
    }
}

watch(isExpanded, (newVal) => {
    if (!newVal && contentRef.value) {
        contentRef.value.scrollTop = 0
    }
})


// Watch rendered content changes to attach load listeners to new images
watch(renderedContent, () => {
    nextTick(() => {
        if (!contentRef.value) return

        const images = contentRef.value.querySelectorAll('img')
        images.forEach((img) => {
            if (img.complete) {
                checkOverflow()
            } else {
                img.addEventListener('load', checkOverflow)
            }
        })
        // Initial check
        checkOverflow()
    })
}, { immediate: true })

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
    // Use ResizeObserver to detect size changes (images loading, window resize, etc.)
    if (contentRef.value) {
        resizeObserver = new ResizeObserver(() => {
            checkOverflow()
        })
        resizeObserver.observe(contentRef.value)
    }
})

onUnmounted(() => {
    if (resizeObserver) {
        resizeObserver.disconnect()
    }
})
</script>

<template>
    <article class="shorts-card" :class="{ 'is-expanded': isExpanded, 'is-overflowing': isOverflowing }"
        @click="toggleExpand">

        <div class="shorts-content-wrapper" ref="contentRef">
            <div class="post-header">
                <h2 class="post-title">{{ title }}</h2>
            </div>
            <div class="post-content markdown-body" v-html="renderedContent"></div>
        </div>

        <!-- Right Interaction Bar -->
        <div class="actions-container" @click.stop>
            <button class="action-btn" @click="handleLike">
                <Icon name="favorite" :type="localIsLiked ? 'filled' : 'outlined'"
                    :class="{ 'is-liked': localIsLiked }" />
                <span class="count">{{ formatCount(localLikesCount) }}</span>
            </button>

            <button class="action-btn" @click.stop="isCommentModalOpen = true">
                <Icon name="chat_bubble" />
                <span class="count">{{ formatCount(commentsCount) }}</span>
            </button>

            <Modal :isOpen="isCommentModalOpen" title="댓글" @close="isCommentModalOpen = false">
                <CommentList :postId="postId" />
            </Modal>

            <button class="action-btn more-btn" @click.stop="isReportModalOpen = true">
                <Icon name="more_vert" />
            </button>

            <Modal :isOpen="isReportModalOpen" title="더보기" @close="isReportModalOpen = false">
                <button class="menu-item" @click="handleReport">
                    <Icon name="report" />
                    <span>신고하기</span>
                </button>
            </Modal>
        </div>

        <!-- Overlay "Tap to expand" shown only when overflowed and NOT expanded -->
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

.shorts-content-wrapper {
    height: 100%;
    padding: 24px 16px;
    padding-bottom: calc(58px + 24px);
    overflow: hidden;
    box-sizing: border-box;
}

/* Expanded State */
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
    color: #000;
    margin: 0;
}

.post-content {
    font-family: var(--font-family-base);
    font-size: 14px;
    line-height: 1.5;
    color: #333;
    padding-bottom: 40px;
}

/* Markdown Image Sizing */
:deep(img) {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    margin-top: 8px;
    background-color: #f0f0f0;
}

:deep(p) {
    margin: 0 0 8px 0;
    line-height: var(--font-body-large-line-height);
}

:deep(p:last-child) {
    margin-bottom: 0;
}

/* Overlay Styles */
.expand-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: calc(120px + 58px);
    background: linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding-bottom: 24px;
    pointer-events: none;
}

.expand-text {
    font-family: var(--font-family-base);
    font-size: 14px;
    font-weight: 600;
    color: #000;
}

/* Interaction Bar Styles */
.actions-container {
    position: absolute;
    bottom: 50%;
    right: 16px;
    display: flex;
    flex-direction: column;
    gap: 24px;
    align-items: center;
    z-index: 10;
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

.count {
    font-size: 12px;
    font-weight: 600;
}

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
</style>
