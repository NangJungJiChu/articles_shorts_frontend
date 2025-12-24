<script setup lang="ts">
import { ref, computed, watchEffect, onUnmounted } from 'vue'
import { ProfileTabs } from '@/widgets/profile-info/ui'
import { ProfileImageUploader } from '@/features/profile/update-profile-image'
import { FeedCard } from '@/entities/feed/ui'
import { useInfiniteMyPostListQuery, useInfiniteLikedPostListQuery, type Post } from '@/entities/post'

import { useAuthStore } from '@/features/auth/model/store'
import { Button } from '@/shared/ui/button'
import { useRouter } from 'vue-router'

const activeTab = ref<'likes' | 'posts'>('likes')
const authStore = useAuthStore()
const router = useRouter()

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}


const myPostsQuery = useInfiniteMyPostListQuery({ page_size: 10 })
const likedPostsQuery = useInfiniteLikedPostListQuery({ page_size: 10 })


const currentQuery = computed(() => {
  return activeTab.value === 'posts' ? myPostsQuery : likedPostsQuery
})

const hiddenPostIds = ref(new Set<number>())

const handleRemove = (id: number) => {
  hiddenPostIds.value.add(id)
}

const posts = computed(() => {
  const data = currentQuery.value.data.value
  if (!data) return []
  return data.pages
    .flatMap((page) => page.results)
    .filter((post) => !hiddenPostIds.value.has(post.id))
})

const isLoading = computed(() => currentQuery.value.isLoading.value)
const isError = computed(() => currentQuery.value.isError.value)
const hasNextPage = computed(() => currentQuery.value.hasNextPage.value)
const isFetchingNextPage = computed(() => currentQuery.value.isFetchingNextPage.value)
const fetchNextPage = () => currentQuery.value.fetchNextPage()


const getPostProps = (item: Post) => {
  const post = item as Post
  return {
    title: post.title,
    content: post.content,
    likesCount: post.like_count,
    commentsCount: post.comments.length,
    isLiked: post.is_liked,
    postId: post.id,
    author: post.author_username,
    authorProfileImage: post.author_profile_image
  }
}

// IntersectionObserver for infinite scroll
const loadMoreTrigger = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null
watchEffect(() => {
  if (observer) {
    observer.disconnect()
  }

  if (loadMoreTrigger.value) {
    observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0]
        if (target && target.isIntersecting && hasNextPage.value && !isFetchingNextPage.value) {
          fetchNextPage()
        }
      },
      { threshold: 0.1 },
    )
    observer.observe(loadMoreTrigger.value)
  }
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
})
</script>

<template>
  <div class="profile-page">
    <header class="profile-header">
      <div class="profile-info">
        <ProfileImageUploader :current-image-url="authStore.user?.profile_img" />
        <h2 class="username">{{ authStore.user?.username }}</h2>
        <Button variant="secondary" size="small" @click="handleLogout" class="logout-btn">
          로그아웃
        </Button>
      </div>
    </header>

    <div class="tabs-container">
      <ProfileTabs v-model="activeTab" />
    </div>

    <main class="profile-content">
      <!-- Loading -->
      <div v-if="isLoading" class="loading-state">
        <span class="loading-spinner"></span>
      </div>

      <!-- Error -->
      <div v-else-if="isError" class="empty-state">
        데이터를 불러오는데 실패했습니다.
      </div>

      <!-- Empty -->
      <div v-else-if="posts.length === 0" class="empty-state">
        게시글이 없습니다.
      </div>

      <!-- Content -->
      <div v-else class="post-list">
        <FeedCard v-for="post in posts" :key="post.id" v-bind="getPostProps(post)" @remove="handleRemove" />

        <!-- Sentinel -->
        <div ref="loadMoreTrigger" class="load-more-trigger">
          <span v-if="isFetchingNextPage" class="loading-spinner bg-spinner"></span>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.profile-page {
  width: 100%;
  min-height: 100vh;
  padding-bottom: 80px;
  background-color: var(--color-white);
}

.profile-header {
  display: flex;
  justify-content: center;
  padding: 40px 0;
}

.profile-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.username {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-gray-900);
  margin: 0;
}

.profile-image-container {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  background-color: #f0f0f0;
}

.profile-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.tabs-container {
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: var(--color-white);
}

.profile-content {
  padding: 24px 16px;
}

.post-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.empty-state {
  text-align: center;
  color: #9e9e9e;
  padding: 40px 0;
}

.loading-state,
.load-more-trigger {
  display: flex;
  justify-content: center;
  padding: 24px;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid var(--color-gray-200);
  border-top-color: var(--color-blue-500);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
