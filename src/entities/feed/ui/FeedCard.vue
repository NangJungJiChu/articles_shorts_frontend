<script setup lang="ts">
import { ref, computed } from 'vue'
import MarkdownIt from 'markdown-it'
import { Icon } from '@/shared/ui/icon'
import { toggleLikePost } from '@/features/post-interaction'
import { queryClient } from '@/shared/api'
import { postKeys } from '@/entities/post'
import { BottomSheet } from '@/shared/ui/bottom-sheet'
import { CommentList } from '@/features/comment'

interface Props {
    title: string
    author: string
    content: string
    likesCount: number
    commentsCount: number
    isLiked: boolean
    postId: number
}

const props = defineProps<Props>()

const md = new MarkdownIt({
    html: false, // Security: disable HTML tags
    breaks: true, // Convert \n to <br>
    linkify: true, // Autoconvert URL-like text to links
})

const localIsLiked = ref(props.isLiked)
const localLikesCount = ref(props.likesCount)

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
    return count > 999 ? `${(count / 1000).toFixed(1)}k` : count
}

const handleLike = async () => {
    // Optimistic Update
    const prevIsLiked = localIsLiked.value
    const prevCount = localLikesCount.value

    localIsLiked.value = !localIsLiked.value
    localLikesCount.value += localIsLiked.value ? 1 : -1

    try {
        const response = await toggleLikePost(props.postId)
        localIsLiked.value = response.is_liked
        localLikesCount.value = response.like_count

        queryClient.invalidateQueries({
            queryKey: postKeys.likedList({ page_size: 10 }),
        })
    } catch (error) {
        console.error('Like toggle failed:', error)
        // Rollback
        localIsLiked.value = prevIsLiked
        localLikesCount.value = prevCount
        alert('Failed to update like')
    }
}
</script>

<template>
    <article class="feed-card">
        <div class="post-header">
            <h2 class="post-title">{{ title }}</h2>
        </div>

        <!-- Markdown Content (Text + Images) -->
        <div class="post-content markdown-body" v-html="renderedContent"></div>

        <div class="post-footer">
            <button class="action-btn" @click="handleLike">
                <Icon name="favorite" :type="localIsLiked ? 'filled' : 'outlined'"
                    :class="{ 'is-liked': localIsLiked }" />
                <span class="count">{{ formatCount(localLikesCount) }}</span>
            </button>

            <BottomSheet>
                <template #trigger>
                    <button class="action-btn">
                        <Icon name="chat_bubble" />
                        <span class="count">{{ formatCount(commentsCount) }}</span>
                    </button>
                </template>
                <template #content>
                    <CommentList :postId="postId" />
                </template>
            </BottomSheet>

            <button class="action-btn more-btn">
                <Icon name="more_vert" />
            </button>
        </div>
    </article>
</template>

<style scoped>
.feed-card {
    width: 100%;
    max-width: 600px;
    background: var(--color-white);
    padding: 24px 0;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.post-header {
    padding: 0 16px;
}

.post-title {
    font-family: var(--font-family-base);
    font-size: 24px;
    font-weight: 700;
    color: #000;
    margin: 0;
}

/* Markdown Styles */
.post-content {
    padding: 0 16px;
    font-family: var(--font-family-base);
    font-size: 14px;
    line-height: 1.5;
    color: #333;
}

/* Ensure images in markdown fit the card */
:deep(img) {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    margin-top: 8px;
    background-color: #f0f0f0;
    /* Placeholder bg */
}

/* Allow paragraphs to have spacing */
:deep(p) {
    margin: 0 0 8px 0;
}

:deep(p:last-child) {
    margin-bottom: 0;
}

.post-footer {
    padding: 0 16px;
    display: flex;
    align-items: center;
    gap: 16px;
}

.action-btn {
    background: none;
    border: none;
    padding: 0;
    display: flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    color: #000;
}

.count {
    font-family: var(--font-family-base);
    font-size: 14px;
    font-weight: 500;
}

.more-btn {
    margin-left: auto;
}
</style>
