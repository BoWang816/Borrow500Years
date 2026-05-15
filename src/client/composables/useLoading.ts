import { useLoadingStore } from '../stores/loading'

export function useLoading() {
  const loadingStore = useLoadingStore()

  /**
   * 包装异步函数，自动显示loading
   */
  async function withLoading<T>(
    fn: () => Promise<T>,
    message = ''
  ): Promise<T> {
    loadingStore.show(message)
    try {
      return await fn()
    } finally {
      loadingStore.hide()
    }
  }

  return {
    show: loadingStore.show,
    hide: loadingStore.hide,
    reset: loadingStore.reset,
    withLoading
  }
}
