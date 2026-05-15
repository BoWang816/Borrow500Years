<template>
  <section id="profile" class="tab-pane active">
    <h2 class="page-title">
      <span class="cn">道号印鉴</span>
      <span class="en">Profile</span>
    </h2>
    
    <!-- 统计信息栏 -->
    <div class="merit-bar">
      <div class="merit-item">
        <i class="fas fa-coins"></i>
        <div>
          <div class="merit-label">复活币</div>
          <div class="merit-val">{{ stateStore.profile?.coin || 0 }}</div>
        </div>
      </div>
      <div class="merit-item">
        <i class="fas fa-gem"></i>
        <div>
          <div class="merit-label">功德值</div>
          <div class="merit-val">{{ stateStore.profile?.merit || 0 }}</div>
        </div>
      </div>
      <div class="merit-item">
        <i class="fas fa-puzzle-piece"></i>
        <div>
          <div class="merit-label">复活币碎片</div>
          <div class="merit-val">{{ stateStore.profile?.shard || 0 }} / 5</div>
        </div>
      </div>
    </div>
    
    <div v-if="stateStore.profile" class="profile-card">
      <div class="avatar-wrap">
        <div class="avatar">
          <span>{{ stateStore.profile.name?.charAt(0) || '道' }}</span>
        </div>
        <div class="avatar-ring"></div>
      </div>
      <div class="profile-info">
        <div class="pi-row">
          <span class="pi-label">道号</span>
          <span class="pi-value">{{ stateStore.profile.name }}</span>
        </div>
        <div class="pi-row">
          <span class="pi-label">境界</span>
          <span class="pi-value">{{ stateStore.profile.realm }}</span>
        </div>
        <div class="pi-row">
          <span class="pi-label">性别</span>
          <span class="pi-value">{{ stateStore.profile.gender === 'male' ? '男' : '女' }}</span>
        </div>
        <div class="pi-row">
          <span class="pi-label">年龄</span>
          <span class="pi-value">{{ stateStore.profile.age }} 岁</span>
        </div>
        <div class="pi-row">
          <span class="pi-label">身高</span>
          <span class="pi-value">{{ stateStore.profile.height }} cm</span>
        </div>
        <div class="pi-row">
          <span class="pi-label">体重</span>
          <span class="pi-value">{{ stateStore.profile.weight }} kg</span>
        </div>
        <div class="pi-row">
          <span class="pi-label">BMI</span>
          <span class="pi-value">{{ stateStore.profile.bmi?.toFixed(1) }}</span>
        </div>
        <div class="pi-row">
          <span class="pi-label">初始寿命</span>
          <span class="pi-value">{{ formatLife(stateStore.profile.initialLifeYears) }}</span>
        </div>
        <div class="pi-row">
          <span class="pi-label">累计增益</span>
          <span class="pi-value" style="color: var(--jade);">+{{ formatLife(stateStore.profile.totalGainedYears) }}</span>
        </div>
        <div class="pi-row">
          <span class="pi-label">连续签到</span>
          <span class="pi-value">{{ stateStore.profile.streak }} 天</span>
        </div>
      </div>
    </div>

    <div class="formula-card">
      <h3>核心寿命公式</h3>
      <pre class="formula">L_current = L_initial + Σ L_gain − (T_now − T_start) × R_decay</pre>
      <p class="formula-note">L_gain：养生行为增量 · R_decay：衰减系数（受作息、心情等加成影响）</p>
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

    <!-- 成就墙 -->
    <div class="card achievements-card">
      <div class="achievements-header">
        <div class="achievements-title">
          <i class="fas fa-medal"></i>
          <h3>成就墙 <span class="ach-count">{{ unlockedCount }}/{{ achievements.length }}</span></h3>
        </div>
        <button @click="checkAchievements" class="check-btn" :disabled="loading">
          <i class="fas fa-rotate"></i> 检查成就
        </button>
      </div>
      <p class="achievements-subtitle">修仙路上的里程碑</p>
      <div class="achievements-list">
        <div v-if="achievements.length === 0" class="empty">暂无成就</div>
        <div v-for="ach in achievements" :key="ach.id" :class="['ach-item', { unlocked: ach.unlocked, locked: !ach.unlocked }]">
          <div class="ach-icon">{{ ach.emoji }}</div>
          <div class="ach-info">
            <div class="ach-name">{{ ach.name }}</div>
            <div class="ach-desc">{{ ach.description }}</div>
          </div>
          <div v-if="ach.unlocked" class="ach-badge">
            <i class="fas fa-check"></i>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useStateStore } from '../stores/state'
import { formatLife, api, toast } from '../utils/api'

const stateStore = useStateStore()
const loading = ref(false)
const logs = ref<any[]>([])
const logContent = ref('')
const logMood = ref('平静')
const logType = ref('note')
const achievements = ref<any[]>([])

const unlockedCount = computed(() => achievements.value.filter(a => a.unlocked).length)

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

async function loadAchievements() {
  try {
    const res = await api('/achievements')
    achievements.value = res.achievements || []
  } catch (err: any) {
    console.error('Failed to load achievements:', err)
  }
}

async function checkAchievements() {
  loading.value = true
  try {
    const res = await api('/achievements/check', { method: 'POST' })
    if (res.newAchievements && res.newAchievements.length > 0) {
      toast(`解锁了 ${res.newAchievements.length} 个新成就！`, 'gold')
    } else {
      toast('暂无新成就', 'good')
    }
    await loadAchievements()
  } catch (err: any) {
    toast(err.message, 'bad')
  } finally {
    loading.value = false
  }
}

function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString('zh-CN')
}

onMounted(async () => {
  await stateStore.fetchState(true)
  await loadLogs()
  await loadAchievements()
})
</script>
