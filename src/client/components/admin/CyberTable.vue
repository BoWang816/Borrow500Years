<template>
  <div class="cyber-table-container">
    <table class="cyber-table">
      <thead>
        <tr>
          <th v-for="column in columns" :key="column.key" :style="{ width: column.width }">
            {{ column.label }}
          </th>
          <th v-if="$slots.actions" class="actions-col">操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="data.length === 0">
          <td :colspan="columns.length + ($slots.actions ? 1 : 0)" class="empty-row">
            <div class="empty-state">
              <i class="fas fa-inbox"></i>
              <span>{{ emptyText || '暂无数据' }}</span>
            </div>
          </td>
        </tr>
        <tr v-for="(row, index) in data" :key="index">
          <td v-for="column in columns" :key="column.key">
            <slot :name="`cell-${column.key}`" :row="row" :value="row[column.key]">
              {{ row[column.key] }}
            </slot>
          </td>
          <td v-if="$slots.actions" class="actions-col">
            <slot name="actions" :row="row" :index="index"></slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  columns: Array<{ key: string; label: string; width?: string }>
  data: Array<any>
  emptyText?: string
}>()
</script>

<style scoped>
.cyber-table-container {
  overflow-x: auto;
  border-radius: 6px;
  border: 1px solid rgba(78, 205, 196, 0.1);
}

.cyber-table {
  width: 100%;
  border-collapse: collapse;
  background: rgba(0, 0, 0, 0.3);
}

.cyber-table thead {
  background: rgba(0, 0, 0, 0.4);
}

.cyber-table th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #4ecdc4;
  border-bottom: 2px solid rgba(78, 205, 196, 0.3);
  font-size: 0.9rem;
}

.cyber-table td {
  padding: 1rem;
  border-bottom: 1px solid rgba(78, 205, 196, 0.1);
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

.cyber-table tbody tr {
  transition: all 0.2s;
}

.cyber-table tbody tr:hover {
  background: rgba(78, 205, 196, 0.05);
}

.actions-col {
  text-align: right;
  white-space: nowrap;
}

.empty-row {
  padding: 0 !important;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  gap: 0.75rem;
  color: rgba(255, 255, 255, 0.3);
}

.empty-state i {
  font-size: 2.5rem;
}
</style>
