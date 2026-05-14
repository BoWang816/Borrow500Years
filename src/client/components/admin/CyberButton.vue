<template>
  <button 
    :class="['cyber-btn', variant, { loading: loading }]" 
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <i v-if="icon && !loading" :class="icon"></i>
    <i v-if="loading" class="fas fa-spinner fa-spin"></i>
    <span v-if="$slots.default"><slot></slot></span>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'secondary' | 'danger' | 'success'
  icon?: string
  loading?: boolean
  disabled?: boolean
}>()

defineEmits<{
  click: [event: MouseEvent]
}>()
</script>

<style scoped>
.cyber-btn {
  padding: 0.5rem 1.25rem;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s;
  border: 1px solid;
  font-weight: 500;
}

.cyber-btn.primary {
  background: linear-gradient(135deg, rgba(78, 205, 196, 0.2) 0%, rgba(68, 160, 141, 0.2) 100%);
  border-color: #4ecdc4;
  color: #4ecdc4;
}

.cyber-btn.primary:hover:not(:disabled) {
  background: linear-gradient(135deg, rgba(78, 205, 196, 0.3) 0%, rgba(68, 160, 141, 0.3) 100%);
  box-shadow: 0 0 15px rgba(78, 205, 196, 0.5);
  transform: translateY(-2px);
}

.cyber-btn.secondary {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.8);
}

.cyber-btn.secondary:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
}

.cyber-btn.danger {
  background: linear-gradient(135deg, rgba(255, 107, 107, 0.2) 0%, rgba(255, 77, 109, 0.2) 100%);
  border-color: #ff6b6b;
  color: #ff6b6b;
}

.cyber-btn.danger:hover:not(:disabled) {
  background: linear-gradient(135deg, rgba(255, 107, 107, 0.3) 0%, rgba(255, 77, 109, 0.3) 100%);
  box-shadow: 0 0 15px rgba(255, 107, 107, 0.5);
}

.cyber-btn.success {
  background: linear-gradient(135deg, rgba(46, 213, 115, 0.2) 0%, rgba(0, 184, 148, 0.2) 100%);
  border-color: #2ed573;
  color: #2ed573;
}

.cyber-btn.success:hover:not(:disabled) {
  background: linear-gradient(135deg, rgba(46, 213, 115, 0.3) 0%, rgba(0, 184, 148, 0.3) 100%);
  box-shadow: 0 0 15px rgba(46, 213, 115, 0.5);
}

.cyber-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cyber-btn.loading {
  pointer-events: none;
}
</style>
