<template>
  <section id="cultivation-practices" class="tab-pane active">
    <h2 class="page-title">
      <span class="cn">修炼项目</span>
      <span class="en">Cultivation Practices</span>
    </h2>

    <!-- 统计面板 -->
    <div class="stats-panel" v-if="stats">
      <div class="stat-card">
        <div class="stat-icon">📊</div>
        <div class="stat-content">
          <div class="stat-label">总修炼次数</div>
          <div class="stat-value">{{ stats.totalPracticeCount }}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">✅</div>
        <div class="stat-content">
          <div class="stat-label">成功率</div>
          <div class="stat-value">{{ stats.successRate }}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">👑</div>
        <div class="stat-content">
          <div class="stat-label">精通功法</div>
          <div class="stat-value">{{ stats.masteredCount }}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">⚡</div>
        <div class="stat-content">
          <div class="stat-label">激活功法</div>
          <div class="stat-value">{{ stats.activeCount }} / 5</div>
        </div>
      </div>
    </div>

    <!-- 当前境界信息 -->
    <div class="current-realm-info" v-if="currentRealmName">
      <i class="fas fa-mountain"></i>
      <span>当前境界：{{ currentRealmName }}</span>
      <span class="realm-id">（境界 {{ currentRealmId }}）</span>
    </div>

    <!-- 修炼项目列表 -->
    <div class="practices-container">
      <div v-if="loading" class="loading-state">
        <i class="fas fa-spinner fa-spin"></i> 加载中...
      </div>

      <template v-else>
        <!-- 空状态提示 -->
        <div v-if="practices.length === 0" class="empty-state">
          <i class="fas fa-database"></i>
          <h3>暂无修炼项目</h3>
          <p>请先运行数据库迁移脚本初始化修炼项目数据</p>
          <div class="migration-commands">
            <code>wrangler d1 execute DB --local --file=./migrations/0015_realm_cultivation_system.sql</code>
            <code>wrangler d1 execute DB --local --file=./migrations/0016_cultivation_practices_expansion.sql</code>
            <code>wrangler d1 execute DB --local --file=./migrations/0017_cultivation_practices_realms_11_15.sql</code>
            <code>wrangler d1 execute DB --local --file=./migrations/0018_cultivation_practices_realms_16_20.sql</code>
          </div>
        </div>

        <!-- 按境界分组显示 -->
        <div v-for="realmGroup in groupedPractices" :key="realmGroup.realmId" class="realm-group">
          <div class="realm-header" @click="toggleRealm(realmGroup.realmId)">
            <i :class="['fas', expandedRealms.includes(realmGroup.realmId) ? 'fa-chevron-down' : 'fa-chevron-right']"></i>
            <span class="realm-name">境界 {{ realmGroup.realmId }}：{{ realmGroup.realmName }}</span>
            <span class="practice-count">{{ realmGroup.practices.length }} 个修炼项目</span>
            <span v-if="realmGroup.realmId > currentRealmId" class="locked-badge">🔒 未解锁</span>
          </div>

          <div v-show="expandedRealms.includes(realmGroup.realmId)" class="practices-grid">
            <div 
              v-for="practice in realmGroup.practices" 
              :key="practice.key"
              :class="['practice-card', practice.rarity, { 
                'locked': !practice.isUnlocked,
                'active': practice.isActive,
                'mastered': practice.isMastered
              }]"
            >
              <div class="practice-header">
                <span class="practice-emoji">{{ practice.emoji }}</span>
                <div class="practice-title">
                  <h4>{{ practice.name }}</h4>
                  <span :class="['practice-type', practice.practiceType]">{{ getTypeLabel(practice.practiceType) }}</span>
                </div>
                <span v-if="practice.userLevel > 0" class="practice-level">Lv.{{ practice.userLevel }}</span>
              </div>

              <p class="practice-desc">{{ practice.description }}</p>

              <div class="practice-stats">
                <div class="stat-row">
                  <span class="label">难度：</span>
                  <span class="value">{{ '★'.repeat(Math.min(practice.difficulty, 5)) }}</span>
                </div>
                <div class="stat-row" v-if="practice.userLevel > 0">
                  <span class="label">经验：</span>
                  <div class="exp-bar">
                    <div class="exp-fill" :style="{ width: getExpPercent(practice) + '%' }"></div>
                  </div>
                </div>
              </div>

              <div class="practice-cost">
                <span v-if="practice.costMerit > 0">💎 {{ practice.costMerit }}</span>
                <span v-if="practice.costCoin > 0">🪙 {{ practice.costCoin }}</span>
              </div>

              <div class="practice-reward">
                <span v-if="practice.rewardLife > 0">⏳ +{{ formatTime(practice.rewardLife) }}</span>
                <span v-if="practice.rewardMerit > 0">💎 +{{ practice.rewardMerit }}</span>
                <span v-if="practice.rewardShard > 0">💠 +{{ practice.rewardShard }}</span>
              </div>

              <div class="practice-actions">
                <button 
                  v-if="practice.isUnlocked && practice.canPractice && practice.isAffordable"
                  @click="doPractice(practice.key)"
                  class="btn-practice"
                  :disabled="practicing"
                >
                  <i class="fas fa-fire"></i> 修炼
                </button>
                <button 
                  v-else-if="!practice.isUnlocked"
                  class="btn-locked"
                  disabled
                >
                  <i class="fas fa-lock"></i> 未解锁
                </button>
                <button 
                  v-else-if="!practice.canPractice"
                  class="btn-cooldown"
                  disabled
                >
                  <i class="fas fa-clock"></i> 冷却中
                </button>
                <button 
                  v-else-if="!practice.isAffordable"
                  class="btn-unaffordable"
                  disabled
                >
                  <i class="fas fa-coins"></i> 资源不足
                </button>

                <button 
                  v-if="practice.userLevel > 0"
                  @click="toggleActive(practice.key)"
                  :class="['btn-toggle', { active: practice.isActive }]"
                  :disabled="practicing"
                >
                  <i :class="['fas', practice.isActive ? 'fa-check-circle' : 'fa-circle']"></i>
                  {{ practice.isActive ? '已激活' : '激活' }}
                </button>
              </div>

              <div v-if="practice.todayPracticeCount > 0 && practice.dailyLimit > 0" class="daily-count">
                今日：{{ practice.todayPracticeCount }} / {{ practice.dailyLimit }}
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { api, toast } from '../utils/api'
import { useStateStore } from '../stores/state'

