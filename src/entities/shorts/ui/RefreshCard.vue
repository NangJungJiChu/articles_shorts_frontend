<script setup lang="ts">
import { Icon } from '@/shared/ui/icon'
import { Button } from '@/shared/ui/button'

defineEmits<{
    (e: 'refresh'): void
}>()
</script>

<template>
    <div class="refresh-card">
        <div class="content">
            <Icon name="check_circle" class="check-icon" />
            <div class="text-group">
                <h2 class="title">모든 추천을 확인했어요!</h2>
                <p class="description">
                    새로운 추천 게시글을 보시겠어요?
                </p>
            </div>
            <Button variant="primary" size="large" @click="$emit('refresh')">
                <Icon name="refresh" />
                새로고침
            </Button>
        </div>
    </div>
</template>

<style scoped>
.refresh-card {
    width: 100%;
    height: 100dvh;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--color-gray-50);
    scroll-snap-align: start;
    scroll-snap-stop: always;
}

.content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 32px;
    padding: 24px;
    text-align: center;
}

.check-icon {
    font-size: 64px;
    color: var(--color-blue-500);
}

.text-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.title {
    font-size: 24px;
    font-weight: 700;
    color: var(--color-gray-900);
    margin: 0;
}

.description {
    font-size: 16px;
    color: var(--color-gray-600);
    margin: 0;
}
</style>
