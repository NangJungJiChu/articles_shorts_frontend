<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { Icon } from '@/shared/ui/icon'

interface Props {
    isOpen: boolean
    title?: string
}

const props = defineProps<Props>()
const emit = defineEmits(['close'])

const handleClose = () => {
    emit('close')
}

// Prevent background scrolling when modal is open
onMounted(() => {
    // Watch logic could be added here if dynamic body lock is needed, 
    // but for simplicity we assume simplistic usage or add watch in parent/here if strictly needed.
    // For now, let's keep it simple CSS-based overlay.
})

</script>

<template>
    <Teleport to="body">
        <Transition name="modal-fade">
            <div v-if="isOpen" class="modal-overlay" @click="handleClose">
                <div class="modal-container" @click.stop>
                    <header class="modal-header" v-if="title || $slots.header">
                        <slot name="header">
                            <h3 class="modal-title">{{ title }}</h3>
                        </slot>
                        <button class="close-btn" @click="handleClose">
                            <Icon name="close" />
                        </button>
                    </header>
                    <div class="modal-content">
                        <slot />
                    </div>
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
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal-container {
    background-color: var(--color-white, #fff);
    border-radius: 12px;
    width: 90%;
    max-width: 400px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid #e0e0e0;
}

.modal-title {
    font-size: 18px;
    font-weight: 600;
    margin: 0;
}

.close-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
}

.modal-content {
    padding: 16px;
}

/* Transitions */
.modal-fade-enter-active,
.modal-fade-leave-active {
    transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
    opacity: 0;
}
</style>
