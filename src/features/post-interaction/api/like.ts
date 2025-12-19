import { httpClient } from '@/shared/api'

export interface LikeResponse {
  is_liked: boolean
  like_count: number
}

export const toggleLikePost = async (postId: number): Promise<LikeResponse> => {
  const { data } = await httpClient.post<LikeResponse>(`/posts/${postId}/like/`)
  return data
}
