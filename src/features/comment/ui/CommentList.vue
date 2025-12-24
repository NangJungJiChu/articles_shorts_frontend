<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCommentListQuery, useCreateCommentMutation } from '@/features/comment'
import { Icon } from '@/shared/ui/icon'

const props = defineProps<{
    postId: number
}>()

const newComment = ref('')
const { data: commentData, isLoading } = useCommentListQuery(props.postId)
const { mutate: addComment, isPending: isSubmitting } = useCreateCommentMutation()

const comments = computed(() => {
    const list = commentData.value?.comments ? [...commentData.value.comments] : []
    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
})

const emit = defineEmits<{
    (e: 'comment-added'): void
}>()

const handleSubmit = () => {
    if (!newComment.value.trim()) return

    addComment(
        { postId: props.postId, content: newComment.value },
        {
            onSuccess: () => {
                newComment.value = ''
                emit('comment-added')
            }
        }
    )
}

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
}
</script>

<template>
    <div class="comment-list-container">
        <!-- Input Area -->
        <form class="comment-input-area" @submit.prevent="handleSubmit">
            <input v-model="newComment" type="text" placeholder="댓글을 입력하세요..." class="comment-input" :disabled="isSubmitting" />
            <button class="send-btn" :disabled="!newComment.trim() || isSubmitting">
                <Icon name="send" />
            </button>
        </form>

        <!-- List Area -->
        <div class="comments-scroll-area">
            <div v-if="isLoading" class="loading-state">
                Loading...
            </div>

            <div v-else-if="comments.length === 0" class="empty-state">
                첫 번째 댓글을 남겨보세요!
            </div>

            <ul v-else class="comment-items">
                <li v-for="comment in comments" :key="comment.id" class="comment-item">
                    <div class="comment-header">
                        <span class="author">{{ comment.author_username }}</span>
                        <span class="date">{{ formatDate(comment.created_at) }}</span>
                    </div>
                    <p class="content">{{ comment.content }}</p>
                </li>
            </ul>
        </div>
    </div>
</template>

<style scoped>
.comment-list-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 0 16px;
}

.comment-input-area {
  background-color: var(--color-white, #fff);
  position: sticky;
  top: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 0;
  border-bottom: 1px solid #eee;
  margin-bottom: 16px;
}

.comment-input {
    flex: 1;
    padding: 10px 14px;
    border: 1px solid #ddd;
    border-radius: 20px;
    font-size: 14px;
    outline: none;
}

.comment-input:focus {
    border-color: var(--color-blue-500);
}

.send-btn {
    background: none;
    border: none;
    color: var(--color-blue-500);
    cursor: pointer;
    padding: 4px;
}

.send-btn:disabled {
    color: var(--color-gray-400);
    cursor: not-allowed;
}

.comments-scroll-area {
    flex: 1;
    overflow-y: auto;
    padding-bottom: 20px;
}

.comment-item {
    margin-bottom: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid #f5f5f5;
}

.comment-header {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: var(--color-gray-500);
    margin-bottom: 4px;
}

.author {
    font-weight: 600;
    color: #333;
}

.content {
    font-size: 14px;
    line-height: 1.5;
    color: #444;
}

.loading-state,
.empty-state {
    text-align: center;
    padding: 40px 0;
    color: var(--color-gray-500);
    font-size: 14px;
}
</style>
