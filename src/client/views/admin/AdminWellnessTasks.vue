<template>
  <div class="admin-wellness-tasks">
    <div class="card">
      <div class="card-header">
        <h3><i class="fas fa-spa"></i> 养生任务管理</h3>
        <button @click="openCreateModal" class="btn-primary">
          <i class="fas fa-plus"></i> 新建任务
        </button>
      </div>

      <div v-if="loading" class="loading">加载中...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else class="admin-list">
        <div v-if="tasks.length === 0" class="empty">暂无养生任务</div>
        <div v-for="task in tasks" :key="task.id" class="admin-item">
          <span class="item-emoji">{{ task.emoji }}</span>
          <div class="item-content">
            <div class="item-header">
              <span class="item-name">{{ task.name }}</span>
              <span class="item-badge" :class="{ active: task.is_active }">
                {{ task.is_active ? '启用' : '禁用' }}
              </span>
              <span class="item-id">({{ task.task_key }})</span>
            </div>
            <div class="item-desc">{{ task.description }}</div>
            <div class="item-meta">
              <span v-if="task.life_reward" class="meta-success">
                <i class="fas fa-hourglass"></i>
                寿命: {{ formatLife(task.life_reward) }}
              </span>
              <span v-if="task.merit_reward" class="meta-info">
                <i class="fas fa-gem"></i>
                功德: {{ task.merit_reward }}
              </span>
              <span v-if="task.shard_reward" class="meta-warning">
                <i class="fas fa-star"></i>
                碎片: {{ task.shard_reward }}
              </span>
              <span v-if="task.coin_reward" class="meta-special">
                <i class="fas fa-coins"></i>
                复活币: {{ task.coin_reward }}
              </span>
              <span>类型: {{ rewardTypeLabel(task.reward_type) }}</span>
              <span>境界: {{ realmLabel(task.realm_requirement) }}</span>
              <span>排序: {{ task.sort_order }}</span>
            </div>
          </div>
          <div class="item-actions">
            <button @click="openEditModal(task)" class="btn-edit" title="编辑">
              <i class="fas fa-edit"></i>
            </button>
            <button @click="deleteTask(task.id)" class="btn-delete" title="删除">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <Modal v-model="showModal" :title="editingTask ? '编辑养生任务' : '新建养生任务'" size="large">
      <div class="modal-form">
        <div class="form-grid">
          <div class="form-item">
            <label>任务键名 *</label>
            <input v-model="formData.taskKey" placeholder="例如: ziwu" />
          </div>
          <div class="form-item">
            <label>任务名称 *</label>
            <input v-model="formData.name" placeholder="例如: 子午流注" />
          </div>
          <div class="form-item">
            <label>图标 *</label>
            <input v-model="formData.emoji" placeholder="例如: 🌙" maxlength="2" />
          </div>
          <div class="form-item">
            <label>奖励类型 *</label>
            <select v-model="formData.rewardType">
              <option value="fixed">固定奖励</option>
              <option value="variable">可变奖励</option>
              <option value="input">输入型奖励</option>
            </select>
          </div>
          <div class="form-item">
            <label>寿命奖励（秒）</label>
            <input v-model.number="formData.lifeReward" type="number" min="0" />
          </div>
          <div class="form-item">
            <label>功德奖励</label>
            <input v-model.number="formData.meritReward" type="number" min="0" />
          </div>
          <div class="form-item">
            <label>碎片奖励</label>
            <input v-model.number="formData.shardReward" type="number" min="0" />
          </div>
          <div class="form-item">
            <label>复活币奖励</label>
            <input v-model.number="formData.coinReward" type="number" min="0" />
          </div>
          <div class="form-item">
            <label>修饰值</label>
            <input v-model.number="formData.modifierValue" type="number" step="0.01" />
          </div>
          <div class="form-item">
            <label>境界要求 *</label>
            <select v-model="formData.realmRequirement">
              <option value="basic">基础</option>
              <option value="mortal">凡人</option>
              <option value="advanced">进阶</option>
              <option value="challenge">挑战</option>
            </select>
          </div>
          <div class="form-item">
            <label>排序</label>
            <input v-model.number="formData.sortOrder" type="number" min="0" />
          </div>
          <div class="form-item">
            <label style="display: flex; align-items: center; gap: 8px;">
              <input type="checkbox" v-model="formData.isActive" />
              <span>启用</span>
            </label>
          </div>
        </div>
        <div class="form-item full-width">
          <label>任务描述 *</label>
          <textarea v-model="formData.description" placeholder="任务描述" rows="3"></textarea>
        </div>
        <div class="form-item full-width">
          <label>输入配置（JSON）</label>
          <textarea v-model="formData.inputConfig" placeholder='例如: {"type":"slider","min":1000,"max":50000}' rows="2"></textarea>
        </div>
      </div>
      
      <template #footer>
        <button @click="showModal = false" class="btn-secondary">
          <i class="fas fa-times"></i> 取消
        </button>
        <button @click="saveTask" class="btn-success" :disabled="loading">
          <i class="fas fa-save"></i> {{ editingTask ? '保存' : '创建' }}
        </button>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api, toast } from '../../utils/api'
import Modal from '../../components/Modal.vue'

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
const loading = ref(false)
const error = ref('')
const showModal = ref(false)
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

function resetForm() {
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
  editingTask.value = null
}

function openCreateModal() {
  resetForm()
  showModal.value = true
}

function openEditModal(task: WellnessTask) {
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
  editingTask.value = task
  showModal.value = true
}

async function loadTasks() {
  loading.value = true
  error.value = ''
  try {
    const res = await api('/admin/wellness-tasks') as { tasks: WellnessTask[] }
    tasks.value = res.tasks || []
  } catch (err: any) {
    error.value = err.message || '加载失败'
    toast(error.value, 'bad')
  } finally {
    loading.value = false
  }
}

async function saveTask() {
  if (!formData.value.taskKey || !formData.value.name || !formData.value.description) {
    toast('请填写必填字段', 'bad')
    return
  }

  loading.value = true
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
      toast('养生任务更新成功', 'good')
    } else {
      await api('/admin/wellness-tasks', {
        method: 'POST',
        body: JSON.stringify(payload)
      })
      toast('养生任务创建成功', 'good')
    }

    showModal.value = false
    resetForm()
    await loadTasks()
  } catch (err: any) {
    toast(err.message || '操作失败', 'bad')
  } finally {
    loading.value = false
  }
}

async function deleteTask(id: number) {
  if (!confirm('确定删除此任务？')) return
  
  loading.value = true
  try {
    await api(`/admin/wellness-tasks/${id}`, { method: 'DELETE' })
    toast('养生任务删除成功', 'good')
    await loadTasks()
  } catch (err: any) {
    toast(err.message || '删除失败', 'bad')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadTasks()
})
</script>

<style scoped src="./admin-form-styles.css"></style>
