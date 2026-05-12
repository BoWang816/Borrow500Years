<template>
  <div class="page adventure-page">
    <h2 class="page-title">
      <span class="cn">历练</span>
      <span class="en">Adventure</span>
    </h2>
    <div class="container">
      <div class="card">
        <h3><i class="fas fa-mountain"></i> 探险</h3>
        <button @click="explore" class="oracle-btn" :disabled="loading">
          <i class="fas fa-compass"></i> 开始探险
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

async function explore() {
  loading.value = true
  try {
    const res = await api('/explore', { method: 'POST' })
    toast(res.msg || '探险完成', 'good')
    await stateStore.fetchState(true)
  } catch (err: any) {
    toast(err.message, 'bad')
  } finally {
    loading.value = false
  }
}
</script>
