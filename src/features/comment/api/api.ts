import { httpClient } from '@/shared/api'

export interface Comment {
  id: number
  content: string
  author_username: string
  author_profile_image?: string
  created_at: string
}

export interface CommentListResponse {
  count: number
  comments: Comment[]
}

export async function getComments(postId: number): Promise<CommentListResponse> {
  const { data } = await httpClient.get<CommentListResponse>(`/posts/${postId}/comments/`)
  return data
}

export async function createComment(postId: number, content: string): Promise<Comment> {
  const { data } = await httpClient.post<Comment>(`/posts/${postId}/comments/`, { content })
  return data
}

export async function deleteComment(commentId: number): Promise<void> {
  await httpClient.delete(`/posts/comments/${commentId}/`)
}
