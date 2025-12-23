import { ref, watch } from 'vue'
import { toggleLikePost, interactWithPost, reportPost } from '@/features/post-interaction'
import { deletePost } from '@/entities/post'
import { queryClient } from '@/shared/api'
import { useAuthStore } from '@/features/auth'
import type { QueryKey } from '@tanstack/vue-query'

interface InteractionProps {
  postId: number
  author: string
  isLiked: boolean
  likesCount: number | string
}

export function usePostInteractions(props: InteractionProps, invalidateKeys: QueryKey[] = []) {
  const localIsLiked = ref(props.isLiked)
  const localLikesCount = ref(Number(props.likesCount))
  const isReportModalOpen = ref(false)
  const isCommentModalOpen = ref(false)

  const authStore = useAuthStore()
  const isAuthor = ref(authStore.user?.username === props.author)

  watch(() => props.isLiked, (val) => (localIsLiked.value = val))
  watch(() => props.likesCount, (val) => (localLikesCount.value = Number(val)))
  watch(() => authStore.user?.username, (username) => {
    isAuthor.value = username === props.author
  })

  const handleLike = async () => {
    const prevIsLiked = localIsLiked.value
    const prevCount = localLikesCount.value

    localIsLiked.value = !localIsLiked.value
    localLikesCount.value += localIsLiked.value ? 1 : -1

    try {
      const response = await toggleLikePost(props.postId)
      localIsLiked.value = response.is_liked
      localLikesCount.value = response.like_count

      invalidateKeys.forEach(key => {
        queryClient.invalidateQueries({ queryKey: key })
      })
    } catch (error) {
      console.error('Like toggle failed:', error)
      localIsLiked.value = prevIsLiked
      localLikesCount.value = prevCount
      alert('Failed to update like')
    }
  }

  const handleReport = async (reason: string) => {
    if (!reason) return
    try {
      await reportPost(props.postId, reason)
      alert('신고가 접수되었습니다.')
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      queryClient.invalidateQueries({ queryKey: ['shorts'] })
      isReportModalOpen.value = false
    } catch (error) {
      console.error('Report failed:', error)
      alert('신고에 실패했습니다.')
    }
  }

  const handleNotInterested = async () => {
    try {
      await interactWithPost(props.postId, 'NOT_INTERESTED')
      alert('관심없음으로 설정되었습니다.')
      isReportModalOpen.value = false
    } catch (error) {
      console.error('Not interested action failed:', error)
      alert('설정에 실패했습니다.')
    }
  }

  const handleDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    try {
      await deletePost(props.postId)
      alert('게시글이 삭제되었습니다.')

      // Always invalidate the general lists on delete
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      queryClient.invalidateQueries({ queryKey: ['shorts'] })

      invalidateKeys.forEach(key => {
        queryClient.invalidateQueries({ queryKey: key })
      })

      isReportModalOpen.value = false
    } catch (error) {
      console.error('Delete failed:', error)
      alert('삭제에 실패했습니다.')
    }
  }

  return {
    localIsLiked,
    localLikesCount,
    isReportModalOpen,
    isCommentModalOpen,
    isAuthor,
    handleLike,
    handleReport,
    handleNotInterested,
    handleDelete,
  }
}
