import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { createPost, type CreatePostPayload } from './api'
import { postKeys } from './queries'
import { useRouter } from 'vue-router'

export function useCreatePostMutation() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: (payload: CreatePostPayload) => createPost(payload),
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: postKeys.all })

      // Navigate to the newly created post (assuming detail page exists) or home
      // Since detail page isn't fully ready/linked, we can go home or to profile/my posts
      // Or just back() as logic was in CreatePage
      router.push({ name: 'home' })
    },
  })
}
