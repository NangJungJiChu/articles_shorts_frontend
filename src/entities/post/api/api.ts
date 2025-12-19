import { httpClient } from '@/shared/api'
import type { PostListResponse } from '../model/types'

export interface GetPostListParams {
  page?: number
  page_size?: number
}

export async function getPostList(params: GetPostListParams = {}): Promise<PostListResponse> {
  const { data } = await httpClient.get<PostListResponse>('/posts/', { params })
  return data
}

export async function getMyPostList(params: GetPostListParams = {}): Promise<PostListResponse> {
  const { data } = await httpClient.get<PostListResponse>('/posts/my/', { params })
  return data
}

export async function getLikedPostList(params: GetPostListParams = {}): Promise<PostListResponse> {
  const { data } = await httpClient.get<PostListResponse>('/posts/my/likes/', { params })
  return data
}

export interface Category {
  id: string
  name: string
}

export interface CreatePostPayload {
  title: string
  body: string
  category?: string
}

export async function createPost(
  payload: CreatePostPayload,
): Promise<{ message: string; post_id: number; author: string }> {
  const { data } = await httpClient.post<{ message: string; post_id: number; author: string }>(
    '/posts/create/',
    payload,
  )
  return data
}

export async function getCategoryList(): Promise<Category[]> {
  const { data } = await httpClient.get<Category[]>('/posts/categories/')
  return data
}
