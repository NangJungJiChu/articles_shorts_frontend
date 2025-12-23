import { httpClient } from '@/shared/api'
import type { InteractResponse } from '../model/types'

export const reportPost = async (
  postId: number,
  content: string,
): Promise<InteractResponse> => {
  const { data } = await httpClient.post<InteractResponse>(`/posts/${postId}/report/`, {
    content,
  })
  return data
}
