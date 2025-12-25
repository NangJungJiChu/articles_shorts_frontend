export interface Post {
  id: number
  title: string
  content: string
  author_username: string
  author_profile_image?: string
  category: string
  category_name: string
  is_nsfw: boolean
  is_liked: boolean
  like_count: number
  created_at: string
  comments: Comment[]
}

export interface Comment {
  id: number
  content: string
  author_username: string
  author_profile_image?: string
  created_at: string
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export type PostListResponse = PaginatedResponse<Post>
