<script setup lang="ts">
import { onMounted } from 'vue'
import type { ToastType } from './useToast'
import { Icon } from '@/shared/ui/icon'

interface Props {
    message: string
    type: ToastType
}

const props = defineProps<Props>()

onMounted(() => {
    // Optional: Add sound or haptic feedback here
})
</script>

<template>
    <div class="toast" :class="`toast-${props.type}`">
        <div class="icon-wrapper">
            <Icon v-if="props.type === 'success'" name="check_circle" :size="20" class="toast-icon success-icon" />
            <Icon v-else-if="props.type === 'error'" name="error" :size="20" class="toast-icon error-icon" />
            <Icon v-else name="info" :size="20" class="toast-icon info-icon" />
        </div>
        <span class="message">{{ props.message }}</span>
    </div>
</template>

<style scoped>
.toast {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    border-radius: 8px;
    background-color: var(--color-white);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    margin-bottom: 10px;
    min-width: 300px;
    max-width: 90%;
    animation: slide-in 0.3s ease-out forwards;
    pointer-events: auto;
    border: 1px solid rgba(0, 0, 0, 0.05);
}

.toast-success {
    border-left: 4px solid var(--color-green-500, #22c55e);
}

.toast-error {
    border-left: 4px solid var(--color-red-500, #ef4444);
}

.toast-info {
    border-left: 4px solid var(--color-blue-500, #3b82f6);
}

.icon-wrapper {
    margin-right: 12px;
    display: flex;
    align-items: center;
}

.success-icon {
    color: var(--color-green-500, #22c55e);
}

.error-icon {
    color: var(--color-red-500, #ef4444);
}

.info-icon {
    color: var(--color-blue-500, #3b82f6);
}

.message {
    font-size: 14px;
    color: var(--color-gray-900, #1f2937);
    font-weight: 500;
}

@keyframes slide-in {
    from {
        transform: translateY(100%);
        opacity: 0;
    }

    to {
        transform: translateY(0);
        opacity: 1;
    }
}
</style>
