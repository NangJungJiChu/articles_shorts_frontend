import { ref, watch } from 'vue'
import { toggleLikePost, interactWithPost, reportPost } from '@/features/post-interaction'
import { deletePost } from '@/entities/post'
import { queryClient } from '@/shared/api'
import { useAuthStore } from '@/features/auth'
import { useToast } from '@/shared/ui/toast'
import { useConfirm } from '@/shared/ui/confirm'
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
  // change isReportModalOpen
  const isMenuModalOpen = ref(false)
  const isCommentModalOpen = ref(false)

  const authStore = useAuthStore()
  const isAuthor = ref(authStore.user?.username === props.author)

  const { showToast } = useToast()
  const { confirm } = useConfirm()

  watch(
    () => props.isLiked,
    (val) => (localIsLiked.value = val),
  )
  watch(
    () => props.likesCount,
    (val) => (localLikesCount.value = Number(val)),
  )
  watch(
    () => authStore.user?.username,
    (username) => {
      isAuthor.value = username === props.author
    },
  )

  const handleLike = async () => {
    const prevIsLiked = localIsLiked.value
    const prevCount = localLikesCount.value

    localIsLiked.value = !localIsLiked.value
    localLikesCount.value += localIsLiked.value ? 1 : -1

    try {
      const response = await toggleLikePost(props.postId)
      localIsLiked.value = response.is_liked
      localLikesCount.value = response.like_count

      invalidateKeys.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key })
      })
    } catch (error) {
      console.error('Like toggle failed:', error)
      localIsLiked.value = prevIsLiked
      localLikesCount.value = prevCount
      showToast('좋아요 업데이트에 실패했습니다.', 'error')
    }
  }

  const handleReport = async (reason: string): Promise<boolean> => {
    if (!reason) return false
    try {
      isMenuModalOpen.value = false
      showToast('신고가 접수되었습니다.', 'success')
      await reportPost(props.postId, reason)
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      queryClient.invalidateQueries({ queryKey: ['shorts'] })
      return true
    } catch (error) {
      console.error('Report failed:', error)
      showToast('신고 접수에 실패했습니다.', 'error')
      return false
    }
  }

  const handleNotInterested = async (): Promise<boolean> => {
    try {
      isMenuModalOpen.value = false
      await interactWithPost(props.postId, 'NOT_INTERESTED')
      showToast('관심 없음으로 설정되었습니다.', 'success')
      return true
    } catch (error) {
      console.error('Not interested action failed:', error)
      showToast('작업에 실패했습니다.', 'error')
      return false
    }
  }

  const handleDelete = async (): Promise<boolean> => {
    const confirmed = await confirm('게시글을 정말 삭제하시겠습니까?', '삭제 확인')
    if (!confirmed) return false

    try {
      await deletePost(props.postId)
      showToast('게시글이 삭제되었습니다.', 'success')

      // Always invalidate the general lists on delete
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      queryClient.invalidateQueries({ queryKey: ['shorts'] })

      invalidateKeys.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key })
      })

      isMenuModalOpen.value = false
      return true
    } catch (error) {
      console.error('Delete failed:', error)
      showToast('삭제에 실패했습니다.', 'error')
      return false
    }
  }

  return {
    localIsLiked,
    localLikesCount,
    isMenuModalOpen,
    isCommentModalOpen,
    isAuthor,
    handleLike,
    handleReport,
    handleNotInterested,
    handleDelete,
  }
}
