<script setup lang="ts">
defineProps<{
  src: string
  alt?: string
  size?: number
}>()
</script>

<template>
  <div class="avatar" :style="{ width: size + 'px', height: size + 'px' }">
    <img :src="src" :alt="alt || 'User avatar'" />
  </div>
</template>

<style scoped>
.avatar {
  border-radius: 50%;
  overflow: hidden;
  border: 1px solid var(--color-border);
  flex-shrink: 0;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
