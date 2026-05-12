<template>
  <div class="auth-page login">
    <!-- 赛博粒子效果 -->
    <div class="cyber-particles">
      <div v-for="i in 20" :key="i" class="particle" :style="particleStyle(i)"></div>
    </div>
    
    <!-- 道教符文漂浮 -->
    <div class="floating-runes">
      <span class="rune" v-for="(rune, i) in runes" :key="i" :style="runeStyle(i)">{{ rune }}</span>
    </div>
    
    <div class="auth-container">
      <div class="auth-card">
        <!-- 赛博边角装饰 -->
        <div class="corner-decoration corner-tl"></div>
        <div class="corner-decoration corner-tr"></div>
        <div class="corner-decoration corner-bl"></div>
        <div class="corner-decoration corner-br"></div>
        
        <!-- 扫描线 -->
        <div class="scan-line"></div>
        
        <div class="auth-header">
          <div class="title-glyph">☯</div>
          <h1 class="title-cn">天命测算</h1>
          <p class="title-en">Oracle of Fate</p>
          <p class="subtitle">降下，旋如天机门，测先辈上根骨</p>
        </div>

        <form @submit.prevent="handleLogin" class="auth-form">
          <div class="form-group">
            <label>道号</label>
            <input 
              v-model="username" 
              type="text" 
              placeholder="请输入道号"
              required
            />
          </div>

          <div class="form-group">
            <label>心法口诀</label>
            <input 
              v-model="password" 
              type="password" 
              placeholder="请输入心法口诀"
              required
            />
          </div>

          <button type="submit" class="submit-btn" :disabled="loading">
            {{ loading ? '验证中...' : '踏 · 入 · 仙 · 途' }}
          </button>

          <div v-if="error" class="error-msg">{{ error }}</div>

          <div class="auth-footer">
            <span>尚未开启命盘？</span>
            <router-link to="/register" class="link">前往注册</router-link>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const runes = ['☯', '卍', '◈', '✦', '⚊', '⚋', '☰', '☷']

function particleStyle(i: number) {
  return {
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 5}s`,
    animationDuration: `${3 + Math.random() * 4}s`
  }
}

function runeStyle(i: number) {
  return {
    left: `${10 + Math.random() * 80}%`,
    top: `${10 + Math.random() * 80}%`,
    animationDelay: `${Math.random() * 3}s`,
    animationDuration: `${4 + Math.random() * 3}s`
  }
}

async function handleLogin() {
  error.value = ''
  loading.value = true
  
  try {
    const success = await authStore.login(username.value, password.value)
    if (success) {
      router.push('/dashboard')
    } else {
      error.value = '道号或心法错误'
    }
  } catch (err: any) {
    error.value = err.message || '登录失败'
  } finally {
    loading.value = false
  }
}
</script>
