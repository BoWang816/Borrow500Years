# 全局Loading组件使用指南

## 概述
统一的全局Loading组件，用于在API调用或异步操作时显示加载状态。

**设计原则**：
- 默认不自动显示loading（避免多个API并发时闪烁）
- 需要时手动控制
- 提供便捷方法简化使用

## 组件结构

### 1. Loading组件 (`src/client/components/Loading.vue`)
- 全屏遮罩层
- 三环旋转动画
- 可选的加载消息
- 淡入淡出过渡效果

### 2. Loading Store (`src/client/stores/loading.ts`)
- 管理loading状态
- 支持多个并发请求（计数器机制）
- 提供show/hide/reset方法

### 3. API工具 (`src/client/utils/api.ts`)
- `api()` - 普通API调用，不显示loading
- `apiWithLoading()` - 带loading的API调用

### 4. Composable (`src/client/composables/useLoading.ts`)
- 便捷的loading使用方法
- withLoading包装器

## 使用方法

### 方法1: 使用apiWithLoading（推荐用于单个API）

```typescript
import { apiWithLoading } from '../utils/api'

// 带loading的API调用
const data = await apiWithLoading('/users', {}, '加载用户数据...')

// 不带消息
const data = await apiWithLoading('/users')
```

### 方法2: 使用withLoading包装器（推荐用于复杂逻辑）

```vue
<script setup lang="ts">
import { useLoading } from '../composables/useLoading'
import { api } from '../utils/api'

const { withLoading } = useLoading()

async function loadData() {
  await withLoading(async () => {
    // 可以包含多个API调用和其他逻辑
    const users = await api('/users')
    const tasks = await api('/tasks')
    // 处理数据...
  }, '加载数据中...')
}
</script>
```

### 方法3: 手动控制（用于特殊场景）

```vue
<script setup lang="ts">
import { useLoading } from '../composables/useLoading'
import { api } from '../utils/api'

const { show, hide } = useLoading()

async function complexOperation() {
  show('正在处理...')
  try {
    const step1 = await api('/step1')
    // 更新消息
    show('处理第二步...')
    const step2 = await api('/step2')
    // 处理数据
  } catch (error) {
    toast(error.message, 'bad')
  } finally {
    hide()
  }
}
</script>
```

### 方法4: 普通API调用（不显示loading）

```typescript
import { api } from '../utils/api'

// 适用于：
// 1. 页面有多个并发API调用
// 2. 后台静默更新
// 3. 轮询请求
const data = await api('/users')
```

## 使用场景

### 场景1: 页面初始加载（单个主要API）

```vue
<script setup lang="ts">
import { onMounted } from 'vue'
import { apiWithLoading } from '../utils/api'

onMounted(async () => {
  try {
    const data = await apiWithLoading('/dashboard', {}, '加载数据...')
    // 处理数据
  } catch (err) {
    toast(err.message, 'bad')
  }
})
</script>
```

### 场景2: 页面有多个并发API（不显示loading）

```vue
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { api } from '../utils/api'

const loading = ref(true)

onMounted(async () => {
  try {
    // 多个API并发，使用本地loading状态
    const [users, tasks, events] = await Promise.all([
      api('/users'),
      api('/tasks'),
      api('/events')
    ])
    // 处理数据
  } catch (err) {
    toast(err.message, 'bad')
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div v-if="loading" class="local-loading">加载中...</div>
  <div v-else>
    <!-- 内容 -->
  </div>
</template>
```

### 场景3: 用户操作（表单提交、删除等）

```vue
<script setup lang="ts">
import { useLoading } from '../composables/useLoading'
import { api, toast } from '../utils/api'

const { withLoading } = useLoading()

async function handleSubmit() {
  await withLoading(async () => {
    await api('/users', {
      method: 'POST',
      body: JSON.stringify(formData)
    })
    toast('保存成功', 'good')
  }, '保存中...')
}

async function handleDelete(id: number) {
  if (!confirm('确定删除？')) return
  
  await withLoading(async () => {
    await api(`/users/${id}`, { method: 'DELETE' })
    toast('删除成功', 'good')
    await loadData() // 重新加载
  }, '删除中...')
}
</script>
```

### 场景4: 分步操作

```vue
<script setup lang="ts">
import { useLoading } from '../composables/useLoading'
import { api } from '../utils/api'

const { show, hide } = useLoading()

async function multiStepOperation() {
  try {
    show('步骤1: 验证数据...')
    await api('/validate')
    
    show('步骤2: 处理数据...')
    await api('/process')
    
    show('步骤3: 保存结果...')
    await api('/save')
    
    toast('操作完成', 'good')
  } catch (error) {
    toast(error.message, 'bad')
  } finally {
    hide()
  }
}
</script>
```

## 最佳实践

### ✅ 推荐做法

```typescript
// 1. 单个API调用 - 使用apiWithLoading
const data = await apiWithLoading('/users', {}, '加载中...')

// 2. 复杂逻辑 - 使用withLoading
await withLoading(async () => {
  const data1 = await api('/api1')
  const data2 = await api('/api2')
  processData(data1, data2)
}, '处理中...')

// 3. 多个并发API - 不显示全局loading
const loading = ref(true)
const [data1, data2] = await Promise.all([
  api('/api1'),
  api('/api2')
])
loading.value = false

// 4. 后台静默操作 - 不显示loading
await api('/background-sync')
```

### ❌ 避免的做法

```typescript
// ❌ 不要在循环中显示loading
for (const item of items) {
  await apiWithLoading(`/process/${item.id}`) // 会闪烁！
}

// ✅ 应该这样
await withLoading(async () => {
  for (const item of items) {
    await api(`/process/${item.id}`)
  }
}, '批量处理中...')

// ❌ 不要嵌套loading
await withLoading(async () => {
  await apiWithLoading('/data') // 嵌套了！
})

// ✅ 应该这样
await withLoading(async () => {
  await api('/data')
})
```

## 特性

### 1. 并发请求支持
Loading组件使用计数器机制：

```typescript
show() // count: 0 -> 1, loading显示
show() // count: 1 -> 2, loading继续显示
hide() // count: 2 -> 1, loading继续显示
hide() // count: 1 -> 0, loading隐藏
```

### 2. 动态消息更新

```typescript
const { show } = useLoading()

show('加载中...')
// 可以更新消息
show('处理中...')
show('保存中...')
```

### 3. 强制重置

```typescript
// 在错误情况下强制重置
loadingStore.reset()
```

## API参考

### api(endpoint, options)
普通API调用，不显示loading

```typescript
api(endpoint: string, options?: RequestInit): Promise<any>
```

### apiWithLoading(endpoint, options, message)
带loading的API调用

```typescript
apiWithLoading(
  endpoint: string, 
  options?: RequestInit, 
  message?: string
): Promise<any>
```

### useLoading()
Loading composable

```typescript
const { show, hide, reset, withLoading } = useLoading()

show(message?: string): void
hide(): void
reset(): void
withLoading<T>(fn: () => Promise<T>, message?: string): Promise<T>
```

## 完成时间
2026-05-15
