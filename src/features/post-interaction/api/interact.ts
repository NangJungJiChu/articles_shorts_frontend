import { httpClient } from '@/shared/api'
import type { InteractionType, InteractResponse } from '../model/types'

export const interactWithPost = async (
  postId: number,
  interactionType: InteractionType,
  duration: number = 0,
): Promise<InteractResponse> => {
  const { data } = await httpClient.post<InteractResponse>(`/posts/${postId}/interact/`, {
    type: interactionType,
    duration,
  })
  return data
}
