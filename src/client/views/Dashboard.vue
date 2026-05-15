<template>
  <section id="dashboard" class="tab-pane active">
    <div v-if="!stateStore.profile" class="loading-state">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>
    
    <template v-else>
      <!-- 寿命倒计时 -->
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
              <span class="meta-val realm">{{ realmName }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">功德</span>
              <span class="meta-val merit">
                <i class="fas fa-gem"></i> {{ (stateStore.profile.merit || 0).toLocaleString() }}
              </span>
            </div>
            <div class="meta-item">
              <span class="meta-label">总寿命</span>
              <span class="meta-val life">
                <i class="fas fa-hourglass-half"></i> {{ formatTotalLife(stateStore.profile.lifeSec || 0) }}
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
        <!-- 事件日志 -->
        <div class="card event-card">
          <div class="card-header-row">
            <h3><i class="fas fa-scroll"></i> 命运卷轴</h3>
            <button @click="triggerRandomEvent" class="trigger-btn" :disabled="triggerLoading">
              <i class="fas fa-dice-d20"></i> 
              <span v-if="!triggerLoading">掷天骰 · 触发随机事件</span>
              <span v-else>触发中...</span>
            </button>
          </div>
          <ul class="event-log">
            <li v-if="stateStore.events.length === 0" class="empty">
              <i class="fas fa-yin-yang"></i>
              <p>命运长河静谧无波，等待天机显现...</p>
            </li>
            <li v-for="event in stateStore.events" :key="event.id" class="event-item">
              <div class="event-time">{{ formatTime(event.createdAt) }}</div>
              <div :class="['event-content', event.type === 'good' ? 'ev-good' : event.type === 'bad' ? 'ev-bad' : '']">
                <i :class="['event-icon', event.type === 'good' ? 'fas fa-arrow-up' : event.type === 'bad' ? 'fas fa-arrow-down' : 'fas fa-circle']"></i>
                <span class="event-msg">{{ event.msg }}</span>
              </div>
            </li>
          </ul>
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
const triggerLoading = ref(false)
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

const realmName = computed(() => {
  if (!stateStore.profile) return '未知境界'
  // 后端已经返回了境界名称字符串，直接使用
  return stateStore.profile.realm || '未知境界'
})

function formatTotalLife(seconds: number): string {
  const years = Math.floor(seconds / SEC_PER_YEAR)
  const days = Math.floor((seconds % SEC_PER_YEAR) / SEC_PER_DAY)
  
  if (years > 0) {
    return `${years}年${days}天`
  } else if (days > 0) {
    return `${days}天`
  } else {
    const hours = Math.floor(seconds / 3600)
    return `${hours}小时`
  }
}

function formatTime(timestamp: number): string {
  // timestamp是秒级时间戳
  const date = new Date(timestamp * 1000)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  if (diff < 0) return '未来' // 防止时间戳异常
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  if (diff < 172800000) return '昨天'
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`
  
  return date.toLocaleString('zh-CN', { 
    month: '2-digit', 
    day: '2-digit', 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

async function triggerRandomEvent() {
  if (triggerLoading.value) return
  
  triggerLoading.value = true
  try {
    const res = await api('/world-events/trigger', { method: 'POST' })
    
    if (res.event) {
      toast(`✨ ${res.event.emoji} ${res.event.name}`, 'gold')
      // 显示事件详情
      setTimeout(() => {
        toast(res.event.description, 'good')
      }, 500)
    } else {
      toast(res.msg || '事件已触发', 'gold')
    }
    
    await stateStore.fetchState(true)
  } catch (err: any) {
    toast(err.message || '触发失败', 'bad')
  } finally {
    triggerLoading.value = false
  }
}

onMounted(async () => {
  await stateStore.fetchRealms() // 先加载境界数据
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
  
  // 每60秒同步服务器数据（降低请求频率）
  timer = window.setInterval(async () => {
    await stateStore.fetchState()
    if (stateStore.profile) {
      serverLifeSec.value = stateStore.profile.lifeSec
      serverFetchTime.value = Date.now()
    }
  }, 60000) // 从5秒改为60秒
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
  if (countdownTimer) clearInterval(countdownTimer)
})
</script>
