<script setup lang="ts">
import { Icon } from '@/shared/ui/icon'

interface Props {
    modelValue: 'likes' | 'posts'
}

interface Emits {
    (e: 'update:modelValue', value: 'likes' | 'posts'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const selectTab = (tab: 'likes' | 'posts') => {
    emit('update:modelValue', tab)
}
</script>

<template>
    <div class="profile-tabs">
        <!-- Likes Tab -->
        <button class="tab-item" :class="{ 'is-active': modelValue === 'likes' }" @click="selectTab('likes')">
            <Icon name="favorite" :type="modelValue === 'likes' ? 'filled' : 'outlined'" />
            <span class="tab-label">Likes</span>
        </button>

        <!-- Posts Tab -->
        <button class="tab-item" :class="{ 'is-active': modelValue === 'posts' }" @click="selectTab('posts')">
            <Icon name="article" :type="modelValue === 'posts' ? 'filled' : 'outlined'" />
            <span class="tab-label">Posts</span>
        </button>
    </div>
</template>

<style scoped>
.profile-tabs {
    width: 100%;
    display: flex;
    border-bottom: 1px solid #e0e0e0;
}

.tab-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 12px 0;
    background: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    cursor: pointer;
    color: #9e9e9e;
    /* Inactive color */
    transition: all 0.2s ease;
}

.tab-item.is-active {
    color: #000000;
    /* Active color */
    border-bottom-color: #000000;
}

.tab-label {
    font-family: var(--font-family-base);
    font-size: 14px;
    font-weight: 500;
}
</style>
