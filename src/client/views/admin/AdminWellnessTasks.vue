<template>
  <div class="admin-section">
    <div class="section-header">
      <h3>养生任务管理</h3>
      <button @click="showCreateForm = true" class="btn-primary">+ 新建任务</button>
    </div>

    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else class="tasks-list">
      <div v-for="task in tasks" :key="task.id" class="task-item">
        <div class="task-info">
          <span class="task-emoji">{{ task.emoji }}</span>
          <div class="task-details">
            <div class="task-name">{{ task.name }} <span class="task-key">({{ task.task_key }})</span></div>
            <div class="task-desc">{{ task.description }}</div>
            <div class="task-rewards">
              <span v-if="task.life_reward">寿命: {{ formatLife(task.life_reward) }}</span>
              <span v-if="task.merit_reward">功德: {{ task.merit_reward }}</span>
              <span v-if="task.shard_reward">碎片: {{ task.shard_reward }}</span>
              <span v-if="task.coin_reward">复活币: {{ task.coin_reward }}</span>
            </div>
            <div class="task-meta">
              <span>类型: {{ rewardTypeLabel(task.reward_type) }}</span>
              <span>境界: {{ realmLabel(task.realm_requirement) }}</span>
              <span>排序: {{ task.sort_order }}</span>
              <span :class="task.is_active ? 'status-active' : 'status-inactive'">
                {{ task.is_active ? '启用' : '禁用' }}
              </span>
            </div>
          </div>
        </div>
        <div class="task-actions">
          <button @click="editTask(task)" class="btn-edit">编辑</button>
          <button @click="deleteTask(task.id)" class="btn-delete">删除</button>
        </div>
      </div>
    </div>

    <!-- 创建/编辑表单 -->
    <div v-if="showCreateForm || editingTask" class="modal-overlay" @click.self="closeForm">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ editingTask ? '编辑任务' : '新建任务' }}</h3>
          <button @click="closeForm" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitForm" class="task-form">
            <div class="form-row">
              <label>任务键名 *</label>
              <input v-model="formData.taskKey" required placeholder="例如: ziwu" />
            </div>
            <div class="form-row">
              <label>任务名称 *</label>
            <input v-model="formData.name" required placeholder="例如: 子午流注" />
          </div>
          <div class="form-row">
            <label>图标 *</label>
            <input v-model="formData.emoji" required placeholder="例如: 🌙" />
          </div>
          <div class="form-row">
            <label>描述 *</label>
            <textarea v-model="formData.description" required placeholder="任务描述"></textarea>
          </div>
          <div class="form-row">
            <label>奖励类型 *</label>
            <select v-model="formData.rewardType" required>
              <option value="fixed">固定奖励</option>
              <option value="variable">可变奖励</option>
              <option value="input">输入型奖励</option>
            </select>
          </div>
          <div class="form-row">
            <label>寿命奖励（秒）</label>
            <input v-model.number="formData.lifeReward" type="number" min="0" />
          </div>
          <div class="form-row">
            <label>功德奖励</label>
            <input v-model.number="formData.meritReward" type="number" min="0" />
          </div>
          <div class="form-row">
            <label>碎片奖励</label>
            <input v-model.number="formData.shardReward" type="number" min="0" />
          </div>
          <div class="form-row">
            <label>复活币奖励</label>
            <input v-model.number="formData.coinReward" type="number" min="0" />
          </div>
          <div class="form-row">
            <label>修饰值</label>
            <input v-model.number="formData.modifierValue" type="number" step="0.01" />
          </div>
          <div class="form-row">
            <label>境界要求 *</label>
            <select v-model="formData.realmRequirement" required>
              <option value="basic">基础</option>
              <option value="mortal">凡人</option>
              <option value="advanced">进阶</option>
              <option value="challenge">挑战</option>
            </select>
          </div>
          <div class="form-row">
            <label>排序</label>
            <input v-model.number="formData.sortOrder" type="number" min="0" />
          </div>
          <div class="form-row">
            <label>输入配置（JSON）</label>
            <textarea v-model="formData.inputConfig" placeholder='例如: {"type":"slider","min":1000,"max":50000}'></textarea>
          </div>
          <div class="form-row">
            <label>
              <input v-model="formData.isActive" type="checkbox" />
              启用
            </label>
          </div>
          <div class="form-actions">
            <button type="button" @click="closeForm" class="btn-cancel">取消</button>
            <button type="submit" class="btn-submit">{{ editingTask ? '更新' : '创建' }}</button>
          </div>
        </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '../../utils/api'

