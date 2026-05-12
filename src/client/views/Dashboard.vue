<template>
  <div class="page dashboard-page">
    <nav class="nav">
      <div class="nav-brand">
        <h1>向天再借500年</h1>
      </div>
      <div class="nav-items">
        <router-link to="/dashboard" class="nav-item" active-class="active">
          <i class="fas fa-heartbeat"></i> 命脉
        </router-link>
        <router-link to="/fortune" class="nav-item" active-class="active">
          <i class="fas fa-yin-yang"></i> 运势
        </router-link>
        <router-link to="/cultivation" class="nav-item" active-class="active">
          <i class="fas fa-spa"></i> 修炼
        </router-link>
        <router-link to="/inventory" class="nav-item" active-class="active">
          <i class="fas fa-flask"></i> 丹房
        </router-link>
        <router-link to="/adventure" class="nav-item" active-class="active">
          <i class="fas fa-mountain"></i> 历练
        </router-link>
        <router-link to="/leaderboard" class="nav-item" active-class="active">
          <i class="fas fa-trophy"></i> 天榜
        </router-link>
        <router-link to="/profile" class="nav-item" active-class="active">
          <i class="fas fa-user-circle"></i> 道号
        </router-link>
        <router-link v-if="authStore.isAdmin" to="/admin" class="nav-item" active-class="active">
          <i class="fas fa-cog"></i> 后台
        </router-link>
      </div>
      <button @click="authStore.logout" class="logout-btn">
        <i class="fas fa-sign-out-alt"></i> 登出
      </button>
    </nav>

    <div class="container">
      <div class="pulse-section">
        <div class="card pulse-card">
          <h2 class="card-title">
            <span class="cn">生命脉搏</span>
            <span class="en">Life Pulse</span>
          </h2>
          
          <div v-if="stateStore.profile" class="pulse-display">
            <div class="pulse-main">
              <div class="pulse-value">{{ displayLife }}</div>
              <div class="pulse-label">当前寿命</div>
            </div>
            
            <div class="pulse-stats">
              <div class="stat-item">
                <span class="stat-label">境界</span>
                <span class="stat-value">{{ stateStore.profile.realm }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">功德</span>
                <span class="stat-value">{{ stateStore.profile.merit }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">复活币</span>
                <span class="stat-value">{{ stateStore.profile.coin }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="stateStore.modifiers.length > 0" class="card modifiers-card">
          <h3><i class="fas fa-magic"></i> 生效中的丹药</h3>
          <div class="modifiers-list">
            <div v-for="mod in stateStore.modifiers" :key="mod.id" class="modifier-item">
              <span class="mod-emoji">{{ mod.potionEmoji }}</span>
              <span class="mod-label">{{ mod.modLabel }}</span>
              <span class="mod-expire">{{ formatExpire(mod.expireAt) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="events-section">
        <div class="card events-card">
          <h3><i class="fas fa-scroll"></i> 修行日志</h3>
          <div class="events-list">
            <div v-for="event in stateStore.events" :key="event.id" 
                 :class="['event-item', `event-${event.type}`]">
              <span class="event-msg">{{ event.msg }}</span>
              <span class="event-time">{{ formatTime(event.createdAt) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useStateStore } from '../stores/state'
import { formatLife } from '../utils/api'

const authStore = useAuthStore()
const stateStore = useStateStore()

let timer: number | null = null

const displayLife = computed(() => {
  if (!stateStore.profile) return '0秒'
  return formatLife(stateStore.profile.lifeSec)
})

function formatExpire(timestamp: number): string {
  const remaining = Math.floor((timestamp - Date.now()) / 1000)
  return formatLife(remaining)
}

function formatTime(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString('zh-CN')
}

onMounted(async () => {
  await stateStore.fetchState(true)
  timer = window.setInterval(() => {
    stateStore.fetchState()
  }, 5000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>
