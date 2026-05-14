<template>
  <div class="pagination" v-if="totalPages > 1">
    <button 
      class="page-btn" 
      :disabled="currentPage === 1"
      @click="$emit('update:currentPage', 1)"
    >
      <i class="fas fa-angle-double-left"></i>
    </button>
    
    <button 
      class="page-btn" 
      :disabled="currentPage === 1"
      @click="$emit('update:currentPage', currentPage - 1)"
    >
      <i class="fas fa-angle-left"></i>
    </button>
    
    <div class="page-numbers">
      <button
        v-for="page in visiblePages"
        :key="page"
        class="page-btn"
        :class="{ active: page === currentPage }"
        @click="$emit('update:currentPage', page)"
      >
        {{ page }}
      </button>
    </div>
    
    <button 
      class="page-btn" 
      :disabled="currentPage === totalPages"
      @click="$emit('update:currentPage', currentPage + 1)"
    >
      <i class="fas fa-angle-right"></i>
    </button>
    
    <button 
      class="page-btn" 
      :disabled="currentPage === totalPages"
      @click="$emit('update:currentPage', totalPages)"
    >
      <i class="fas fa-angle-double-right"></i>
    </button>
    
    <div class="page-info">
      <span>{{ currentPage }} / {{ totalPages }}</span>
      <span class="total-items">共 {{ total }} 条</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  currentPage: number
  pageSize: number
  total: number
}>()

defineEmits<{
  'update:currentPage': [page: number]
}>()

const totalPages = computed(() => Math.ceil(props.total / props.pageSize))

const visiblePages = computed(() => {
  const pages: number[] = []
  const maxVisible = 5
  
  if (totalPages.value <= maxVisible) {
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i)
    }
  } else {
    const start = Math.max(1, props.currentPage - 2)
    const end = Math.min(totalPages.value, start + maxVisible - 1)
    
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
  }
  
  return pages
})
</script>


<style scoped>
.pagination {
  display: flex !important;
  flex-direction: row !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 8px;
  margin-top: 24px;
  padding: 16px 0;
}

.page-btn {
  min-width: 36px;
  height: 36px;
  padding: 0 12px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(54, 255, 208, 0.3);
  border-radius: 6px;
  color: var(--jade, #36ffd0);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  display: flex !important;
  align-items: center;
  justify-content: center;
}

.page-btn:hover:not(:disabled) {
  background: rgba(54, 255, 208, 0.1);
  border-color: var(--jade, #36ffd0);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(54, 255, 208, 0.2);
}

.page-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  transform: none;
}

.page-btn.active {
  background: linear-gradient(135deg, var(--jade, #36ffd0), var(--gold, #d4af37));
  color: #000;
  border-color: var(--jade, #36ffd0);
  font-weight: 700;
  box-shadow: 0 0 15px rgba(54, 255, 208, 0.4);
}

.page-numbers {
  display: flex !important;
  flex-direction: row !important;
  gap: 8px;
}

.page-info {
  display: flex !important;
  flex-direction: column !important;
  align-items: center;
  margin-left: 16px;
  padding-left: 16px;
  border-left: 1px solid rgba(54, 255, 208, 0.3);
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.4;
}

.total-items {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

@media (max-width: 768px) {
  .pagination {
    flex-wrap: wrap;
    gap: 6px;
  }
  
  .page-btn {
    min-width: 32px;
    height: 32px;
    padding: 0 8px;
    font-size: 13px;
  }
  
  .page-info {
    margin-left: 8px;
    padding-left: 8px;
    font-size: 12px;
  }
}
</style>
