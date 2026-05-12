import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '../utils/api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const username = ref<string>('')
  const isAdmin = ref<boolean>(false)
  const showAuthModal = ref<boolean>(false)
  const showOnboardingModal = ref<boolean>(false)

  const isAuthenticated = computed(() => !!token.value)

  async function login(user: string, password: string) {
    const res = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: user, password })
    })
    
    if (res.token) {
      token.value = res.token
      username.value = user
      localStorage.setItem('token', res.token)
      showAuthModal.value = false
      
      if (res.needsOnboarding) {
        showOnboardingModal.value = true
      }
      
      await checkAdmin()
      return true
    }
    return false
  }

  async function register(user: string, password: string) {
    const res = await api('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username: user, password })
    })
    
    if (res.token) {
      token.value = res.token
      username.value = user
      localStorage.setItem('token', res.token)
      showAuthModal.value = false
      showOnboardingModal.value = true
      return true
    }
    return false
  }

  function logout() {
    token.value = null
    username.value = ''
    isAdmin.value = false
    localStorage.removeItem('token')
    showAuthModal.value = true
  }

  async function checkAuth() {
    if (!token.value) {
      showAuthModal.value = true
      return
    }
    
    try {
      await api('/state')
      await checkAdmin()
    } catch (err) {
      logout()
    }
  }

  async function checkAdmin() {
    try {
      const res = await api('/admin/me')
      isAdmin.value = res.admin || false
    } catch {
      isAdmin.value = false
    }
  }

  return {
    token,
    username,
    isAdmin,
    isAuthenticated,
    showAuthModal,
    showOnboardingModal,
    login,
    register,
    logout,
    checkAuth,
    checkAdmin
  }
})
