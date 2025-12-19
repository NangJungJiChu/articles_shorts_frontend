import { httpClient } from '@/shared/api'
import type { PostListResponse } from '@/entities/post/model/types'

export const getRecommendedPosts = async (page = 1): Promise<PostListResponse> => {
  const { data } = await httpClient.get<PostListResponse>(`/posts/recommended/?page=${page}`)
  return data
}
