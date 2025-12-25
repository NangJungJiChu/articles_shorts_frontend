<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@/shared/ui/icon'
import { httpClient } from '@/shared/api'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits(['close', 'verified'])

const isLoading = ref(false)

const handleKakaoLogin = async () => {
  try {
    isLoading.value = true
    const currentPath = window.location.pathname + window.location.search
    console.log('Fetching Kakao login URL with next path:', currentPath)
    const resp = await httpClient.get(`/accounts/api/kakao/login/?next=${encodeURIComponent(currentPath)}`)
    console.log('Kakao Response:', resp.data)
    if (resp.data.url) {
      window.location.href = resp.data.url
    }
  } catch (err: any) {
    console.error('Failed to get Kakao login URL:', err)
    if (err.response) {
       console.error('Error status:', err.response.status)
       console.error('Error data:', err.response.data)
    }
    alert('카카오 로그인 요청에 실패했습니다. 서버 상태를 확인해주세요.')
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="isOpen" class="modal-overlay" @click.self="emit('close')">
        <div class="auth-modal">
          <header class="auth-header">
            <h1 class="header-title">본인 확인</h1>
            <button class="close-btn" @click="emit('close')">
              <Icon name="close" />
            </button>
          </header>

          <main class="auth-body">
            <div class="kakao-container">
              <div class="kakao-logo">
                <img src="https://upload.wikimedia.org/wikipedia/commons/e/e3/KakaoTalk_logo.svg" alt="Kakao" />
              </div>
              <h2 class="auth-title">카카오 인증이 필요합니다</h2>
              <p class="auth-desc">성인 콘텐츠 접근을 위해 위 인증 절차가 필요합니다.<br>19세 이상인 경우에만 접근이 허용됩니다.</p>
              
              <button class="kakao-btn" @click="handleKakaoLogin" :disabled="isLoading">
                <img src="https://upload.wikimedia.org/wikipedia/commons/e/e3/KakaoTalk_logo.svg" class="btn-icon" />
                {{ isLoading ? '인증 페이지로 이동 중...' : '카카오로 1초 만에 인증하기' }}
              </button>
              
              <p class="legal-info">인증을 진행하면 정보통신망법에 따른<br>본인확인 절차에 동의하는 것으로 간주됩니다.</p>
            </div>
          </main>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(8px);
}

.auth-modal {
  width: 90%;
  max-width: 380px;
  background: white;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.auth-header {
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f8fafc;
}

.header-title {
  font-size: 15px;
  font-weight: 600;
  color: #64748b;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #94a3b8;
  padding: 4px;
}

.auth-body {
  padding: 40px 24px;
}

.kakao-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.kakao-logo {
  width: 64px;
  height: 64px;
  background: #fee500;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  box-shadow: 0 8px 16px -4px rgba(254, 229, 0, 0.4);
}

.kakao-logo img {
  width: 36px;
  height: 36px;
}

.auth-title {
  font-size: 20px;
  font-weight: 800;
  color: #1a1a1b;
  margin-bottom: 12px;
}

.auth-desc {
  font-size: 14px;
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 32px;
}

.kakao-btn {
  width: 100%;
  height: 54px;
  background: #fee500;
  color: #1a1a1b;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px -2px rgba(254, 229, 0, 0.3);
}

.kakao-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px -2px rgba(254, 229, 0, 0.4);
}

.kakao-btn:active {
  transform: scale(0.98);
}

.btn-icon {
  width: 20px;
  height: 20px;
}

.legal-info {
  margin-top: 24px;
  font-size: 12px;
  color: #94a3b8;
  line-height: 1.5;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
