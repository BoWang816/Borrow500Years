<template>
  <Teleport to="body">
    <Transition name="loading-fade">
      <div v-if="loadingStore.isLoading" class="loading-overlay">
        <div class="loading-spinner">
          <div class="spinner-ring"></div>
          <div class="spinner-ring"></div>
          <div class="spinner-ring"></div>
          <p v-if="loadingStore.message" class="loading-message">{{ loadingStore.message }}</p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useLoadingStore } from '../stores/loading'

const loadingStore = useLoadingStore()
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-spinner {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.spinner-ring {
  position: absolute;
  width: 80px;
  height: 80px;
  border: 3px solid transparent;
  border-radius: 50%;
  animation: spin 1.5s cubic-bezier(0.5, 0, 0.5, 1) infinite;
}

.spinner-ring:nth-child(1) {
  border-top-color: var(--jade);
  animation-delay: -0.45s;
}

.spinner-ring:nth-child(2) {
  border-top-color: var(--gold);
  animation-delay: -0.3s;
  width: 64px;
  height: 64px;
  top: 8px;
  left: 8px;
}

.spinner-ring:nth-child(3) {
  border-top-color: rgba(54, 255, 208, 0.5);
  animation-delay: -0.15s;
  width: 48px;
  height: 48px;
  top: 16px;
  left: 16px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-message {
  margin-top: 100px;
  color: var(--jade);
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.loading-fade-enter-active,
.loading-fade-leave-active {
  transition: opacity 0.3s ease;
}

.loading-fade-enter-from,
.loading-fade-leave-to {
  opacity: 0;
}
</style>
