<template>
  <section id="fortune" class="tab-pane active">
    <h2 class="page-title">
      <span class="cn">运势天机</span>
      <span class="en">Daily Fortune</span>
    </h2>
    
    <!-- 今日运势 -->
    <div class="card fortune-card">
      <h3><i class="fas fa-star"></i> 今日运势</h3>
      
      <div v-if="!fortune" class="fortune-loading">正在推演天机...</div>
      
      <div v-else class="fortune-content">
        <!-- 运势结果 -->
        <div :class="['fortune-result', getFortuneCssClass(fortune.type)]">
          <div class="fortune-type">{{ fortune.type }}</div>
          <div class="fortune-title">{{ fortune.title }}</div>
          <div class="fortune-description">{{ fortune.description }}</div>
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
          
          <div class="detail-row">
            <div class="detail-item">
              <span class="detail-label">🧭 吉方</span>
              <span class="detail-value">{{ fortune.luckyDirection }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">⏰ 吉时</span>
              <span class="detail-value">{{ fortune.luckyTime }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">🎨 幸运色</span>
              <span class="detail-value">{{ fortune.luckyColor }}</span>
            </div>
          </div>

          <div class="fortune-multipliers">
            <span>寿命加成: <strong>{{ (fortune.lifeMultiplier * 100).toFixed(0) }}%</strong></span>
            <span>功德加成: <strong>{{ (fortune.meritMultiplier * 100).toFixed(0) }}%</strong></span>
          </div>
        </div>

        <!-- 签到按钮 -->
        <button 
          v-if="!checkedIn" 
          @click="checkin" 
          class="oracle-btn"
          :disabled="loading"
        >
          <i class="fas fa-gift"></i> 签到领取运势奖励
        </button>
        <div v-else class="checked-badge">
          <i class="fas fa-check-circle"></i> 今日已签到
        </div>
      </div>
    </div>

    <!-- 功法修炼 -->
    <div class="card manuals-card">
      <h3><i class="fas fa-book-open"></i> 功法修炼</h3>
      <div class="manuals-list">
        <div v-if="manuals.length === 0" class="empty">暂无功法</div>
        <div v-for="manual in manuals" :key="manual.id" class="manual-item">
          <span class="manual-icon">{{ manual.emoji }}</span>
          <div class="manual-body">
            <div class="manual-name">
              {{ manual.name }}
              <span class="manual-lv" v-if="manual.level">Lv.{{ manual.level }}</span>
            </div>
            <div class="manual-desc">{{ manual.description }}</div>
          </div>
          <button @click="upgradeManual(manual.id)" class="practice-btn" :disabled="loading">
            升级
          </button>
        </div>
      </div>
    </div>

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
const checkedIn = ref(false)
const fortune = ref<any>(null)
const manuals = ref<any[]>([])
const worldEvents = ref<any[]>([])
const logs = ref<any[]>([])
const logContent = ref('')
const logMood = ref('平静')
const logType = ref('note')

async function loadFortune() {
  try {
    const res = await api('/fortune')
    console.log('Fortune API response:', res)
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
    console.log('Fortune value:', fortune.value)
    checkedIn.value = res.checkedIn
  } catch (err: any) {
    console.error('Failed to load fortune:', err)
  }
}

async function checkin() {
  loading.value = true
  try {
    const res = await api('/fortune/checkin', { method: 'POST' })
    toast(res.msg || '签到成功', 'gold')
    checkedIn.value = true
    await loadFortune()
  } catch (err: any) {
    toast(err.message, 'bad')
  } finally {
    loading.value = false
  }
}

async function loadManuals() {
  try {
    const res = await api('/manuals')
    manuals.value = res.manuals || []
  } catch (err: any) {
    console.error('Failed to load manuals:', err)
  }
}

async function upgradeManual(id: number) {
  loading.value = true
  try {
    const res = await api(`/manuals/${id}/upgrade`, { method: 'POST' })
    toast(res.msg || '升级成功', 'good')
    await loadManuals()
  } catch (err: any) {
    toast(err.message, 'bad')
  } finally {
    loading.value = false
  }
}

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
  loadFortune()
  loadManuals()
  loadWorldEvents()
  loadLogs()
})
</script>
