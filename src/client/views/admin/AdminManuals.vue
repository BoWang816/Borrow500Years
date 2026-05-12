<template>
  <div class="admin-manuals">
    <div class="card">
      <div class="card-header">
        <h3><i class="fas fa-book"></i> 功法管理</h3>
        <button @click="openCreateModal" class="btn-primary">
          <i class="fas fa-plus"></i> 新建功法
        </button>
      </div>

      <!-- 功法列表 -->
      <div class="admin-list">
        <div v-if="paginatedManuals.length === 0" class="empty">暂无功法</div>
        <div v-for="manual in paginatedManuals" :key="manual.id" class="admin-item">
          <span class="item-emoji">{{ manual.emoji }}</span>
          <div class="item-content">
            <div class="item-header">
              <span class="item-name">{{ manual.name }}</span>
              <span class="item-badge">{{ manual.key }}</span>
            </div>
            <div class="item-desc">{{ manual.description }}</div>
            <div class="item-meta">
              <span>效果: {{ getEffectLabel(manual.effect_type) }} {{ manual.effect_value }}</span>
              <span>最大等级: {{ manual.max_level }}</span>
              <span>消耗: {{ manual.cost_merit }} 功德</span>
            </div>
          </div>
          <div class="item-actions">
            <button @click="openEditModal(manual)" class="btn-edit" title="编辑">
              <i class="fas fa-edit"></i>
            </button>
            <button @click="deleteManual(manual.id, manual.name)" class="btn-delete" title="删除">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <Pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="manuals.length"
      />
    </div>

    <!-- Modal弹框 -->
    <Modal v-model="showModal" :title="editingId ? '编辑功法' : '新建功法'" size="large">
      <div class="modal-form">
        <div class="form-grid">
          <div class="form-item">
            <label>功法Key *</label>
            <input v-model="formData.key" placeholder="唯一标识" />
          </div>
          <div class="form-item">
            <label>功法名称 *</label>
            <input v-model="formData.name" placeholder="功法名称" />
          </div>
          <div class="form-item">
            <label>图标</label>
            <input v-model="formData.emoji" placeholder="emoji" maxlength="2" />
          </div>
          <div class="form-item">
            <label>效果类型</label>
            <select v-model="formData.effectType">
              <option value="decay_reduction">衰减减少</option>
              <option value="merit_boost">功德加成</option>
              <option value="life_boost">寿命加成</option>
            </select>
          </div>
          <div class="form-item">
            <label>效果值</label>
            <input v-model.number="formData.effectValue" type="number" step="0.01" placeholder="效果值" />
          </div>
          <div class="form-item">
            <label>最大等级</label>
            <input v-model.number="formData.maxLevel" type="number" placeholder="最大等级" />
          </div>
          <div class="form-item">
            <label>升级消耗</label>
            <input v-model.number="formData.costMerit" type="number" placeholder="功德" />
          </div>
        </div>
        <div class="form-item full-width">
          <label>功法描述</label>
          <textarea v-model="formData.description" placeholder="功法描述" rows="3"></textarea>
        </div>
      </div>
      
      <template #footer>
        <button @click="showModal = false" class="btn-secondary">
          <i class="fas fa-times"></i> 取消
        </button>
        <button @click="saveManual" class="btn-success" :disabled="loading">
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
const manuals = ref<any[]>([])
const currentPage = ref(1)
const pageSize = ref(10)

const formData = ref({
  key: '',
  name: '',
  emoji: '📿',
  description: '',
  effectType: 'decay_reduction',
  effectValue: 0.1,
  maxLevel: 10,
  costMerit: 100
})

const paginatedManuals = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return manuals.value.slice(start, end)
})

function getEffectLabel(type: string) {
  const labels: Record<string, string> = {
    decay_reduction: '衰减减少',
    merit_boost: '功德加成',
    life_boost: '寿命加成'
  }
  return labels[type] || type
}

function resetForm() {
  formData.value = {
    key: '',
    name: '',
    emoji: '📿',
    description: '',
    effectType: 'decay_reduction',
    effectValue: 0.1,
    maxLevel: 10,
    costMerit: 100
  }
  editingId.value = null
}

function openCreateModal() {
  resetForm()
  showModal.value = true
}

function openEditModal(manual: any) {
  formData.value = {
    key: manual.key,
    name: manual.name,
    emoji: manual.emoji,
    description: manual.description,
    effectType: manual.effect_type,
    effectValue: manual.effect_value,
    maxLevel: manual.max_level,
    costMerit: manual.cost_merit
  }
  editingId.value = manual.id
  showModal.value = true
}

async function loadManuals() {
  try {
    const res = await api('/admin/manuals')
    manuals.value = res.manuals || []
  } catch (err: any) {
    toast(err.message, 'bad')
  }
}

async function saveManual() {
  if (!formData.value.key || !formData.value.name) {
    toast('请填写功法Key和名称', 'bad')
    return
  }

  loading.value = true
  try {
    if (editingId.value) {
      await api(`/admin/manuals/${editingId.value}`, {
        method: 'PUT',
        body: JSON.stringify(formData.value)
      })
      toast('功法更新成功', 'good')
    } else {
      await api('/admin/manuals', {
        method: 'POST',
        body: JSON.stringify(formData.value)
      })
      toast('功法创建成功', 'good')
    }
    showModal.value = false
    resetForm()
    await loadManuals()
  } catch (err: any) {
    toast(err.message, 'bad')
  } finally {
    loading.value = false
  }
}

async function deleteManual(id: number, name: string) {
  if (!confirm(`确定要删除功法"${name}"吗？`)) return

  loading.value = true
  try {
    await api(`/admin/manuals/${id}`, { method: 'DELETE' })
    toast('功法删除成功', 'good')
    await loadManuals()
  } catch (err: any) {
    toast(err.message, 'bad')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadManuals()
})
</script>

<style scoped src="./admin-form-styles.css"></style>
