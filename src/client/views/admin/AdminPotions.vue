<template>
  <div class="admin-potions">
    <div class="card">
      <h3><i class="fas fa-flask"></i> 丹药使用记录</h3>
      
      <div class="admin-list">
        <div v-if="paginatedPotions.length === 0" class="empty">暂无丹药使用记录</div>
        <div v-for="potion in paginatedPotions" :key="potion.id" class="admin-item">
          <span class="item-emoji">{{ potion.potionEmoji }}</span>
          <div class="item-content">
            <div class="item-header">
              <span class="item-name">{{ potion.potionName }}</span>
              <span class="item-badge" :class="{ expired: isExpired(potion.expireAt) }">
                {{ isExpired(potion.expireAt) ? '已过期' : '生效中' }}
              </span>
            </div>
            <div class="item-meta">
              <span>用户ID: {{ potion.userId }}</span>
              <span>效果: {{ potion.modLabel }} {{ potion.modValue > 0 ? '+' : '' }}{{ potion.modValue }}</span>
              <span>过期: {{ formatTime(potion.expireAt) }}</span>
            </div>
          </div>
          <div class="item-actions">
            <button @click="deletePotion(potion.id, potion.potionName)" class="btn-delete" title="删除">
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { api, toast } from '../../utils/api'
import Pagination from '../../components/Pagination.vue'

const potions = ref<any[]>([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)

const paginatedPotions = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return potions.value.slice(start, end)
})

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleString('zh-CN')
}

function isExpired(timestamp: number) {
  return timestamp <= Date.now()
}

async function loadPotions() {
  try {
    const res = await api('/admin/potions-records')
    potions.value = res.potions || []
  } catch (err: any) {
    console.error('加载丹药记录失败:', err)
    toast(err.message || '加载丹药记录失败', 'bad')
  }
}

async function deletePotion(id: number, name: string) {
  if (!confirm(`确定要删除丹药记录"${name}"吗？`)) return

  loading.value = true
  try {
    await api(`/admin/potions-records/${id}`, { method: 'DELETE' })
    toast('丹药记录删除成功', 'good')
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
