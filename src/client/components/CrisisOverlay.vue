<template>
  <!-- 危机/弥留状态遮罩 -->
  <div v-if="stateStore.profile?.dying" class="crisis-overlay">
    <div class="crisis-text">命悬一线 · CRISIS</div>
  </div>
  
  <!-- 弥留期模态框 -->
  <div v-if="showDyingModal" class="modal">
    <div class="modal-card dying">
      <h2><i class="fas fa-skull"></i> 弥留之际</h2>
      <p>阁下寿元已尽，现进入 24 小时弥留期</p>
      <p>消耗 <strong>1 枚复活币</strong> 可起死回生。</p>
      <div class="dying-actions">
        <button @click="revive" class="oracle-btn" :disabled="loading">
          <i class="fas fa-heart"></i> 消耗复活币 · 续命
        </button>
      </div>
    </div>
  </div>

  <!-- Toast 容器 -->
  <div id="toast-wrap" class="toast-wrap"></div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useStateStore } from '../stores/state'
import { api, toast } from '../utils/api'

const stateStore = useStateStore()
const showDyingModal = ref(false)
const loading = ref(false)

// 监听 dying 状态变化
watch(() => stateStore.profile?.dying, (isDying) => {
  if (isDying) {
    showDyingModal.value = true
  }
})

async function revive() {
  loading.value = true
  try {
    const res = await api('/revive', { method: 'POST' })
    toast(res.msg || '复活成功', 'gold')
    showDyingModal.value = false
    await stateStore.fetchState(true)
  } catch (err: any) {
    toast(err.message, 'bad')
  } finally {
    loading.value = false
  }
}
</script>
