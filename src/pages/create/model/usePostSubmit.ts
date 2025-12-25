
import { type Ref } from 'vue'
import { useRouter } from 'vue-router'
import { uploadImage } from '@/features/upload/api/uploadImage'
import { useCreatePostMutation } from '@/entities/post'

interface UsePostSubmitProps {
    title: Ref<string>
    content: Ref<string>
    categoryId: Ref<string | null>
    pendingImages: Ref<Map<string, File>>
    isNsfw: Ref<boolean>
    isProfane: Ref<boolean>
}

export function usePostSubmit({ title, content, categoryId, pendingImages, isNsfw, isProfane }: UsePostSubmitProps) {
    const router = useRouter()
    const { mutate: createPost, isPending: isSubmitting } = useCreatePostMutation()

    const submitPost = async () => {
        if (!title.value.trim() || !content.value.trim()) {
            alert('제목과 내용을 모두 입력해주세요.')
            return
        }

        if (!categoryId.value) {
            alert('카테고리를 선택해주세요.')
            return
        }

        try {
            let finalContent = content.value

            // filesToUpload array to preserve order for bulk upload
            const filesToUpload: File[] = []
            const blobUrlsToReplace: string[] = []

            for (const [blobUrl, file] of pendingImages.value.entries()) {
                if (finalContent.includes(blobUrl)) {
                    filesToUpload.push(file)
                    blobUrlsToReplace.push(blobUrl)
                } else {
                    // unused blob, revoke it
                    URL.revokeObjectURL(blobUrl)
                }
            }

            if (filesToUpload.length > 0) {
                const responseList = await uploadImage(filesToUpload)

                // Replace blobs with returned IDs
                responseList.forEach((response, index) => {
                    const blobUrl = blobUrlsToReplace[index]
                    const replacement = `/media/${response.id}.png`
                    if (blobUrl) {
                        finalContent = finalContent.split(blobUrl).join(replacement)
                        URL.revokeObjectURL(blobUrl)
                    }
                })
            }

            // Clear pending images map
            pendingImages.value.clear()

            createPost(
                {
                    title: title.value,
                    body: finalContent,
                    category: categoryId.value,
                    is_nsfw: isNsfw.value,
                    is_profane: isProfane.value
                },
                {
                    onSuccess: () => {
                        alert('게시글이 작성되었습니다.')
                        router.push('/')
                    },
                    onError: (error) => {
                        console.error('Failed to create post:', error)
                        alert('게시글 작성에 실패했습니다.')
                    }
                }
            )
        } catch (e) {
            console.error('Upload error', e)
            alert('이미지 업로드 중 오류가 발생했습니다.')
        }
    }

    return {
        isSubmitting,
        submitPost
    }
}
