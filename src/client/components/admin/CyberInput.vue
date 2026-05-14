<template>
  <div class="cyber-input-wrapper">
    <label v-if="label" class="input-label">{{ label }}</label>
    <div class="input-container">
      <i v-if="icon" :class="['input-icon', icon]"></i>
      <input
        v-if="type !== 'textarea'"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        class="cyber-input"
      />
      <textarea
        v-else
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :rows="rows"
        @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
        class="cyber-input cyber-textarea"
      ></textarea>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string | number
  label?: string
  type?: string
  placeholder?: string
  icon?: string
  disabled?: boolean
  rows?: number
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<style scoped>
.cyber-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  font-weight: 500;
}

.input-container {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(78, 205, 196, 0.5);
  pointer-events: none;
}

.cyber-input {
  width: 100%;
  padding: 0.75rem 1rem;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(78, 205, 196, 0.2);
  border-radius: 4px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
  transition: all 0.3s;
}

.input-container .input-icon + .cyber-input {
  padding-left: 2.75rem;
}

.cyber-input:focus {
  outline: none;
  border-color: #4ecdc4;
  box-shadow: 0 0 10px rgba(78, 205, 196, 0.3);
}

.cyber-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cyber-input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.cyber-textarea {
  resize: vertical;
  min-height: 100px;
}
</style>
