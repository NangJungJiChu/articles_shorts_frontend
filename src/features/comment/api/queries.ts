import { useQuery } from '@tanstack/vue-query'
import { getComments } from './api'
import type { MaybeRef } from 'vue'
import { toValue } from 'vue'

export const commentKeys = {
  all: ['comments'] as const,
  list: (postId: MaybeRef<number>) => [...commentKeys.all, 'list', toValue(postId)] as const,
}

export function useCommentListQuery(postId: MaybeRef<number>) {
  return useQuery({
    queryKey: commentKeys.list(postId),
    queryFn: ({ queryKey }) => {
      const [_1, _2, id] = queryKey as [string, string, number]
      return getComments(id)
    },
    enabled: () => !!toValue(postId),
  })
}
