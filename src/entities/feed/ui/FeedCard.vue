<script setup lang="ts">
import { ref, toRef, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@/shared/ui/icon'
import { Modal } from '@/shared/ui/modal'
import { Button } from '@/shared/ui/button'
import { CommentList } from '@/features/comment'
import { postKeys } from '@/entities/post'
import { useMarkdown } from '@/entities/post/lib/useMarkdown'
import { usePostInteractions } from '@/entities/post/lib/usePostInteractions'
import { useViewTracking } from '@/entities/post/lib/useViewTracking'

interface Props {
  title: string
  author: string
  content: string
  likesCount: number
  commentsCount: number
  isLiked: boolean
  postId: number
  disableViewTracking?: boolean
  authorProfileImage?: string
}

const emit = defineEmits<{
  (e: 'remove', id: number): void
}>()

const props = defineProps<Props>()
const router = useRouter()

// Refs for composables
const cardRef = ref<HTMLElement | null>(null)
const contentRef = ref<HTMLElement | null>(null)
const showShareTooltip = ref(false)

const handleShare = async () => {
  const url = `${window.location.origin}/posts/${props.postId}`
  try {
    await navigator.clipboard.writeText(url)
    showShareTooltip.value = true
    setTimeout(() => {
      showShareTooltip.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy link:', err)
  }
}

// 1. Post Interactions (Like, Delete, etc.)
// Passing invalidation keys for both general lists and the liked list
const {
  localIsLiked,
  localLikesCount,
  isMenuModalOpen,
  isCommentModalOpen,
  isAuthor,
  handleLike,
  handleReport,
  handleNotInterested,
  handleDelete
} = usePostInteractions(props, [postKeys.likedList({ page_size: 10 })])

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
  isMenuModalOpen.value = false
  const success = await handleDelete()
  if (success) {
    emit('remove', props.postId)
  }
}

const isReasonModalOpen = ref(false)
const reportReason = ref('')

const handleOpenReasonModal = () => {
  isMenuModalOpen.value = false
  isReasonModalOpen.value = true
}

const handleCloseReasonModal = () => {
  isReasonModalOpen.value = false
  reportReason.value = ''
}

// 2. Markdown Rendering
const { renderedContent } = useMarkdown(toRef(props, 'content'), contentRef)

// 3. View Tracking
useViewTracking(props.postId, cardRef, () => !props.disableViewTracking)

// 4. Local Comment Count (Optimistic Update)
const localCommentsCount = ref(props.commentsCount)

watch(() => props.commentsCount, (newCount) => {
  localCommentsCount.value = newCount
})

const handleCommentAdded = () => {
  localCommentsCount.value++
}

// --- Helper ---
const formatCount = (count: number | string) => {
  const num = Number(count)
  if (isNaN(num)) return count
  return num > 999 ? `${(num / 1000).toFixed(1)}k` : num
}
</script>

<template>
  <article ref="cardRef" class="feed-card">
    <!-- 1. Content Area -->
    <div ref="contentRef" class="feed-content-wrapper">
      <header class="post-header">
        <div class="author-info">
          <img v-if="authorProfileImage" :src="authorProfileImage" alt="Author" class="author-avatar" />
          <div v-else class="author-avatar placeholder"></div>
          <span class="author-name">{{ author }}</span>
        </div>
        <h2 class="post-title">{{ title }}</h2>
      </header>
      <div class="post-content markdown-body" v-html="renderedContent"></div>
    </div>

    <!-- 2. Interaction Footer -->
    <footer class="post-footer">
      <!-- Like Button -->
      <button class="action-btn" @click="handleLike">
        <Icon name="favorite" :type="localIsLiked ? 'filled' : 'outlined'" :class="{ 'is-liked': localIsLiked }" />
        <span class="count">{{ formatCount(localLikesCount) }}</span>
      </button>

      <!-- Comment Button -->
      <button class="action-btn" @click="isCommentModalOpen = true">
        <Icon name="chat_bubble" />
        <span class="count">{{ formatCount(localCommentsCount) }}</span>
      </button>

      <!-- Share Button -->
      <div class="share-container">
        <button class="action-btn share-btn" @click="handleShare">
          <Icon name="send" />
        </button>
        <Transition name="fade">
          <div v-if="showShareTooltip" class="share-tooltip">
            <Icon name="check_circle" size="small" />
            링크 복사 완료
          </div>
        </Transition>
      </div>

      <!-- More Options Button -->
      <button class="action-btn more-btn" @click="isMenuModalOpen = true">
        <Icon name="more_vert" />
      </button>
    </footer>

    <!-- 3. Modals -->
    <!-- Comment Modal -->
    <Modal :isOpen="isCommentModalOpen" title="댓글" @close="isCommentModalOpen = false">
      <CommentList :postId="postId" @comment-added="handleCommentAdded" @comment-deleted="localCommentsCount--" />
    </Modal>

    <!-- More Options Modal -->
    <!-- More Options Modal -->
    <Modal :isOpen="isMenuModalOpen" title="더보기" @close="isMenuModalOpen = false">
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
    <Modal :isOpen="isReasonModalOpen" title="신고 사유 입력" @close="handleCloseReasonModal">
      <div class="report-reason-container">
        <textarea v-model="reportReason" class="reason-input" placeholder="신고 사유를 입력해주세요..."></textarea>
        <div class="report-actions">
          <Button variant="secondary" @click="handleCloseReasonModal">
            취소
          </Button>
          <Button variant="primary" :disabled="!reportReason.trim()" @click="onReport">
            신고
          </Button>
        </div>
      </div>
    </Modal>
  </article>
</template>

<style scoped>
.feed-card {
  width: 100%;
  max-width: 610px;
  background: var(--color-white);
  padding: 24px 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  border-bottom: 1px solid var(--color-gray-100);
}

/* Content Area */
.feed-content-wrapper {
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
  color: var(--color-black);
  margin: 0;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.author-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  background-color: var(--color-gray-200);
}

.author-avatar.placeholder {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--color-gray-300);
}

.author-name {
  font-family: var(--font-family-base);
  font-size: 14px;
  font-weight: 600;
  color: var(--color-gray-900);
}

.post-content {
  padding: 0 16px;
  font-family: var(--font-family-base);
  font-size: 14px;
  line-height: 1.5;
  color: var(--color-gray-800);
  word-wrap: break-word;
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

/* Interaction Footer */
.post-footer {
  padding: 0 16px;
  display: flex;
  align-items: center;
  gap: 20px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-gray-900);
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.action-btn:hover {
  background-color: var(--color-gray-50);
}

.action-btn .icon.is-liked {
  color: var(--color-danger);
  /* Changed to use token if available, or keep custom red? colors.css has danger: #df0b0b */
}

.count {
  font-family: var(--font-family-base);
  font-size: 14px;
  font-weight: 600;
}

.more-btn {
  margin-left: auto;
}

/* Modal Menu Items */
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

/* Share Tooltip Styles */
.share-container {
  position: relative;
  display: flex;
  align-items: center;
}

.share-tooltip {
  position: absolute;
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--color-blue-900);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  pointer-events: none;
  z-index: 10;
}

.share-tooltip::after {
  content: '';
  position: absolute;
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid var(--color-blue-900);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(10px);
}
</style>
