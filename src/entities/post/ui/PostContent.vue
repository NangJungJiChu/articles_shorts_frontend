<script setup lang="ts">
import { computed } from 'vue'
import { parseContentTokens } from '../lib/parseContentTokens'

const props = defineProps<{
  content: string
}>()

const parsedContent = computed(() => parseContentTokens(props.content))
</script>

<template>
  <div class="post-content">
    <div class="caption">
      <div class="text" v-html="parsedContent"></div>
    </div>
  </div>
</template>

<style scoped>
.caption {
  padding: 0 16px 16px;
  font-size: 15px;
  line-height: 1.5;
}

.text {
  color: var(--color-text);
  word-break: break-all;
}

.text :deep(.content-image) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 8px 0;
  display: block;
}

.text :deep(.content-video) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 8px 0;
  display: block;
}

.text :deep(.content-iframe) {
  width: 100%;
  height: 400px;
  border-radius: 8px;
  margin: 8px 0;
  display: block;
}
</style>
