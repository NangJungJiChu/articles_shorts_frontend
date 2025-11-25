<script setup lang="ts">
import { useRouter } from 'vue-router'
import FeedList from '@/widgets/feed/FeedList.vue'
import BottomNav from '@/widgets/layout/BottomNav.vue'

const router = useRouter()

const goToShorts = () => {
  router.push('/shorts')
}
</script>

<template>
  <div class="feed-page">
    <header class="header">
      <h1>Instagram Clone</h1>
      <button @click="goToShorts">Go to Shorts</button>
    </header>
    <main>
      <FeedList />
    </main>
    <BottomNav />
  </div>
</template>

<style scoped>
.feed-page {
  max-width: var(--max-width-feed);
  margin: 0 auto;
  min-height: 100vh;
}

.header {
  height: var(--nav-height);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  position: sticky;
  top: 0;
  background-color: var(--color-bg);
  z-index: 10;
}
</style>
