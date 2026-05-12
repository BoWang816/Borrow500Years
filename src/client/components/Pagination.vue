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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 24px;
  padding: 16px;
  background: rgba(0,0,0,0.2);
  border: 1px solid var(--line);
  border-radius: 8px;
}

.page-btn {
  min-width: 36px;
  height: 36px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.3);
  border: 1px solid rgba(212,175,55,0.3);
  border-radius: 4px;
  color: var(--ink);
  font-size: 13px;
  font-family: 'Orbitron', sans-serif;
  cursor: pointer;
  transition: all 0.3s;
}

.page-btn:hover:not(:disabled) {
  background: rgba(212,175,55,0.15);
  border-color: var(--gold);
  box-shadow: 0 0 10px rgba(212,175,55,0.2);
}

.page-btn.active {
  background: rgba(54,255,208,0.15);
  border-color: var(--jade);
  color: var(--jade);
  box-shadow: 0 0 15px rgba(54,255,208,0.3);
}

.page-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 4px;
}

.page-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-left: 12px;
  padding-left: 12px;
  border-left: 1px solid var(--line);
  font-size: 12px;
  color: var(--ink-dim);
  font-family: 'Orbitron', sans-serif;
}

.total-items {
  font-size: 11px;
  color: var(--jade);
  margin-top: 2px;
}

@media (max-width: 768px) {
  .pagination {
    flex-wrap: wrap;
  }
  
  .page-info {
    width: 100%;
    margin-left: 0;
    padding-left: 0;
    border-left: none;
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid var(--line);
  }
}
</style>
