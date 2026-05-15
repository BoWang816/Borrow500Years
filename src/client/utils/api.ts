import { useLoadingStore } from '../stores/loading'

export async function api(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token')
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers
  })

  if (!response.ok) {
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }))
      throw new Error(error.error || `HTTP ${response.status}`)
    } else {
      // 如果返回的不是JSON，可能是HTML错误页面
      const text = await response.text()
      console.error('API返回非JSON响应:', text.substring(0, 200))
      throw new Error(`API请求失败 (HTTP ${response.status})`)
    }
  }

  const contentType = response.headers.get('content-type')
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text()
    console.error('API返回非JSON响应:', text.substring(0, 200))
    throw new Error('API返回格式错误')
  }

  return response.json()
}

/**
 * 带loading的API调用
 */
export async function apiWithLoading(endpoint: string, options: RequestInit = {}, message = '') {
  const loadingStore = useLoadingStore()
  loadingStore.show(message)
  
  try {
    return await api(endpoint, options)
  } finally {
    loadingStore.hide()
  }
}

export function formatLife(years: number): string {
  const SEC_PER_YEAR = 31557600
  const SEC_PER_DAY = 86400
  
  // 如果输入的是年
  if (years >= 1) {
    return `${years.toFixed(2)}年`
  }
  
  // 转换为秒进行计算
  const seconds = years * SEC_PER_YEAR
  
  if (seconds < 60) return `${Math.floor(seconds)}秒`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}分钟`
  if (seconds < SEC_PER_DAY) return `${Math.floor(seconds / 3600)}小时`
  return `${Math.floor(seconds / SEC_PER_DAY)}天`
}

export function toast(message: string, type: 'good' | 'bad' | 'gold' = 'good') {
  // Simple toast implementation - can be enhanced with a toast library
  const toast = document.createElement('div')
  toast.className = `toast toast-${type}`
  toast.textContent = message
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 24px;
    background: ${type === 'good' ? '#36ffd0' : type === 'bad' ? '#ff4757' : '#d4af37'};
    color: #0a0e1a;
    border-radius: 8px;
    font-weight: 600;
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `
  document.body.appendChild(toast)
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease'
    setTimeout(() => toast.remove(), 300)
  }, 3000)
}
