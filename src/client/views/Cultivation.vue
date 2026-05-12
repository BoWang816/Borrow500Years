<template>
  <section id="cultivation" class="tab-pane active">
    <h2 class="page-title">
      <span class="cn">养生修炼</span>
      <span class="en">Daily Cultivation</span>
    </h2>
    
    <div class="cultivation-grid">
      <div class="task-card">
        <div class="task-icon"><i class="fas fa-moon"></i></div>
        <div class="task-body">
          <h4>子午流注</h4>
          <p>23:00 前入睡，次日衰减率降低 20%</p>
          <div class="task-reward">
            奖励：<span class="reward-life">+30 分钟</span> · 
            <span class="reward-mod">-0.2x 衰减</span>
          </div>
        </div>
        <button @click="doTask('ziwu')" class="task-btn" :disabled="loading">打卡</button>
      </div>

      <div class="task-card">
        <div class="task-icon"><i class="fas fa-shoe-prints"></i></div>
        <div class="task-body">
          <h4>步步为营</h4>
          <p>每日步行修行，1000 步 = +12 分钟，达 10000 步 +2 小时</p>
          <div class="step-input">
            <input 
              type="range" 
              v-model="steps" 
              min="0" 
              max="20000" 
              step="500" 
            />
            <div class="step-num">{{ steps.toLocaleString() }} 步</div>
          </div>
          <div class="task-reward">
            折算：<span class="reward-life">{{ stepsReward }}</span>
          </div>
        </div>
        <button @click="submitSteps" class="task-btn" :disabled="loading">提交</button>
      </div>

      <div class="task-card">
        <div class="task-icon"><i class="fas fa-tint"></i></div>
        <div class="task-body">
          <h4>上善若水</h4>
          <p>每日 8 次饮水，单次 +5 分钟寿命</p>
          <div class="water-cups">
            <span v-for="i in 8" :key="i" class="water-cup">💧</span>
          </div>
        </div>
        <button @click="doTask('water')" class="task-btn" :disabled="loading">饮一杯</button>
      </div>

      <div class="task-card">
        <div class="task-icon"><i class="fas fa-spa"></i></div>
        <div class="task-body">
          <h4>静坐冥想</h4>
          <p>静坐 10 分钟，心境清明，+15 分钟寿命</p>
          <div class="task-reward">
            连续打卡奖励：<span class="reward-coin">复活币碎片</span>
          </div>
        </div>
        <button @click="doTask('meditate')" class="task-btn" :disabled="loading">入定</button>
      </div>

      <div class="task-card challenge">
        <div class="task-icon"><i class="fas fa-sun"></i></div>
        <div class="task-body">
          <h4>早起挑战 · 七日劫数</h4>
          <p>连续 7 天 7:00 前起床，奖励 1 枚复活币</p>
          <div class="streak-bar">
            <div class="streak-progress" :style="{ width: `${(streak / 7) * 100}%` }"></div>
          </div>
          <div class="task-reward">
            当前进度：<span>{{ streak }}</span> / 7 天
          </div>
        </div>
        <button @click="doTask('earlyrise')" class="task-btn" :disabled="loading">今日已早起</button>
      </div>

      <div class="task-card challenge">
        <div class="task-icon"><i class="fas fa-bowl-rice"></i></div>
        <div class="task-body">
          <h4>清淡饮食</h4>
          <p>记录三餐，少油少盐，+20 分钟寿命</p>
          <div class="task-reward">
            奖励：<span class="reward-life">+20 分钟</span> · 功德 +1
          </div>
        </div>
        <button @click="doTask('diet')" class="task-btn" :disabled="loading">今日清淡</button>
      </div>
    </div>

    <!-- 扩展养生修炼任务 -->
    <div class="extra-tasks-section">
      <h3 class="section-title">📋 扩展养生修炼</h3>
      <div class="extra-tasks-grid">
        <div v-for="task in extraTasks" :key="task.task_key" class="extra-task-card">
          <div class="task-icon">{{ task.emoji }}</div>
          <div class="task-body">
            <h4>{{ task.name }}</h4>
            <p>{{ task.description }}</p>
            <div class="task-reward">
              奖励：<span class="reward-life">+{{ formatLife(task.life_reward) }}</span>
              <span v-if="task.merit_reward"> · 功德 +{{ task.merit_reward }}</span>
            </div>
          </div>
          <button @click="doTask(task.task_key)" class="task-btn" :disabled="loading">
            完成
          </button>
        </div>
      </div>
    </div>

    <!-- 功法修炼 -->
    <div class="manuals-section">
      <h3 class="section-title">📖 功法修炼</h3>
      <div class="manuals-list">
        <div v-if="manuals.length === 0" class="empty">暂无功法</div>
        <div v-for="manual in manuals" :key="manual.key" class="manual-item">
          <span class="manual-icon">{{ manual.emoji }}</span>
          <div class="manual-body">
            <div class="manual-name">
              {{ manual.name }}
              <span class="manual-lv" v-if="manual.myLevel">Lv.{{ manual.myLevel }}</span>
            </div>
            <div class="manual-desc">{{ manual.description }}</div>
            <div class="manual-cost">消耗: {{ manual.costMerit }} 功德</div>
          </div>
          <button @click="upgradeManual(manual.key)" class="task-btn" :disabled="loading">
            {{ manual.myLevel === 0 ? '解锁' : '升级' }}
          </button>
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
const manuals = ref<any[]>([])

const stepsReward = computed(() => {
  const s = steps.value || 0
  let minutes = Math.floor(s / 1000) * 12
  if (s >= 10000) minutes += 120
  return `+${minutes} 分钟`
})

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

async function loadManuals() {
  try {
    const res = await api('/manuals')
    manuals.value = res.manuals || []
  } catch (err: any) {
    console.error('Failed to load manuals:', err)
  }
}

async function upgradeManual(key: string) {
  loading.value = true
  try {
    const res = await api(`/manuals/${key}/practice`, { method: 'POST' })
    toast(res.msg || '修炼成功', 'good')
    await loadManuals()
    await stateStore.fetchState(true)
  } catch (err: any) {
    toast(err.message, 'bad')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadExtraTasks()
  loadManuals()
})
</script>
