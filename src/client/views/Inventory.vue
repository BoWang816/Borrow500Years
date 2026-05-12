<template>
  <section id="inventory" class="tab-pane active">
    <h2 class="page-title">
      <span class="cn">丹房 · 商城</span>
      <span class="en">Apothecary</span>
    </h2>
    
    <div class="merit-bar">
      <div class="merit-item">
        <i class="fas fa-coins"></i>
        <div>
          <div class="merit-label">复活币</div>
          <div class="merit-val">{{ stateStore.profile?.coin || 0 }}</div>
        </div>
      </div>
      <div class="merit-item">
        <i class="fas fa-gem"></i>
        <div>
          <div class="merit-label">功德值</div>
          <div class="merit-val">{{ stateStore.profile?.merit || 0 }}</div>
        </div>
      </div>
      <div class="merit-item">
        <i class="fas fa-puzzle-piece"></i>
        <div>
          <div class="merit-label">复活币碎片</div>
          <div class="merit-val">{{ stateStore.profile?.shard || 0 }} / 5</div>
        </div>
      </div>
    </div>

    <h3 class="sub-title">— 延寿补剂 —</h3>
    <div class="potion-grid">
      <div v-for="potion in potions" :key="potion.id" class="potion">
        <div class="potion-icon">{{ potion.emoji }}</div>
        <div class="potion-name">{{ potion.name }}</div>
        <div class="potion-desc">{{ potion.desc }}</div>
        <div class="potion-cost">
          <i :class="potion.type === 'merit' ? 'fas fa-gem' : 'fas fa-coins'"></i>
          {{ potion.cost }} {{ potion.type === 'merit' ? '功德' : '复活币' }}
        </div>
        <button 
          @click="buyPotion(potion.id)" 
          class="buy-btn"
          :disabled="loading || !canAfford(potion)"
        >
          <i class="fas fa-shopping-cart"></i> 炼制
        </button>
      </div>
    </div>

    <h3 class="sub-title">— 我的丹炉 · 已激活 —</h3>
    <div class="active-potions">
      <p v-if="stateStore.modifiers.length === 0" class="empty">尚无丹药生效</p>
      <div v-for="mod in stateStore.modifiers" :key="mod.id" class="active-potion">
        <span class="ap-emoji">{{ mod.potionEmoji }}</span>
        <div class="ap-info">
          <div class="ap-name">{{ mod.potionName }}</div>
          <div class="ap-effect">{{ mod.modLabel }}</div>
        </div>
        <div class="ap-expire">{{ formatExpire(mod.expireAt) }}</div>
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
