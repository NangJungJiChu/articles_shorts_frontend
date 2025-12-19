<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'primary' | 'secondary'
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'medium',
  disabled: false,
  type: 'button',
})

const classes = computed(() => {
  return [
    'btn',
    `btn-${props.variant}`,
    `btn-${props.size}`,
    { 'btn-disabled': props.disabled },
  ]
})
</script>

<template>
  <button :class="classes" :disabled="props.disabled" :type="props.type">
    <slot></slot>
  </button>
</template>

<style scoped>
.btn {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
  cursor: pointer;
  border-radius: 8px;
  color: var(--color-white);
  transition: background-color 0.2s;
}

/* Sizes & Typography */
.btn-small {
  height: 48px;
  /* label-large */
  font-family: var(--font-family-base);
  font-size: var(--font-label-large-size);
  line-height: var(--font-label-large-line-height);
  letter-spacing: var(--font-label-large-letter-spacing);
  font-weight: 500;
}

.btn-medium {
  height: 56px;
  /* body-medium + emphasize (font-weight: 500) */
  font-family: var(--font-family-base);
  font-size: var(--font-body-medium-size);
  line-height: var(--font-body-medium-line-height);
  letter-spacing: var(--font-body-medium-letter-spacing);
  font-weight: 500;
}

.btn-large {
  height: 64px;
  /* body-large + emphasize (font-weight: 500) */
  font-family: var(--font-family-base);
  font-size: var(--font-body-large-size);
  line-height: var(--font-body-large-line-height);
  letter-spacing: var(--font-body-large-letter-spacing);
  font-weight: 500;
}

/* Primary Variant */
.btn-primary {
  background-color: var(--color-blue-600);
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--color-blue-500);
}

/* Secondary Variant */
.btn-secondary {
  background-color: var(--color-blue-300);
}

.btn-secondary:hover:not(:disabled) {
  background-color: var(--color-blue-200);
}

/* Disabled State */
.btn-disabled {
  background-color: var(--color-gray-400);
  cursor: not-allowed;
}
</style>
