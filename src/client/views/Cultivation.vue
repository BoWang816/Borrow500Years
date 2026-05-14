<template>
  <section id="cultivation" class="tab-pane active">
    <h2 class="page-title">
      <span class="cn">修炼大道</span>
      <span class="en">Cultivation Path</span>
    </h2>
    
    <!-- 加载状态 -->
    <div v-if="loadingTasks" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>加载养生任务中...</p>
    </div>
    
    <!-- 养生修炼区域 -->
    <div v-else class="cultivation-section">
      <h3 class="section-title">
        <i class="fas fa-leaf"></i> 养生修炼 · 筑基之道
        <span class="section-desc">{{ realmDesc }}</span>
      </h3>
      
      <div v-if="wellnessTasks.length === 0" class="empty-wellness">
        <i class="fas fa-mountain"></i>
        <p>当前境界无需养生修炼</p>
        <p class="sub-text">已超脱凡俗，可直接修炼高深功法</p>
      </div>
      
      <div v-else>
        <!-- 基础任务组 -->
        <div v-if="basicTasks.length > 0" class="task-group">
          <h4 class="group-title">
            <i class="fas fa-star"></i> 基础修炼
            <span class="group-count">{{ basicTasks.length }}项</span>
          </h4>
          <div class="cultivation-grid">
            <div v-for="task in basicTasks" :key="task.task_key" 
                 :class="['task-card', 'wellness', getTaskClass(task.realm_requirement), { completed: isTaskCompleted(task.task_key) }]">
              <div class="task-icon">
                <span class="task-emoji">{{ task.emoji }}</span>
                <span v-if="isTaskCompleted(task.task_key)" class="completed-badge">✓</span>
              </div>
              <div class="task-body">
                <h4>
                  {{ task.name }} 
                  <span :class="getTagClass(task.realm_requirement)">{{ getTagLabel(task.realm_requirement) }}</span>
                </h4>
                <p>{{ task.description }}</p>
                
                <!-- 动态渲染特殊输入 -->
                <component 
                  :is="getInputComponent(task)" 
                  v-if="getInputComponent(task)"
                  :task="task"
                  :value="getInputValue(task.task_key)"
                  @update="(val: any) => updateInputValue(task.task_key, val)"
                />
                
                <div class="task-reward">
                  <span>奖励：</span>
                  <span v-if="task.life_reward" class="reward-life">+{{ formatLife(task.life_reward) }}</span>
                  <span v-if="task.merit_reward"> · </span>
                  <span v-if="task.merit_reward" class="reward-merit">功德 +{{ task.merit_reward }}</span>
                  <span v-if="task.shard_reward"> · </span>
                  <span v-if="task.shard_reward" class="reward-coin">碎片 +{{ task.shard_reward }}</span>
                  <span v-if="task.coin_reward"> · </span>
                  <span v-if="task.coin_reward" class="reward-coin">复活币 +{{ task.coin_reward }}</span>
                </div>
              </div>
              <button 
                @click="handleTaskClick(task)" 
                :class="['task-btn', getButtonClass(task.realm_requirement)]" 
                :disabled="loading || isTaskCompleted(task.task_key)"
              >
                {{ isTaskCompleted(task.task_key) ? '已完成' : getTaskButtonText(task.task_key) }}
              </button>
            </div>
          </div>
        </div>

        <!-- 境界专属任务组 -->
        <div v-if="realmSpecificTasks.length > 0" class="task-group">
          <h4 class="group-title">
            <i class="fas fa-mountain"></i> 境界专属修炼
            <span class="group-count">{{ realmSpecificTasks.length }}项</span>
          </h4>
          <div class="cultivation-grid">
            <div v-for="task in realmSpecificTasks" :key="task.task_key" 
                 :class="['task-card', 'wellness', getTaskClass(task.realm_requirement), { completed: isTaskCompleted(task.task_key) }]">
              <div class="task-icon">
                <span class="task-emoji">{{ task.emoji }}</span>
                <span v-if="isTaskCompleted(task.task_key)" class="completed-badge">✓</span>
              </div>
              <div class="task-body">
                <h4>
                  {{ task.name }} 
                  <span :class="getTagClass(task.realm_requirement)">{{ getTagLabel(task.realm_requirement) }}</span>
                </h4>
                <p>{{ task.description }}</p>
                
                <div class="task-reward">
                  <span>奖励：</span>
                  <span v-if="task.life_reward" class="reward-life">+{{ formatLife(task.life_reward) }}</span>
                  <span v-if="task.merit_reward"> · </span>
                  <span v-if="task.merit_reward" class="reward-merit">功德 +{{ task.merit_reward }}</span>
                  <span v-if="task.shard_reward"> · </span>
                  <span v-if="task.shard_reward" class="reward-coin">碎片 +{{ task.shard_reward }}</span>
                </div>
              </div>
              <button 
                @click="handleTaskClick(task)" 
                :class="['task-btn', getButtonClass(task.realm_requirement)]" 
                :disabled="loading || isTaskCompleted(task.task_key)"
              >
                {{ isTaskCompleted(task.task_key) ? '已完成' : '完成' }}
              </button>
            </div>
          </div>
        </div>

        <!-- 挑战任务组 -->
        <div v-if="challengeTasks.length > 0" class="task-group">
          <h4 class="group-title">
            <i class="fas fa-trophy"></i> 挑战修炼
            <span class="group-count">{{ challengeTasks.length }}项</span>
          </h4>
          <div class="cultivation-grid">
            <div v-for="task in challengeTasks" :key="task.task_key" 
                 :class="['task-card', 'wellness', 'challenge', { completed: isTaskCompleted(task.task_key) }]">
              <div class="task-icon">
                <span class="task-emoji">{{ task.emoji }}</span>
                <span v-if="isTaskCompleted(task.task_key)" class="completed-badge">✓</span>
              </div>
              <div class="task-body">
                <h4>
                  {{ task.name }} 
                  <span class="challenge-tag">挑战</span>
                </h4>
                <p>{{ task.description }}</p>
                
                <!-- 早起挑战进度条 -->
                <div v-if="task.task_key === 'earlyrise'" class="streak-bar">
                  <div class="streak-progress" :style="{ width: `${(streak / 7) * 100}%` }"></div>
                  <div class="streak-text">{{ streak }} / 7 天</div>
                </div>
                
                <div class="task-reward">
                  <span>奖励：</span>
                  <span v-if="task.life_reward" class="reward-life">+{{ formatLife(task.life_reward) }}</span>
                  <span v-if="task.merit_reward"> · </span>
                  <span v-if="task.merit_reward" class="reward-merit">功德 +{{ task.merit_reward }}</span>
                  <span v-if="task.coin_reward"> · </span>
                  <span v-if="task.coin_reward" class="reward-coin">复活币 +{{ task.coin_reward }}</span>
                </div>
              </div>
              <button 
                @click="handleTaskClick(task)" 
                :class="['task-btn', 'challenge-btn']" 
                :disabled="loading || isTaskCompleted(task.task_key)"
              >
                {{ isTaskCompleted(task.task_key) ? '已完成' : getTaskButtonText(task.task_key) }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 境界说明 -->
      <div v-if="wellnessTasks.length > 0" class="realm-notice">
        <div class="notice-content">
          <i class="fas fa-info-circle"></i>
          <div class="notice-text">
            <strong>修仙之道：</strong>
            <span>{{ realmNotice }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 扩展修炼区域 -->
    <div v-if="!loadingTasks && realmLevel <= 5 && extraTasks.length > 0" class="cultivation-section">
      <h3 class="section-title">
        <i class="fas fa-scroll"></i> 凡俗修行 · 养精蓄锐
        <span class="section-desc">凡人阶段额外修炼</span>
      </h3>
      <div class="extra-tasks-grid" :class="{ collapsed: !showAllExtraTasks }">
        <div v-for="task in displayedExtraTasks" :key="task.task_key" 
             :class="['extra-task-card', 'wellness', 'mortal']">
          <div class="task-icon">{{ task.emoji }}</div>
          <div class="task-body">
            <h4>{{ task.name }} <span class="mortal-tag">凡人</span></h4>
            <p>{{ task.description }}</p>
            <div class="task-reward">
              <span>奖励：</span>
              <span class="reward-life">+{{ formatLife(task.life_reward) }}</span>
              <span v-if="task.merit_reward"> · </span>
              <span v-if="task.merit_reward" class="reward-merit">功德 +{{ task.merit_reward }}</span>
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
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue'
import { api, formatLife, toast } from '../utils/api'
import { useStateStore } from '../stores/state'
import type { Task } from '../types'

const stateStore = useStateStore()
const loading = ref(false)
const loadingTasks = ref(true)
const steps = ref(0)
const waterCount = ref(0)
const inputValues = ref<Record<string, any>>({})
const streak = computed(() => stateStore.profile?.streak || 0)
const extraTasks = ref<Task[]>([])
const wellnessTasks = ref<any[]>([])
const showAllExtraTasks = ref(false)
const completedTasks = ref<Set<string>>(new Set())

// 境界等级判断
const realmLevel = computed(() => {
  if (!stateStore.profile) return 0
  return stateStore.profile.realmId || 1
})

// 任务分组
const basicTasks = computed(() => 
  wellnessTasks.value.filter(t => t.realm_requirement === 'basic')
)

const realmSpecificTasks = computed(() => 
  wellnessTasks.value.filter(t => t.realm_requirement === 'mortal' || t.realm_requirement === 'advanced')
)

const challengeTasks = computed(() => 
  wellnessTasks.value.filter(t => t.realm_requirement === 'challenge')
)

// 显示的扩展任务
const displayedExtraTasks = computed(() => 
  showAllExtraTasks.value ? extraTasks.value : extraTasks.value.slice(0, 6)
)

// 境界描述
const realmDesc = computed(() => {
  const realm = realmLevel.value
  if (realm <= 5) return '凡蜕期修行，贴近生活养生'
  if (realm <= 9) return '超凡期修炼，吸纳天地灵气'
  return '已超脱凡俗，无需养生'
})

// 境界提示
const realmNotice = computed(() => {
  const realm = realmLevel.value
  if (realm <= 5) return '凡蜕期修士需要基础养生维持生机，为突破超凡打下根基'
  if (realm <= 9) return '超凡期修士已脱离部分凡俗需求，但仍需特殊修炼巩固境界'
  return '已达化境期以上，完全超脱凡俗，可直接修炼高深功法'
})

// 检查任务是否已完成
function isTaskCompleted(taskKey: string): boolean {
  return completedTasks.value.has(taskKey)
}

// 获取输入组件
function getInputComponent(task: any) {
  if (!task.input_config) return null
  
  try {
    const config = typeof task.input_config === 'string' 
      ? JSON.parse(task.input_config) 
      : task.input_config
    
    if (config.type === 'slider') {
      return h('div', { class: 'step-input' }, [
        h('input', {
          type: 'range',
          min: config.min || 0,
          max: config.max || 50000,
          step: config.step || 500,
          value: inputValues.value[task.task_key] || 0,
          onInput: (e: any) => updateInputValue(task.task_key, parseInt(e.target.value))
        }),
        h('div', { class: 'step-num' }, 
          `${(inputValues.value[task.task_key] || 0).toLocaleString()} ${config.unit || ''}`
        )
      ])
    }
    
    if (config.type === 'counter') {
      const current = inputValues.value[task.task_key] || 0
      const max = config.max || 8
      return h('div', { class: 'water-cups' }, 
        Array.from({ length: max }, (_, i) => 
          h('span', { 
            class: ['water-cup', i < current ? 'filled' : ''],
            key: i 
          }, '💧')
        )
      )
    }
  } catch (e) {
    console.error('Failed to parse input_config:', e)
  }
  
  return null
}

// 获取输入值
function getInputValue(taskKey: string) {
  return inputValues.value[taskKey] || 0
}

// 更新输入值
function updateInputValue(taskKey: string, value: any) {
  inputValues.value[taskKey] = value
}

// 获取任务按钮文本
function getTaskButtonText(taskKey: string): string {
  const buttonTexts: Record<string, string> = {
    'ziwu': '打卡',
    'meditate': '入定',
    'steps': '提交',
    'water': '饮一杯',
    'diet': '今日清淡',
    'earlyrise': '今日已早起'
  }
  return buttonTexts[taskKey] || '完成'
}

// 获取任务样式类
function getTaskClass(requirement: string): string {
  return requirement || 'basic'
}

// 获取标签样式类
function getTagClass(requirement: string): string {
  const classes: Record<string, string> = {
    'basic': 'basic-tag',
    'mortal': 'mortal-tag',
    'advanced': 'advanced-tag',
    'challenge': 'challenge-tag'
  }
  return classes[requirement] || 'basic-tag'
}

// 获取标签文本
function getTagLabel(requirement: string): string {
  const labels: Record<string, string> = {
    'basic': '基础',
    'mortal': '凡人',
    'advanced': '超凡',
    'challenge': '挑战'
  }
  return labels[requirement] || '基础'
}

// 获取按钮样式类
function getButtonClass(requirement: string): string {
  const classes: Record<string, string> = {
    'basic': 'wellness-btn',
    'mortal': 'wellness-btn',
    'advanced': 'advanced-btn',
    'challenge': 'challenge-btn'
  }
  return classes[requirement] || 'wellness-btn'
}

// 处理任务点击
function handleTaskClick(task: any) {
  if (task.task_key === 'steps') {
    submitSteps()
  } else if (task.task_key === 'water') {
    submitWater()
  } else {
    doTask(task.task_key)
  }
}

async function doTask(taskKey: string) {
  loading.value = true
  try {
    const res = await api(`/tasks/${taskKey}`, { method: 'POST' }) as { msg?: string }
    toast(res.msg || '修炼完成', 'good')
    completedTasks.value.add(taskKey)
    await stateStore.fetchState(true)
  } catch (err: any) {
    toast(err.message, 'bad')
  } finally {
    loading.value = false
  }
}

async function submitSteps() {
  const stepsValue = inputValues.value['steps'] || 0
  if (stepsValue < 1000) {
    toast('至少需要 1000 步', 'bad')
    return
  }
  
  loading.value = true
  try {
    const res = await api('/tasks/steps', {
      method: 'POST',
      body: JSON.stringify({ steps: stepsValue })
    }) as { msg?: string }
    toast(res.msg || '步数已提交', 'good')
    completedTasks.value.add('steps')
    inputValues.value['steps'] = 0
    await stateStore.fetchState(true)
  } catch (err: any) {
    toast(err.message, 'bad')
  } finally {
    loading.value = false
  }
}

async function submitWater() {
  loading.value = true
  try {
    const res = await api('/tasks/water', { method: 'POST' }) as { msg?: string }
    toast(res.msg || '饮水记录成功', 'good')
    const current = inputValues.value['water'] || 0
    inputValues.value['water'] = Math.min(current + 1, 8)
    if (inputValues.value['water'] >= 8) {
      completedTasks.value.add('water')
    }
    await stateStore.fetchState(true)
  } catch (err: any) {
    toast(err.message, 'bad')
  } finally {
    loading.value = false
  }
}

async function loadExtraTasks() {
  try {
    const res = await api('/extra-tasks/config') as { tasks?: any[] }
    extraTasks.value = res.tasks || []
  } catch (err: any) {
    console.error('Failed to load extra tasks:', err)
  }
}

async function loadWellnessTasks() {
  loadingTasks.value = true
  try {
    const res = await api('/tasks/wellness/config') as { tasks?: any[], currentRealmId?: number }
    console.log('Wellness tasks loaded:', res)
    wellnessTasks.value = res.tasks || []
    console.log('Current realm ID:', res.currentRealmId)
    console.log('Tasks count:', wellnessTasks.value.length)
    
    // 初始化输入值
    wellnessTasks.value.forEach(task => {
      if (task.task_key === 'steps') {
        inputValues.value['steps'] = 0
      } else if (task.task_key === 'water') {
        inputValues.value['water'] = 0
      }
    })
  } catch (err: any) {
    console.error('Failed to load wellness tasks:', err)
    toast('加载养生任务失败', 'bad')
  } finally {
    loadingTasks.value = false
  }
}

// 加载今日完成状态
async function loadTodayStatus() {
  // 从state中获取今日任务完成状态
  // 这里可以根据实际API调整
  completedTasks.value.clear()
}

onMounted(async () => {
  await Promise.all([
    loadWellnessTasks(),
    loadExtraTasks(),
    loadTodayStatus()
  ])
})
</script>