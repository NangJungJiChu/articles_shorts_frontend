<script setup lang="ts">
import { Home, Search, PlusSquare, Film, User } from 'lucide-vue-next'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const goTo = (path: string) => {
  router.push(path)
}

const isActive = (path: string) => route.path === path
</script>

<template>
  <nav class="bottom-nav">
    <button class="nav-item" :class="{ active: isActive('/') }" @click="goTo('/')">
      <Home :size="24" :stroke-width="isActive('/') ? 3 : 2" />
    </button>
    <button class="nav-item tooltip-container">
      <Search :size="24" />
      <span class="tooltip">Coming Soon</span>
    </button>
    <button class="nav-item tooltip-container">
      <PlusSquare :size="24" />
      <span class="tooltip">Coming Soon</span>
    </button>
    <button class="nav-item" :class="{ active: isActive('/shorts') }" @click="goTo('/shorts')">
      <Film :size="24" :stroke-width="isActive('/shorts') ? 3 : 2" />
    </button>
    <button class="nav-item tooltip-container">
      <User :size="24" />
      <span class="tooltip">Coming Soon</span>
    </button>
  </nav>
</template>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: var(--nav-height);
  background-color: var(--color-bg);
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 100;
}

.nav-item {
  padding: 10px;
  color: var(--color-text);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.nav-item.active {
  color: var(--color-text);
}

.tooltip-container:hover .tooltip {
  visibility: visible;
  opacity: 1;
}

.tooltip {
  visibility: hidden;
  width: 100px;
  background-color: #333;
  color: #fff;
  text-align: center;
  border-radius: 6px;
  padding: 5px 0;
  position: absolute;
  z-index: 1;
  bottom: 125%; /* Position above the icon */
  left: 50%;
  margin-left: -50px;
  opacity: 0;
  transition: opacity 0.3s;
  font-size: 12px;
}

.tooltip::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -5px;
  border-width: 5px;
  border-style: solid;
  border-color: #333 transparent transparent transparent;
}
</style>
