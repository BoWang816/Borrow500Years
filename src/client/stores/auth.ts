import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '../utils/api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const username = ref<string>(localStorage.getItem('username') || '')
  const isAdmin = ref<boolean>(false)
  const adminChecked = ref<boolean>(false)

  const isAuthenticated = computed(() => !!token.value)

  async function login(user: string, password: string) {
    const res = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: user, password })
    })
    
    if (res.token) {
      token.value = res.token
      username.value = res.username || user
      localStorage.setItem('token', res.token)
      localStorage.setItem('username', res.username || user)
      
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
      username.value = res.username || user
      localStorage.setItem('token', res.token)
      localStorage.setItem('username', res.username || user)
      return true
    }
    return false
  }

  function logout() {
    token.value = null
    username.value = ''
    isAdmin.value = false
    adminChecked.value = false
    localStorage.removeItem('token')
    localStorage.removeItem('username')
  }

  async function checkAuth() {
    if (!token.value) {
      return false
    }
    
    try {
      await api('/state')
      await checkAdmin()
      return true
    } catch (err) {
      logout()
      return false
    }
  }

  async function checkAdmin() {
    if (adminChecked.value) {
      return isAdmin.value
    }
    
    try {
      const res = await api('/admin/me')
      isAdmin.value = res.admin || false
      adminChecked.value = true
      return isAdmin.value
    } catch {
      isAdmin.value = false
      adminChecked.value = true
      return false
    }
  }

  return {
    token,
    username,
    isAdmin,
    adminChecked,
    isAuthenticated,
    login,
    register,
    logout,
    checkAuth,
    checkAdmin
  }
})
