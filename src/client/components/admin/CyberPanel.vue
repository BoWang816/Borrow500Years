<template>
  <div class="cyber-panel">
    <div v-if="title" class="panel-header">
      <h3 class="panel-title">
        <i v-if="icon" :class="icon"></i>
        <span>{{ title }}</span>
      </h3>
      <div v-if="$slots.actions" class="panel-actions">
        <slot name="actions"></slot>
      </div>
    </div>
    <div class="panel-content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title?: string
  icon?: string
}>()
</script>

<style scoped>
.cyber-panel {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(78, 205, 196, 0.2);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(78, 205, 196, 0.1);
  background: rgba(0, 0, 0, 0.2);
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0;
  font-size: 1.1rem;
  color: #4ecdc4;
  font-weight: 500;
}

.panel-title i {
  font-size: 1.2rem;
}

.panel-actions {
  display: flex;
  gap: 0.5rem;
}

.panel-content {
  padding: 1.5rem;
}
</style>
