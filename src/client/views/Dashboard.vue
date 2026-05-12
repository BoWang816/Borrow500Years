<template>
  <section id="dashboard" class="tab-pane active">
    <div v-if="!stateStore.profile" class="loading-state">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>
    
    <template v-else>
      <!-- 倒计时和运势左右布局 -->
      <div class="dashboard-top-grid">
        <!-- 左侧：寿命倒计时 -->
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

        <!-- 右侧：今日运势 -->
        <div class="fortune-wrap">
          <div v-if="!fortune" class="fortune-loading">
            <div class="loading-spinner"></div>
            <p>正在推演天机...</p>
          </div>
          
          <div v-else class="fortune-content">
            <div class="fortune-header">
              <h3><i class="fas fa-star"></i> 今日运势</h3>
            </div>

            <!-- 运势结果 -->
            <div :class="['fortune-result', getFortuneCssClass(fortune.type)]">
              <div class="fortune-type">{{ fortune.type }}</div>
              <div class="fortune-title">{{ fortune.title }}</div>
            </div>

            <!-- 天机诗 -->
            <div class="fortune-poem-box">
              <div class="poem-label">天机诗</div>
              <div class="fortune-poem">{{ fortune.poem }}</div>
            </div>

            <!-- 详细信息 -->
            <div class="fortune-details">
              <div class="detail-row">
                <div class="detail-item">
                  <span class="detail-label good">✓ 宜</span>
                  <span class="detail-value">{{ fortune.advice }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label bad">✗ 忌</span>
                  <span class="detail-value">{{ fortune.avoid }}</span>
                </div>
              </div>
              
              <div class="fortune-multipliers">
                <span>寿命 <strong>{{ (fortune.lifeMultiplier * 100).toFixed(0) }}%</strong></span>
                <span>功德 <strong>{{ (fortune.meritMultiplier * 100).toFixed(0) }}%</strong></span>
              </div>
            </div>

            <!-- 签到按钮 -->
            <button 
              v-if="!checkedIn" 
              @click="checkin" 
              class="fortune-checkin-btn"
              :disabled="fortuneLoading"
            >
              <i class="fas fa-gift"></i> 签到领取运势奖励
            </button>
            <div v-else class="checked-badge">
              <i class="fas fa-check-circle"></i> 今日已签到
            </div>
          </div>
        </div>
      </div>

      <div class="dash-cards">
        <div class="card event-card full-width">
          <div class="card-header-row">
            <h3><i class="fas fa-scroll"></i> 命运卷轴 · 事件日志</h3>
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
const fortuneLoading = ref(false)
const checkedIn = ref(false)
const fortune = ref<any>(null)
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

async function loadFortune() {
  try {
    const res = await api('/fortune')
    fortune.value = {
      type: res.fortune,
      title: res.title,
      description: res.description,
      advice: res.advice,
      avoid: res.avoid,
      luckyDirection: res.luckyDirection,
      luckyTime: res.luckyTime,
      luckyColor: res.luckyColor,
      poem: res.poem,
      lifeMultiplier: res.lifeMultiplier,
      meritMultiplier: res.meritMultiplier
    }
    checkedIn.value = res.checkedIn
  } catch (err: any) {
    console.error('Failed to load fortune:', err)
  }
}

async function checkin() {
  fortuneLoading.value = true
  try {
    const res = await api('/fortune/checkin', { method: 'POST' })
    toast(res.msg || '签到成功', 'gold')
    checkedIn.value = true
    await loadFortune()
    await stateStore.fetchState(true)
  } catch (err: any) {
    toast(err.message, 'bad')
  } finally {
    fortuneLoading.value = false
  }
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

onMounted(async () => {
  await stateStore.fetchState(true)
  await loadFortune()
  
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

/* 顶部左右布局 */
.dashboard-top-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
}

@media (max-width: 1200px) {
  .dashboard-top-grid {
    grid-template-columns: 1fr;
  }
}

/* 运势卡片样式 */
.fortune-wrap {
  background: linear-gradient(135deg, rgba(10,14,26,0.8), rgba(20,24,38,0.6));
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 24px;
  position: relative;
  overflow: hidden;
}

.fortune-wrap::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--jade), transparent);
  opacity: 0.6;
}

.fortune-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  color: var(--gold);
}

.fortune-loading .loading-spinner {
  width: 40px;
  height: 40px;
  margin-bottom: 16px;
}

