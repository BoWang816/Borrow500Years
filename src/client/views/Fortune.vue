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

    <!-- 修仙日志 -->
    <div class="card logs-card">
      <h3><i class="fas fa-feather"></i> 修仙日志</h3>
      <div class="log-form">
        <textarea 
          v-model="logContent" 
          placeholder="记录今日修炼感悟..." 
          maxlength="500"
        ></textarea>
        <div class="log-form-actions">
          <select v-model="logMood">
            <option value="平静">平静</option>
            <option value="愉悦">愉悦</option>
            <option value="疲惫">疲惫</option>
            <option value="感悟">感悟</option>
            <option value="突破">突破</option>
          </select>
          <select v-model="logType">
            <option value="note">修炼笔记</option>
            <option value="milestone">里程碑</option>
            <option value="reflection">感悟</option>
          </select>
          <button @click="addLog" class="oracle-btn" :disabled="loading || !logContent">
            <i class="fas fa-pen"></i> 记录
          </button>
        </div>
      </div>
      <div class="cultivation-logs-list">
        <div v-if="logs.length === 0" class="empty">暂无日志</div>
        <div v-for="log in logs" :key="log.id" class="log-item">
          <div class="log-header">
            <span class="log-mood">{{ log.mood }}</span>
            <span class="log-type">{{ log.type }}</span>
            <span class="log-time">{{ formatDate(log.created_at) }}</span>
          </div>
          <div class="log-content">{{ log.content }}</div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api, toast } from '../utils/api'

const loading = ref(false)
const worldEvents = ref<any[]>([])
const logs = ref<any[]>([])
const logContent = ref('')
const logMood = ref('平静')
const logType = ref('note')

async function loadWorldEvents() {
  try {
    const res = await api('/world-events')
    worldEvents.value = res.events || []
  } catch (err: any) {
    console.error('Failed to load world events:', err)
  }
}

async function loadLogs() {
  try {
    const res = await api('/fortune/logs')
    logs.value = res.logs || []
  } catch (err: any) {
    console.error('Failed to load logs:', err)
  }
}

async function addLog() {
  loading.value = true
  try {
    const res = await api('/fortune/logs', {
      method: 'POST',
      body: JSON.stringify({
        content: logContent.value,
        mood: logMood.value,
        type: logType.value
      })
    })
    toast(res.msg || '日志已记录', 'good')
    logContent.value = ''
    await loadLogs()
  } catch (err: any) {
    toast(err.message, 'bad')
  } finally {
    loading.value = false
  }
}

function getFortuneIcon(fortuneType: string): string {
  const icons: Record<string, string> = {
    '大吉': '☀️',
    '吉': '✨',
    '平': '☁️',
    '凶': '⚡',
    '大凶': '💀'
  }
  return icons[fortuneType] || '☁️'
}

function getFortuneCssClass(fortuneType: string): string {
  const map: Record<string, string> = {
    '大吉': 'fortune-daji',
    '吉': 'fortune-ji',
    '平': 'fortune-ping',
    '凶': 'fortune-xiong',
    '大凶': 'fortune-daxiong'
  }
  return map[fortuneType] || 'fortune-ping'
}

function formatTimeRemaining(endAt: number): string {
  const remaining = endAt - Math.floor(Date.now() / 1000)
  if (remaining < 0) return '已结束'
  if (remaining < 3600) return `${Math.floor(remaining / 60)}分钟`
  if (remaining < 86400) return `${Math.floor(remaining / 3600)}小时`
  return `${Math.floor(remaining / 86400)}天`
}

function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString('zh-CN')
}

onMounted(() => {
  loadWorldEvents()
  loadLogs()
})
</script>
