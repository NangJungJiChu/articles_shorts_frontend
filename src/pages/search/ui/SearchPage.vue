<script lang="ts">
export default {
    name: 'SearchPage'
}
</script>

<script setup lang="ts">
import { ref } from 'vue'
import { searchPosts, type SearchResult } from '@/features/search/api'
import { Icon } from '@/shared/ui/icon'

import { useRouter } from 'vue-router'

const query = ref('')
const results = ref<SearchResult[]>([])
const isLoading = ref(false)
const hasSearched = ref(false)
const router = useRouter()

const handleSearch = async () => {
    if (!query.value.trim()) return

    try {
        isLoading.value = true
        hasSearched.value = true
        const response = await searchPosts(query.value)
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
</script>

<template>
    <div class="search-page">
        <header class="search-header">
            <div class="search-bar">
                <input
                    v-model="query"
                    type="text"
                    placeholder="검색어를 입력하세요 (예: 겨울 코디)"
                    class="search-input"
                    @keyup.enter="handleSearch"
                />
                <button class="search-btn" @click="handleSearch">
                    <Icon name="search" />
                </button>
            </div>
        </header>

        <main class="search-results">
            <div v-if="isLoading" class="loading">검색 중...</div>

            <div v-else-if="hasSearched && results.length === 0" class="no-results">검색 결과가 없습니다.</div>

            <ul v-else class="result-list">
                <li v-for="item in results" :key="item.id" class="result-item" @click="goToDetail(item.id)">
                    <h3 class="item-title">{{ item.title }}</h3>
                    <p class="item-preview">{{ item.preview }}...</p>
                    <div class="item-meta">
                        <span class="author">By {{ item.author }}</span>
                        <span class="score">유사도: {{ item.score.toFixed(2) }}</span>
                    </div>
                </li>
            </ul>
        </main>
    </div>
</template>

<style scoped>
.search-page {
    padding-bottom: 80px; /* Bottom Nav 공간 확보 */
    background-color: var(--color-white);
    min-height: 100vh;
}
.search-header {
    padding: 16px;
    position: sticky;
    top: 0;
    background: white;
    z-index: 10;
    border-bottom: 1px solid #eee;
}
.search-bar {
    display: flex;
    gap: 8px;
}
.search-input {
    flex: 1;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 16px;
    font-family: var(--font-family-base);
}
.search-btn {
    background: none;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-blue-600);
}
.result-list {
    list-style: none;
    padding: 0;
    margin: 0;
}
.result-item {
    padding: 16px;
    border-bottom: 1px solid #f0f0f0;
    cursor: pointer;
    transition: background-color 0.2s;
}
.result-item:active {
    background-color: #f9f9f9;
}
.item-title {
    margin: 0 0 8px 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--color-blue-950);
}
.item-preview {
    font-size: 14px;
    color: #666;
    margin: 0 0 8px 0;
    line-height: 1.4;
}
.item-meta {
    font-size: 12px;
    color: #999;
    display: flex;
    justify-content: space-between;
}
.loading,
.no-results {
    text-align: center;
    padding: 40px;
    color: #666;
    font-family: var(--font-family-base);
}
</style>