const stateStore = useStateStore()
const loading = ref(true)
const practicing = ref(false)
const practices = ref<any[]>([])
const stats = ref<any>(null)
const currentRealmId = ref(0)
const currentRealmName = ref('')
const expandedRealms = ref<number[]>([])

// 按境界分组
const groupedPractices = computed(() => {
  const groups: Record<number, any> = {}
  
  practices.value.forEach(p => {
    if (!groups[p.realmId]) {
      groups[p.realmId] = {
        realmId: p.realmId,
        realmName: getRealmName(p.realmId),
        practices: []
      }
    }
    groups[p.realmId].practices.push(p)
  })
  
  return Object.values(groups).sort((a, b) => a.realmId - b.realmId)
})

function getRealmName(realmId: number): string {
  const realm = stateStore.realms.find(r => r.id === realmId)
  return realm?.name || `境界${realmId}`
}

function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    'basic': '基础',
    'advanced': '高级',
    'secret': '秘法',
    'forbidden': '禁术'
  }
  return labels[type] || type
}

function getExpPercent(practice: any): number {
  const expNeeded = (practice.userLevel + 1) * 100
  return (practice.userExp / expNeeded) * 100
}

function formatTime(seconds: number): string {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  
  if (days > 0) {
    return `${days}天${hours}时`
  } else if (hours > 0) {
    return `${hours}小时`
  } else {
    const minutes = Math.floor(seconds / 60)
    return `${minutes}分钟`
  }
}

