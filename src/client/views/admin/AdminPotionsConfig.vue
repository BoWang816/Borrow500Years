<template>
  <div class="admin-potions-config">
    <div class="card">
      <div class="card-header">
        <h3><i class="fas fa-cog"></i> 丹药配置管理</h3>
        <button @click="openCreateModal" class="btn-primary">
          <i class="fas fa-plus"></i> 新建丹药
        </button>
      </div>

      <div class="admin-list">
        <div v-if="paginatedPotions.length === 0" class="empty">暂无丹药配置</div>
        <div v-for="potion in paginatedPotions" :key="potion.id" class="admin-item">
          <span class="item-emoji">{{ potion.emoji }}</span>
          <div class="item-content">
            <div class="item-header">
              <span class="item-name">{{ potion.name }}</span>
              <span class="item-badge" :class="{ active: potion.is_active }">
                {{ potion.is_active ? '启用' : '禁用' }}
              </span>
              <span class="item-id">#{{ potion.id }}</span>
            </div>
            <div class="item-desc">{{ potion.desc }}</div>
            <div class="item-meta">
              <span class="meta-highlight">
                <i class="fas fa-gem"></i>
                消耗: {{ potion.cost }} {{ potion.type === 'merit' ? '功德' : '复活币' }}
              </span>
              <span v-if="potion.instant_life > 0" class="meta-success">
                <i class="fas fa-bolt"></i>
                即时增寿: +{{ formatSeconds(potion.instant_life) }}
              </span>
              <span v-if="potion.dur > 0" class="meta-info">
                <i class="fas fa-clock"></i>
                持续: {{ formatSeconds(potion.dur) }}
              </span>
              <span v-if="potion.dur_decay_reduction > 0" class="meta-warning">
                <i class="fas fa-shield-alt"></i>
                衰减减少: {{ (potion.dur_decay_reduction * 100).toFixed(0) }}%
              </span>
              <span v-if="potion.dur_merit_boost > 0" class="meta-special">
                <i class="fas fa-star"></i>
                功德加成: {{ (potion.dur_merit_boost * 100).toFixed(0) }}%
              </span>
            </div>
          </div>
          <div class="item-actions">
            <button @click="openEditModal(potion)" class="btn-edit" title="编辑">
              <i class="fas fa-edit"></i>
            </button>
            <button @click="deletePotion(potion.id, potion.name)" class="btn-delete" title="删除">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>

      <Pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="potions.length"
      />
    </div>

    <Modal v-model="showModal" :title="editingId ? '编辑丹药配置' : '新建丹药配置'" size="large">
      <div class="modal-form">
        <div class="form-grid">
          <div class="form-item">
            <label>丹药ID *</label>
            <input v-model="formData.id" placeholder="唯一标识" :disabled="!!editingId" />
          </div>
          <div class="form-item">
            <label>丹药名称 *</label>
            <input v-model="formData.name" placeholder="丹药名称" />
          </div>
          <div class="form-item">
            <label>图标</label>
            <input v-model="formData.emoji" placeholder="emoji" maxlength="2" />
          </div>
          <div class="form-item">
            <label>消耗类型</label>
            <select v-model="formData.costType">
              <option value="merit">功德</option>
              <option value="shard">复活币</option>
            </select>
          </div>
          <div class="form-item">
            <label>消耗数量</label>
            <input v-model.number="formData.cost" type="number" />
          </div>
          <div class="form-item">
            <label>即时寿命(秒)</label>
            <input v-model.number="formData.instantLife" type="number" />
          </div>
          <div class="form-item">
            <label>持续时间(秒)</label>
            <input v-model.number="formData.dur" type="number" />
          </div>
          <div class="form-item">
            <label>衰减减少</label>
            <input v-model.number="formData.durDecayReduction" type="number" step="0.01" />
          </div>
          <div class="form-item">
            <label>功德加成</label>
            <input v-model.number="formData.durMeritBoost" type="number" step="0.01" />
          </div>
          <div class="form-item">
            <label>排序</label>
            <input v-model.number="formData.sortOrder" type="number" />
          </div>
          <div class="form-item">
            <label style="display: flex; align-items: center; gap: 8px;">
              <input type="checkbox" v-model="formData.isActive" />
              <span>启用</span>
            </label>
          </div>
        </div>
        <div class="form-item full-width">
          <label>丹药描述</label>
          <textarea v-model="formData.description" placeholder="丹药描述" rows="3"></textarea>
        </div>
      </div>
      
      <template #footer>
        <button @click="showModal = false" class="btn-secondary">
          <i class="fas fa-times"></i> 取消
        </button>
        <button @click="savePotion" class="btn-success" :disabled="loading">
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
const editingId = ref<string | null>(null)
const potions = ref<any[]>([])
const currentPage = ref(1)
const pageSize = ref(10)

