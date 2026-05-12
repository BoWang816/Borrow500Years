<template>
  <section id="cultivation" class="tab-pane active">
    <h2 class="page-title">
      <span class="cn">修炼大道</span>
      <span class="en">Cultivation Path</span>
    </h2>
    
    <!-- 养生修炼区域 -->
    <div class="cultivation-section">
      <h3 class="section-title">
        <i class="fas fa-leaf"></i> 养生修炼 · 延年益寿
        <span class="section-desc">简单易行，增加寿命与功德</span>
      </h3>
      
      <div class="cultivation-grid">
        <div class="task-card wellness">
          <div class="task-icon"><i class="fas fa-moon"></i></div>
          <div class="task-body">
            <h4>子午流注</h4>
            <p>23:00 前入睡，次日衰减率降低 20%</p>
            <div class="task-reward">
              奖励：<span class="reward-life">+30 分钟</span> · 
              <span class="reward-mod">-0.2x 衰减</span> · 
              <span class="reward-merit">功德 +2</span>
            </div>
          </div>
          <button @click="doTask('ziwu')" class="task-btn wellness-btn" :disabled="loading">打卡</button>
        </div>

        <div class="task-card wellness">
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
              折算：<span class="reward-life">{{ stepsReward }}</span> · 
              <span class="reward-merit">功德 +{{ Math.floor(steps / 2000) }}</span>
            </div>
          </div>
          <button @click="submitSteps" class="task-btn wellness-btn" :disabled="loading">提交</button>
        </div>

        <div class="task-card wellness">
          <div class="task-icon"><i class="fas fa-tint"></i></div>
          <div class="task-body">
            <h4>上善若水</h4>
            <p>每日 8 次饮水，单次 +5 分钟寿命</p>
            <div class="water-cups">
              <span v-for="i in 8" :key="i" class="water-cup">💧</span>
            </div>
            <div class="task-reward">
              奖励：<span class="reward-life">+5 分钟</span> · 
              <span class="reward-merit">功德 +1</span>
            </div>
          </div>
          <button @click="doTask('water')" class="task-btn wellness-btn" :disabled="loading">饮一杯</button>
        </div>

        <div class="task-card wellness">
          <div class="task-icon"><i class="fas fa-spa"></i></div>
          <div class="task-body">
            <h4>静坐冥想</h4>
            <p>静坐 10 分钟，心境清明，+15 分钟寿命</p>
            <div class="task-reward">
              奖励：<span class="reward-life">+15 分钟</span> · 
              <span class="reward-merit">功德 +3</span> · 
              <span class="reward-coin">复活币碎片</span>
            </div>
          </div>
          <button @click="doTask('meditate')" class="task-btn wellness-btn" :disabled="loading">入定</button>
        </div>

        <div class="task-card wellness challenge">
          <div class="task-icon"><i class="fas fa-sun"></i></div>
          <div class="task-body">
            <h4>早起挑战 · 七日劫数</h4>
            <p>连续 7 天 7:00 前起床，奖励 1 枚复活币</p>
            <div class="streak-bar">
              <div class="streak-progress" :style="{ width: `${(streak / 7) * 100}%` }"></div>
            </div>
            <div class="task-reward">
              当前进度：<span>{{ streak }}</span> / 7 天 · 
              <span class="reward-merit">功德 +5</span>
            </div>
          </div>
          <button @click="doTask('earlyrise')" class="task-btn wellness-btn" :disabled="loading">今日已早起</button>
        </div>

        <div class="task-card wellness">
          <div class="task-icon"><i class="fas fa-bowl-rice"></i></div>
          <div class="task-body">
            <h4>清淡饮食</h4>
            <p>记录三餐，少油少盐，+20 分钟寿命</p>
            <div class="task-reward">
              奖励：<span class="reward-life">+20 分钟</span> · 
              <span class="reward-merit">功德 +3</span>
            </div>
          </div>
          <button @click="doTask('diet')" class="task-btn wellness-btn" :disabled="loading">今日清淡</button>
        </div>
      </div>

      <!-- 扩展养生修炼任务 -->
      <div class="extra-tasks-section">
        <h4 class="subsection-title">📋 扩展养生修炼</h4>
        <div class="extra-tasks-grid">
          <div v-for="task in extraTasks" :key="task.task_key" class="extra-task-card wellness">
            <div class="task-icon">{{ task.emoji }}</div>
            <div class="task-body">
              <h4>{{ task.name }}</h4>
              <p>{{ task.description }}</p>
              <div class="task-reward">
                奖励：<span class="reward-life">+{{ formatLife(task.life_reward) }}</span>
                <span v-if="task.merit_reward"> · <span class="reward-merit">功德 +{{ task.merit_reward }}</span></span>
              </div>
            </div>
            <button @click="doTask(task.task_key)" class="task-btn wellness-btn" :disabled="loading">
              完成
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 功法修炼区域 -->
    <div class="cultivation-section">
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
  loadExtraTasks()
  loadManuals()
})
</script>

