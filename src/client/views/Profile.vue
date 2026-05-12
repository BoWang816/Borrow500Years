<template>
  <section id="profile" class="tab-pane active">
    <h2 class="page-title">
      <span class="cn">道号印鉴</span>
      <span class="en">Profile</span>
    </h2>
    
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
          <span class="pi-value">{{ formatLife(stateStore.profile.initialLifeSec) }}</span>
        </div>
        <div class="pi-row">
          <span class="pi-label">累计增益</span>
          <span class="pi-value" style="color: var(--jade);">+{{ formatLife(stateStore.profile.totalGainedSec) }}</span>
        </div>
        <div class="pi-row">
          <span class="pi-label">功德值</span>
          <span class="pi-value" style="color: var(--gold-soft);">{{ stateStore.profile.merit }}</span>
        </div>
        <div class="pi-row">
          <span class="pi-label">复活币</span>
          <span class="pi-value">{{ stateStore.profile.coin }}</span>
        </div>
        <div class="pi-row">
          <span class="pi-label">碎片</span>
          <span class="pi-value">{{ stateStore.profile.shard }} / 5</span>
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
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useStateStore } from '../stores/state'
import { formatLife, api, toast } from '../utils/api'

const stateStore = useStateStore()
const loading = ref(false)
const logs = ref<any[]>([])
const logContent = ref('')
const logMood = ref('平静')
const logType = ref('note')

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

function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString('zh-CN')
}

onMounted(async () => {
  await stateStore.fetchState(true)
  await loadLogs()
})
</script>
