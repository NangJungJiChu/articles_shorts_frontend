<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getPostDetail } from '@/entities/post'
import { FeedCard } from '@/entities/feed/ui'
import { Icon } from '@/shared/ui/icon'
import { httpClient } from '@/shared/api'
import SimpleAuthModal from '@/shared/ui/modal/SimpleAuthModal.vue'
import type { Post } from '@/entities/post'
import { useAuthStore } from '@/features/auth/model/store'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const post = ref<Post | null>(null)
const similarPosts = ref<Post[]>([])
const isLoading = ref(true)
const isError = ref(false)
const isNeedsPass = ref(false)
const isPassModalOpen = ref(false)
const userVerified = ref(false)

const checkUserStatus = async () => {
  try {
    const resp = await httpClient.get('/accounts/api/user/')
    userVerified.value = resp.data.is_pass_verified
  } catch (e) {
    console.error('Failed to get user status', e)
  }
}

const handlePassVerified = async () => {
  try {
    isPassModalOpen.value = false
    isLoading.value = true
    await httpClient.post('/accounts/api/pass-verification/')
    // Retry fetching the post after verification
    const id = route.params.id as string
    if (id) await fetchPost(id)
  } catch (err) {
    console.error('Verification failed:', err)
    alert('인증에 실패했습니다. 다시 시도해 주세요.')
  } finally {
    isLoading.value = false
  }
}

const openPassVerification = () => {
  isPassModalOpen.value = true
}

const fetchPost = async (id: string) => {
  isLoading.value = true
  isError.value = false
  isNeedsPass.value = false
  post.value = null
  similarPosts.value = []

  try {
    // 1. Get user status first
    const userResp = await httpClient.get('/accounts/api/user/')
    userVerified.value = userResp.data.is_pass_verified

    // 2. Fetch main post
    const data = await getPostDetail(id)

    isLoading.value = false;

    // 3. Proactive Check
    if ((data.is_nsfw || data.is_profane) && !userVerified.value) {
      isNeedsPass.value = true
      isPassModalOpen.value = true
      // Don't set post.value yet to prevent flash of content
    } else {
      post.value = data
    }

    if (post.value) {
      try {
        const resp = await httpClient.get<any>(`/posts/${id}/similar/`)
        similarPosts.value = resp.data.results || []
      } catch (err) {
        console.warn('Failed to fetch similar posts:', err)
      }
    }

    window.scrollTo(0, 0)
  } catch (error: any) {
    console.error('Failed to fetch post:', error)
    if (error.response?.status === 403) {
      isNeedsPass.value = true
    } else {
      isError.value = true
    }
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
  if (newId) fetchPost(newId as string)
})

onMounted(async () => {
  // Check if we just came back from Kakao verification
  const verification = route.query.verification
  if (verification === 'success') {
    const access = route.query.access as string
    const refresh = route.query.refresh as string
    if (access && refresh) {
      localStorage.setItem('accessToken', access)
      localStorage.setItem('refreshToken', refresh)
    }
    await authStore.fetchUser()
    alert('카카오 본인인증 전용 로그인이 완료되었습니다!')
    // Clean up URL
    router.replace({ query: {} })
  } else if (verification === 'fail') {
    const reason = route.query.reason
    if (reason === 'underage') {
      alert('본인인증 실패: 19세 미만은 본 콘텐츠를 이용하실 수 없습니다.')
    }
    router.replace({ query: {} })
  }

  const id = route.params.id as string
  if (id) {
    await fetchPost(id)
  }
})
</script>

<template>
  <div class="post-detail-page">
    <header class="detail-header">
      <button class="back-btn" @click="router.push('/')">
        <Icon name="arrow_back" />
      </button>
      <h1 class="header-title">게시글</h1>
    </header>

    <main class="detail-content">
      <!-- Badge Section -->
      <div v-if="post && (post.is_nsfw || post.is_profane)" class="content-badges">
        <span v-if="post.is_nsfw" class="badge nsfw">NSFW</span>
        <span v-if="post.is_profane" class="badge violence">VIOLENCE</span>
      </div>

      <div v-if="isLoading" class="state-container">
        <span class="loading-spinner"></span>
        <p>불러오는 중...</p>
      </div>

      <div v-else-if="isError" class="state-container">
        <Icon name="error_outline" size="large" />
        <p>게시글을 찾을 수 없거나 불러오는데 실패했습니다.</p>
        <button class="retry-btn" @click="fetchPost(route.params.id as string)">다시 시도</button>
      </div>

      <div v-else-if="isNeedsPass" class="state-container nsfw-container">
        <div class="nsfw-badge">19</div>
        <h2 class="nsfw-title">연령 제한 콘텐츠</h2>
        <p class="nsfw-desc">본 게시물은 본인 인증이 필요합니다.<br>간편인증을 통해 본인 확인을 완료해주세요.</p>

        <div class="legal-notice">
          안전한 서비스 이용을 위해 정보통신망법에 의거하여<br>본인 확인 절차를 진행합니다.
        </div>

        <button class="pass-btn" @click="openPassVerification">
          <Icon name="verified_user" size="small" />
          간편인증하기
        </button>
        <button class="back-link" @click="router.back()">이전으로 돌아가기</button>
      </div>
      <template v-else-if="post">
        <!-- Main Post Card -->
        <FeedCard v-bind="getPostProps(post)" />

        <!-- Similar Posts Section -->
        <div v-if="similarPosts.length > 0" class="similar-posts">
          <h2 class="section-title">관련된 게시글</h2>
          <div class="similar-list">
            <div v-for="sim in similarPosts" :key="sim.id" class="similar-item"
              @click="router.push({ name: 'post-detail', params: { id: sim.id } })">
              <h3 class="sim-title">{{ sim.title }}</h3>
              <span class="sim-author">by {{ sim.author_username }}</span>
            </div>
          </div>
        </div>
      </template>

      <SimpleAuthModal :is-open="isPassModalOpen" @close="isPassModalOpen = false" @verified="handlePassVerified" />
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

.content-badges {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  background: #fff5f5;
  border-bottom: 1px solid #fee2e2;
}

.badge {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.5px;
}

.badge.nsfw {
  background: #e11d48;
  color: white;
}

.badge.violence {
  background: #f59e0b;
  color: white;
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
  to {
    transform: rotate(360deg);
  }
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

/* NSFW Styles */
.nsfw-container {
  padding: 80px 32px !important;
  text-align: center;
}

.nsfw-badge {
  width: 60px;
  height: 60px;
  background: #e11d48;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 800;
  margin-bottom: 20px;
}

.nsfw-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--color-blue-950);
  margin: 0;
}

.nsfw-desc {
  font-size: 15px;
  color: var(--color-gray-500);
  margin-top: 12px;
  line-height: 1.6;
}

.legal-notice {
  margin: 32px 0;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  font-size: 13px;
  color: #64748b;
  line-height: 1.5;
  width: 100%;
}

.pass-btn {
  width: 100%;
  max-width: 320px;
  padding: 16px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: transform 0.2s, background-color 0.2s;
  font-size: 16px;
}

.pass-btn:hover {
  background-color: #2563eb;
  transform: translateY(-2px);
}

.pass-btn:active {
  transform: scale(0.98);
}

.back-link {
  background: none;
  border: none;
  color: var(--color-gray-400);
  font-size: 14px;
  text-decoration: underline;
  cursor: pointer;
  margin-top: 20px;
}
</style>
