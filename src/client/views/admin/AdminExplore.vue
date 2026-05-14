<template>
  <div class="admin-explore">
    <div class="card">
      <div class="card-header">
        <h3><i class="fas fa-compass"></i> 历练项目管理</h3>
        <button @click="openCreateModal" class="btn-primary">
          <i class="fas fa-plus"></i> 新建项目
        </button>
      </div>

      <div class="admin-list">
        <div v-if="paginatedLoots.length === 0" class="empty">暂无历练项目</div>
        <div v-for="loot in paginatedLoots" :key="loot.id" class="admin-item">
          <div class="item-content">
            <div class="item-header">
              <span class="item-name">{{ loot.name }}</span>
              <span class="item-badge">权重: {{ loot.weight }}</span>
            </div>
            <div class="item-desc">{{ loot.msg }}</div>
            <div class="item-meta">
              <span>寿命: +{{ loot.life }}</span>
              <span>功德: +{{ loot.merit }}</span>
              <span>碎片: +{{ loot.shard }}</span>
              <span>排序: {{ loot.sort_order }}</span>
            </div>
          </div>
          <div class="item-actions">
            <button @click="openEditModal(loot)" class="btn-edit" title="编辑">
              <i class="fas fa-edit"></i>
            </button>
            <button @click="deleteLoot(loot.id, loot.name)" class="btn-delete" title="删除">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>

      <Pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="loots.length"
      />
    </div>

    <Modal v-model="showModal" :title="editingId ? '编辑历练项目' : '新建历练项目'" size="large">
      <div class="modal-form">
        <div class="form-grid">
          <div class="form-item">
            <label>项目名称 *</label>
            <input v-model="formData.name" placeholder="项目名称" />
          </div>
          <div class="form-item">
            <label>权重</label>
            <input v-model.number="formData.weight" type="number" placeholder="权重" />
          </div>
          <div class="form-item">
            <label>排序</label>
            <input v-model.number="formData.sortOrder" type="number" placeholder="排序" />
          </div>
          <div class="form-item">
            <label>寿命奖励</label>
            <input v-model.number="formData.life" type="number" placeholder="寿命" />
          </div>
          <div class="form-item">
            <label>功德奖励</label>
            <input v-model.number="formData.merit" type="number" placeholder="功德" />
          </div>
          <div class="form-item">
            <label>碎片奖励</label>
            <input v-model.number="formData.shard" type="number" placeholder="碎片" />
          </div>
        </div>
        <div class="form-item full-width">
          <label>提示消息</label>
          <textarea v-model="formData.msg" placeholder="提示消息" rows="3"></textarea>
        </div>
      </div>
      
      <template #footer>
        <button @click="showModal = false" class="btn-secondary">
          <i class="fas fa-times"></i> 取消
        </button>
        <button @click="saveLoot" class="btn-success" :disabled="loading">
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
const loots = ref<any[]>([])
const currentPage = ref(1)
const pageSize = ref(10)

const formData = ref({
  name: '',
  weight: 10,
  sortOrder: 0,
  msg: '',
  life: 0,
  merit: 0,
  shard: 0
})

const paginatedLoots = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return loots.value.slice(start, end)
})

function resetForm() {
  formData.value = {
    name: '',
    weight: 10,
    sortOrder: 0,
    msg: '',
    life: 0,
    merit: 0,
    shard: 0
  }
  editingId.value = null
}

function openCreateModal() {
  resetForm()
  showModal.value = true
}

function openEditModal(loot: any) {
  formData.value = {
    name: loot.name,
    weight: loot.weight,
    sortOrder: loot.sort_order,
    msg: loot.msg,
    life: loot.life,
    merit: loot.merit,
    shard: loot.shard
  }
  editingId.value = loot.id
  showModal.value = true
}

async function loadLoots() {
  try {
    const res = await api('/admin/explore-loot') as any
    loots.value = res.loots || []
  } catch (err: any) {
    toast(err.message, 'bad')
  }
}

async function saveLoot() {
  if (!formData.value.name) {
    toast('请填写项目名称', 'bad')
    return
  }

  loading.value = true
  try {
    if (editingId.value) {
      await api(`/admin/explore-loot/${editingId.value}`, {
        method: 'PUT',
        body: JSON.stringify(formData.value)
      })
      toast('历练项目更新成功', 'good')
    } else {
      await api('/admin/explore-loot', {
        method: 'POST',
        body: JSON.stringify(formData.value)
      })
      toast('历练项目创建成功', 'good')
    }
    showModal.value = false
    resetForm()
    await loadLoots()
  } catch (err: any) {
    toast(err.message, 'bad')
  } finally {
    loading.value = false
  }
}

async function deleteLoot(id: number, name: string) {
  if (!confirm(`确定要删除历练项目"${name}"吗？`)) return

  loading.value = true
  try {
    await api(`/admin/explore-loot/${id}`, { method: 'DELETE' })
    toast('历练项目删除成功', 'good')
    await loadLoots()
  } catch (err: any) {
    toast(err.message, 'bad')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadLoots()
})
</script>

<style scoped src="./admin-form-styles.css"></style>
