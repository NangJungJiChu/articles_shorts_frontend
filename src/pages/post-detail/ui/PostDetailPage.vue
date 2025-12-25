<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getPostDetail } from '@/entities/post'
import { FeedCard } from '@/entities/feed/ui'
import { Icon } from '@/shared/ui/icon'
import { httpClient } from '@/shared/api'
import type { Post } from '@/entities/post'

const route = useRoute()
const router = useRouter()
const post = ref<Post | null>(null)
const similarPosts = ref<Post[]>([])
const isLoading = ref(true)
const isError = ref(false)

const fetchPost = async () => {
  const postId = route.params.id as string
  try {
    isLoading.value = true
    isError.value = false
    
    // Fetch main post
    const data = await getPostDetail(postId)
    post.value = data
    
    // Fetch similar posts
    try {
      const resp = await httpClient.get<any>(`/posts/${postId}/similar/`)
      similarPosts.value = resp.data.results || []
    } catch (err) {
      console.warn('Failed to fetch similar posts:', err)
    }
    
    window.scrollTo(0, 0)
  } catch (error) {
    console.error('Failed to fetch post:', error)
    isError.value = true
  } finally {
    isLoading.value = false
  }
}

const getPostProps = (p: Post) => {
  return {
    title: p.title,
    content: p.content,
    likesCount: p.like_count || 0,
    commentsCount: Array.isArray(p.comments) ? p.comments.length : 0,
    isLiked: p.is_liked,
    postId: p.id,
    author: p.author_username,
    authorProfileImage: p.author_profile_image
  }
}

// Watch for route changes (e.g. clicking a similar post)
watch(() => route.params.id, (newId) => {
  if (newId) fetchPost()
})

onMounted(fetchPost)
</script>

<template>
  <div class="post-detail-page">
    <header class="detail-header">
      <button class="back-btn" @click="router.back()">
        <Icon name="arrow_back" />
      </button>
      <h1 class="header-title">게시글</h1>
    </header>

    <main class="detail-content">
      <div v-if="isLoading" class="state-container">
        <span class="loading-spinner"></span>
        <p>불러오는 중...</p>
      </div>

      <div v-else-if="isError" class="state-container">
        <Icon name="error_outline" size="large" />
        <p>게시글을 찾을 수 없거나 불러오는데 실패했습니다.</p>
        <button class="retry-btn" @click="fetchPost">다시 시도</button>
      </div>

      <template v-else-if="post">
        <!-- Main Post Card -->
        <FeedCard v-bind="getPostProps(post)" />
        
        <!-- Similar Posts Section -->
        <div v-if="similarPosts.length > 0" class="similar-posts">
          <h2 class="section-title">관련된 게시글</h2>
          <div class="similar-list">
            <div 
              v-for="sim in similarPosts" 
              :key="sim.id" 
              class="similar-item"
              @click="router.push({ name: 'post-detail', params: { id: sim.id } })"
            >
              <h3 class="sim-title">{{ sim.title }}</h3>
              <span class="sim-author">by {{ sim.author_username }}</span>
            </div>
          </div>
        </div>
      </template>
    </main>
  </div>
</template>

<style scoped>
.post-detail-page {
  min-height: 100vh;
  background-color: var(--color-white);
  padding-bottom: 80px;
}

.detail-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  position: sticky;
  top: 0;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  z-index: 100;
  border-bottom: 1px solid var(--color-gray-100);
  gap: 16px;
}

.back-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.back-btn:hover {
  background-color: var(--color-gray-50);
}

.header-title {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  color: var(--color-blue-950);
}

.detail-content {
  max-width: 610px;
  margin: 0 auto;
}

.state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120px 20px;
  gap: 20px;
  color: var(--color-gray-500);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-gray-100);
  border-top-color: var(--color-blue-500);
  border-radius: 50%;
  animation: spin 1s cubic-bezier(0.5, 0, 0.5, 1) infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.retry-btn {
  padding: 10px 24px;
  background-color: var(--color-blue-600);
  color: white;
  border: none;
  border-radius: 20px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.retry-btn:active {
  transform: scale(0.95);
}

/* Similar Posts */
.similar-posts {
  padding: 24px 16px;
  border-top: 8px solid var(--color-gray-50);
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 16px;
  color: var(--color-blue-950);
}

.similar-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.similar-item {
  padding: 16px;
  background: var(--color-gray-50);
  border-radius: 12px;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.2s;
}

.similar-item:hover {
  background-color: var(--color-gray-100);
}

.similar-item:active {
  transform: scale(0.98);
}

.sim-title {
  margin: 0 0 4px 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--color-blue-900);
}

.sim-author {
  font-size: 12px;
  color: var(--color-gray-500);
}
</style>
