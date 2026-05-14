<template>
  <div class="cyber-page-header">
    <div class="header-title">
      <h2 class="cyber-title">
        <i v-if="icon" :class="icon"></i>
        <span class="cn">{{ title }}</span>
        <span v-if="subtitle" class="en">{{ subtitle }}</span>
      </h2>
      <p v-if="description" class="header-desc">{{ description }}</p>
    </div>
    <div v-if="$slots.actions" class="header-actions">
      <slot name="actions"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
  description?: string
  icon?: string
}>()
</script>

<style scoped>
.cyber-page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  padding: 1.5rem;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(78, 205, 196, 0.3);
  border-radius: 8px;
  box-shadow: 0 0 20px rgba(78, 205, 196, 0.1);
}

.header-title {
  flex: 1;
}

.cyber-title {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  color: #4ecdc4;
  text-shadow: 0 0 10px rgba(78, 205, 196, 0.5);
}

.cyber-title i {
  font-size: 1.8rem;
}

.cyber-title .cn {
  font-family: 'Chinese-Sans', sans-serif;
  letter-spacing: 0.3rem;
}

.cyber-title .en {
  font-size: 0.7rem;
  color: rgba(78, 205, 196, 0.6);
  letter-spacing: 0.2rem;
  font-weight: 300;
}

.header-desc {
  margin: 0;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.9rem;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}
</style>
