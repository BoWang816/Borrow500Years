<template>
  <div class="fortune-admin">
    <!-- 顶部控制栏 -->
    <div class="control-bar">
      <div class="title-section">
        <h2 class="cyber-title">
          <i class="fas fa-yin-yang"></i>
          <span class="cn">运势天机</span>
          <span class="en">FORTUNE ORACLE</span>
        </h2>
      </div>
      
      <div class="zodiac-control">
        <label>星座</label>
        <select v-model="selectedZodiac" @change="loadFortune" class="cyber-select">
          <option v-for="z in zodiacs" :key="z" :value="z">{{ z }}</option>
        </select>
        <button @click="refreshFortune" class="cyber-btn" :disabled="refreshing">
          <i :class="['fas fa-sync-alt', { 'fa-spin': refreshing }]"></i>
          <span>{{ refreshing ? '刷新中' : '刷新' }}</span>
        </button>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="main-grid">
      <!-- 左侧：运势详情 -->
      <div class="fortune-panel">
        <div v-if="todayFortune" class="fortune-content">
          <!-- 运势头部 -->
          <div class="fortune-header">
            <div class="fortune-level">
              <div :class="['level-badge', `level-${todayFortune.fortune}`]">
                {{ todayFortune.title }}
              </div>
              <div class="fortune-date">{{ formatDate(todayFortune.date) }}</div>
            </div>
            <div class="fortune-meta-compact">
              <div class="meta-item">
                <i class="fas fa-star"></i>
                <span>{{ todayFortune.luckyConstellation }}</span>
              </div>
              <div class="meta-item">
                <i class="fas fa-hashtag"></i>
                <span>{{ todayFortune.luckyNumber }}</span>
              </div>
              <div class="meta-item">
                <i class="fas fa-palette"></i>
                <span>{{ todayFortune.luckyColor }}</span>
              </div>
            </div>
          </div>

          <!-- 运势诗句 -->
          <div class="fortune-poem">
            <div class="poem-icon">「</div>
            <p>{{ todayFortune.poem }}</p>
            <div class="poem-icon">」</div>
          </div>

          <!-- 运势指数 -->
          <div v-if="todayFortune.indexes" class="fortune-indexes">
            <div class="index-row" v-for="(label, key) in indexLabels" :key="key">
              <span class="index-label">{{ label }}</span>
              <div class="index-bar">
                <div class="index-fill" :style="{ width: todayFortune.indexes[key] }"></div>
                <span class="index-value">{{ todayFortune.indexes[key] }}</span>
              </div>
            </div>
          </div>

          <!-- 宜忌 -->
          <div class="advice-grid">
            <div class="advice-item good">
              <i class="fas fa-check-circle"></i>
              <div class="advice-content">
                <span class="advice-label">宜</span>
                <span class="advice-text">{{ todayFortune.advice }}</span>
              </div>
            </div>
            <div class="advice-item bad">
              <i class="fas fa-times-circle"></i>
              <div class="advice-content">
                <span class="advice-label">忌</span>
                <span class="advice-text">{{ todayFortune.avoid }}</span>
              </div>
            </div>
          </div>

          <!-- 运势描述 -->
          <div class="fortune-desc">
            <p>{{ todayFortune.description }}</p>
          </div>
        </div>
        <div v-else class="loading-state">
          <i class="fas fa-spinner fa-spin"></i>
          <span>卜算天机中...</span>
        </div>
      </div>

      <!-- 右侧：统计数据 -->
      <div class="stats-panel">
        <!-- 统计卡片 -->
        <div class="stat-cards">
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-users"></i>
            </div>
            <div class="stat-data">
              <div class="stat-value">{{ stats.totalCheckins }}</div>
              <div class="stat-label">今日签到</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-percentage"></i>
            </div>
            <div class="stat-data">
              <div class="stat-value">{{ stats.checkinRate }}%</div>
              <div class="stat-label">签到率</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-fire"></i>
            </div>
            <div class="stat-data">
              <div class="stat-value">{{ stats.maxStreak }}</div>
              <div class="stat-label">最高连签</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-user-friends"></i>
            </div>
            <div class="stat-data">
              <div class="stat-value">{{ stats.totalUsers }}</div>
              <div class="stat-label">总用户</div>
            </div>
          </div>
        </div>

        <!-- 签到记录 -->
        <div class="records-section">
          <h3 class="section-title">
            <i class="fas fa-list"></i>
            <span>今日签到</span>
          </h3>
          <div class="records-list">
            <div v-if="checkinRecords.length === 0" class="empty-state">
              <i class="fas fa-inbox"></i>
              <span>暂无签到记录</span>
            </div>
            <div v-for="record in checkinRecords.slice(0, 10)" :key="record.id" class="record-item">
              <div class="record-user">
                <span class="user-name">{{ record.username }}</span>
                <span class="user-zodiac">{{ record.zodiac || '未设置' }}</span>
              </div>
              <div class="record-info">
                <span :class="['fortune-badge', `badge-${record.fortune}`]">{{ record.fortuneTitle }}</span>
                <span class="streak-badge">{{ record.streak }}天</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api, toast } from '../../utils/api'

