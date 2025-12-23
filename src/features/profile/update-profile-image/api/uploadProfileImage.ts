import { httpClient } from '@/shared/api'

export const uploadProfileImage = async (imageBlob: Blob) => {
    const formData = new FormData()
    formData.append('file', imageBlob, 'profile_image.jpg')

    try {
        const response = await httpClient.post('/accounts/api/user/image/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        })
        return response.data
    } catch (error) {
        throw error
    }
}
