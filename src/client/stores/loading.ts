import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useLoadingStore = defineStore('loading', () => {
  const isLoading = ref(false)
  const message = ref('')
  const loadingCount = ref(0)

  function show(msg = '') {
    loadingCount.value++
    isLoading.value = true
    message.value = msg
  }

  function hide() {
    loadingCount.value--
    if (loadingCount.value <= 0) {
      loadingCount.value = 0
      isLoading.value = false
      message.value = ''
    }
  }

  function reset() {
    loadingCount.value = 0
    isLoading.value = false
    message.value = ''
  }

  return {
    isLoading,
    message,
    show,
    hide,
    reset
  }
})
