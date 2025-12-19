<script setup lang="ts">
import { computed } from 'vue'

interface Props {
    name: string
    type?: 'filled' | 'outlined'
}

const props = withDefaults(defineProps<Props>(), {
    type: 'outlined',
})

const classes = computed(() => {
    return [
        'material-symbols-outlined',
        { 'icon-filled': props.type === 'filled' },
    ]
})
</script>

<template>
    <span :class="classes">
        {{ props.name }}
    </span>
</template>

<style scoped>
.material-symbols-outlined {
    /* Default to outlined (FILL 0) */
    font-variation-settings:
        'FILL' 0,
        'wght' 400,
        'GRAD' 0,
        'opsz' 24;

    /* Ensure correct sizing if needed, though usually handled by font or parent */
    font-size: 24px;
    user-select: none;
}

.icon-filled {
    font-variation-settings:
        'FILL' 1,
        'wght' 400,
        'GRAD' 0,
        'opsz' 24;
}
</style>
