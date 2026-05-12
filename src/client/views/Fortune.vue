<template>
  <div class="page fortune-page">
    <h2 class="page-title">
      <span class="cn">运势天机</span>
      <span class="en">Fortune</span>
    </h2>
    <div class="container">
      <div class="card">
        <h3><i class="fas fa-yin-yang"></i> 每日签到</h3>
        <button @click="checkin" class="oracle-btn" :disabled="loading">
          <i class="fas fa-calendar-check"></i> 签到
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { api, toast } from '../utils/api'
import { useStateStore } from '../stores/state'

const stateStore = useStateStore()
const loading = ref(false)

async function checkin() {
  loading.value = true
  try {
    const res = await api('/fortune/checkin', { method: 'POST' })
    toast(res.msg || '签到成功', 'gold')
    await stateStore.fetchState(true)
  } catch (err: any) {
    toast(err.message, 'bad')
  } finally {
    loading.value = false
  }
}
</script>
