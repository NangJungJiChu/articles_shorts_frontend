import { httpClient } from '@/shared/api'

export interface UploadImageResponse {
  id: string
  url: string
}

export const uploadImage = async (file: File): Promise<UploadImageResponse> => {
  const formData = new FormData()
  formData.append('image', file)

  const { data } = await httpClient.post<UploadImageResponse>(
    '/posts/api/upload/image/',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  )
  return data
}
