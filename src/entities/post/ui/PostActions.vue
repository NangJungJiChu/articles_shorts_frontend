<script setup lang="ts">
import { ThumbsUp, MessageCircle, Send, Bookmark, ThumbsDown } from 'lucide-vue-next'

defineProps<{
  likes: number
  dislikes: number
}>()
</script>

<template>
  <div class="post-actions">
    <div class="left-actions">
      <button class="action-btn">
        <ThumbsUp :size="24" />
        <span v-if="likes > 0" class="count">{{ likes }}</span>
      </button>
      <button class="action-btn">
        <ThumbsDown :size="24" />
        <span v-if="dislikes > 0" class="count">{{ dislikes }}</span>
      </button>
      <button class="action-btn">
        <MessageCircle :size="24" />
      </button>
      <button class="action-btn">
        <Send :size="24" />
      </button>
    </div>
    <div class="right-actions">
      <button class="action-btn">
        <Bookmark :size="24" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.post-actions {
  display: flex;
  justify-content: space-between;
  padding: 6px 16px;
}

.left-actions {
  display: flex;
  gap: 16px;
}

.action-btn {
  padding: 8px 0;
  color: var(--color-text);
  transition: opacity 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.count {
  font-size: 14px;
  font-weight: 600;
  line-height: 1; /* Ensure line height doesn't throw off alignment */
  margin-top: 2px; /* Slight adjustment for visual centering with icon */
}
</style>
