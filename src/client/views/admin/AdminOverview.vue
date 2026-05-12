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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api, toast } from '../../utils/api'

const stats = ref({
  userCount: 0,
  activeUsers: 0,
  totalPotionsUsed: 0,
  eventCount: 0
})

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

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  text-align: center;
  padding: 24px;
}

.stat-icon {
  font-size: 32px;
  color: var(--gold);
  margin-bottom: 12px;
}

.stat-value {
  font-size: 36px;
  font-weight: 700;
  color: var(--jade);
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: var(--ink-dim);
}
</style>
