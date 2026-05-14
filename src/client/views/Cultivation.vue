<template>
  <section id="cultivation" class="tab-pane active">
    <h2 class="page-title">
      <span class="cn">修炼大道</span>
      <span class="en">Cultivation Path</span>
    </h2>
    
    <!-- 养生修炼区域 -->
    <div class="cultivation-section">
      <h3 class="section-title">
        <i class="fas fa-leaf"></i> 养生修炼 · 筑基之道
        <span class="section-desc">凡人基础修行，为高深功法打基础</span>
      </h3>
      
      <div class="cultivation-grid">
        <!-- 动态渲染养生任务 -->
        <template v-for="task in wellnessTasks" :key="task.task_key">
          <!-- 基础任务 - 永远可用 -->
          <div v-if="task.realm_requirement === 'basic'" class="task-card wellness basic">
            <div class="task-icon"><span class="task-emoji">{{ task.emoji }}</span></div>
            <div class="task-body">
              <h4>{{ task.name }} <span class="basic-tag">基础</span></h4>
              <p>{{ task.description }}</p>
              
              <!-- 特殊输入：步数滑块 -->
              <div v-if="task.task_key === 'steps'" class="step-input">
                <input 
                  type="range" 
                  v-model="steps" 
                  min="0" 
                  max="100000" 
                  step="500" 
                />
                <div class="step-num">{{ steps.toLocaleString() }} 步</div>
              </div>
              
              <!-- 特殊输入：水杯计数 -->
              <div v-else-if="task.task_key === 'water'" class="water-cups">
                <span v-for="i in 8" :key="i" class="water-cup">💧</span>
              </div>
              
              <div class="task-reward">
                <span>奖励：</span><span v-if="task.task_key === 'steps'" class="reward-life">{{ stepsReward }}</span><span v-else-if="task.life_reward" class="reward-life">+{{ formatLife(task.life_reward) }}</span><span v-if="task.merit_reward"> · </span><span v-if="task.merit_reward" class="reward-merit">功德 +{{ task.merit_reward }}</span><span v-if="task.shard_reward"> · </span><span v-if="task.shard_reward" class="reward-coin">复活币碎片</span><span v-if="task.modifier_value"> · </span><span v-if="task.modifier_value" class="reward-mod">{{ task.modifier_value }}x 衰减</span>
              </div>
            </div>
            <button 
              @click="task.task_key === 'steps' ? submitSteps() : doTask(task.task_key)" 
              class="task-btn wellness-btn" 
              :disabled="loading"
            >
              {{ getTaskButtonText(task.task_key) }}
            </button>
          </div>

          <!-- 凡人阶段任务 -->
          <div v-else-if="task.realm_requirement === 'mortal' && isLowRealm" class="task-card wellness mortal">
            <div class="task-icon"><span class="task-emoji">{{ task.emoji }}</span></div>
            <div class="task-body">
              <h4>{{ task.name }} <span class="mortal-tag">凡人</span></h4>
              <p>{{ task.description }}</p>
              <div class="task-reward">
                <span>奖励：</span><span v-if="task.life_reward" class="reward-life">+{{ formatLife(task.life_reward) }}</span><span v-if="task.merit_reward"> · </span><span v-if="task.merit_reward" class="reward-merit">功德 +{{ task.merit_reward }}</span>
              </div>
            </div>
            <button @click="doTask(task.task_key)" class="task-btn wellness-btn" :disabled="loading">
              {{ getTaskButtonText(task.task_key) }}
            </button>
          </div>

          <!-- 高阶任务 -->
          <div v-else-if="task.realm_requirement === 'advanced' && isHighRealm" class="task-card wellness advanced">
            <div class="task-icon"><span class="task-emoji">{{ task.emoji }}</span></div>
            <div class="task-body">
              <h4>{{ task.name }} <span class="advanced-tag">高阶</span></h4>
              <p>{{ task.description }}</p>
              <div class="task-reward">
                <span>奖励：</span><span v-if="task.life_reward" class="reward-life">+{{ formatLife(task.life_reward) }}</span><span v-if="task.merit_reward"> · </span><span v-if="task.merit_reward" class="reward-merit">功德 +{{ task.merit_reward }}</span>
              </div>
            </div>
            <button @click="doTask(task.task_key)" class="task-btn advanced-btn" :disabled="loading">
              {{ getTaskButtonText(task.task_key) }}
            </button>
          </div>

          <!-- 挑战任务 -->
          <div v-else-if="task.realm_requirement === 'challenge'" class="task-card wellness challenge">
            <div class="task-icon"><span class="task-emoji">{{ task.emoji }}</span></div>
            <div class="task-body">
              <h4>{{ task.name }} <span class="challenge-tag">挑战</span></h4>
              <p>{{ task.description }}</p>
              <div v-if="task.task_key === 'earlyrise'" class="streak-bar">
                <div class="streak-progress" :style="{ width: `${(streak / 7) * 100}%` }"></div>
              </div>
              <div class="task-reward">
                <span v-if="task.task_key === 'earlyrise'">当前进度：</span><span v-if="task.task_key === 'earlyrise'">{{ streak }}</span><span v-if="task.task_key === 'earlyrise'"> / 7 天</span><span v-if="!task.task_key || task.task_key !== 'earlyrise'">奖励：</span><span v-if="task.life_reward && task.task_key !== 'earlyrise'" class="reward-life">+{{ formatLife(task.life_reward) }}</span><span v-if="task.merit_reward"> · </span><span v-if="task.merit_reward" class="reward-merit">功德 +{{ task.merit_reward }}</span><span v-if="task.coin_reward"> · </span><span v-if="task.coin_reward" class="reward-coin">复活币 +{{ task.coin_reward }}</span>
              </div>
            </div>
            <button @click="doTask(task.task_key)" class="task-btn challenge-btn" :disabled="loading">
              {{ getTaskButtonText(task.task_key) }}
            </button>
          </div>
        </template>
      </div>

      <!-- 境界说明 -->
      <div class="realm-notice">
        <div class="notice-content">
          <i class="fas fa-info-circle"></i>
          <div class="notice-text">
            <strong>修仙之道：</strong>
            <span v-if="isLowRealm">凡胎肉身阶段需要基础养生维持生机，随着境界提升将逐渐脱离凡俗需求</span>
            <span v-else-if="isHighRealm">已达高深境界，无需凡人养生，可直接吸纳天地灵气</span>
            <span v-else>正处修炼关键期，部分凡俗养生仍有助益</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 扩展修炼区域：左右布局 -->
    <div class="advanced-cultivation-wrapper">
      <!-- 扩展养生修炼任务 - 仅低境界显示 -->
      <div v-if="isLowRealm && extraTasks.length > 0" class="cultivation-section">
        <h3 class="section-title">
          <i class="fas fa-scroll"></i> 凡俗修行  · 养精蓄锐
          <span class="section-desc">凡人阶段额外修炼</span>
        </h3>
        <div class="extra-tasks-grid" :class="{ collapsed: !showAllExtraTasks }">
          <div v-for="task in extraTasks" :key="task.task_key" class="extra-task-card wellness mortal">
            <div class="task-icon">{{ task.emoji }}</div>
            <div class="task-body">
              <h4>{{ task.name }} <span class="mortal-tag">凡人</span></h4>
              <p>{{ task.description }}</p>
              <div class="task-reward">
                <span>奖励：</span><span class="reward-life">+{{ formatLife(task.life_reward) }}</span><span v-if="task.merit_reward"> · </span><span v-if="task.merit_reward" class="reward-merit">功德 +{{ task.merit_reward }}</span>
              </div>
            </div>
            <button @click="doTask(task.task_key)" class="task-btn wellness-btn" :disabled="loading">
              完成
            </button>
          </div>
        </div>
        <button 
          v-if="extraTasks.length > 6" 
          @click="showAllExtraTasks = !showAllExtraTasks" 
          class="toggle-tasks-btn"
        >
          <i :class="showAllExtraTasks ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
          {{ showAllExtraTasks ? '收起' : `显示全部 (${extraTasks.length})` }}
        </button>
      </div>

      <!-- 功法修炼区域 -->
      <div class="cultivation-section manuals-section">
        <h3 class="section-title">
          <i class="fas fa-fire"></i> 功法修炼 · 逆天改命
          <span class="section-desc">消耗功德，大幅增加寿命</span>
        </h3>
        
        <div class="manuals-list">
          <div v-if="manuals.length === 0" class="empty">暂无功法</div>
          <div v-for="manual in manuals" :key="manual.key" class="manual-item">
            <span class="manual-icon">{{ manual.emoji }}</span>
            <div class="manual-body">
              <div class="manual-header">
                <div class="manual-name">
                  {{ manual.name }}
                  <span class="manual-lv" v-if="manual.myLevel">Lv.{{ manual.myLevel }}</span>
                </div>
                <div class="manual-type">{{ getManualType(manual.key) }}</div>
              </div>
              <div class="manual-desc">{{ manual.description }}</div>
              <div class="manual-stats">
                <div class="manual-cost">
                  <i class="fas fa-gem"></i> 消耗: {{ manual.costMerit }} 功德
                </div>
                <div class="manual-reward">
                  <i class="fas fa-hourglass-half"></i> 预计增益: {{ getManualReward(manual) }}
                </div>
              </div>
            </div>
            <button @click="upgradeManual(manual.key)" class="task-btn manual-btn" :disabled="loading || !canAffordManual(manual)">
              {{ manual.myLevel === 0 ? '解锁功法' : '提升境界' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { api, formatLife, toast } from '../utils/api'
import { useStateStore } from '../stores/state'
import type { Task } from '../types'

const stateStore = useStateStore()
const loading = ref(false)
const steps = ref(0)
const streak = ref(0)
const extraTasks = ref<Task[]>([])
const wellnessTasks = ref<any[]>([])
const manuals = ref<any[]>([])
const showAllExtraTasks = ref(false)

// 境界等级判断 - 使用数据库中的境界数据
const realmLevel = computed(() => {
  if (!stateStore.profile) return 0
  return stateStore.profile.realm || 1
})

// 是否为低境界（需要凡俗养生）- 境界ID <= 8
const isLowRealm = computed(() => {
  return realmLevel.value <= 8
})

// 是否为高境界（可以高阶修炼）- 境界ID >= 9
const isHighRealm = computed(() => {
  return realmLevel.value >= 9
})

const stepsReward = computed(() => {
  const s = steps.value || 0
  let minutes = Math.floor(s / 1000) * 12
  if (s >= 10000) minutes += 120
  return `+${minutes} 分钟`
})

// 检查是否有足够功德修炼功法
const canAffordManual = computed(() => (manual: any) => {
  return stateStore.profile && stateStore.profile.merit >= manual.costMerit
})

// 获取功法类型
function getManualType(key: string): string {
  const types: Record<string, string> = {
    'basic_breathing': '基础功法',
    'iron_body': '炼体功法',
    'meditation': '心法',
    'qi_circulation': '内功心法',
    'advanced_breathing': '高级功法'
  }
  return types[key] || '未知功法'
}

// 获取功法修炼预计奖励
function getManualReward(manual: any): string {
  // 根据功法等级和类型计算预计奖励
  const baseReward = manual.costMerit * 10 // 基础倍率：消耗功德的10倍分钟
  const levelMultiplier = (manual.myLevel || 0) + 1
  const totalMinutes = baseReward * levelMultiplier
  
  if (totalMinutes >= 1440) {
    return `+${Math.floor(totalMinutes / 1440)} 天`
  } else if (totalMinutes >= 60) {
    return `+${Math.floor(totalMinutes / 60)} 小时`
  } else {
    return `+${totalMinutes} 分钟`
  }
}

// 获取任务按钮文本
function getTaskButtonText(taskKey: string): string {
  const buttonTexts: Record<string, string> = {
    'ziwu': '调息',
    'meditate': '入定',
    'steps': '提交',
    'water': '饮一杯',
    'diet': '今日清淡',
    'earlyrise': '今日已早起'
  }
  return buttonTexts[taskKey] || '完成'
}

async function doTask(taskKey: string) {
  loading.value = true
  try {
    const res = await api(`/tasks/${taskKey}`, { method: 'POST' })
    toast(res.msg || '修炼完成', 'good')
    await stateStore.fetchState(true)
  } catch (err: any) {
    toast(err.message, 'bad')
  } finally {
    loading.value = false
  }
}

async function submitSteps() {
  loading.value = true
  try {
    const res = await api('/tasks/steps', {
      method: 'POST',
      body: JSON.stringify({ steps: steps.value })
    })
    toast(res.msg || '步数已提交', 'good')
    await stateStore.fetchState(true)
    steps.value = 0
  } catch (err: any) {
    toast(err.message, 'bad')
  } finally {
    loading.value = false
  }
}

async function loadExtraTasks() {
  try {
    const res = await api('/extra-tasks/config')
    extraTasks.value = res.tasks || []
  } catch (err: any) {
    console.error('Failed to load extra tasks:', err)
  }
}

async function loadWellnessTasks() {
  try {
    const res = await api('/tasks/wellness/config')
    wellnessTasks.value = res.tasks || []
  } catch (err: any) {
    console.error('Failed to load wellness tasks:', err)
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

async function upgradeManual(key: string) {
  if (loading.value) return
  
  const manual = manuals.value.find(m => m.key === key)
  if (!manual) return
  
  if (!canAffordManual.value(manual)) {
    toast(`功德不足，需要 ${manual.costMerit} 功德`, 'bad')
    return
  }
  
  loading.value = true
  try {
    const res = await api(`/manuals/${key}/practice`, { method: 'POST' })
    toast(res.msg || '修炼成功，境界提升！', 'gold')
    await loadManuals()
    await stateStore.fetchState(true)
  } catch (err: any) {
    toast(err.message, 'bad')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadWellnessTasks()
  loadExtraTasks()
  loadManuals()
})
</script>