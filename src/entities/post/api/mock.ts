import type { Post } from '../model/types'
import postsData from '@/shared/data/posts.json'

// JSON 데이터를 Post 타입으로 변환
export const MOCK_POSTS: Post[] = postsData.map((post) => ({
  id: post.post_id,
  author: 'ㅇㅇ', // DB에 author 정보가 없으므로 기본값 설정
  title: post.title,
  category: post.gallery_id,
  content: post.content,
  likes: post.likes,
  dislikes: post.dislikes,
  comments: 0, // DB에 댓글 수 정보가 없으므로 0으로 설정
  createdAt: post.created_at
}))
