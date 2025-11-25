<script setup lang="ts">
import ShortFormPost from '@/entities/post/ui/ShortFormPost.vue'
import { MOCK_POSTS } from '@/entities/post/api/mock'
</script>

<template>
  <div class="short-form-list">
    <div 
      v-for="post in MOCK_POSTS" 
      :key="post.id" 
      class="short-item-wrapper"
    >
      <ShortFormPost :post="post" />
    </div>
  </div>
</template>

<style scoped>
.short-form-list {
  height: 100vh;
  width: 100%;
  overflow-y: scroll;
  scroll-snap-type: y mandatory;
  background-color: #000;
  scrollbar-width: none;
}

.short-item-wrapper {
  height: 100vh;
  width: 100%;
  scroll-snap-align: start;
  scroll-snap-stop: always;
}
</style>
