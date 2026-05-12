<template>
  <div class="admin-tasks">
    <div class="card">
      <div class="card-header">
        <h3><i class="fas fa-tasks"></i> 修炼项目管理</h3>
        <button @click="openCreateModal" class="btn-primary">
          <i class="fas fa-plus"></i> 新建项目
        </button>
      </div>

      <div class="admin-list">
        <div v-if="paginatedTasks.length === 0" class="empty">暂无修炼项目</div>
        <div v-for="task in paginatedTasks" :key="task.id" class="admin-item">
          <span class="item-emoji">{{ task.emoji }}</span>
          <div class="item-content">
            <div class="item-header">
              <span class="item-name">{{ task.name }}</span>
              <span class="item-badge">{{ task.task_key }}</span>
            </div>
            <div class="item-desc">{{ task.description }}</div>
            <div class="item-meta">
              <span>寿命: +{{ task.life_reward }}秒</span>
              <span>功德: +{{ task.merit_reward }}</span>
              <span>碎片: +{{ task.shard_reward }}</span>
              <span>排序: {{ task.sort_order }}</span>
            </div>
          </div>
          <div class="item-actions">
            <button @click="openEditModal(task)" class="btn-edit" title="编辑">
              <i class="fas fa-edit"></i>
            </button>
            <button @click="deleteTask(task.id, task.name)" class="btn-delete" title="删除">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>

      <Pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="tasks.length"
      />
    </div>

    <Modal v-model="showModal" :title="editingId ? '编辑修炼项目' : '新建修炼项目'" size="large">
      <div class="modal-form">
        <div class="form-grid">
          <div class="form-item">
            <label>项目Key *</label>
            <input v-model="formData.key" placeholder="唯一标识" />
          </div>
          <div class="form-item">
            <label>项目名称 *</label>
            <input v-model="formData.name" placeholder="项目名称" />
          </div>
          <div class="form-item">
            <label>图标</label>
            <input v-model="formData.emoji" placeholder="emoji" maxlength="2" />
          </div>
          <div class="form-item">
            <label>寿命奖励(秒)</label>
            <input v-model.number="formData.lifeReward" type="number" />
          </div>
          <div class="form-item">
            <label>功德奖励</label>
            <input v-model.number="formData.meritReward" type="number" />
          </div>
          <div class="form-item">
            <label>碎片奖励</label>
            <input v-model.number="formData.shardReward" type="number" />
          </div>
          <div class="form-item">
            <label>排序</label>
            <input v-model.number="formData.sortOrder" type="number" />
          </div>
        </div>
        <div class="form-item full-width">
          <label>项目描述</label>
          <textarea v-model="formData.description" placeholder="项目描述" rows="3"></textarea>
        </div>
      </div>
      
      <template #footer>
        <button @click="showModal = false" class="btn-secondary">
          <i class="fas fa-times"></i> 取消
        </button>
        <button @click="saveTask" class="btn-success" :disabled="loading">
          <i class="fas fa-save"></i> {{ editingId ? '保存' : '创建' }}
        </button>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { api, toast } from '../../utils/api'
import Modal from '../../components/Modal.vue'
import Pagination from '../../components/Pagination.vue'

const loading = ref(false)
const showModal = ref(false)
const editingId = ref<number | null>(null)
const tasks = ref<any[]>([])
const currentPage = ref(1)
const pageSize = ref(10)

const formData = ref({
  key: '',
  name: '',
  emoji: '🧘',
  description: '',
  lifeReward: 600,
  meritReward: 1,
  shardReward: 0,
  sortOrder: 0
})

const paginatedTasks = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return tasks.value.slice(start, end)
})

function resetForm() {
  formData.value = {
    key: '',
    name: '',
    emoji: '🧘',
    description: '',
    lifeReward: 600,
    meritReward: 1,
    shardReward: 0,
    sortOrder: 0
  }
  editingId.value = null
}

function openCreateModal() {
  resetForm()
  showModal.value = true
}

function openEditModal(task: any) {
  formData.value = {
    key: task.task_key,
    name: task.name,
    emoji: task.emoji,
    description: task.description,
    lifeReward: task.life_reward,
    meritReward: task.merit_reward,
    shardReward: task.shard_reward,
    sortOrder: task.sort_order
  }
  editingId.value = task.id
  showModal.value = true
}

async function loadTasks() {
  try {
    const res = await api('/admin/extra-tasks')
    tasks.value = res.tasks || []
  } catch (err: any) {
    toast(err.message, 'bad')
  }
}

async function saveTask() {
  if (!formData.value.key || !formData.value.name) {
    toast('请填写项目Key和名称', 'bad')
    return
  }

  loading.value = true
  try {
    if (editingId.value) {
      await api(`/admin/extra-tasks/${editingId.value}`, {
        method: 'PUT',
        body: JSON.stringify(formData.value)
      })
      toast('修炼项目更新成功', 'good')
    } else {
      await api('/admin/extra-tasks', {
        method: 'POST',
        body: JSON.stringify(formData.value)
      })
      toast('修炼项目创建成功', 'good')
    }
    showModal.value = false
    resetForm()
    await loadTasks()
  } catch (err: any) {
    toast(err.message, 'bad')
  } finally {
    loading.value = false
  }
}

async function deleteTask(id: number, name: string) {
  if (!confirm(`确定要删除修炼项目"${name}"吗？`)) return

  loading.value = true
  try {
    await api(`/admin/extra-tasks/${id}`, { method: 'DELETE' })
    toast('修炼项目删除成功', 'good')
    await loadTasks()
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

<style scoped src="./admin-form-styles.css"></style>
