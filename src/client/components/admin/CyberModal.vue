<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="cyber-modal-overlay" @click="handleOverlayClick">
        <div class="cyber-modal" @click.stop>
          <div class="modal-header">
            <h3 class="modal-title">
              <i v-if="icon" :class="icon"></i>
              <span>{{ title }}</span>
            </h3>
            <button class="modal-close" @click="close">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <slot></slot>
          </div>
          <div v-if="$slots.footer" class="modal-footer">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
  title: string
  icon?: string
  closeOnOverlay?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

function close() {
  emit('update:modelValue', false)
}

function handleOverlayClick() {
  if (props.closeOnOverlay !== false) {
    close()
  }
}
</script>

<style scoped>
.cyber-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
}

.cyber-modal {
  background: linear-gradient(135deg, rgba(20, 20, 40, 0.95) 0%, rgba(0, 0, 0, 0.95) 100%);
  border: 1px solid rgba(78, 205, 196, 0.3);
  border-radius: 8px;
  box-shadow: 0 0 40px rgba(78, 205, 196, 0.2);
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(78, 205, 196, 0.2);
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0;
  font-size: 1.2rem;
  color: #4ecdc4;
  font-weight: 500;
}

.modal-close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.3s;
}

.modal-close:hover {
  background: rgba(255, 107, 107, 0.2);
  border-color: #ff6b6b;
  color: #ff6b6b;
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid rgba(78, 205, 196, 0.1);
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

/* 动画 */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s;
}

.modal-enter-active .cyber-modal,
.modal-leave-active .cyber-modal {
  transition: transform 0.3s, opacity 0.3s;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .cyber-modal,
.modal-leave-to .cyber-modal {
  transform: scale(0.9);
  opacity: 0;
}
</style>
