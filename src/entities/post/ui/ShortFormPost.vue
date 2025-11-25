<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Post } from '../model/types'
import { ThumbsUp, MessageCircle, Send, MoreHorizontal, Bookmark, ThumbsDown } from 'lucide-vue-next'
import { parseContentTokens } from '../lib/parseContentTokens'

const props = defineProps<{
  post: Post
}>()

const isExpanded = ref(false)
const contentContainerRef = ref<HTMLDivElement | null>(null)
const parsedContent = computed(() => parseContentTokens(props.post.content))

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
  
  // expanded가 해제될 때 스크롤을 맨 위로 초기화
  if (!isExpanded.value && contentContainerRef.value) {
    contentContainerRef.value.scrollTop = 0
  }
}
</script>

<template>
  <article class="short-form-post" @click="toggleExpanded">
    <div 
      ref="contentContainerRef"
      class="content-container" 
      :class="{ 'expanded': isExpanded }"
    >
      <div class="text-content">
        <span class="category-tag">{{ post.category }}</span>
        <h2 class="post-title">{{ post.title }}</h2>
        <div class="post-body" v-html="parsedContent"></div>
      </div>
      <!-- Gradient overlay when not expanded -->
      <div v-if="!isExpanded" class="gradient-overlay"></div>
    </div>

    <!-- Right Side Actions -->
    <div class="actions-column" @click.stop>
      <button class="action-btn">
        <ThumbsUp :size="32" />
        <span class="count">{{ post.likes }}</span>
      </button>
      <button class="action-btn">
        <ThumbsDown :size="32" />
        <span class="count">{{ post.dislikes }}</span>
      </button>
      <button class="action-btn">
        <MessageCircle :size="32" />
        <span class="count">{{ post.comments }}</span>
      </button>
      <button class="action-btn">
        <Bookmark :size="32" />
      </button>
      <button class="action-btn">
        <Send :size="32" />
      </button>
      <button class="action-btn">
        <MoreHorizontal :size="32" />
      </button>
    </div>

    <!-- Bottom Info -->
    <div class="bottom-info" @click.stop>
      <h3 class="username">{{ post.author }}</h3>
      <p class="date">{{ post.createdAt }}</p>
    </div>
  </article>
</template>

<style scoped>
.short-form-post {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: #121212; /* Dark background for focus */
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 20px;
  cursor: pointer;
}

.content-container {
  position: relative;
  flex: 1;
  display: flex;
  justify-content: center;
  padding: 0 60px 60px 0; /* Space for actions and bottom info */
  max-height: calc(100vh - 200px);
  overflow: hidden;
}

.content-container.expanded {
  overflow-y: auto;
  align-items: flex-start;
}

.text-content {
  text-align: left;
  max-width: 100%;
  word-wrap: break-word;
  width: 100%;
}

.gradient-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 60px;
  height: 150px;
  background: linear-gradient(to bottom, transparent, #121212);
  pointer-events: none;
}

.category-tag {
  display: inline-block;
  background-color: var(--color-primary);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
}

.post-title {
  font-size: 28px;
  font-weight: 800;
  margin-bottom: 16px;
  line-height: 1.3;
}

.post-body {
  font-size: 18px;
  line-height: 1.6;
  opacity: 0.9;
}

.actions-column {
  position: absolute;
  right: 16px;
  bottom: 100px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  align-items: center;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: white;
  gap: 6px;
  background: transparent;
}

.count {
  font-size: 13px;
  font-weight: 600;
}

.bottom-info {
  position: absolute;
  bottom: 30px;
  left: 20px;
  width: calc(100% - 80px);
}

.username {
  font-weight: 700;
  font-size: 16px;
  margin-bottom: 4px;
}

.date {
  font-size: 12px;
  color: #a8a8a8;
}

.post-body :deep(.content-image) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 12px 0;
  display: block;
}

.post-body :deep(.content-video) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 12px 0;
  display: block;
}

.post-body :deep(.content-iframe) {
  width: 100%;
  height: 400px;
  border-radius: 8px;
  margin: 12px 0;
  display: block;
}
</style>
