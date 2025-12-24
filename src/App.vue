<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { BottomTabBar } from '@/widgets/bottom-navigation/ui'
import { useAuthStore } from '@/features/auth'
import { ToastContainer } from '@/shared/ui/toast'
import { ConfirmModal } from '@/shared/ui/confirm'

const route = useRoute()
const showBottomNav = computed(() => !!route.meta.requiresAuth)
const authStore = useAuthStore()

onMounted(() => {
    // If token exists, fetch user
    if (localStorage.getItem('accessToken')) {
        authStore.fetchUser()
    }
})
</script>

<template>
    <div class="app-container">
        <div class="content-layout">
            <RouterView />
            <div v-if="showBottomNav" class="bottom-nav-wrapper">
                <BottomTabBar />
            </div>
            <ToastContainer />
            <ConfirmModal />
        </div>
    </div>
</template>

<style>
body {
    margin: 0;
}
</style>

<style scoped>
.app-container {
    min-height: 100vh;
    background-color: #fafafa;
    /* Optional: distinct bg for outside area */
}

.content-layout {
    width: 100%;
    max-width: 610px;
    margin: 0 auto;
    position: relative;
    background-color: var(--color-white);
    min-height: 100vh;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
    /* Optional: visual separation */
}

.bottom-nav-wrapper {
    position: fixed;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    max-width: 610px;
    z-index: 1000;
    background-color: var(--color-white);
}
</style>
