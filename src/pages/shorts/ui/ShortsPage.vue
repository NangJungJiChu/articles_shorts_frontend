<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ShortsCard } from '@/entities/shorts/ui'
import { useInfiniteRecommendedPostListQuery } from '@/entities/post'
import { useVirtualizer } from '@tanstack/vue-virtual'

// Use recommended shorts query
const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } =
    useInfiniteRecommendedPostListQuery()

const hiddenPostIds = ref(new Set<number>())

const handleRemove = (id: number) => {
    hiddenPostIds.value.add(id)
}

// Flatten all pages into single shorts array
const shorts = computed(() => {
    if (!data.value) return []
    return data.value.pages
        .flatMap((page) => page.results)
        .filter((post) => !hiddenPostIds.value.has(post.id))
})

// --- Virtual Scroll Setup ---
const parentRef = ref<HTMLElement | null>(null)

// Pass options as a computed getter to make it reactive
const rowVirtualizer = useVirtualizer(
    computed(() => ({
        count: shorts.value.length,
        getScrollElement: () => parentRef.value,
        estimateSize: () => window.innerHeight, // Assume full screen height per item
        overscan: 1, // Keep 1 item above/below for smooth snapping
    }))
)

const virtualRows = computed(() => rowVirtualizer.value.getVirtualItems())
const totalSize = computed(() => rowVirtualizer.value.getTotalSize())

watch(virtualRows, (newRows) => {
    if (newRows.length === 0) return

    const lastItem = newRows[newRows.length - 1]
    const totalItems = shorts.value.length

    if (
        lastItem &&
        lastItem.index >= totalItems - 3 &&
        hasNextPage.value &&
        !isFetchingNextPage.value
    ) {
        fetchNextPage()
    }
})

</script>

<template>
    <div class="shorts-page">
        <!-- Loading -->
        <div v-if="isLoading && shorts.length === 0" class="center-state">
            <span class="loading-spinner"></span>
        </div>

        <!-- Error -->
        <div v-else-if="isError && shorts.length === 0" class="center-state">
            <p>Shorts를 불러오는데 실패했습니다.</p>
        </div>

        <!-- content -->
        <div v-else ref="parentRef" class="shorts-container">
            <div :style="{
                height: `${totalSize}px`,
                width: '100%',
                position: 'relative',
            }">
                <div v-for="virtualRow in virtualRows" :key="virtualRow.index" class="shorts-wrapper" :style="{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                }">
                    <ShortsCard v-if="shorts[virtualRow.index]" :title="shorts[virtualRow.index]!.title"
                        :content="shorts[virtualRow.index]!.content" :likes-count="shorts[virtualRow.index]!.like_count"
                        :comments-count="shorts[virtualRow.index]!.comments.length"
                        :is-liked="shorts[virtualRow.index]!.is_liked" :post-id="shorts[virtualRow.index]!.id"
                        :author="shorts[virtualRow.index]!.author_username" @remove="handleRemove" />
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.shorts-page {
    width: 100%;
    height: 100vh;
    background: var(--color-white);
}

.shorts-container {
    width: 100%;
    height: 100%;
    overflow-y: scroll;
    scroll-snap-type: y mandatory;
    -ms-overflow-style: none;
    scrollbar-width: none;
    /* Important for virtual scrolling container */
    contain: strict;
}

.shorts-container::-webkit-scrollbar {
    display: none;
}

/* Scroll Snap on Wrapper */
.shorts-wrapper {
    /* Virtual items are absolute, so we need to ensure snap works */
    /* Note: Scroll snap with absolute positioning can be tricky.
       Usually, snap aligns to the flow.
       TanStack Virtual + Scroll Snap is compatible if the container scrolls.
    */
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
</style>
