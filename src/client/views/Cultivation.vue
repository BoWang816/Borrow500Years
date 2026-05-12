<template>
  <div class="page cultivation-page">
    <h2 class="page-title">
      <span class="cn">养生修炼</span>
      <span class="en">Cultivation</span>
    </h2>

    <div class="container">
      <div class="card tasks-card">
        <h3><i class="fas fa-tasks"></i> 日常修炼</h3>
        <div class="tasks-grid">
          <button 
            v-for="task in tasks" 
            :key="task.task_key"
            @click="doTask(task.task_key)"
            class="task-btn"
            :disabled="loading"
          >
            <span class="task-emoji">{{ task.emoji }}</span>
            <span class="task-name">{{ task.name }}</span>
            <span class="task-reward">+{{ formatLife(task.life_reward) }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api, formatLife, toast } from '../utils/api'
import { useStateStore } from '../stores/state'
import type { Task } from '../types'

const stateStore = useStateStore()
const tasks = ref<Task[]>([])
const loading = ref(false)

async function loadTasks() {
  try {
    const res = await api('/extra-tasks/config')
    tasks.value = res.tasks || []
  } catch (err: any) {
    toast(err.message, 'bad')
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

onMounted(() => {
  loadTasks()
})
</script>
