<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { loginApi, useAuthStore } from '@/features/auth'

const router = useRouter()
const authStore = useAuthStore()
const username = ref('')
const password = ref('')
const isLoading = ref(false)

const handleLogin = async () => {
    if (!username.value || !password.value) {
        alert('Please enter username and password')
        return
    }

    try {
        isLoading.value = true
        const response = await loginApi.login({
            username: username.value,
            password: password.value,
        })

        localStorage.setItem('accessToken', response.access)
        localStorage.setItem('refreshToken', response.refresh)

        // Fetch user info
        await authStore.fetchUser()

        router.push('/')
    } catch (error) {
        console.error('Login failed:', error)
        alert('Login failed. Please check your credentials.')
    } finally {
        isLoading.value = false
    }
}
</script>

<template>
    <div class="login-page">
        <div class="login-container">
            <div class="logo-area">
                <img src="/logo.svg" alt="NUUC Logo" class="logo" />
            </div>

            <form @submit.prevent="handleLogin">
                <div class="input-group">
                    <Input v-model="username" placeholder="Username" />
                    <Input v-model="password" placeholder="Password" type="password" />
                </div>

                <div class="button-area">
                    <Button type='submit' class="submit-btn" size="small">
                        Log in
                    </Button>
                </div>
            </form>
        </div>

        <div class="footer-area">
            <span class="footer-text">Don't have an account? </span>
            <RouterLink to="/signup" class="link-text">Sign up</RouterLink>
        </div>
    </div>
</template>

<style scoped>
.login-page {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100dvh;
    padding: 16px;
    background-color: var(--color-white);
}

.login-container {
    box-sizing: border-box;
    width: 100%;
    max-width: 490px;
    padding: 40px;
    border: 1px solid #dbdbdb;
    border-radius: 8px;
    /* Optional conceptual border similar to IG */
    margin-bottom: 10px;
    background-color: var(--color-white);
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.logo-area {
    display: flex;
    justify-content: center;
    margin-bottom: 12px;
}

.logo {
    height: 40px;
}

.input-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.button-area {
    margin-top: 8px;
}

.footer-area {
    box-sizing: border-box;
    width: 100%;
    max-width: 490px;
    padding: 20px;
    border: 1px solid #dbdbdb;
    border-radius: 8px;
    text-align: center;
    background-color: var(--color-white);
}

.footer-text {
    font-family: var(--font-family-base);
    font-size: 14px;
    color: #000;
}

.link-text {
    font-family: var(--font-family-base);
    font-size: 14px;
    font-weight: 600;
    color: var(--color-blue-600);
    text-decoration: none;
}
</style>