const formData = ref({
  id: '',
  name: '',
  emoji: '💊',
  description: '',
  cost: 30,
  costType: 'merit',
  instantLife: 0,
  dur: 86400,
  durDecayReduction: 0,
  durMeritBoost: 0,
  sortOrder: 0,
  isActive: true
})

const paginatedPotions = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return potions.value.slice(start, end)
})

function formatSeconds(seconds: number): string {
  if (seconds >= 86400) {
    const days = Math.floor(seconds / 86400)
    return `${days}天`
  } else if (seconds >= 3600) {
    const hours = Math.floor(seconds / 3600)
    return `${hours}小时`
  } else if (seconds >= 60) {
    const minutes = Math.floor(seconds / 60)
    return `${minutes}分钟`
  }
  return `${seconds}秒`
}

function resetForm() {
  formData.value = {
    id: '',
    name: '',
    emoji: '💊',
    description: '',
    cost: 30,
    costType: 'merit',
    instantLife: 0,
    dur: 86400,
    durDecayReduction: 0,
    durMeritBoost: 0,
    sortOrder: 0,
    isActive: true
  }
  editingId.value = null
}

function openCreateModal() {
  resetForm()
  showModal.value = true
}

function openEditModal(potion: any) {
  formData.value = {
    id: potion.id,
    name: potion.name,
    emoji: potion.emoji,
    description: potion.desc,
    cost: potion.cost,
    costType: potion.type,
    instantLife: potion.instant_life,
    dur: potion.dur,
    durDecayReduction: potion.dur_decay_reduction,
    durMeritBoost: potion.dur_merit_boost,
    sortOrder: potion.sort_order,
    isActive: !!potion.is_active
  }
  editingId.value = potion.id
  showModal.value = true
}

async function loadPotions() {
  try {
    const res = await api('/admin/potions-config') as any
    potions.value = res.potions || []
  } catch (err: any) {
    toast(err.message, 'bad')
  }
}

async function savePotion() {
  if (!formData.value.id || !formData.value.name) {
    toast('请填写丹药ID和名称', 'bad')
    return
  }

  loading.value = true
  try {
    if (editingId.value) {
      await api(`/admin/potions-config/${editingId.value}`, {
        method: 'PUT',
        body: JSON.stringify(formData.value)
      })
      toast('丹药配置更新成功', 'good')
    } else {
      await api('/admin/potions-config', {
        method: 'POST',
        body: JSON.stringify(formData.value)
      })
      toast('丹药配置创建成功', 'good')
    }
    showModal.value = false
    resetForm()
    await loadPotions()
  } catch (err: any) {
    toast(err.message, 'bad')
  } finally {
    loading.value = false
  }
}

async function deletePotion(id: string, name: string) {
  if (!confirm(`确定要删除丹药配置"${name}"吗？`)) return

  loading.value = true
  try {
    await api(`/admin/potions-config/${id}`, { method: 'DELETE' })
    toast('丹药配置删除成功', 'good')
    await loadPotions()
  } catch (err: any) {
    toast(err.message, 'bad')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadPotions()
})
</script>

<style scoped src="./admin-form-styles.css"></style>
