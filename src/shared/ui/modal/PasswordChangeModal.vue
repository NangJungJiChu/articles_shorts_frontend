<script setup lang="ts">
import { ref } from 'vue'
import { Modal } from '@/shared/ui/modal'
import { Button } from '@/shared/ui/button'
import { httpClient } from '@/shared/api'

interface Props {
  isOpen: boolean
}

const emit = defineEmits<{
  (e: 'close'): void
}>()

const props = defineProps<Props>()

const oldPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const isSubmitting = ref(false)
const error = ref('')

const handleClose = () => {
  emit('close')
  // Reset form
  oldPassword.value = ''
  newPassword.value = ''
  confirmPassword.value = ''
  error.value = ''
}

const handleSubmit = async () => {
  if (newPassword.value !== confirmPassword.value) {
    error.value = '새 비밀번호가 일치하지 않습니다.'
    return
  }

  if (newPassword.value.length < 8) {
      error.value = '비밀번호는 8자 이상이어야 합니다.'
      return
  }

  try {
    isSubmitting.value = true
    error.value = ''
    
    await httpClient.post('/accounts/api/password/change/', {
        old_password: oldPassword.value,
        new_password: newPassword.value
    })

    alert('비밀번호가 변경되었습니다.')
    handleClose()
  } catch (err: any) {
    console.error(err)
    if (err.response?.data?.error) {
        error.value = err.response.data.error
    } else {
        error.value = '비밀번호 변경에 실패했습니다.'
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <Modal :isOpen="isOpen" title="비밀번호 변경" @close="handleClose">
    <div class="password-form">
      <div class="input-group">
        <label>현재 비밀번호</label>
        <input v-model="oldPassword" type="password" placeholder="현재 비밀번호를 입력해주세요" class="form-input" />
      </div>

      <div class="input-group">
        <label>새 비밀번호</label>
        <input v-model="newPassword" type="password" placeholder="새 비밀번호 (8자 이상)" class="form-input" />
      </div>

      <div class="input-group">
        <label>새 비밀번호 확인</label>
        <input v-model="confirmPassword" type="password" placeholder="새 비밀번호를 한번 더 입력해주세요" class="form-input" />
      </div>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <div class="form-actions">
        <Button variant="secondary" @click="handleClose" :disabled="isSubmitting">
          취소
        </Button>
        <Button variant="primary" @click="handleSubmit" :disabled="isSubmitting || !oldPassword || !newPassword">
          {{ isSubmitting ? '변경 중...' : '변경하기' }}
        </Button>
      </div>
    </div>
  </Modal>
</template>

<style scoped>
.password-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-group label {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-gray-700);
}

.form-input {
  padding: 10px 12px;
  border: 1px solid var(--color-gray-300);
  border-radius: 8px;
  font-size: 14px;
  outline: none;
}

.form-input:focus {
  border-color: var(--color-blue-500);
}

.error-message {
  color: var(--color-danger);
  font-size: 13px;
  text-align: center;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}
</style>
