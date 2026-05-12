<template>
  <div class="page inventory-page">
    <h2 class="page-title">
      <span class="cn">丹房</span>
      <span class="en">Inventory</span>
    </h2>

    <div class="container">
      <div class="potions-grid">
        <div v-for="potion in potions" :key="potion.id" class="potion-card card">
          <div class="potion-emoji">{{ potion.emoji }}</div>
          <div class="potion-name">{{ potion.name }}</div>
          <div class="potion-desc">{{ potion.desc }}</div>
          <div class="potion-cost">
            {{ potion.cost }} {{ potion.type === 'merit' ? '功德' : '复活币' }}
          </div>
          <button 
            @click="buyPotion(potion.id)" 
            class="oracle-btn"
            :disabled="loading"
          >
            <i class="fas fa-shopping-cart"></i> 炼制
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api, toast } from '../utils/api'
import { useStateStore } from '../stores/state'
import type { Potion } from '../types'

const stateStore = useStateStore()
const potions = ref<Potion[]>([])
const loading = ref(false)

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
