<script setup lang="ts">
import { ref, onUnmounted, computed, watchEffect } from 'vue'
import { ShortsCard } from '@/entities/shorts/ui'
import { useInfiniteRecommendedShortsQuery } from '@/features/shorts'

// Use recommended shorts query
const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } =
    useInfiniteRecommendedShortsQuery()

// Flatten all pages into single shorts array
const shorts = computed(() => {
    if (!data.value) return []
    return data.value.pages.flatMap((page) => page.results)
})

// IntersectionObserver for infinite scroll (last card or sentinel)
// Since shorts are fullscreen, we might want to load more as we scroll near end
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
    <div class="shorts-page">
        <!-- Loading -->
        <div v-if="isLoading" class="center-state">
            <span class="loading-spinner"></span>
        </div>

        <!-- Error -->
        <div v-else-if="isError" class="center-state">
            <p>Shorts를 불러오는데 실패했습니다.</p>
        </div>

        <!-- content -->
        <div v-else class="shorts-container">
            <ShortsCard v-for="item in shorts" :key="item.id" :title="item.title" :content="item.content"
                :likes-count="item.like_count" :comments-count="item.comments.length" :is-liked="item.is_liked"
                :post-id="item.id" class="shorts-card-item" />

            <!-- Sentinel -->
            <div ref="loadMoreTrigger" class="load-more-sentinel"></div>
        </div>
    </div>
</template>

<style scoped>
.shorts-page {
    width: 100%;
    height: 100vh;
    /* Space for bottom nav */
    background: black;
    /* Usually shorts have dark bg, but designs show light */
    background: var(--color-white);
}

.shorts-container {
    width: 100%;
    height: 100%;
    overflow-y: scroll;
    scroll-snap-type: y mandatory;
    -ms-overflow-style: none;
    scrollbar-width: none;
}

.shorts-container::-webkit-scrollbar {
    display: none;
}

/* Ensure ShortsCard snaps */
:deep(.shorts-card) {
    scroll-snap-align: start;
    scroll-snap-stop: always;
}

.center-state {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    color: var(--color-gray-600);
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

.load-more-sentinel {
    height: 1px;
}
</style>