const zodiacs = ['白羊座', '金牛座', '双子座', '巨蟹座', '狮子座', '处女座', '天秤座', '天蝎座', '射手座', '摩羯座', '水瓶座', '双鱼座']
const indexLabels: Record<string, string> = {
  all: '综合',
  health: '健康',
  love: '爱情',
  money: '财运',
  work: '工作'
}

const todayFortune = ref<any>(null)
const selectedZodiac = ref('白羊座')
const refreshing = ref(false)
const stats = ref({
  totalCheckins: 0,
  totalUsers: 0,
  checkinRate: 0,
  maxStreak: 0
})
const checkinRecords = ref<any[]>([])

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const weekdays = ['日', '一', '二', '三', '四', '五', '六']
  return `${date.getMonth() + 1}月${date.getDate()}日 周${weekdays[date.getDay()]}`
}

async function loadFortune() {
  try {
    const res: any = await api(`/admin/fortune/today?zodiac=${selectedZodiac.value}`)
    todayFortune.value = res.fortune
  } catch (err: any) {
    toast(err.message || '加载运势失败', 'bad')
  }
}

async function loadStats() {
  try {
    const res: any = await api('/admin/fortune/stats')
    stats.value = res.stats
  } catch (err: any) {
    console.error('Failed to load stats:', err)
  }
}

async function loadCheckinRecords() {
  try {
    const res: any = await api('/admin/fortune/checkins')
    checkinRecords.value = res.records
  } catch (err: any) {
    console.error('Failed to load checkin records:', err)
  }
}

async function refreshFortune() {
  if (refreshing.value) return
  
  refreshing.value = true
  try {
    const res: any = await api('/admin/fortune/refresh', { 
      method: 'POST',
      body: JSON.stringify({ zodiac: selectedZodiac.value })
    })
    toast(res.msg || '运势已刷新', 'gold')
    await loadFortune()
  } catch (err: any) {
    toast(err.message || '刷新失败', 'bad')
  } finally {
    refreshing.value = false
  }
}

onMounted(() => {
  loadFortune()
  loadStats()
  loadCheckinRecords()
})
</script>


<style scoped>
.fortune-admin {
  padding: 1.5rem;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(20, 20, 40, 0.9) 100%);
  min-height: 100vh;
}

/* 控制栏 */
.control-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 1rem 1.5rem;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(78, 205, 196, 0.3);
  border-radius: 8px;
  box-shadow: 0 0 20px rgba(78, 205, 196, 0.1);
}

.cyber-title {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 0;
  font-size: 1.5rem;
  color: #4ecdc4;
  text-shadow: 0 0 10px rgba(78, 205, 196, 0.5);
}

