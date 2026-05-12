<template>
  <section id="adventure" class="tab-pane active">
    <h2 class="page-title">
      <span class="cn">仙途历练</span>
      <span class="en">Adventure</span>
    </h2>

    <div class="adv-container">
      <!-- 秘境探险 -->
      <div class="card adv-card explore-card">
        <div class="adv-card-header">
          <div class="adv-icon-wrap explore-icon"><i class="fas fa-dungeon"></i></div>
          <div class="adv-title-wrap">
            <h3>秘境探险</h3>
            <span class="adv-subtitle">消耗功德 · 探寻机缘</span>
          </div>
        </div>
        
        <div class="adv-card-body">
          <p class="explore-desc">闯入未知秘境，随机获得寿命、功德或碎片奖励</p>
          
          <!-- 统计信息 -->
          <div v-if="lootTable.length > 0" class="explore-stats">
            <div class="stat-item">
              <span class="stat-label">机缘种类</span>
              <span class="stat-value">{{ lootTable.length }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">最高奖励</span>
              <span class="stat-value">{{ formatLife(Math.max(...lootTable.map(l => l.life))) }}</span>
            </div>
          </div>
          
          <!-- 可能的奖励展示 -->
          <div class="loot-preview">
            <div class="loot-header" @click="showLootTable = !showLootTable">
              <h4 class="loot-title">可能的机缘 ({{ lootTable.length }}种)</h4>
              <i :class="['fas', showLootTable ? 'fa-chevron-up' : 'fa-chevron-down']"></i>
            </div>
            <transition name="expand">
              <div v-show="showLootTable" class="loot-grid">
                <div v-for="loot in displayLoots" :key="loot.id" :class="['loot-item', getRarityClass(loot)]">
                  <div class="loot-name">{{ loot.name }}</div>
                  <div class="loot-rewards">
                    <span v-if="loot.life > 0" class="reward-badge life">
                      <i class="fas fa-heart"></i> +{{ formatLife(loot.life) }}
                    </span>
                    <span v-if="loot.merit > 0" class="reward-badge merit">
                      <i class="fas fa-gem"></i> +{{ loot.merit }}
                    </span>
                    <span v-if="loot.shard > 0" class="reward-badge shard">
                      <i class="fas fa-puzzle-piece"></i> +{{ loot.shard }}
                    </span>
                  </div>
                  <div class="loot-chance">概率: {{ calculateChance(loot.weight) }}%</div>
                </div>
              </div>
            </transition>
          </div>
          
          <div class="explore-cost">
            <i class="fas fa-yin-yang"></i> 
            <span>消耗 20 功德</span>
          </div>
        </div>
        
        <div class="adv-card-footer">
          <button @click="explore" class="adv-btn primary" :disabled="loading || !canExplore">
            <i :class="['fas', loading ? 'fa-spinner fa-spin' : 'fa-compass']"></i> 
            <span>{{ loading ? '探索中...' : canExplore ? '闯入秘境' : '功德不足' }}</span>
          </button>
        </div>
        
        <!-- 探索结果 -->
        <div v-if="exploreResult" class="explore-result">
          <div :class="['result-card', exploreResult.rarity]">
            <div class="result-icon">{{ getResultIcon(exploreResult.rarity) }}</div>
            <div class="result-content">
              <div class="result-title">{{ exploreResult.name }}</div>
              <div class="result-msg">{{ exploreResult.msg }}</div>
              <div class="result-rewards">
                <span v-if="exploreResult.life > 0" class="reward-item">
                  <i class="fas fa-heart"></i> +{{ formatLife(exploreResult.life) }}
                </span>
                <span v-if="exploreResult.merit > 0" class="reward-item">
                  <i class="fas fa-gem"></i> +{{ exploreResult.merit }}
                </span>
                <span v-if="exploreResult.shard > 0" class="reward-item">
                  <i class="fas fa-puzzle-piece"></i> +{{ exploreResult.shard }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 天劫挑战 -->
      <div class="card adv-card tribulation-card">
        <div class="adv-card-header">
          <div class="adv-icon-wrap trib-icon"><i class="fas fa-bolt-lightning"></i></div>
          <div class="adv-title-wrap">
            <h3>天劫挑战</h3>
            <span class="adv-subtitle">每周一次 · 逆天改命</span>
          </div>
          <button v-if="tribulation?.status === 'accepted'" @click="loadTribulation" class="refresh-btn" title="刷新进度">
            <i class="fas fa-sync-alt"></i>
          </button>
        </div>
        
        <div class="adv-card-body">
          <div class="trib-reward-preview">
            <div class="trib-reward win">
              <i class="fas fa-trophy"></i>
              <span>成功</span>
              <span class="value">+7天</span>
            </div>
            <div class="trib-divider">/</div>
            <div class="trib-reward lose">
              <i class="fas fa-skull"></i>
              <span>失败</span>
              <span class="value">-3时</span>
            </div>
          </div>
          
          <p class="trib-desc">完成3项指定修炼任务即可渡劫成功</p>
          
          <div class="trib-status">
            <div v-if="!tribulation" class="trib-loading">
              <i class="fas fa-spinner fa-spin"></i> 天劫推演中...
            </div>
            <div v-else-if="tribulation.status === 'pending'" class="trib-pending">
              <div class="trib-tasks-title">本周天劫任务：</div>
              <div v-for="(taskItem, i) in tribulation.tasks" :key="i" class="trib-task">
                <span class="task-num">{{ i + 1 }}</span>
                <span class="task-text">{{ getTaskName(taskItem.task) }}</span>
              </div>
            </div>
            <div v-else-if="tribulation.status === 'accepted'" class="trib-active">
              <div class="trib-tasks-title">进行中的天劫：</div>
              <div v-for="(taskItem, i) in tribulation.tasks" :key="i" :class="['trib-task', 'active', { 'task-done': taskItem.done }]">
                <span class="task-num">{{ i + 1 }}</span>
                <span class="task-text">{{ getTaskName(taskItem.task) }}</span>
                <span v-if="taskItem.done" class="task-check"><i class="fas fa-check"></i></span>
              </div>
              <div class="trib-progress">
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: `${(tribulationProgress / 3) * 100}%` }"></div>
                </div>
                <div class="progress-text">{{ tribulationProgress }} / 3</div>
              </div>
            </div>
            <div v-else-if="tribulation.status === 'completed'" class="trib-done">
              <i class="fas fa-check-circle"></i>
              <span>本周已完成渡劫</span>
            </div>
            <div v-else class="trib-failed">
              <i class="fas fa-times-circle"></i>
              <span>本周渡劫失败</span>
            </div>
          </div>
        </div>
        
        <div class="adv-card-footer">
          <button 
            v-if="tribulation?.status === 'pending'" 
            @click="acceptTribulation" 
            class="adv-btn primary"
            :disabled="loading"
          >
            <i class="fas fa-hand-fist"></i> 接下天劫
          </button>
          <div v-if="tribulation?.status === 'accepted'" class="trib-btns-row">
            <button @click="completeTribulation" class="adv-btn success" :disabled="loading || !tribulation.canComplete">
              <i class="fas fa-check"></i> {{ tribulation.canComplete ? '完成渡劫' : '任务未完成' }}
            </button>
            <button @click="failTribulation" class="adv-btn danger" :disabled="loading">
              <i class="fas fa-xmark"></i> 放弃渡劫
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { api, toast } from '../utils/api'
import { useStateStore } from '../stores/state'

interface LootItem {
  id: number
  name: string
  msg: string
  life: number
  merit: number
  shard: number
  weight: number
}

interface ExploreResult {
  name: string
  msg: string
  life: number
  merit: number
  shard: number
  rarity: string
}

interface TaskStatus {
  task: string
  done: boolean
}

interface TribulationData {
  weekId: string
  status: 'pending' | 'accepted' | 'completed' | 'failed'
  tasks: TaskStatus[]
  allDone: boolean
  canAccept: boolean
  canComplete: boolean
  isCompleted: boolean
  isFailed: boolean
}

const stateStore = useStateStore()
const loading = ref(false)
const exploreResult = ref<ExploreResult | null>(null)
const tribulation = ref<TribulationData | null>(null)
const lootTable = ref<LootItem[]>([])
const showLootTable = ref(false)

const canExplore = computed(() => {
  return stateStore.profile && stateStore.profile.merit >= 20
})

const displayLoots = computed(() => {
  // 按稀有度和权重排序，显示所有物品
  return [...lootTable.value].sort((a, b) => {
    const rarityA = getRarityClass(a)
    const rarityB = getRarityClass(b)
    const rarityOrder: Record<string, number> = {
      legendary: 5,
      epic: 4,
      rare: 3,
      uncommon: 2,
      common: 1
    }
    const orderDiff = (rarityOrder[rarityB] || 0) - (rarityOrder[rarityA] || 0)
    if (orderDiff !== 0) return orderDiff
    return b.weight - a.weight
  })
})

const totalWeight = computed(() => {
  return lootTable.value.reduce((sum, loot) => sum + loot.weight, 0)
})

const tribulationProgress = computed(() => {
  if (!tribulation.value || !tribulation.value.tasks) return 0
  return tribulation.value.tasks.filter(t => t.done).length
})

const taskNameMap: Record<string, string> = {
  ziwu: '子午觉（午休30分钟）',
  steps: '行走万步（10000步）',
  water: '饮水八杯（8杯水）',
  meditate: '静心冥想（15分钟）',
  diet: '清淡饮食（无油腻）'
}

function getTaskName(task: string): string {
  return taskNameMap[task] || task
}

function calculateChance(weight: number): string {
  if (totalWeight.value === 0) return '0.0'
  return ((weight / totalWeight.value) * 100).toFixed(1)
}

function getRarityClass(loot: LootItem | ExploreResult): string {
  const life = loot.life
  if (life >= 365 * 86400) return 'legendary' // 1年+
  if (life >= 24 * 3600) return 'epic' // 1天+
  if (life >= 3600) return 'rare' // 1小时+
  if (life > 0) return 'uncommon'
  return 'common'
}

function getResultIcon(rarity: string): string {
  const icons: Record<string, string> = {
    legendary: '👑',
    epic: '⭐',
    rare: '💎',
    uncommon: '✨',
    common: '🌫️'
  }
  return icons[rarity] || '🌫️'
}

function formatLife(seconds: number): string {
  if (seconds >= 365 * 86400) {
    const years = Math.floor(seconds / (365 * 86400))
    return `${years}年`
  } else if (seconds >= 86400) {
    const days = Math.floor(seconds / 86400)
    return `${days}天`
  } else if (seconds >= 3600) {
    const hours = Math.floor(seconds / 3600)
    return `${hours}小时`
  } else if (seconds >= 60) {
    const minutes = Math.floor(seconds / 60)
    return `${minutes}分钟`
  }
  return `${seconds}秒`
}

async function loadLootTable() {
  try {
    const res: any = await api('/explore/config')
    lootTable.value = res.lootTable || []
  } catch (err: any) {
    console.error('Failed to load loot table:', err)
  }
}

async function explore() {
  loading.value = true
  exploreResult.value = null
  try {
    const res: any = await api('/explore', { method: 'POST' })
    const loot = res.loot
    exploreResult.value = {
      name: loot.name,
      msg: loot.msg,
      life: loot.life,
      merit: loot.merit,
      shard: loot.shard,
      rarity: getRarityClass(loot)
    }
    toast(res.msg, loot.life >= 6 * 3600 ? 'gold' : loot.life > 0 ? 'good' : undefined)
    await stateStore.fetchState(true)
  } catch (err: any) {
    toast(err.message, 'bad')
  } finally {
    loading.value = false
  }
}

async function loadTribulation() {
  try {
    const res: any = await api('/tribulation')
    tribulation.value = res as TribulationData
  } catch (err: any) {
    console.error('Failed to load tribulation:', err)
  }
}

async function acceptTribulation() {
  loading.value = true
  try {
    const res: any = await api('/tribulation/accept', { method: 'POST' })
    toast(res.msg || '天劫已接受', 'gold')
    await loadTribulation()
  } catch (err: any) {
    toast(err.message, 'bad')
  } finally {
    loading.value = false
  }
}

async function completeTribulation() {
  loading.value = true
  try {
    const res: any = await api('/tribulation/complete', { method: 'POST' })
    toast(res.msg || '渡劫成功', 'gold')
    await loadTribulation()
    await stateStore.fetchState(true)
  } catch (err: any) {
    toast(err.message, 'bad')
  } finally {
    loading.value = false
  }
}

async function failTribulation() {
  loading.value = true
  try {
    const res: any = await api('/tribulation/fail', { method: 'POST' })
    toast(res.msg || '渡劫失败', 'bad')
    await loadTribulation()
    await stateStore.fetchState(true)
  } catch (err: any) {
    toast(err.message, 'bad')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadLootTable()
  loadTribulation()
})
</script>
