<template>
  <div class="admin-potions-config">
    <div class="card">
      <h3><i class="fas fa-cog"></i> 丹药配置管理</h3>
      <div class="potions-list">
        <div v-for="potion in potions" :key="potion.id" class="potion-config-item">
          <div class="potion-header">
            <span class="potion-icon">{{ potion.emoji }}</span>
            <span class="potion-name">{{ potion.name }}</span>
            <span class="potion-id">#{{ potion.id }}</span>
          </div>
          <div class="potion-desc">{{ potion.desc }}</div>
          <div class="potion-cost">
            消耗: {{ potion.cost }} {{ potion.type === 'merit' ? '功德' : '复活币' }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api, toast } from '../../utils/api'

const potions = ref<any[]>([])

async function loadPotions() {
  try {
    const res = await api('/admin/potions-config')
    potions.value = res.potions || []
  } catch (err: any) {
    toast(err.message, 'bad')
  }
}

onMounted(() => {
  loadPotions()
})
</script>
