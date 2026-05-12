<template>
  <div v-if="authStore.showAuthModal" class="modal-overlay" @click.self="close">
    <div class="modal auth-modal">
      <h2>向天再借500年</h2>
      
      <div class="auth-tabs">
        <button 
          :class="['auth-tab', { active: mode === 'login' }]"
          @click="mode = 'login'"
        >
          登录
        </button>
        <button 
          :class="['auth-tab', { active: mode === 'register' }]"
          @click="mode = 'register'"
        >
          注册
        </button>
      </div>

      <form @submit.prevent="submit" class="auth-form">
        <input 
          v-model="username" 
          type="text" 
          placeholder="用户名" 
          required
          autocomplete="username"
        />
        <input 
          v-model="password" 
          type="password" 
          placeholder="密码" 
          required
          :autocomplete="mode === 'login' ? 'current-password' : 'new-password'"
        />
        <button type="submit" class="oracle-btn" :disabled="loading">
          {{ mode === 'login' ? '登录' : '注册' }}
        </button>
      </form>

      <div v-if="error" class="error-msg">{{ error }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const mode = ref<'login' | 'register'>('login')
const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

function close() {
  if (authStore.isAuthenticated) {
    authStore.showAuthModal = false
  }
}

async function submit() {
  error.value = ''
  loading.value = true
  
  try {
    const success = mode.value === 'login' 
      ? await authStore.login(username.value, password.value)
      : await authStore.register(username.value, password.value)
    
    if (success) {
      router.push('/dashboard')
    } else {
      error.value = '操作失败，请重试'
    }
  } catch (err: any) {
    error.value = err.message || '操作失败'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: var(--bg-card);
  padding: 32px;
  border-radius: 12px;
  max-width: 400px;
  width: 90%;
  border: 1px solid rgba(212,175,55,0.3);
}

.auth-tabs {
  display: flex;
  gap: 12px;
  margin: 20px 0;
}

.auth-tab {
  flex: 1;
  padding: 10px;
  background: rgba(212,175,55,0.1);
  border: 1px solid rgba(212,175,55,0.3);
  border-radius: 6px;
  color: var(--gold);
  cursor: pointer;
  transition: all 0.3s;
}

.auth-tab.active {
  background: rgba(212,175,55,0.2);
  border-color: var(--gold);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.auth-form input {
  padding: 12px;
  background: rgba(10,14,26,0.6);
  border: 1px solid rgba(212,175,55,0.3);
  border-radius: 6px;
  color: var(--ink);
  font-size: 14px;
}

.error-msg {
  margin-top: 16px;
  padding: 12px;
  background: rgba(255,71,87,0.1);
  border: 1px solid rgba(255,71,87,0.3);
  border-radius: 6px;
  color: #ff4757;
  text-align: center;
}
</style>
