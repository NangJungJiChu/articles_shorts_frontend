<script setup lang="ts">
import { useRouter } from 'vue-router'
import ShortFormList from '@/widgets/short-form/ShortFormList.vue'
import { ArrowLeft } from 'lucide-vue-next'

const router = useRouter()

const goToFeed = () => {
  router.push('/')
}
</script>

<template>
  <div class="short-form-page">
    <button class="back-button" @click="goToFeed">
      <ArrowLeft :size="24" />
    </button>
    <ShortFormList />
  </div>
</template>

<style scoped>
.short-form-page {
  height: 100vh;
  width: 100%;
  max-width: var(--max-width-feed);
  margin: 0 auto;
  background-color: #000;
  color: #fff;
  position: relative;
  border-left: 1px solid #333;
  border-right: 1px solid #333;
}

.back-button {
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 100;
  color: white;
  background: transparent;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.1);
}
</style>