function toggleRealm(realmId: number) {
  const index = expandedRealms.value.indexOf(realmId)
  if (index > -1) {
    expandedRealms.value.splice(index, 1)
  } else {
    expandedRealms.value.push(realmId)
  }
}

async function loadPractices() {
  loading.value = true
  try {
    const res = await api('/cultivation/practices') as any
    
    if (res.error) {
      toast(res.error, 'bad')
      practices.value = []
      currentRealmId.value = res.currentRealmId || 0
      currentRealmName.value = res.currentRealmName || ''
      return
    }
    
    practices.value = res.practices || []
    currentRealmId.value = res.currentRealmId || 0
    currentRealmName.value = res.currentRealmName || ''
    
    // 默认展开当前境界和前一个境界
    expandedRealms.value = [currentRealmId.value, Math.max(1, currentRealmId.value - 1)]
  } catch (err: any) {
    toast(err.message || '加载失败', 'bad')
  } finally {
    loading.value = false
  }
}

async function loadStats() {
  try {
    const res = await api('/cultivation/stats') as any
    stats.value = res
  } catch (err: any) {
    console.error('Failed to load stats:', err)
  }
}

async function doPractice(key: string) {
  if (practicing.value) return
  
  practicing.value = true
  try {
    const res = await api(`/cultivation/practice/${key}`, { method: 'POST' }) as any
    
    if (res.result === 'critical') {
      toast('💥 暴击修炼！' + res.msg, 'gold')
    } else if (res.result === 'success') {
      toast('✨ ' + res.msg, 'good')
    } else {
      toast('😔 ' + res.msg, 'bad')
    }
    
    await Promise.all([
      loadPractices(),
      loadStats(),
      stateStore.fetchState(true)
    ])
  } catch (err: any) {
    toast(err.message || '修炼失败', 'bad')
  } finally {
    practicing.value = false
  }
}

async function toggleActive(key: string) {
  if (practicing.value) return
  
  practicing.value = true
  try {
    await api(`/cultivation/toggle/${key}`, { method: 'POST' })
    await loadPractices()
  } catch (err: any) {
    toast(err.message || '操作失败', 'bad')
  } finally {
    practicing.value = false
  }
}

onMounted(async () => {
  await stateStore.fetchRealms()
  await Promise.all([
    loadPractices(),
    loadStats()
  ])
})
</script>

<style scoped>
/* 统计面板 */
.stats-panel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: linear-gradient(135deg, rgba(212,175,55,0.1), rgba(54,255,208,0.05));
  border: 1px solid rgba(212,175,55,0.3);
  border-radius: 8px;
}

.stat-icon {
  font-size: 32px;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 12px;
  color: var(--ink-dim);
  margin-bottom: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--gold-soft);
  font-family: 'Orbitron', sans-serif;
}

/* 当前境界信息 */
.current-realm-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(54,255,208,0.1);
  border-left: 4px solid var(--jade);
  border-radius: 4px;
  margin-bottom: 24px;
  font-size: 14px;
  color: var(--jade);
}

.realm-id {
  color: var(--ink-dim);
  font-size: 12px;
}

/* 境界分组 */
.realm-group {
  margin-bottom: 24px;
}

.realm-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: linear-gradient(135deg, rgba(212,175,55,0.15), rgba(54,255,208,0.08));
  border: 1px solid rgba(212,175,55,0.3);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 16px;
}

.realm-header:hover {
  background: linear-gradient(135deg, rgba(212,175,55,0.25), rgba(54,255,208,0.12));
  border-color: var(--gold);
}

.realm-name {
  flex: 1;
  font-size: 18px;
  font-weight: 600;
  color: var(--gold-soft);
}

.practice-count {
  font-size: 14px;
  color: var(--ink-dim);
}

.locked-badge {
  padding: 4px 12px;
  background: rgba(255,77,109,0.2);
  border-radius: 12px;
  font-size: 12px;
  color: var(--crimson);
}

/* 修炼项目网格 */
.practices-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

