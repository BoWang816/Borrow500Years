<template>
  <section id="dashboard" class="tab-pane active">
    <div v-if="!stateStore.profile" class="loading-state">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>
    
    <template v-else>
      <div class="pulse-wrap">
        <div class="pulse-rings">
          <div class="ring ring1"></div>
          <div class="ring ring2"></div>
          <div class="ring ring3"></div>
          <div class="ring-bagua"></div>
        </div>

        <div class="pulse-core">
          <div class="pulse-label">PULSE · 寿命倒计时</div>
          <div class="pulse-time">
            <span class="seg">{{ timeDisplay.years }}</span><em>年</em>
            <span class="seg">{{ timeDisplay.days }}</span><em>日</em>
            <span class="seg">{{ timeDisplay.hours }}</span><em>:</em>
            <span class="seg">{{ timeDisplay.minutes }}</span><em>:</em>
            <span class="seg">{{ timeDisplay.seconds }}</span>
          </div>
          <div class="pulse-seconds">{{ secondsDisplay }}</div>
          <div class="pulse-meta">
            <div class="meta-item">
              <span class="meta-label">衰减速率</span>
              <span class="meta-val">{{ decayRate }}x</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">境界</span>
              <span class="meta-val realm">{{ stateStore.profile.realm || '凡胎肉身' }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">复活币</span>
              <span class="meta-val coin">
                <i class="fas fa-coins"></i> {{ stateStore.profile.coin || 0 }}
              </span>
            </div>
          </div>
          <div class="pulse-toggle">
            <button 
              :class="['t-btn', { active: displayMode === 'full' }]" 
              @click="displayMode = 'full'"
            >
              岁·日·时·分·秒
            </button>
            <button 
              :class="['t-btn', { active: displayMode === 'seconds' }]" 
              @click="displayMode = 'seconds'"
            >
              精确秒
            </button>
            <button 
              :class="['t-btn', { active: displayMode === 'days' }]" 
              @click="displayMode = 'days'"
            >
              总天数
            </button>
          </div>
        </div>
      </div>

      <div class="dash-cards">
        <div class="card flux-card">
          <h3><i class="fas fa-bolt"></i> 修正系数 (Modifier)</h3>
          <ul class="modifier-list">
            <li v-if="stateStore.modifiers.length === 0" class="empty">暂无修正项</li>
            <li v-for="mod in stateStore.modifiers" :key="mod.id">
              <span class="mod-name">{{ mod.potionEmoji }} {{ mod.modLabel }}</span>
              <span :class="['mod-val', mod.modValue > 0 ? 'good' : 'bad']">
                {{ mod.modValue > 0 ? '+' : '' }}{{ mod.modValue }}
              </span>
            </li>
          </ul>
        </div>
        <div class="card event-card">
          <h3><i class="fas fa-scroll"></i> 命运卷轴 · 事件日志</h3>
          <ul class="event-log">
            <li v-if="stateStore.events.length === 0" class="empty">暂无事件</li>
            <li v-for="event in stateStore.events" :key="event.id">
              <time>{{ formatTime(event.createdAt) }}</time>
              <span :class="event.type === 'good' ? 'ev-good' : event.type === 'bad' ? 'ev-bad' : ''">
                {{ event.msg }}
              </span>
            </li>
          </ul>
          <button @click="triggerRandomEvent" class="ghost-btn">
            <i class="fas fa-dice-d20"></i> 掷天骰 · 触发随机事件
          </button>
        </div>
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useStateStore } from '../stores/state'
import { api, toast } from '../utils/api'

const stateStore = useStateStore()
const displayMode = ref<'full' | 'seconds' | 'days'>('full')
const currentTime = ref(Date.now())
const serverLifeSec = ref(0)
const serverFetchTime = ref(Date.now())
let timer: number | null = null
let countdownTimer: number | null = null

const SEC_PER_YEAR = 31536000
const SEC_PER_DAY = 86400

// 计算当前剩余寿命（考虑时间流逝）
const currentLifeSec = computed(() => {
  if (!stateStore.profile) return 0
  
  // 计算从上次服务器同步到现在经过的秒数
  const elapsedSinceSync = Math.floor((currentTime.value - serverFetchTime.value) / 1000)
  
  // 使用服务器返回的lifeSec减去本地流逝的时间
  const lifeSec = serverLifeSec.value > 0 ? serverLifeSec.value : stateStore.profile.lifeSec
  
  return Math.max(0, lifeSec - elapsedSinceSync)
})

const timeDisplay = computed(() => {
  const lifeSec = currentLifeSec.value
  const years = Math.floor(lifeSec / SEC_PER_YEAR)
  const remainAfterYears = lifeSec % SEC_PER_YEAR
  const days = Math.floor(remainAfterYears / SEC_PER_DAY)
  const remainAfterDays = remainAfterYears % SEC_PER_DAY
  const hours = Math.floor(remainAfterDays / 3600)
  const minutes = Math.floor((remainAfterDays % 3600) / 60)
  const seconds = Math.floor(remainAfterDays % 60)

  return {
    years: String(years).padStart(3, '0'),
    days: String(days).padStart(3, '0'),
    hours: String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0')
  }
})

const secondsDisplay = computed(() => {
  const lifeSec = currentLifeSec.value
  
  if (displayMode.value === 'seconds') {
    return `${lifeSec.toLocaleString()} 秒`
  } else if (displayMode.value === 'days') {
    const days = Math.floor(lifeSec / SEC_PER_DAY)
    return `${days.toLocaleString()} 天`
  }
  return `${lifeSec.toLocaleString()} · 秒`
})

const decayRate = computed(() => {
  // 计算衰减速率（基于修饰符）
  let rate = 1.0
  stateStore.modifiers.forEach(mod => {
    if (mod.modValue < 0) {
      rate += mod.modValue
    }
  })
  return rate.toFixed(2)
})

function formatExpire(timestamp: number): string {
  const remaining = Math.floor((timestamp - Date.now()) / 1000)
  if (remaining < 60) return `${remaining}秒`
  if (remaining < 3600) return `${Math.floor(remaining / 60)}分钟`
  if (remaining < 86400) return `${Math.floor(remaining / 3600)}小时`
  return `${Math.floor(remaining / 86400)}天`
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp * 1000)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  
  return date.toLocaleString('zh-CN', { 
    month: '2-digit', 
    day: '2-digit', 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

async function triggerRandomEvent() {
  try {
    const res = await api('/world-events/trigger', { method: 'POST' })
    toast(res.msg || '事件已触发', 'gold')
    await stateStore.fetchState(true)
  } catch (err: any) {
    toast(err.message, 'bad')
  }
}

onMounted(async () => {
  await stateStore.fetchState(true)
  
  // 保存服务器返回的lifeSec和获取时间
  if (stateStore.profile) {
    serverLifeSec.value = stateStore.profile.lifeSec
    serverFetchTime.value = Date.now()
  }
  
  // 每秒更新倒计时
  countdownTimer = window.setInterval(() => {
    currentTime.value = Date.now()
  }, 1000)
  
  // 每5秒同步服务器数据
  timer = window.setInterval(async () => {
    await stateStore.fetchState()
    if (stateStore.profile) {
      serverLifeSec.value = stateStore.profile.lifeSec
      serverFetchTime.value = Date.now()
    }
  }, 5000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
  if (countdownTimer) clearInterval(countdownTimer)
})
</script>

<style scoped>
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: var(--gold);
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 3px solid rgba(212, 175, 55, 0.2);
  border-top-color: var(--gold);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
