<script setup lang="ts">
import { ref, onUnmounted, onMounted, computed, watchEffect } from 'vue'
import { FeedCard } from '@/entities/feed/ui'
import { useInfiniteRecommendedPostListQuery, postKeys } from '@/entities/post'
import { useQueryClient } from '@tanstack/vue-query'

const queryClient = useQueryClient()

const refreshFeed = async () => {
    await queryClient.invalidateQueries({ queryKey: postKeys.recommended() })
    window.scrollTo({ top: 0, behavior: 'smooth' })
}

const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } =
    useInfiniteRecommendedPostListQuery()



const hiddenPostIds = ref(new Set<number>())

const handleRemove = (id: number) => {
    hiddenPostIds.value.add(id)
}

// Flatten all pages into single posts array
const posts = computed(() => {
    if (!data.value) return []
    return data.value.pages
        .flatMap((page) => page.results)
        .filter((post) => !hiddenPostIds.value.has(post.id))
})

// IntersectionObserver for infinite scroll
const loadMoreTrigger = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

// Scroll Handling for Sticky Header
const isHeaderVisible = ref(true)
const lastScrollY = ref(0)

const handleScroll = () => {
    const currentScrollY = window.scrollY

    // Determine scroll direction and update visibility
    if (currentScrollY > lastScrollY.value && currentScrollY > 50) {
        // Scrolling DOWN and not at the very top
        isHeaderVisible.value = false
    } else {
        // Scrolling UP
        isHeaderVisible.value = true
    }

    lastScrollY.value = currentScrollY
}

// Use watchEffect to observe when ref becomes available
watchEffect(() => {
    // Clean up previous observer
    if (observer) {
        observer.disconnect()
    }

    // Only create observer when the element exists
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



onMounted(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
    if (observer) {
        observer.disconnect()
    }
    window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
    <div class="home-page">
        <header class="home-header" :class="{ 'hidden': !isHeaderVisible }">
            <img src="/logo.svg" alt="Logo" class="logo" @click="refreshFeed" />
        </header>

        <main class="feed-list">
            <!-- Loading State -->
            <div v-if="isLoading" class="loading-state">
                <span class="loading-spinner"></span>
                <p>게시글을 불러오는 중...</p>
            </div>

            <!-- Error State -->
            <div v-else-if="isError" class="error-state">
                <p>게시글을 불러오는데 실패했습니다.</p>
            </div>

            <!-- Posts -->
            <template v-else>
                <FeedCard v-for="post in posts" :key="post.id" :title="post.title" :content="post.content"
                    :likesCount="post.like_count" :commentsCount="post.comments.length" :isLiked="post.is_liked"
                    :postId="post.id" :author="post.author_username" @remove="handleRemove" />

                <!-- Load More Trigger -->
                <div ref="loadMoreTrigger" class="load-more-trigger">
                    <span v-if="isFetchingNextPage" class="loading-spinner"></span>
                    <p v-else-if="!hasNextPage && posts.length > 0" class="end-message">
                        모든 게시글을 불러왔습니다.
                    </p>
                </div>
            </template>
        </main>
    </div>
</template>

<style scoped>
.home-page {
    width: 100%;
    min-height: 100vh;
    padding-bottom: 80px;
    /* Space for bottom tab bar */
    background-color: var(--color-white);
}

.home-header {
    display: flex;
    justify-content: center;
    padding: 16px 0;
    background-color: var(--color-white);

    /* Sticky Snap Logic */
    position: sticky;
    top: 0;
    z-index: 100;
    transition: transform 0.3s ease-in-out;
}

.home-header.hidden {
    transform: translateY(-100%);
}

.logo {
    height: 24px;
    /* Adjust based on logo SVG */
    width: auto;
}

.feed-list {
    width: 100%;
    max-width: 610px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.loading-state,
.error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 48px 16px;
    gap: 12px;
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

.load-more-trigger {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 24px 16px;
    min-height: 60px;
}

.end-message {
    color: var(--color-gray-500);
    font-size: 14px;
}
</style>
