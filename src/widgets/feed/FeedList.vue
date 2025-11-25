<script setup lang="ts">
import PostCard from '@/entities/post/ui/PostCard.vue'
import { MOCK_POSTS } from '@/entities/post/api/mock'
</script>

<template>
  <div class="feed-list">
    <PostCard 
      v-for="post in MOCK_POSTS" 
      :key="post.id" 
      :post="post" 
    />
  </div>
</template>

<style scoped>
.feed-list {
  display: flex;
  flex-direction: column;
  padding-bottom: 60px; /* Space for bottom nav if needed */
}
</style>
