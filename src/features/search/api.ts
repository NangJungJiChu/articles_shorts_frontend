import { httpClient } from '@/shared/api'

export interface SearchResult {
  id: string
  title: string
  preview: string
  author: string
  score: number
}

export interface SearchResponse {
  count: number
  results: SearchResult[]
}

export async function searchPosts(query: string): Promise<SearchResponse> {
  const { data } = await httpClient.get<SearchResponse>('/posts/search/semantic/', {
    params: { q: query }
  })
  return data
}
