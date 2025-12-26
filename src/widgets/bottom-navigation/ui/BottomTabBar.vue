<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'
import { Icon } from '@/shared/ui/icon'
import { useQueryClient } from '@tanstack/vue-query'
import { postKeys } from '@/entities/post'

const route = useRoute()
// const router = useRouter()
const queryClient = useQueryClient()

const handleHomeClick = async (navigate: () => void) => {
  if (route.name === 'home') {
    await queryClient.invalidateQueries({ queryKey: postKeys.recommended() })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  navigate()
}

const handleShortsClick = async (navigate: () => void) => {
  if (route.name === 'shorts') {
    await queryClient.invalidateQueries({ queryKey: postKeys.recommended() })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  navigate()
}

// const handleSearchClick = (navigate: () => void) => {
//   if (route.name === 'search') {
//     router.push({ name: 'search', query: { reset: 'true' } })
//   } else {
//     navigate()
//   }
// }
</script>

<template>
  <nav class="bottom-tab-bar">
    <!-- Home Tab -->
    <RouterLink :to="{ name: 'home' }" custom v-slot="{ navigate, isActive }">
      <button class="tab-item" :class="{ 'is-active': isActive }" @click="handleHomeClick(navigate)">
        <Icon name="home" :type="isActive ? 'filled' : 'outlined'" />
        <span class="tab-label">Home</span>
      </button>
    </RouterLink>

    <!-- Search Tab -->
    <!-- <RouterLink :to="{ name: 'search' }" custom v-slot="{ navigate, isActive }">
            <button class="tab-item" :class="{ 'is-active': isActive }" @click="handleSearchClick(navigate)">
                <Icon name="search" :type="isActive ? 'filled' : 'outlined'" />
                <span class="tab-label">Search</span>
            </button>
        </RouterLink> -->

    <!-- Shorts Tab -->
    <RouterLink :to="{ name: 'shorts' }" custom v-slot="{ navigate, isActive }">
      <button class="tab-item" :class="{ 'is-active': isActive }" @click="handleShortsClick(navigate)">
        <Icon name="article" :type="isActive ? 'filled' : 'outlined'" />
        <span class="tab-label">Shorts</span>
      </button>
    </RouterLink>

    <!-- Create Tab -->
    <RouterLink :to="{ name: 'create' }" custom v-slot="{ navigate, isActive }">
      <button class="tab-item" :class="{ 'is-active': isActive }" @click="navigate">
        <Icon name="add_circle" :type="isActive ? 'filled' : 'outlined'" />
        <span class="tab-label">Create</span>
      </button>
    </RouterLink>

    <!-- Profile Tab -->
    <RouterLink :to="{ name: 'profile' }" custom v-slot="{ navigate, isActive }">
      <button class="tab-item" :class="{ 'is-active': isActive }" @click="navigate">
        <Icon name="account_circle" :type="isActive ? 'filled' : 'outlined'" />
        <span class="tab-label">Profile</span>
      </button>
    </RouterLink>
  </nav>
</template>

<style scoped>
.bottom-tab-bar {
  display: flex;
  width: 100%;
  height: 100%;
  /* Fill wrapper */
  background: var(--color-white);
  border-top: 1px solid #e0e0e0;
  padding-bottom: env(safe-area-inset-bottom);
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 0;
  background: transparent;
  border: none;
  cursor: pointer;
  color: #000;
  text-decoration: none;
}

.tab-item.is-active {
  color: var(--color-blue-600);
}

.tab-label {
  font-family: var(--font-family-base);
  font-size: 12px;
  font-weight: 500;
}
</style>
