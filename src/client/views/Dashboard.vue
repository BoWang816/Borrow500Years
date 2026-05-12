<template>
  <section id="dashboard" class="tab-pane active">
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
            <span class="meta-val realm">{{ stateStore.profile?.realm || '凡胎肉身' }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">复活币</span>
            <span class="meta-val coin">
              <i class="fas fa-coins"></i> {{ stateStore.profile?.coin || 0 }}
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
          <li v-for="mod in stateStore.modifiers" :key="mod.id" class="mod-item">
            <span class="mod-emoji">{{ mod.potionEmoji }}</span>
            <span class="mod-label">{{ mod.modLabel }}</span>
            <span class="mod-val">{{ mod.modValue > 0 ? '+' : '' }}{{ mod.modValue }}</span>
            <span class="mod-expire">{{ formatExpire(mod.expireAt) }}</span>
          </li>
        </ul>
      </div>
      <div class="card event-card">
        <h3><i class="fas fa-scroll"></i> 命运卷轴 · 事件日志</h3>
        <ul class="event-log">
          <li v-for="event in stateStore.events" :key="event.id" :class="['event-item', `event-${event.type}`]">
            <span class="event-msg">{{ event.msg }}</span>
            <span class="event-time">{{ formatTime(event.createdAt) }}</span>
          </li>
        </ul>
        <button @click="triggerRandomEvent" class="ghost-btn">
          <i class="fas fa-dice-d20"></i> 掷天骰 · 触发随机事件
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useStateStore } from '../stores/state'
import { api, toast } from '../utils/api'

const stateStore = useStateStore()
const displayMode = ref<'full' | 'seconds' | 'days'>('full')
let timer: number | null = null

const SEC_PER_YEAR = 31536000
const SEC_PER_DAY = 86400

const timeDisplay = computed(() => {
  if (!stateStore.profile) {
    return { years: '000', days: '000', hours: '00', minutes: '00', seconds: '00' }
  }

  const lifeSec = stateStore.profile.lifeSec
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
  if (!stateStore.profile) return '— · — 秒'
  const lifeSec = stateStore.profile.lifeSec
  
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
  timer = window.setInterval(() => {
    stateStore.fetchState()
  }, 5000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>