interface WellnessTask {
  id: number
  task_key: string
  name: string
  emoji: string
  description: string
  reward_type: string
  life_reward: number
  merit_reward: number
  shard_reward: number
  coin_reward: number
  modifier_value: number
  realm_requirement: string
  is_active: number
  sort_order: number
  input_config: string | null
}

const tasks = ref<WellnessTask[]>([])
const loading = ref(true)
const error = ref('')
const showCreateForm = ref(false)
const editingTask = ref<WellnessTask | null>(null)

const formData = ref({
  taskKey: '',
  name: '',
  emoji: '🧘',
  description: '',
  rewardType: 'fixed',
  lifeReward: 0,
  meritReward: 0,
  shardReward: 0,
  coinReward: 0,
  modifierValue: 0,
  realmRequirement: 'basic',
  sortOrder: 0,
  inputConfig: '',
  isActive: true
})

const formatLife = (sec: number) => {
  const min = Math.floor(sec / 60)
  return min > 0 ? `${min}分钟` : `${sec}秒`
}

const rewardTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    fixed: '固定',
    variable: '可变',
    input: '输入型'
  }
  return labels[type] || type
}

const realmLabel = (realm: string) => {
  const labels: Record<string, string> = {
    basic: '基础',
    mortal: '凡人',
    advanced: '进阶',
    challenge: '挑战'
  }
  return labels[realm] || realm
}

const loadTasks = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await api('/admin/wellness-tasks') as { tasks: WellnessTask[] }
    tasks.value = res.tasks || []
  } catch (err: any) {
    error.value = err.message || '加载失败'
  } finally {
    loading.value = false
  }
}

const editTask = (task: WellnessTask) => {
  editingTask.value = task
  formData.value = {
    taskKey: task.task_key,
    name: task.name,
    emoji: task.emoji,
    description: task.description,
    rewardType: task.reward_type,
    lifeReward: task.life_reward,
    meritReward: task.merit_reward,
    shardReward: task.shard_reward,
    coinReward: task.coin_reward,
    modifierValue: task.modifier_value,
    realmRequirement: task.realm_requirement,
    sortOrder: task.sort_order,
    inputConfig: task.input_config || '',
    isActive: task.is_active === 1
  }
}

const closeForm = () => {
  showCreateForm.value = false
  editingTask.value = null
  formData.value = {
    taskKey: '',
    name: '',
    emoji: '🧘',
    description: '',
    rewardType: 'fixed',
    lifeReward: 0,
    meritReward: 0,
    shardReward: 0,
    coinReward: 0,
    modifierValue: 0,
    realmRequirement: 'basic',
    sortOrder: 0,
    inputConfig: '',
    isActive: true
  }
}

const submitForm = async () => {
  try {
    const payload = {
      taskKey: formData.value.taskKey,
      name: formData.value.name,
      emoji: formData.value.emoji,
      description: formData.value.description,
      rewardType: formData.value.rewardType,
      lifeReward: formData.value.lifeReward,
      meritReward: formData.value.meritReward,
      shardReward: formData.value.shardReward,
      coinReward: formData.value.coinReward,
      modifierValue: formData.value.modifierValue,
      realmRequirement: formData.value.realmRequirement,
      sortOrder: formData.value.sortOrder,
      inputConfig: formData.value.inputConfig ? JSON.parse(formData.value.inputConfig) : null,
      isActive: formData.value.isActive
    }

    if (editingTask.value) {
      await api(`/admin/wellness-tasks/${editingTask.value.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      })
    } else {
      await api('/admin/wellness-tasks', {
        method: 'POST',
        body: JSON.stringify(payload)
      })
    }

    closeForm()
    await loadTasks()
  } catch (err: any) {
    alert(err.message || '操作失败')
  }
}

const deleteTask = async (id: number) => {
  if (!confirm('确定删除此任务？')) return
  try {
    await api(`/admin/wellness-tasks/${id}`, { method: 'DELETE' })
    await loadTasks()
  } catch (err: any) {
    alert(err.message || '删除失败')
  }
}

onMounted(() => {
  loadTasks()
})
</script>

<style scoped>
@import './admin-form-styles.css';
</style>
