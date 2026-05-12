<template>
  <section id="inventory" class="tab-pane active">
    <h2 class="page-title">
      <span class="cn">丹房</span>
      <span class="en">Apothecary</span>
    </h2>

    <h3 class="sub-title">— 延寿补剂 —</h3>
    <div class="potion-grid">
      <div v-for="potion in potions" :key="potion.id" class="potion-card">
        <div class="potion-header">
          <div class="potion-icon">{{ potion.emoji }}</div>
          <div class="potion-title">
            <h4>{{ potion.name }}</h4>
            <div class="potion-cost">
              <i :class="potion.type === 'merit' ? 'fas fa-gem' : 'fas fa-coins'"></i>
              <span>{{ potion.cost }}</span>
              <span class="cost-type">{{ potion.type === 'merit' ? '功德' : '复活币' }}</span>
            </div>
          </div>
        </div>
        
        <div class="potion-desc">{{ potion.desc }}</div>
        
        <div class="potion-effects">
          <div v-if="potion.instant && potion.instant.life" class="effect-item instant">
            <i class="fas fa-bolt"></i>
            <span>即时增寿</span>
            <span class="effect-value">+{{ formatLife(potion.instant.life) }}</span>
          </div>
          <div v-if="potion.mod && potion.dur" class="effect-item duration">
            <i class="fas fa-clock"></i>
            <span>持续效果</span>
            <span class="effect-value">{{ formatDuration(potion.dur) }}</span>
          </div>
          <div v-if="potion.mod && potion.mod.value" class="effect-item buff">
            <i class="fas fa-shield-alt"></i>
            <span>衰减减少</span>
            <span class="effect-value">{{ Math.abs(potion.mod.value * 100).toFixed(0) }}%</span>
          </div>
        </div>
        
        <button 
          @click="buyPotion(potion.id)" 
          class="buy-btn"
          :class="{ affordable: canAfford(potion) }"
          :disabled="loading || !canAfford(potion)"
        >
          <i class="fas fa-flask"></i>
          <span>{{ canAfford(potion) ? '炼制' : '资源不足' }}</span>
        </button>
      </div>
    </div>

    <h3 class="sub-title">— 我的丹炉 · 已激活 —</h3>
    <div class="active-potions">
      <p v-if="stateStore.modifiers.length === 0" class="empty">
        <i class="fas fa-info-circle"></i>
        尚无丹药生效
      </p>
      <div v-for="mod in stateStore.modifiers" :key="mod.id" class="active-potion">
        <span class="ap-emoji">{{ mod.potionEmoji }}</span>
        <div class="ap-info">
          <div class="ap-name">{{ mod.potionName }}</div>
          <div class="ap-effect">{{ mod.modLabel }}</div>
        </div>
        <div class="ap-expire">
          <i class="fas fa-hourglass-half"></i>
          {{ formatExpire(mod.expireAt) }}
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { api, toast } from '../utils/api'
import { useStateStore } from '../stores/state'
import type { Potion } from '../types'

const stateStore = useStateStore()
const potions = ref<Potion[]>([])
const loading = ref(false)

const canAfford = computed(() => (potion: Potion) => {
  if (!stateStore.profile) return false
  if (potion.type === 'merit') {
    return stateStore.profile.merit >= potion.cost
  } else {
    return stateStore.profile.coin >= potion.cost
  }
})

function formatLife(seconds: number): string {
  if (seconds >= 86400) {
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

function formatDuration(seconds: number): string {
  if (seconds >= 86400) {
    const days = Math.floor(seconds / 86400)
    return `${days}天`
  } else if (seconds >= 3600) {
    const hours = Math.floor(seconds / 3600)
    return `${hours}小时`
  }
  return `${Math.floor(seconds / 60)}分钟`
}

function formatExpire(timestamp: number): string {
  const remaining = Math.floor((timestamp - Date.now()) / 1000)
  if (remaining < 60) return `${remaining}秒`
  if (remaining < 3600) return `${Math.floor(remaining / 60)}分钟`
  if (remaining < 86400) return `${Math.floor(remaining / 3600)}小时`
  return `${Math.floor(remaining / 86400)}天`
}

async function loadPotions() {
  try {
    const res = await api('/potions')
    potions.value = res.potions || []
  } catch (err: any) {
    toast(err.message, 'bad')
  }
}

async function buyPotion(id: string) {
  loading.value = true
  try {
    const res = await api(`/potions/${id}`, { method: 'POST' })
    toast(res.msg || '炼制成功', 'gold')
    await stateStore.fetchState(true)
    await loadPotions()
  } catch (err: any) {
    toast(err.message, 'bad')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadPotions()
})
</script>
