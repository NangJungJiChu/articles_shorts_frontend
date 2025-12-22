import { useQuery, useInfiniteQuery } from '@tanstack/vue-query'
import { computed, type MaybeRef, toValue } from 'vue'
import {
  getPostList,
  getMyPostList,
  getLikedPostList,
  getCategoryList,
  getRecommendedPostList,
  type GetPostListParams,
} from './api'
import type { PostListResponse } from '../model/types'

export const postKeys = {
  all: ['posts'] as const,
  lists: () => [...postKeys.all, 'list'] as const,
  list: (params: GetPostListParams) => [...postKeys.lists(), params] as const,
  infiniteList: (params: Omit<GetPostListParams, 'page'>) =>
    [...postKeys.lists(), 'infinite', params] as const,
  myList: (params: Omit<GetPostListParams, 'page'>) => [...postKeys.lists(), 'my', params] as const,
  likedList: (params: Omit<GetPostListParams, 'page'>) =>
    [...postKeys.lists(), 'liked', params] as const,
  recommended: () => [...postKeys.lists(), 'recommended'] as const,
}

export function useInfinitePostListQuery(params: MaybeRef<Omit<GetPostListParams, 'page'>> = {}) {
  return useInfiniteQuery({
    queryKey: computed(() => postKeys.infiniteList(toValue(params))),
    queryFn: ({ pageParam }) => getPostList({ ...toValue(params), page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage: PostListResponse, _allPages, lastPageParam) => {
      return lastPage.next ? lastPageParam + 1 : undefined
    },
  })
}

export function useInfiniteMyPostListQuery(params: MaybeRef<Omit<GetPostListParams, 'page'>> = {}) {
  return useInfiniteQuery({
    queryKey: computed(() => postKeys.myList(toValue(params))),
    queryFn: ({ pageParam }) => getMyPostList({ ...toValue(params), page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage: PostListResponse, _allPages, lastPageParam) => {
      return lastPage.next ? lastPageParam + 1 : undefined
    },
  })
}

export function useInfiniteLikedPostListQuery(
  params: MaybeRef<Omit<GetPostListParams, 'page'>> = {},
) {
  return useInfiniteQuery({
    queryKey: computed(() => postKeys.likedList(toValue(params))),
    queryFn: ({ pageParam }) => getLikedPostList({ ...toValue(params), page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage: PostListResponse, _allPages, lastPageParam) => {
      return lastPage.next ? lastPageParam + 1 : undefined
    },
  })
}

export function useCategoryListQuery() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: getCategoryList,
  })
}

export function useInfiniteRecommendedPostListQuery() {
  return useInfiniteQuery({
    queryKey: computed(() => postKeys.recommended()),
    queryFn: ({ pageParam = 1 }) => getRecommendedPostList(pageParam as number),
    initialPageParam: 1,
    getNextPageParam: (lastPage: PostListResponse, _allPages, lastPageParam) => {
      return lastPage.next ? (lastPageParam as number) + 1 : undefined
    },
  })
}