.fortune-header {
  margin-bottom: 20px;
}

.fortune-header h3 {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: 'ZCOOL XiaoWei', serif;
  letter-spacing: 2px;
  color: var(--gold-soft);
  text-shadow: 0 0 10px rgba(212,175,55,0.3);
}

.fortune-result {
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 16px;
  text-align: center;
  border: 2px solid;
  position: relative;
  overflow: hidden;
}

.fortune-result::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at center, rgba(255,255,255,0.05), transparent);
  pointer-events: none;
}

.fortune-daji {
  background: linear-gradient(135deg, rgba(255,215,0,0.1), rgba(255,140,0,0.05));
  border-color: #ffd700;
  box-shadow: 0 0 20px rgba(255,215,0,0.3);
}

.fortune-ji {
  background: linear-gradient(135deg, rgba(54,255,208,0.1), rgba(0,255,127,0.05));
  border-color: var(--jade);
  box-shadow: 0 0 20px rgba(54,255,208,0.2);
}

.fortune-ping {
  background: linear-gradient(135deg, rgba(128,128,128,0.1), rgba(169,169,169,0.05));
  border-color: #a9a9a9;
  box-shadow: 0 0 20px rgba(128,128,128,0.2);
}

.fortune-xiong {
  background: linear-gradient(135deg, rgba(255,77,109,0.1), rgba(255,0,0,0.05));
  border-color: var(--crimson);
  box-shadow: 0 0 20px rgba(255,77,109,0.2);
}

.fortune-daxiong {
  background: linear-gradient(135deg, rgba(139,0,0,0.2), rgba(0,0,0,0.1));
  border-color: #8b0000;
  box-shadow: 0 0 20px rgba(139,0,0,0.3);
}

.fortune-type {
  font-size: 32px;
  font-weight: 700;
  font-family: 'Ma Shan Zheng', cursive;
  margin-bottom: 8px;
  text-shadow: 0 0 15px currentColor;
}

.fortune-title {
  font-size: 16px;
  font-family: 'ZCOOL XiaoWei', serif;
  opacity: 0.9;
}

.fortune-poem-box {
  background: rgba(0,0,0,0.3);
  border-left: 3px solid var(--gold);
  padding: 16px;
  margin-bottom: 16px;
  border-radius: 4px;
}

.poem-label {
  font-size: 12px;
  color: var(--gold);
  margin-bottom: 8px;
  font-family: 'ZCOOL XiaoWei', serif;
}

.fortune-poem {
  font-size: 14px;
  line-height: 1.8;
  color: var(--ink);
  font-family: 'Noto Serif SC', serif;
  font-style: italic;
}

.fortune-details {
  margin-bottom: 16px;
}

.detail-row {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 12px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
}

.detail-label {
  flex-shrink: 0;
  padding: 4px 12px;
  border-radius: 4px;
  font-weight: 600;
  font-family: 'Noto Sans SC', sans-serif;
}

.detail-label.good {
  background: rgba(54,255,208,0.15);
  color: var(--jade);
  border: 1px solid var(--jade);
}

.detail-label.bad {
  background: rgba(255,77,109,0.15);
  color: var(--crimson);
  border: 1px solid var(--crimson);
}

.detail-value {
  flex: 1;
  color: var(--ink);
  font-family: 'Noto Serif SC', serif;
}

.fortune-multipliers {
  display: flex;
  justify-content: space-around;
  padding: 12px;
  background: rgba(0,0,0,0.2);
  border-radius: 6px;
  font-size: 13px;
  color: var(--ink-dim);
  font-family: 'Noto Sans SC', sans-serif;
}

.fortune-multipliers strong {
  color: var(--jade);
  font-family: 'Orbitron', sans-serif;
  margin-left: 4px;
}

.fortune-checkin-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, rgba(212,175,55,0.15), rgba(54,255,208,0.1));
  border: 1px solid var(--gold);
  border-radius: 6px;
  color: var(--gold-soft);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: 'Noto Sans SC', sans-serif;
  box-shadow: 0 0 15px rgba(212,175,55,0.2);
}

.fortune-checkin-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, rgba(212,175,55,0.25), rgba(54,255,208,0.15));
  box-shadow: 0 0 25px rgba(212,175,55,0.4);
  transform: translateY(-2px);
}

