<script setup lang="ts">
import { ref, computed, watchEffect, onUnmounted, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ProfileTabs } from '@/widgets/profile-info/ui'
import { ProfileImageUploader } from '@/features/profile/update-profile-image'
import { FeedCard } from '@/entities/feed/ui'
import { useInfiniteMyPostListQuery, useInfiniteLikedPostListQuery, type Post } from '@/entities/post'

import { useAuthStore } from '@/features/auth/model/store'
import { Button } from '@/shared/ui/button'
import { useRouter } from 'vue-router'
import SimpleAuthModal from '@/shared/ui/modal/SimpleAuthModal.vue'
import PasswordChangeModal from '@/shared/ui/modal/PasswordChangeModal.vue'
import { httpClient } from '@/shared/api'

const activeTab = ref<'likes' | 'posts'>('likes')
const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()
const isPassModalOpen = ref(false)
const isPasswordModalOpen = ref(false)

const handlePassVerified = async () => {
  try {
    isPassModalOpen.value = false
    await httpClient.post('/accounts/api/pass-verification/')
    await authStore.fetchUser()
  } catch (err) {
    console.error('Verification failed:', err)
  }
}

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

const handleWithdrawal = async () => {
  if (!confirm('정말로 탈퇴하시겠습니까? 탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다.')) {
    return
  }

  try {
    await httpClient.delete('/accounts/api/user/delete/')
    alert('회원 탈퇴가 완료되었습니다.')
    authStore.logout()
    router.push('/login')
  } catch (err) {
    console.error('Withdrawal failed:', err)
    alert('회원 탈퇴 중 오류가 발생했습니다.')
  }
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
    authorProfileImage: post.author_profile_image,
    categoryName: post.category_name
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

onMounted(async () => {
  // Check if we just came back from Kakao verification
  const verification = route.query.verification
  if (verification === 'success') {
    // Save tokens if provided
    const access = route.query.access as string
    const refresh = route.query.refresh as string

    if (access && refresh) {
      localStorage.setItem('accessToken', access)
      localStorage.setItem('refreshToken', refresh)
    }

    alert('카카오 본인인증(19+) 로그인에 성공했습니다!')
    await authStore.fetchUser()
    // Clean up query params
    router.replace({ query: {} })
  } else if (verification === 'fail') {
    const reason = route.query.reason
    if (reason === 'underage') {
      alert('본인인증 실패: 19세 미만은 인증을 진행할 수 없습니다.')
    } else {
      alert('본인인증에 실패했습니다. 다시 시도해주세요.')
    }
    router.replace({ query: {} })
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

        <!-- Verification Status -->
        <div class="verification-status">
          <div v-if="authStore.user?.is_pass_verified" class="verified-badge">
            <Icon name="verified" size="small" />
            <span>본인인증 완료</span>
          </div>
          <button v-else class="verify-trigger-btn" @click="isPassModalOpen = true">
            <Icon name="verified_user" size="small" />
            간편인증 하기
          </button>
        </div>

        <div class="account-actions">
          <div class="action-buttons-grid">
            <Button variant="secondary" class="profile-action-btn" @click="isPasswordModalOpen = true">
              비밀번호 변경
            </Button>
            <Button variant="secondary" class="profile-action-btn" @click="handleLogout">
              로그아웃
            </Button>
          </div>
          <button class="withdrawal-btn" @click="handleWithdrawal">
            회원 탈퇴
          </button>
        </div>
      </div>

      <SimpleAuthModal :is-open="isPassModalOpen" @close="isPassModalOpen = false" @verified="handlePassVerified" />

      <PasswordChangeModal :is-open="isPasswordModalOpen" @close="isPasswordModalOpen = false" />
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
  min-height: 100dvh;
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

/* Verification Styles */
.verification-status {
  margin-top: -8px;
}

.verified-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #f0f7ff;
  color: #3b82f6;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
}

.verify-trigger-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #3b82f6;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  font-weight: 600;
  cursor: pointer;
}

.account-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 100%;
  max-width: 400px;
  /* Increased max-width for better spacing */
}

.action-buttons-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  width: 100%;
}

:deep(.profile-action-btn) {
  width: fit-content;
  padding: 0 16px;
  height: 48px;
  /* Taller touch target */
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 600;
  border-radius: 12px;
  /* Smoother corners */
}

.withdrawal-btn {
  background: none;
  border: none;
  color: var(--color-gray-500);
  font-size: 12px;
  text-decoration: underline;
  cursor: pointer;
  margin-top: 8px;
}

.withdrawal-btn:hover {
  color: var(--color-danger);
}
</style>
