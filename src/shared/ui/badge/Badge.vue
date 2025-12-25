<script setup lang="ts">
import { computed } from 'vue'

interface Props {
    variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'danger'
    size?: 'small' | 'medium'
}

const props = withDefaults(defineProps<Props>(), {
    variant: 'default',
    size: 'medium'
})

const classes = computed(() => {
    return [
        'badge',
        `badge--${props.variant}`,
        `badge--${props.size}`
    ]
})
</script>

<template>
    <span :class="classes">
        <slot></slot>
    </span>
</template>

<style scoped>
.badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 9999px;
    /* Pill shape */
    font-family: var(--font-family-base);
    font-weight: 500;
    white-space: nowrap;
    transition: all 0.2s ease;
}

/* Sizes */
.badge--small {
    padding: 2px 8px;
    font-size: 11px;
    height: 20px;
}

.badge--medium {
    padding: 4px 10px;
    font-size: 12px;
    height: 24px;
}

/* Variants */
.badge--default {
    background-color: var(--color-gray-100);
    color: var(--color-gray-700);
}

.badge--primary {
    background-color: var(--color-blue-50);
    color: var(--color-blue-700);
}

.badge--secondary {
    background-color: var(--color-gray-50);
    color: var(--color-gray-600);
    border: 1px solid var(--color-gray-200);
}

.badge--outline {
    background-color: transparent;
    border: 1px solid var(--color-gray-300);
    color: var(--color-gray-600);
}

.badge--danger {
    background-color: #fee2e2;
    color: var(--color-danger);
}
</style>
