<script setup lang="ts">
import type { Post } from '../model/types'
import PostHeader from './PostHeader.vue'
import PostContent from './PostContent.vue'
import PostActions from './PostActions.vue'

defineProps<{
  post: Post
}>()
</script>

<template>
  <article class="post-card">
    <PostHeader :author="post.author" :created-at="post.createdAt" />
    <div class="post-meta">
      <span class="category-badge">{{ post.category }}</span>
      <h2 class="post-title">{{ post.title }}</h2>
    </div>
    <PostContent :content="post.content" />
    <PostActions :likes="post.likes" :dislikes="post.dislikes" />
  </article>
</template>

<style scoped>
.post-card {
  background-color: var(--color-bg);
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 16px;
}

@media (min-width: 640px) {
  .post-card {
    border: 1px solid var(--color-border);
    border-radius: 8px;
  }
}

.post-meta {
  padding: 0 16px 8px;
}

.category-badge {
  display: inline-block;
  background-color: #f0f0f0;
  color: #666;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
  margin-bottom: 4px;
}

.post-title {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
}
</style>
