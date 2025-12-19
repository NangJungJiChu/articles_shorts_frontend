import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { createComment } from './api'
import { commentKeys } from './queries'

export function useCreateCommentMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ postId, content }: { postId: number; content: string }) =>
      createComment(postId, content),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: commentKeys.list(variables.postId) })
    },
  })
}