.cyber-title i {
  font-size: 1.8rem;
  animation: spin 20s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.cyber-title .cn {
  font-family: 'Chinese-Sans', sans-serif;
  letter-spacing: 0.3rem;
}

.cyber-title .en {
  font-size: 0.7rem;
  color: rgba(78, 205, 196, 0.6);
  letter-spacing: 0.2rem;
  font-weight: 300;
}

.zodiac-control {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.zodiac-control label {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
}

.cyber-select {
  padding: 0.5rem 1rem;
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(78, 205, 196, 0.3);
  border-radius: 4px;
  color: #4ecdc4;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s;
}

.cyber-select:hover {
  border-color: #4ecdc4;
  box-shadow: 0 0 10px rgba(78, 205, 196, 0.3);
}

.cyber-select:focus {
  outline: none;
  border-color: #4ecdc4;
  box-shadow: 0 0 15px rgba(78, 205, 196, 0.5);
}

.cyber-btn {
  padding: 0.5rem 1.25rem;
  background: linear-gradient(135deg, rgba(78, 205, 196, 0.2) 0%, rgba(68, 160, 141, 0.2) 100%);
  border: 1px solid #4ecdc4;
  border-radius: 4px;
  color: #4ecdc4;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s;
}

.cyber-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, rgba(78, 205, 196, 0.3) 0%, rgba(68, 160, 141, 0.3) 100%);
  box-shadow: 0 0 15px rgba(78, 205, 196, 0.5);
  transform: translateY(-2px);
}

.cyber-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 主网格 */
.main-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 1.5rem;
}

/* 运势面板 */
.fortune-panel {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(78, 205, 196, 0.2);
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.fortune-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(78, 205, 196, 0.1);
}

.fortune-level {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.level-badge {
  padding: 0.5rem 1.5rem;
  border-radius: 20px;
  font-size: 1.2rem;
  font-weight: bold;
  font-family: 'Chinese-Sans', sans-serif;
  letter-spacing: 0.2rem;
  text-shadow: 0 0 10px currentColor;
  border: 2px solid currentColor;
}

.level-badge.level-大吉 {
  color: #ff6b6b;
  background: rgba(255, 107, 107, 0.1);
  border-color: #ff6b6b;
}

.level-badge.level-吉 {
  color: #4ecdc4;
  background: rgba(78, 205, 196, 0.1);
  border-color: #4ecdc4;
}

.level-badge.level-平 {
  color: #f1c40f;
  background: rgba(241, 196, 15, 0.1);
  border-color: #f1c40f;
}

.level-badge.level-凶 {
  color: #95a5a6;
  background: rgba(149, 165, 166, 0.1);
  border-color: #95a5a6;
}

.fortune-date {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.85rem;
}

.fortune-meta-compact {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85rem;
}

.meta-item i {
  color: #4ecdc4;
  width: 16px;
}

/* 运势诗句 */
.fortune-poem {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  margin: 1rem 0;
  background: linear-gradient(90deg, rgba(78, 205, 196, 0.05) 0%, rgba(78, 205, 196, 0.1) 50%, rgba(78, 205, 196, 0.05) 100%);
  border-left: 3px solid #4ecdc4;
  border-right: 3px solid #4ecdc4;
}

.poem-icon {
  font-size: 2rem;
  color: #4ecdc4;
  opacity: 0.3;
  font-family: 'Chinese-Calligraphy', serif;
}

.fortune-poem p {
  flex: 1;
  margin: 0;
  color: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
  line-height: 1.6;
  font-family: 'Chinese-Sans', sans-serif;
  letter-spacing: 0.1rem;
}

/* 运势指数 */
.fortune-indexes {
  margin: 1.5rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.index-row {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.index-label {
  min-width: 50px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

.index-bar {
  flex: 1;
  height: 20px;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(78, 205, 196, 0.2);
  border-radius: 10px;
  position: relative;
  overflow: hidden;
}

.index-fill {
  height: 100%;
  background: linear-gradient(90deg, #4ecdc4 0%, #44a08d 100%);
  border-radius: 10px;
  transition: width 0.5s ease;
  box-shadow: 0 0 10px rgba(78, 205, 196, 0.5);
}

.index-value {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  color: #fff;
  font-size: 0.75rem;
  font-weight: bold;
  text-shadow: 0 0 5px rgba(0, 0, 0, 0.8);
}

/* 宜忌 */
.advice-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin: 1.5rem 0;
}

.advice-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 6px;
  border: 1px solid;
}

.advice-item.good {
  background: rgba(78, 205, 196, 0.05);
  border-color: rgba(78, 205, 196, 0.3);
}

.advice-item.good i {
  color: #4ecdc4;
  font-size: 1.2rem;
  margin-top: 0.2rem;
}

.advice-item.bad {
  background: rgba(255, 107, 107, 0.05);
  border-color: rgba(255, 107, 107, 0.3);
}

.advice-item.bad i {
  color: #ff6b6b;
  font-size: 1.2rem;
  margin-top: 0.2rem;
}

.advice-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.advice-label {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
}

.advice-text {
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.95rem;
}

/* 运势描述 */
.fortune-desc {
  padding: 1rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 6px;
  border: 1px solid rgba(78, 205, 196, 0.1);
}

.fortune-desc p {
  margin: 0;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  line-height: 1.6;
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  gap: 1rem;
  color: rgba(78, 205, 196, 0.6);
}

.loading-state i {
  font-size: 2rem;
}

/* 统计面板 */
.stats-panel {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.stat-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(78, 205, 196, 0.2);
  border-radius: 6px;
  transition: all 0.3s;
}

.stat-card:hover {
  border-color: #4ecdc4;
  box-shadow: 0 0 15px rgba(78, 205, 196, 0.2);
  transform: translateY(-2px);
}

.stat-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(78, 205, 196, 0.2) 0%, rgba(68, 160, 141, 0.2) 100%);
  border: 1px solid #4ecdc4;
  border-radius: 50%;
  color: #4ecdc4;
  font-size: 1.2rem;
}

.stat-data {
  flex: 1;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #4ecdc4;
  line-height: 1;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
}

/* 签到记录 */
.records-section {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(78, 205, 196, 0.2);
  border-radius: 8px;
  padding: 1rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 1rem 0;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(78, 205, 196, 0.1);
  color: #4ecdc4;
  font-size: 1rem;
}

.records-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 400px;
  overflow-y: auto;
}

