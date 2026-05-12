<template>
  <div class="admin-overview">
    <div class="stats-grid">
      <div class="stat-card card">
        <div class="stat-icon"><i class="fas fa-users"></i></div>
        <div class="stat-value">{{ stats.userCount }}</div>
        <div class="stat-label">总用户数</div>
      </div>
      <div class="stat-card card">
        <div class="stat-icon"><i class="fas fa-user-check"></i></div>
        <div class="stat-value">{{ stats.activeUsers }}</div>
        <div class="stat-label">活跃用户</div>
      </div>
      <div class="stat-card card">
        <div class="stat-icon"><i class="fas fa-flask"></i></div>
        <div class="stat-value">{{ stats.totalPotionsUsed }}</div>
        <div class="stat-label">丹药使用</div>
      </div>
      <div class="stat-card card">
        <div class="stat-icon"><i class="fas fa-calendar"></i></div>
        <div class="stat-value">{{ stats.eventCount }}</div>
        <div class="stat-label">事件数量</div>
      </div>
    </div>

    <!-- 最近活跃用户 -->
    <div class="card" style="margin-top: 20px;">
      <h3><i class="fas fa-history"></i> 最近活跃用户</h3>
      <div class="recent-users-list">
        <div v-if="stats.recentUsers && stats.recentUsers.length === 0" class="empty">暂无活跃用户</div>
        <div v-for="(user, idx) in stats.recentUsers" :key="idx" class="recent-user-item">
          <div class="user-name">{{ user.name }}</div>
          <div class="user-info">
            <span class="user-life">寿命: {{ formatLife(user.life) }}</span>
            <span class="user-date">最后活跃: {{ user.lastActive }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api, toast } from '../../utils/api'

const stats = ref({
  userCount: 0,
  activeUsers: 0,
  totalPotionsUsed: 0,
  eventCount: 0,
  recentUsers: [] as any[]
})

function formatLife(seconds: number) {
  const years = Math.floor(seconds / 31536000)
  const days = Math.floor((seconds % 31536000) / 86400)
  return `${years}年${days}天`
}

async function loadOverview() {
  try {
    const res = await api('/admin/overview')
    stats.value = res
  } catch (err: any) {
    toast(err.message, 'bad')
  }
}

onMounted(() => {
  loadOverview()
})
</script>
