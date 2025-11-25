<script setup lang="ts">
import { MoreHorizontal } from 'lucide-vue-next'

defineProps<{
  author: string
  createdAt: string
}>()
</script>

<template>
  <div class="post-header">
    <div class="user-info">
      <span class="username">{{ author }}</span>
      <span class="time">• {{ createdAt }}</span>
    </div>
    <button class="more-btn">
      <MoreHorizontal :size="20" />
    </button>
  </div>
</template>

<style scoped>
.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.username {
  font-weight: 600;
  font-size: 14px;
}

.time {
  color: var(--color-text-secondary);
  font-size: 14px;
}

.more-btn {
  color: var(--color-text);
}
</style>