.records-list::-webkit-scrollbar {
  width: 6px;
}

.records-list::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.records-list::-webkit-scrollbar-thumb {
  background: rgba(78, 205, 196, 0.3);
  border-radius: 3px;
}

.records-list::-webkit-scrollbar-thumb:hover {
  background: rgba(78, 205, 196, 0.5);
}

.record-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(78, 205, 196, 0.1);
  border-radius: 4px;
  transition: all 0.2s;
}

.record-item:hover {
  border-color: rgba(78, 205, 196, 0.3);
  background: rgba(0, 0, 0, 0.4);
}

.record-user {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.user-name {
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
}

.user-zodiac {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.75rem;
}

.record-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.fortune-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  border: 1px solid;
}

.fortune-badge.badge-大吉 {
  color: #ff6b6b;
  background: rgba(255, 107, 107, 0.1);
  border-color: #ff6b6b;
}

.fortune-badge.badge-吉 {
  color: #4ecdc4;
  background: rgba(78, 205, 196, 0.1);
  border-color: #4ecdc4;
}

.fortune-badge.badge-平 {
  color: #f1c40f;
  background: rgba(241, 196, 15, 0.1);
  border-color: #f1c40f;
}

.fortune-badge.badge-凶 {
  color: #95a5a6;
  background: rgba(149, 165, 166, 0.1);
  border-color: #95a5a6;
}

.streak-badge {
  padding: 0.25rem 0.5rem;
  background: rgba(78, 205, 196, 0.2);
  border: 1px solid #4ecdc4;
  border-radius: 10px;
  color: #4ecdc4;
  font-size: 0.75rem;
  font-weight: 500;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.3);
}

.empty-state i {
  font-size: 2rem;
}

/* 响应式 */
@media (max-width: 1200px) {
  .main-grid {
    grid-template-columns: 1fr;
  }
  
  .stat-cards {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 768px) {
  .control-bar {
    flex-direction: column;
    gap: 1rem;
  }
  
  .stat-cards {
    grid-template-columns: 1fr 1fr;
  }
  
  .advice-grid {
    grid-template-columns: 1fr;
  }
}
</style>
