<template>
  <div class="admin-events">
    <div class="card">
      <div class="card-header">
        <h3><i class="fas fa-calendar-alt"></i> 全服事件管理</h3>
        <button @click="openCreateModal" class="btn-primary">
          <i class="fas fa-plus"></i> 新建事件
        </button>
      </div>

      <div class="admin-list">
        <div v-if="paginatedEvents.length === 0" class="empty">暂无全服事件</div>
        <div v-for="event in paginatedEvents" :key="event.id" class="admin-item">
          <span class="item-emoji">{{ event.emoji }}</span>
          <div class="item-content">
            <div class="item-header">
              <span class="item-name">{{ event.name }}</span>
              <span class="item-badge" :class="{ active: event.is_active }">
                {{ event.is_active ? '进行中' : '已结束' }}
              </span>
            </div>
            <div class="item-desc">{{ event.description }}</div>
            <div class="item-meta">
              <span>效果: {{ getEffectLabel(event.effect_type) }} {{ event.effect_value > 0 ? '+' : '' }}{{ event.effect_value }}</span>
              <span>开始: {{ formatTime(event.start_at) }}</span>
              <span>结束: {{ formatTime(event.end_at) }}</span>
            </div>
          </div>
          <div class="item-actions">
            <button v-if="event.is_active" @click="openEditModal(event)" class="btn-edit" title="编辑">
              <i class="fas fa-edit"></i>
            </button>
            <button v-if="event.is_active" @click="endEvent(event.id)" class="btn-warning" title="结束事件">
              <i class="fas fa-stop"></i>
            </button>
            <button @click="deleteEvent(event.id, event.name)" class="btn-delete" title="删除">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>

      <Pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="events.length"
      />
    </div>

    <Modal v-model="showModal" :title="editingId ? '编辑全服事件' : '新建全服事件'" size="large">
      <div class="modal-form">
        <div class="form-grid">
          <div class="form-item">
            <label>事件名称 *</label>
            <input v-model="formData.name" placeholder="事件名称" />
          </div>
          <div class="form-item">
            <label>效果类型</label>
            <select v-model="formData.effectType">
              <option value="global_merit">全局功德加成</option>
              <option value="global_decay">全局衰减减少</option>
              <option value="global_life">全局寿命加成</option>
            </select>
          </div>
          <div class="form-item">
            <label>效果值</label>
            <input v-model.number="formData.effectValue" type="number" step="0.01" />
          </div>
          <div class="form-item" v-if="!editingId">
            <label>持续时间(毫秒)</label>
            <input v-model.number="formData.duration" type="number" />
          </div>
        </div>
        <div class="form-item full-width">
          <label>事件描述 *</label>
          <textarea v-model="formData.description" placeholder="事件描述" rows="3"></textarea>
        </div>
      </div>
      
      <template #footer>
        <button @click="showModal = false" class="btn-secondary">
          <i class="fas fa-times"></i> 取消
        </button>
        <button @click="saveEvent" class="btn-success" :disabled="loading">
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
const events = ref<any[]>([])
const currentPage = ref(1)
const pageSize = ref(10)

const formData = ref({
  name: '',
  description: '',
  effectType: 'global_merit',
  effectValue: 0.2,
  duration: 86400000
})

const paginatedEvents = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return events.value.slice(start, end)
})

function getEffectLabel(type: string) {
  const labels: Record<string, string> = {
    global_merit: '全局功德加成',
    global_decay: '全局衰减减少',
    global_life: '全局寿命加成'
  }
  return labels[type] || type
}

function formatTime(timestamp: number) {
  return new Date(timestamp * 1000).toLocaleString('zh-CN')
}

function resetForm() {
  formData.value = {
    name: '',
    description: '',
    effectType: 'global_merit',
    effectValue: 0.2,
    duration: 86400000
  }
  editingId.value = null
}

function openCreateModal() {
  resetForm()
  showModal.value = true
}

function openEditModal(event: any) {
  formData.value = {
    name: event.name,
    description: event.description,
    effectType: event.effect_type,
    effectValue: event.effect_value,
    duration: 86400000
  }
  editingId.value = event.id
  showModal.value = true
}

async function loadEvents() {
  try {
    const res = await api('/admin/events') as any
    events.value = res.events || []
  } catch (err: any) {
    toast(err.message, 'bad')
  }
}

async function saveEvent() {
  if (!formData.value.name || !formData.value.description) {
    toast('请填写事件名称和描述', 'bad')
    return
  }

  loading.value = true
  try {
    if (editingId.value) {
      await api(`/admin/world-events/${editingId.value}`, {
        method: 'PUT',
        body: JSON.stringify(formData.value)
      })
      toast('全服事件更新成功', 'good')
    } else {
      await api('/admin/world-events', {
        method: 'POST',
        body: JSON.stringify(formData.value)
      })
      toast('全服事件创建成功', 'good')
    }
    showModal.value = false
    resetForm()
    await loadEvents()
  } catch (err: any) {
    toast(err.message, 'bad')
  } finally {
    loading.value = false
  }
}

async function endEvent(id: number) {
  if (!confirm('确定要结束这个事件吗？')) return

  loading.value = true
  try {
    await api(`/admin/world-events/${id}/end`, {
      method: 'POST'
    })
    toast('事件已结束', 'good')
    await loadEvents()
  } catch (err: any) {
    toast(err.message, 'bad')
  } finally {
    loading.value = false
  }
}

async function deleteEvent(id: number, name: string) {
  if (!confirm(`确定要删除事件"${name}"吗？`)) return

  loading.value = true
  try {
    await api(`/admin/world-events/${id}`, { method: 'DELETE' })
    toast('事件删除成功', 'good')
    await loadEvents()
  } catch (err: any) {
    toast(err.message, 'bad')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadEvents()
})
</script>

<style scoped src="./admin-form-styles.css"></style>
