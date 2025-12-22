import { defineStore } from 'pinia'
import { ref } from 'vue'
import { userApi } from '../api/user'
import type { User } from '../model/types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isAuthenticated = ref(false)

  const fetchUser = async () => {
    try {
      const userData = await userApi.getUser()
      user.value = userData
      isAuthenticated.value = true
    } catch (error) {
      console.error('Failed to fetch user:', error)
      user.value = null
      isAuthenticated.value = false
    }
  }

  return {
    user,
    isAuthenticated,
    fetchUser,
  }
})
