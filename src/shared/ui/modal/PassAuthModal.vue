<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@/shared/ui/icon'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits(['close', 'verified'])

const step = ref(1) // 1: Carrier Select, 2: Info Input, 3: Processing
const selectedCarrier = ref('')
const name = ref('')
const phone = ref('')

const carriers = [
  { id: 'sk_telecom', name: 'SKT', color: '#E60000' },
  { id: 'kt', name: 'KT', color: '#00B1A7' },
  { id: 'lg_uplus', name: 'LG U+', color: '#ED008C' },
  { id: 'sk_7mobile', name: 'SK7모바일', color: '#555' },
  { id: 'kt_m', name: 'kt M모바일', color: '#555' },
  { id: 'uplus_m', name: 'U+알뜰폰', color: '#555' }
]

const selectCarrier = (id: string) => {
  selectedCarrier.value = id
  step.value = 2
}

const handleVerify = () => {
  if (!name.value || !phone.value) {
    alert('이름과 전화번호를 입력해주세요.')
    return
  }
  step.value = 3
  setTimeout(() => {
    emit('verified')
  }, 2000)
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="isOpen" class="modal-overlay" @click.self="emit('close')">
        <div class="pass-modal">
          <header class="pass-header">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/PASS_logo_South_Korea.svg/1200px-PASS_logo_South_Korea.svg.png" alt="PASS" class="pass-logo" />
            <button class="close-btn" @click="emit('close')">
              <Icon name="close" />
            </button>
          </header>

          <main class="pass-body">
            <!-- Step 1: Carrier Selection -->
            <div v-if="step === 1" class="step-container">
              <h2 class="step-title">본인확인을 위한 통신사를 선택해주세요</h2>
              <div class="carrier-grid">
                <button 
                  v-for="c in carriers" 
                  :key="c.id" 
                  class="carrier-item"
                  @click="selectCarrier(c.id)"
                >
                  <span class="carrier-name">{{ c.name }}</span>
                </button>
              </div>
            </div>

            <!-- Step 2: User Information -->
            <div v-if="step === 2" class="step-container">
              <button class="back-link" @click="step = 1">
                <Icon name="arrow_back" size="small" /> 통신사 다시 선택
              </button>
              <h2 class="step-title">정보를 입력해주세요</h2>
              <div class="input-group">
                <label>이름</label>
                <input v-model="name" type="text" placeholder="성명 입력" />
              </div>
              <div class="input-group">
                <label>휴대폰 번호</label>
                <input v-model="phone" type="tel" placeholder="'-' 없이 숫자만 입력" />
              </div>
              <p class="terms-text">본인확인을 위해 서비스 이용약관에 동의합니다.</p>
              <button class="submit-btn" @click="handleVerify">인증하기</button>
            </div>

            <!-- Step 3: Processing -->
            <div v-if="step === 3" class="step-container loading-state">
              <div class="spinner"></div>
              <p>PASS 앱에서 인증을 완료해주세요...</p>
              <p class="small-text">인증 요청이 휴대폰으로 전송되었습니다.</p>
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
  backdrop-filter: blur(4px);
}

.pass-modal {
  width: 90%;
  max-width: 400px;
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.pass-header {
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
}

.pass-logo {
  height: 24px;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #999;
}

.pass-body {
  padding: 24px 20px;
}

.step-title {
  font-size: 18px;
  font-weight: 700;
  color: #333;
  margin-bottom: 24px;
  line-height: 1.4;
}

.carrier-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.carrier-item {
  height: 60px;
  border: 1px solid #eee;
  border-radius: 12px;
  background: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.carrier-item:hover {
  border-color: #3b82f6;
  background: #f0f7ff;
}

.input-group {
  margin-bottom: 16px;
}

.input-group label {
  display: block;
  font-size: 13px;
  color: #666;
  margin-bottom: 6px;
}

.input-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 15px;
}

.terms-text {
  font-size: 12px;
  color: #999;
  margin-top: 20px;
}

.submit-btn {
  width: 100%;
  padding: 14px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 40px;
  font-weight: 700;
  margin-top: 12px;
  cursor: pointer;
}

.back-link {
  background: none;
  border: none;
  color: #666;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 16px;
  cursor: pointer;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 0;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.small-text {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}

/* Transitions */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
