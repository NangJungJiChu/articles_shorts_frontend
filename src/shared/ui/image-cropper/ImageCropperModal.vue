<script setup lang="ts">
import { ref } from 'vue'
import { Cropper } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'
import { Modal } from '@/shared/ui/modal'
import { Button } from '@/shared/ui/button'

interface Props {
  isOpen: boolean
  imageSrc: string | null
}

interface Emits {
  (e: 'close'): void
  (e: 'crop', blob: Blob): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const cropper = ref()

const handleCrop = () => {
  const { canvas } = cropper.value.getResult()
  if (canvas) {
    canvas.toBlob((blob: Blob | null) => {
      if (blob) {
        emit('crop', blob)
      }
    }, 'image/jpeg')
  }
}
</script>

<template>
  <Modal :is-open="isOpen" @close="$emit('close')" title="프로필 이미지 자르기">
    <div class="cropper-container" v-if="imageSrc">
      <Cropper
        ref="cropper"
        class="cropper"
        :src="imageSrc"
        :stencil-props="{
          aspectRatio: 1,
        }"
      />
    </div>

    <div class="modal-footer">
      <Button variant="secondary" @click="$emit('close')">취소</Button>
      <Button @click="handleCrop">저장</Button>
    </div>
  </Modal>
</template>

<style scoped>
.modal-title {
  font-size: 1.125rem;
  font-weight: 600;
}

.cropper-container {
  padding: 16px;
}

.cropper {
  height: 400px;
  width: 100%;
  background: #ddd;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
  padding: 0 16px 16px;
}
</style>
