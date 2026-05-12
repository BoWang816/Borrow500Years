<template>
  <section id="fortune" class="tab-pane active">
    <h2 class="page-title">
      <span class="cn">运势天机</span>
      <span class="en">Daily Fortune</span>
    </h2>
    
    <!-- 全服事件 -->
    <div class="card world-events-card">
      <h3><i class="fas fa-globe"></i> 全服事件</h3>
      <div class="world-events-list">
        <div v-if="worldEvents.length === 0" class="empty">暂无全服事件</div>
        <div v-for="event in worldEvents" :key="event.id" class="world-event">
          <div class="we-emoji">{{ event.emoji }}</div>
          <div class="we-body">
            <div class="we-name">{{ event.name }}</div>
            <div class="we-desc">{{ event.description }}</div>
            <div class="we-timer">剩余时间：{{ formatTimeRemaining(event.end_at) }}</div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '../utils/api'

const worldEvents = ref<any[]>([])

async function loadWorldEvents() {
  try {
    const res = await api('/world-events')
    worldEvents.value = res.events || []
  } catch (err: any) {
    console.error('Failed to load world events:', err)
  }
}

function formatTimeRemaining(endAt: number): string {
  const remaining = endAt - Math.floor(Date.now() / 1000)
  if (remaining < 0) return '已结束'
  if (remaining < 3600) return `${Math.floor(remaining / 60)}分钟`
  if (remaining < 86400) return `${Math.floor(remaining / 3600)}小时`
  return `${Math.floor(remaining / 86400)}天`
}

onMounted(() => {
  loadWorldEvents()
})
</script>
