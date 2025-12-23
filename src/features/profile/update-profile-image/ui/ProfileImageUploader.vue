<script setup lang="ts">
import { ref } from 'vue'
import { ImageCropperModal } from '@/shared/ui/image-cropper'
import { uploadProfileImage } from '../api/uploadProfileImage'
import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { useAuthStore } from '@/features/auth/model/store'
import { Icon } from '@/shared/ui/icon'

interface Props {
  currentImageUrl?: string
}

defineProps<Props>()
const queryClient = useQueryClient()
const authStore = useAuthStore()

const fileInput = ref<HTMLInputElement | null>(null)
const selectedImage = ref<string | null>(null)
const isModalOpen = ref(false)
const timestamp = ref(Date.now())

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    selectedImage.value = URL.createObjectURL(file)
    isModalOpen.value = true
    // Reset input so same file can be selected again
    target.value = ''
  }
}

const { mutate: uploadImage, isPending: isUploading } = useMutation({
  mutationFn: uploadProfileImage,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onSuccess: async () => {
    // 1. Invalidate 'user' query (as requested)
    await queryClient.invalidateQueries({ queryKey: ['user'] })

    // 2. Fetch fresh user data to update Pinia store (which drives the UI)
    await authStore.fetchUser()

    // 3. Update timestamp to force image refresh
    timestamp.value = Date.now()

    closeModal()
  },
  onError: (error) => {
    console.error('Failed to upload image', error)
    alert('이미지 업로드에 실패했습니다.')
  }
})

const handleCrop = (blob: Blob) => {
  uploadImage(blob)
}

const closeModal = () => {
  isModalOpen.value = false
  selectedImage.value = null
}
</script>

<template>
  <div class="profile-uploader">
    <div class="image-wrapper" @click="triggerFileInput">
      <img
        :src="currentImageUrl ? `${currentImageUrl}?t=${timestamp}` : '/default-profile.svg'"
        alt="Profile"
        class="profile-image"
        :class="{ 'opacity-50': isUploading }"
      />

      <div class="overlay">
        <Icon name="photo_camera" class="camera-icon" />
      </div>

      <div v-if="isUploading" class="loading-overlay">
        <span class="spinner"></span>
      </div>
    </div>

    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      class="hidden-input"
      @change="handleFileChange"
    />

    <ImageCropperModal
      :is-open="isModalOpen"
      :image-src="selectedImage"
      @close="closeModal"
      @crop="handleCrop"
    />
  </div>
</template>

<style scoped>
.profile-uploader {
    position: relative;
    cursor: pointer;
    width: 120px;
    height: 120px;
}

.image-wrapper {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    overflow: hidden;
    position: relative;
    background-color: #f0f0f0;
}

.profile-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: opacity 0.2s;
}

.overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 30%;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s;
}

.image-wrapper:hover .overlay {
    opacity: 1;
}

.camera-icon {
    font-size: 20px;
    color: white;
}

.hidden-input {
    display: none;
}

.loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
}

.spinner {
    width: 24px;
    height: 24px;
    border: 3px solid #ddd;
    border-top-color: #333;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}
</style>
