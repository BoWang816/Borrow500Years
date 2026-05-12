<template>
  <div class="admin-logs">
    <div class="card">
      <h3><i class="fas fa-history"></i> 操作日志</h3>
      
      <!-- 操作日志列表 -->
      <div class="admin-logs-list">
        <div v-if="logs.length === 0" class="empty">暂无操作日志</div>
        <div v-for="log in logs" :key="log.id" class="admin-log-item">
          <div class="log-time">{{ log.time }}</div>
          <div class="log-info">
            <div class="log-admin">管理员: {{ log.admin }}</div>
            <div class="log-action">操作: {{ log.action }}</div>
            <div class="log-detail" v-if="log.detail">详情: {{ log.detail }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api, toast } from '../../utils/api'

const logs = ref<any[]>([])

async function loadLogs() {
  try {
    const res = await api('/admin/logs')
    logs.value = res.logs || []
  } catch (err: any) {
    toast(err.message, 'bad')
  }
}

onMounted(() => {
  loadLogs()
})
</script>
