import { useInfiniteQuery } from '@tanstack/vue-query'
import { computed } from 'vue'
import { getRecommendedPosts } from './getShorts'
import type { PostListResponse } from '@/entities/post/model/types'

export const shortsKeys = {
  all: ['shorts'] as const,
  infiniteList: () => [...shortsKeys.all, 'infinite'] as const,
}

export function useInfiniteRecommendedShortsQuery() {
  return useInfiniteQuery({
    queryKey: computed(() => shortsKeys.infiniteList()),
    queryFn: ({ pageParam = 1 }) => getRecommendedPosts(pageParam as number),
    initialPageParam: 1,
    getNextPageParam: (lastPage: PostListResponse, _allPages, lastPageParam) => {
      // Assuming recommended API supports pagination same as posts
      return lastPage.next ? (lastPageParam as number) + 1 : undefined
    },
  })
}