.fortune-checkin-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.checked-badge {
  text-align: center;
  padding: 12px;
  background: rgba(54,255,208,0.1);
  border: 1px solid var(--jade);
  border-radius: 6px;
  color: var(--jade);
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

/* 事件卡片优化 */
.dash-cards {
  display: grid;
  gap: 20px;
  margin-top: 24px;
}

.event-card.full-width {
  grid-column: 1 / -1;
}

.card-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--line);
  position: relative;
}

.card-header-row::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 80px;
  height: 2px;
  background: linear-gradient(90deg, var(--jade), transparent);
  box-shadow: 0 0 8px var(--jade);
}

.card-header-row h3 {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: 'ZCOOL XiaoWei', serif;
  letter-spacing: 2px;
  color: var(--gold-soft);
  text-shadow: 0 0 10px rgba(212,175,55,0.3);
}

.trigger-btn {
  padding: 10px 20px;
  background: linear-gradient(135deg, rgba(212,175,55,0.15), rgba(54,255,208,0.1));
  border: 1px solid var(--gold);
  border-radius: 6px;
  color: var(--gold-soft);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Noto Sans SC', sans-serif;
  letter-spacing: 1px;
  box-shadow: 0 0 15px rgba(212,175,55,0.2);
}

.trigger-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, rgba(212,175,55,0.25), rgba(54,255,208,0.15));
  box-shadow: 0 0 25px rgba(212,175,55,0.4), 0 0 15px rgba(54,255,208,0.2);
  transform: translateY(-2px);
}

.trigger-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.trigger-btn i {
  animation: dice-roll 2s ease-in-out infinite;
}

@keyframes dice-roll {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(90deg); }
  50% { transform: rotate(180deg); }
  75% { transform: rotate(270deg); }
}

.trigger-btn:hover i {
  animation-duration: 0.5s;
}

.event-log {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 500px;
  overflow-y: auto;
}

.event-log .empty {
  text-align: center;
  padding: 60px 20px;
  color: var(--ink-dim);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.event-log .empty i {
  font-size: 48px;
  color: var(--gold);
  opacity: 0.3;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.event-log .empty p {
  margin: 0;
  font-family: 'ZCOOL XiaoWei', serif;
  letter-spacing: 2px;
  font-size: 14px;
}

.event-item {
  padding: 16px;
  margin-bottom: 12px;
  background: linear-gradient(135deg, rgba(10,14,26,0.6), rgba(20,24,38,0.4));
  border: 1px solid rgba(212,175,55,0.15);
  border-left: 3px solid var(--gold);
  border-radius: 6px;
  transition: all 0.3s;
}

.event-item:hover {
  background: linear-gradient(135deg, rgba(212,175,55,0.08), rgba(54,255,208,0.05));
  border-color: var(--gold);
  transform: translateX(4px);
  box-shadow: 0 4px 15px rgba(0,0,0,0.2), 0 0 20px rgba(212,175,55,0.1);
}

.event-time {
  font-size: 11px;
  color: var(--ink-dim);
  margin-bottom: 8px;
  font-family: 'Orbitron', sans-serif;
  opacity: 0.7;
}

.event-content {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  line-height: 1.6;
}

.event-icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 12px;
}

.event-content.ev-good {
  color: var(--jade);
}

.event-content.ev-good .event-icon {
  background: rgba(54,255,208,0.15);
  color: var(--jade);
  box-shadow: 0 0 10px rgba(54,255,208,0.3);
}

.event-content.ev-bad {
  color: var(--crimson);
}

.event-content.ev-bad .event-icon {
  background: rgba(255,77,109,0.15);
  color: var(--crimson);
  box-shadow: 0 0 10px rgba(255,77,109,0.3);
}

.event-content:not(.ev-good):not(.ev-bad) {
  color: var(--ink);
}

.event-content:not(.ev-good):not(.ev-bad) .event-icon {
  background: rgba(128,128,128,0.15);
  color: var(--ink-dim);
}

.event-msg {
  flex: 1;
  font-family: 'Noto Serif SC', serif;
}

/* 滚动条样式 */
.event-log::-webkit-scrollbar {
  width: 6px;
}

.event-log::-webkit-scrollbar-track {
  background: rgba(0,0,0,0.2);
  border-radius: 3px;
}

.event-log::-webkit-scrollbar-thumb {
  background: rgba(212,175,55,0.3);
  border-radius: 3px;
}

.event-log::-webkit-scrollbar-thumb:hover {
  background: rgba(212,175,55,0.5);
}
</style>
