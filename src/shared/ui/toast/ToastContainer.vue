<script setup lang="ts">
import { useToast } from './useToast'
import ToastItem from './Toast.vue'

const { toasts } = useToast()
</script>

<template>
    <div class="toast-container">
        <TransitionGroup name="toast">
            <ToastItem v-for="toast in toasts" :key="toast.id" :message="toast.message" :type="toast.type" />
        </TransitionGroup>
    </div>
</template>

<style scoped>
.toast-container {
    position: fixed;
    bottom: 80px;
    /* Above bottom nav */
    left: 50%;
    transform: translateX(-50%);
    z-index: 9999;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 600px;
    pointer-events: none;
    /* Allow clicks to pass through container */
    padding: 0 16px;
}

.toast-enter-active,
.toast-leave-active {
    transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
    opacity: 0;
    transform: translateY(20px);
}
</style>
