<script lang="ts">
export default {
  name: 'SearchPage'
}
</script>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { searchPosts, type SearchResult } from '@/features/search/api'
import { Icon } from '@/shared/ui/icon'

const query = ref('')
const results = ref<SearchResult[]>([])
const isLoading = ref(false)
const hasSearched = ref(false)
const route = useRoute()
const router = useRouter()

const handleSearch = async () => {
  const searchTerm = query.value
  if (!searchTerm.trim()) return

  try {
    isLoading.value = true
    hasSearched.value = true
    const response = await searchPosts(searchTerm)
    results.value = response.results
  } catch (error) {
    console.error('Search failed:', error)
    alert('검색 중 오류가 발생했습니다.')
  } finally {
    isLoading.value = false
  }
}

const goToDetail = (postId: string | number) => {
  router.push({ name: 'post-detail', params: { id: postId.toString() } })
}

const resetSearch = () => {
  query.value = ''
  results.value = []
  hasSearched.value = false
  isLoading.value = false
}

// Watch for route query changes to trigger reset
watch(() => route.query.reset, (newVal) => {
  if (newVal) {
    resetSearch()
    // Clean up immediately
    router.replace({ query: {} })
  }
})
</script>

<template>
  <div class="search-page">
    <header class="search-header">
      <div class="search-bar">
        <div class="input-wrapper">
          <Icon name="search" size="small" class="search-icon-inner" />
          <input v-model="query" type="text" placeholder="검색어를 입력하세요..." class="search-input"
            @keyup.enter="handleSearch()" />
        </div>
        <button class="search-btn" @click="handleSearch()">
          검색
        </button>
      </div>
    </header>

    <main class="search-content">
      <!-- Starting State (YouTube Style) -->
      <div v-if="!hasSearched && !isLoading" class="starting-state">
        <div class="hero-card">
          <div class="hero-icon-bg">
            <Icon name="manage_search" size="large" />
          </div>
          <h2 class="hero-title">검색하여 시작하기</h2>
          <p class="hero-desc">
            무엇이든 궁금한 주제를 입력해 보세요.<br>
            나에게 꼭 맞는 맞춤형 피드를 찾아드립니다.
          </p>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="state-container">
        <span class="loading-spinner"></span>
        <p>검색 결과를 가져오는 중...</p>
      </div>

      <!-- Results -->
      <template v-else-if="hasSearched">
        <div v-if="results.length === 0" class="state-container no-results">
          <Icon name="search_off" size="large" />
          <p>검색 결과가 없습니다.</p>
        </div>

        <ul v-else class="result-list">
          <li v-for="item in results" :key="item.id" class="result-item" @click="goToDetail(item.id)">
            <div class="result-card">
              <h3 class="item-title">{{ item.title }}</h3>
              <p class="item-preview">{{ item.preview }}...</p>
              <div class="item-meta">
                <span class="author">
                  <Icon name="person" size="small" />
                  {{ item.author }}
                </span>
                <span class="score">유사도 {{ (item.score * 100).toFixed(0) }}%</span>
              </div>
            </div>
          </li>
        </ul>
      </template>
    </main>
  </div>
</template>

<style scoped>
.search-page {
  padding-bottom: 80px;
  background-color: var(--color-white);
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
}

.search-header {
  padding: 12px 16px;
  position: sticky;
  top: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  z-index: 100;
  border-bottom: 1px solid var(--color-gray-100);
}

.search-bar {
  display: flex;
  gap: 12px;
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
}

.input-wrapper {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
}

.search-icon-inner {
  position: absolute;
  left: 12px;
  color: var(--color-gray-400);
}

.search-input {
  width: 100%;
  padding: 10px 12px 10px 40px;
  border: 1.5px solid var(--color-gray-200);
  border-radius: 20px;
  font-size: 15px;
  background-color: var(--color-gray-50);
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--color-blue-500);
  background-color: white;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.search-btn {
  padding: 0 20px;
  background-color: var(--color-blue-600);
  color: white;
  border: none;
  border-radius: 20px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.search-btn:hover {
  background-color: var(--color-blue-700);
}

/* Empty State Styles (YouTube style) */
.starting-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
}

.hero-card {
  text-align: center;
  margin-bottom: 48px;
}

.hero-icon-bg {
  width: 80px;
  height: 80px;
  background: var(--color-gray-50);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  color: var(--color-gray-400);
}

.hero-title {
  font-size: 24px;
  font-weight: 800;
  color: var(--color-blue-950);
  margin-bottom: 12px;
}

.hero-desc {
  font-size: 15px;
  color: var(--color-gray-500);
  line-height: 1.6;
}

/* Results Styles */
.search-content {
  flex: 1;
  overflow-y: auto;
}

.result-list {
  list-style: none;
  padding: 16px;
  margin: 0 auto;
  max-width: 642px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.result-card {
  padding: 20px;
  background: white;
  border-radius: 12px;
  border: 1px solid var(--color-gray-100);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.result-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.item-title {
  font-size: 17px;
  font-weight: 700;
  color: var(--color-blue-950);
  margin-bottom: 8px;
}

.item-preview {
  font-size: 14px;
  color: var(--color-gray-600);
  line-height: 1.5;
  margin-bottom: 12px;
}

.item-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

.author {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--color-gray-500);
  font-weight: 600;
}

.score {
  color: var(--color-blue-500);
  font-weight: 700;
  background: var(--color-blue-50);
  padding: 2px 8px;
  border-radius: 4px;
}

/* State Containers */
.state-container {
  padding: 80px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  color: var(--color-gray-500);
  text-align: center;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--color-gray-100);
  border-top-color: var(--color-blue-500);
  border-radius: 50%;
  animation: spin 1s infinite linear;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