/* 修炼项目卡片 */
.practice-card {
  padding: 16px;
  background: linear-gradient(135deg, rgba(10,14,26,0.8), rgba(20,24,38,0.6));
  border: 2px solid rgba(212,175,55,0.3);
  border-radius: 8px;
  transition: all 0.3s;
}

.practice-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.3);
}

.practice-card.locked {
  opacity: 0.6;
  filter: grayscale(0.5);
}

.practice-card.active {
  border-color: var(--jade);
  box-shadow: 0 0 20px rgba(54,255,208,0.3);
}

.practice-card.mastered {
  border-color: var(--gold);
}

/* 稀有度颜色 */
.practice-card.common { border-color: rgba(200,200,200,0.3); }
.practice-card.rare { border-color: rgba(54,162,235,0.5); }
.practice-card.epic { border-color: rgba(153,102,255,0.5); }
.practice-card.legendary { border-color: rgba(255,206,86,0.5); }
.practice-card.mythic { border-color: rgba(255,99,132,0.5); }

.practice-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.practice-emoji {
  font-size: 32px;
}

.practice-title {
  flex: 1;
}

.practice-title h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
  color: var(--gold-soft);
}

.practice-type {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
}

.practice-type.basic { background: rgba(54,255,208,0.2); color: var(--jade); }
.practice-type.advanced { background: rgba(153,102,255,0.2); color: #9966ff; }
.practice-type.secret { background: rgba(255,206,86,0.2); color: var(--gold); }
.practice-type.forbidden { background: rgba(255,99,132,0.2); color: var(--crimson); }

.practice-level {
  padding: 4px 12px;
  background: rgba(212,175,55,0.2);
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  color: var(--gold-soft);
}

.practice-desc {
  font-size: 13px;
  color: var(--ink);
  margin-bottom: 12px;
  line-height: 1.5;
}

.practice-stats {
  margin-bottom: 12px;
}

.stat-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  font-size: 12px;
}

.stat-row .label {
  color: var(--ink-dim);
}

.stat-row .value {
  color: var(--gold-soft);
}

.exp-bar {
  flex: 1;
  height: 6px;
  background: rgba(0,0,0,0.3);
  border-radius: 3px;
  overflow: hidden;
}

.exp-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--jade), var(--gold));
  transition: width 0.3s;
}

.practice-cost,
.practice-reward {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
  font-size: 13px;
}

.practice-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.practice-actions button {
  flex: 1;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-practice {
  background: linear-gradient(135deg, var(--gold), #b8902a);
  color: #1a1208;
  border: none;
}

.btn-practice:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(212,175,55,0.4);
}

.btn-toggle {
  background: rgba(54,255,208,0.1);
  color: var(--jade);
  border: 1px solid rgba(54,255,208,0.3);
}

.btn-toggle.active {
  background: rgba(54,255,208,0.2);
  border-color: var(--jade);
}

.btn-locked,
.btn-cooldown,
.btn-unaffordable {
  background: rgba(128,128,128,0.1);
  color: var(--ink-dim);
  border: 1px solid rgba(128,128,128,0.3);
  cursor: not-allowed;
}

.daily-count {
  margin-top: 8px;
  padding: 6px;
  background: rgba(54,255,208,0.1);
  border-radius: 4px;
  text-align: center;
  font-size: 12px;
  color: var(--jade);
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px;
  color: var(--gold);
  font-size: 18px;
  gap: 12px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 40px;
  text-align: center;
}

.empty-state i {
  font-size: 64px;
  color: var(--gold);
  opacity: 0.3;
  margin-bottom: 24px;
}

.empty-state h3 {
  font-size: 24px;
  color: var(--gold-soft);
  margin-bottom: 12px;
}

.empty-state p {
  font-size: 16px;
  color: var(--ink-dim);
  margin-bottom: 24px;
}

.migration-commands {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 800px;
  width: 100%;
}

.migration-commands code {
  padding: 12px 16px;
  background: rgba(0,0,0,0.3);
  border: 1px solid rgba(212,175,55,0.3);
  border-radius: 6px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: var(--jade);
  text-align: left;
  overflow-x: auto;
}
</style>
