<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { signupApi, loginApi } from '@/features/auth'
import { isAxiosError } from 'axios'

const router = useRouter()
const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)

const handleSignup = async () => {
    if (!username.value || !password.value || !confirmPassword.value) {
        alert('Please fill in all fields')
        return
    }

    if (password.value !== confirmPassword.value) {
        alert('Passwords do not match')
        return
    }

    try {
        isLoading.value = true
        // 1. Signup
        await signupApi.signup({
            username: username.value,
            password: password.value,
        })

        // 2. Auto Login
        const response = await loginApi.login({
            username: username.value,
            password: password.value,
        })

        // 3. Save tokens and redirect
        localStorage.setItem('accessToken', response.access)
        localStorage.setItem('refreshToken', response.refresh)
        router.push('/')

    } catch (error) {
        console.error('Signup failed:', error)
        if (isAxiosError(error) && error.response?.data?.username) {
            alert('Username already exists')
        } else {
            alert('Signup failed. Please try again.')
        }
    } finally {
        isLoading.value = false
    }
}
</script>

<template>
    <div class="signup-page">
        <div class="signup-container">
            <div class="logo-area">
                <img src="/logo.svg" alt="NUUC Logo" class="logo" />
            </div>

            <form @submit.prevent="handleSignup">
                <div class="input-group">
                    <Input v-model="username" placeholder="Username" />
                    <Input v-model="password" placeholder="Password" type="password" />
                    <Input v-model="confirmPassword" placeholder="Confirm Password" type="password" />
                </div>

                <div class="button-area">
                    <Button type="submit" class="submit-btn" size="small">
                        Sign up
                    </Button>
                </div>
            </form>
        </div>

        <div class="footer-area">
            <span class="footer-text">Have an account? </span>
            <RouterLink to="/login" class="link-text">Log in</RouterLink>
        </div>
    </div>
</template>

<style scoped>
.signup-page {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 16px;
    background-color: var(--color-white);
}

.signup-container {
    box-sizing: border-box;
    width: 100%;
    max-width: 490px;
    padding: 40px;
    border: 1px solid #dbdbdb;
    border-radius: 8px;
    margin-bottom: 10px;
    background-color: var(--color-white);
    display: flex;
    flex-direction: column;
    gap: 10px;
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
