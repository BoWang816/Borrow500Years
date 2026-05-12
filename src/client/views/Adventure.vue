<template>
  <section id="adventure" class="tab-pane">
    <!-- 英雄横幅 -->
    <div class="adv-hero">
      <div class="adv-hero-bg"></div>
      <div class="adv-hero-content">
        <div class="adv-hero-icon"><i class="fas fa-mountain-sun"></i></div>
        <h2 class="adv-hero-title">仙途历练</h2>
        <p class="adv-hero-sub">闯秘境 · 渡天劫 · 铸成就</p>
      </div>
    </div>

    <div class="adv-container">
      <!-- 上部：秘境探险 & 天劫挑战 并列 -->
      <div class="adv-top-row">
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
            <p class="explore-desc">闯入未知秘境，随机获得寿命、碎片或奇遇</p>
            <div class="explore-rewards">
              <div class="reward-tag legendary"><i class="fas fa-crown"></i> +1年</div>
              <div class="reward-tag epic"><i class="fas fa-star"></i> +1天</div>
              <div class="reward-tag rare"><i class="fas fa-gem"></i> +12时</div>
              <div class="reward-tag common"><i class="fas fa-wind"></i> 灵气</div>
            </div>
            <div class="explore-cost"><i class="fas fa-yin-yang"></i> 20 功德</div>
          </div>
          <div class="adv-card-footer">
            <button @click="explore" class="adv-btn primary" :disabled="loading">
              <i class="fas fa-compass"></i> 闯入秘境
            </button>
          </div>
          <div v-if="exploreResult" class="explore-result">
            <div :class="['result-msg', exploreResult.type]">
              {{ exploreResult.msg }}
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
          </div>
          <div class="adv-card-body">
            <div class="trib-reward-preview">
              <div class="trib-reward win"><i class="fas fa-plus"></i> 7天</div>
              <div class="trib-divider">/</div>
              <div class="trib-reward lose"><i class="fas fa-minus"></i> 3时</div>
            </div>
            <p class="trib-desc">完成3项指定修炼渡劫成功</p>
            <div class="trib-status">
              <div v-if="!tribulation" class="trib-loading">天劫推演中...</div>
              <div v-else-if="tribulation.status === 'available'" class="trib-tasks">
                <div v-for="(task, i) in tribulation.tasks" :key="i" class="trib-task">
                  {{ task }}
                </div>
              </div>
              <div v-else-if="tribulation.status === 'active'" class="trib-progress">
                进行中：{{ tribulation.progress }}/3
              </div>
              <div v-else class="trib-completed">
                本周已完成
              </div>
            </div>
          </div>
          <div class="trib-actions">
            <button 
              v-if="tribulation?.status === 'available'" 
              @click="acceptTribulation" 
              class="adv-btn primary"
              :disabled="loading"
            >
              <i class="fas fa-hand-fist"></i> 接下天劫
            </button>
            <div v-if="tribulation?.status === 'active'" class="trib-btns-row">
              <button @click="completeTribulation" class="adv-btn success" :disabled="loading">
                <i class="fas fa-check"></i> 完成
              </button>
              <button @click="failTribulation" class="adv-btn danger" :disabled="loading">
                <i class="fas fa-xmark"></i> 放弃
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 下部：成就墙 全宽 -->
      <div class="card adv-card achievements-card">
        <div class="adv-card-header compact">
          <div class="adv-icon-wrap ach-icon"><i class="fas fa-medal"></i></div>
          <div class="adv-title-wrap">
            <h3>成就墙 <span class="ach-count">{{ unlockedCount }}/{{ achievements.length }}</span></h3>
            <span class="adv-subtitle">修仙路上的里程碑</span>
          </div>
          <button @click="checkAchievements" class="adv-btn ghost sm" :disabled="loading">
            <i class="fas fa-rotate"></i> 检查
          </button>
        </div>
        <div class="achievements-list">
          <div v-for="ach in achievements" :key="ach.id" :class="['achievement-item', { unlocked: ach.unlocked }]">
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
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { api, toast } from '../utils/api'
import { useStateStore } from '../stores/state'

const stateStore = useStateStore()
const loading = ref(false)
const exploreResult = ref<any>(null)
const tribulation = ref<any>(null)
const achievements = ref<any[]>([])

const unlockedCount = computed(() => achievements.value.filter(a => a.unlocked).length)

async function explore() {
  loading.value = true
  exploreResult.value = null
  try {
    const res = await api('/explore', { method: 'POST' })
    exploreResult.value = { msg: res.msg, type: res.type || 'good' }
    toast(res.msg, 'good')
    await stateStore.fetchState(true)
  } catch (err: any) {
    toast(err.message, 'bad')
  } finally {
    loading.value = false
  }
}

async function loadTribulation() {
  try {
    const res = await api('/tribulation')
    tribulation.value = res.tribulation
  } catch (err: any) {
    console.error('Failed to load tribulation:', err)
  }
}

async function acceptTribulation() {
  loading.value = true
  try {
    const res = await api('/tribulation/accept', { method: 'POST' })
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
    const res = await api('/tribulation/complete', { method: 'POST' })
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
    const res = await api('/tribulation/fail', { method: 'POST' })
    toast(res.msg || '渡劫失败', 'bad')
    await loadTribulation()
    await stateStore.fetchState(true)
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

onMounted(() => {
  loadTribulation()
  loadAchievements()
})
</script>