<style scoped>
/* 修炼区域分组 */
.cultivation-section {
  margin-bottom: 40px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: 'Ma Shan Zheng', serif;
  font-size: 24px;
  color: var(--gold-soft);
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid var(--line);
  position: relative;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100px;
  height: 2px;
  background: linear-gradient(90deg, var(--jade), transparent);
}

.section-desc {
  font-size: 14px;
  color: var(--ink-dim);
  font-family: 'ZCOOL XiaoWei', serif;
  margin-left: auto;
  letter-spacing: 2px;
}

.subsection-title {
  font-family: 'ZCOOL XiaoWei', serif;
  font-size: 18px;
  color: var(--jade);
  margin: 24px 0 16px;
  letter-spacing: 2px;
}

/* 养生修炼卡片样式 */
.task-card.wellness {
  border-left: 4px solid var(--jade);
  background: linear-gradient(135deg, rgba(54,255,208,0.05), var(--panel));
}

.task-card.wellness:hover {
  border-color: var(--jade);
  box-shadow: 0 8px 30px rgba(54,255,208,0.15);
}

.task-card.wellness .task-icon {
  background: linear-gradient(135deg, rgba(54,255,208,0.2), rgba(54,255,208,0.1));
  color: var(--jade);
  border-color: rgba(54,255,208,0.3);
}

.wellness-btn {
  background: linear-gradient(135deg, var(--jade-deep), var(--jade));
  color: #001;
  box-shadow: 0 0 12px rgba(54,255,208,0.3);
}

.wellness-btn:hover:not(:disabled) {
  box-shadow: 0 0 18px rgba(54,255,208,0.6);
}

.reward-merit {
  color: var(--gold-soft);
  font-family: 'Orbitron', sans-serif;
}

/* 功法修炼样式 */
.manuals-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.manual-item {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 24px;
  background: linear-gradient(135deg, rgba(212,175,55,0.08), var(--panel));
  border: 1px solid var(--line);
  border-left: 4px solid var(--gold);
  border-radius: 12px;
  transition: all 0.3s;
}

.manual-item:hover {
  border-color: var(--gold);
  box-shadow: 0 8px 30px rgba(212,175,55,0.15);
  transform: translateY(-2px);
}

.manual-icon {
  font-size: 48px;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(212,175,55,0.2), rgba(212,175,55,0.1));
  border: 2px solid rgba(212,175,55,0.3);
  border-radius: 12px;
  flex-shrink: 0;
}

.manual-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.manual-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.manual-name {
  font-family: 'Ma Shan Zheng', serif;
  font-size: 20px;
  color: var(--gold-soft);
  letter-spacing: 2px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.manual-lv {
  font-family: 'Orbitron', sans-serif;
  font-size: 12px;
  color: var(--jade);
  background: rgba(54,255,208,0.1);
  border: 1px solid rgba(54,255,208,0.3);
  padding: 2px 8px;
  border-radius: 4px;
}

.manual-type {
  font-size: 12px;
  color: var(--ink-dim);
  background: rgba(0,0,0,0.3);
  padding: 4px 12px;
  border-radius: 999px;
  border: 1px solid var(--line);
}

.manual-desc {
  color: var(--ink);
  font-size: 14px;
  line-height: 1.6;
}

.manual-stats {
  display: flex;
  gap: 24px;
  align-items: center;
  flex-wrap: wrap;
}

.manual-cost,
.manual-reward {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

.manual-cost {
  color: var(--gold-soft);
}

.manual-cost i {
  color: var(--gold);
}

.manual-reward {
  color: var(--jade);
}

.manual-reward i {
  color: var(--jade);
}

.manual-btn {
  background: linear-gradient(135deg, var(--gold), #b8902a);
  color: #1a1208;
  font-weight: 700;
  letter-spacing: 2px;
  padding: 12px 24px;
  border-radius: 8px;
  box-shadow: 0 0 14px rgba(212,175,55,0.4);
  min-width: 120px;
}

.manual-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(212,175,55,0.6);
}

.manual-btn:disabled {
  background: #333;
  color: #888;
  cursor: not-allowed;
  box-shadow: none;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .manual-item {
    flex-direction: column;
    text-align: center;
  }
  
  .manual-header {
    flex-direction: column;
    gap: 8px;
  }
  
  .manual-stats {
    justify-content: center;
  }
  
  .section-title {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .section-desc {
    margin-left: 0;
  }
}
</style>