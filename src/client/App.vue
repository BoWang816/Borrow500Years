<template>
  <div id="app-container">
    <!-- 背景层 -->
    <div class="bg-stars"></div>
    <div class="bg-bagua"></div>
    <div class="bg-grid"></div>
    <div class="bg-glow"></div>

    <!-- 顶部导航 -->
    <header v-if="authStore.isAuthenticated" class="topbar">
      <div class="brand">
        <span class="brand-seal">寿</span>
        <div class="brand-text">
          <h1 class="brand-cn">向天再借<span class="num">500</span>年</h1>
          <p class="brand-en">BORROW · 500 · YEARS</p>
        </div>
      </div>
      <nav class="nav">
        <router-link to="/dashboard" class="nav-item" active-class="active">
          <i class="fas fa-heart-pulse"></i><span>命脉</span>
        </router-link>
        <router-link to="/cultivation" class="nav-item" active-class="active">
          <i class="fas fa-leaf"></i><span>修炼</span>
        </router-link>
        <router-link to="/inventory" class="nav-item" active-class="active">
          <i class="fas fa-flask-vial"></i><span>丹房</span>
        </router-link>
        <router-link to="/adventure" class="nav-item" active-class="active">
          <i class="fas fa-mountain-sun"></i><span>历练</span>
        </router-link>
        <router-link to="/leaderboard" class="nav-item" active-class="active">
          <i class="fas fa-trophy"></i><span>长生榜</span>
        </router-link>
        <router-link to="/profile" class="nav-item" active-class="active">
          <i class="fas fa-user-astronaut"></i><span>道号</span>
        </router-link>
      </nav>
      <div class="topbar-actions">
        <router-link 
          v-if="authStore.isAdmin" 
          to="/admin" 
          class="admin-link" 
          title="运管后台"
        >
          <i class="fas fa-shield-halved"></i>
        </router-link>
        <span class="user-tag">
          <i class="fas fa-user"></i> <span>{{ authStore.username }}</span>
        </span>
        <span class="title-badge">{{ realmName }}</span>
        <button 
          @click="handleLogout" 
          class="reset-btn" 
          title="登出"
        >
          <i class="fas fa-right-from-bracket"></i>
        </button>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="main">
      <router-view v-slot="{ Component }">
        <component :is="Component" />
      </router-view>
    </main>

    <!-- 危机弹窗 -->
    <CrisisOverlay />
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'
import { useStateStore } from './stores/state'
import CrisisOverlay from './components/CrisisOverlay.vue'

const router = useRouter()
const authStore = useAuthStore()
const stateStore = useStateStore()

const realmName = computed(() => {
  if (!stateStore.profile) return '未知境界'
  // 后端已经返回了境界名称字符串，直接使用
  return stateStore.profile.realm || '未知境界'
})

onMounted(async () => {
  const isAuth = await authStore.checkAuth()
  
  // 如果已认证，加载用户状态
  if (isAuth) {
    try {
      await stateStore.fetchRealms() // 先加载境界数据
      await stateStore.fetchState(true)
    } catch (err) {
      console.error('Failed to fetch state:', err)
    }
  }
})

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>
