// posts.json 타입 정의
interface PostJson {
  post_id: string
  gallery_id: string
  title: string
  content: string
  likes: number
  dislikes: number
  created_at: string
}

declare module '@/shared/data/posts.json' {
  const posts: PostJson[]
  export default posts
}
