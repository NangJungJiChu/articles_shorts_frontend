<script setup lang="ts">
import { Modal } from '@/shared/ui/modal'
import { Button } from '@/shared/ui/button'
import { useConfirm } from './useConfirm'

const { isVisible, options, handleConfirm, handleCancel } = useConfirm()
</script>

<template>
    <Modal :isOpen="isVisible" :title="options.title" @close="handleCancel">
        <div class="confirm-content">
            <p class="confirm-message">{{ options.message }}</p>
            <div class="confirm-actions">
                <Button variant="secondary" @click="handleCancel" class="action-btn">
                    {{ options.cancelText }}
                </Button>
                <Button variant="primary" @click="handleConfirm" class="action-btn">
                    {{ options.confirmText }}
                </Button>
            </div>
        </div>
    </Modal>
</template>

<style scoped>
.confirm-content {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.confirm-message {
    font-size: 16px;
    color: var(--color-gray-800, #333);
    margin: 0;
    line-height: 1.5;
    text-align: center;
}

.confirm-actions {
    display: flex;
    gap: 12px;
}

.action-btn {
    flex: 1;
}
</style>
