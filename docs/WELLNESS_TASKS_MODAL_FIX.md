# 养生任务模块Modal优化总结

## 优化内容

将养生任务管理模块的弹窗从自定义的 `modal-overlay` 改为使用统一的 `Modal` 组件，与其他管理模块保持一致。

## 修改前后对比

### 修改前
- 使用自定义的 `.modal-overlay` 和 `.modal-content`
- 使用 `.task-form` 和 `.form-row` 布局
- 使用 `.btn-cancel` 和 `.btn-submit` 按钮
- 使用 `showCreateForm` 和 `editingTask` 两个状态控制显示
- 使用 `alert()` 显示错误信息

### 修改后
- ✅ 使用统一的 `Modal` 组件
- ✅ 使用 `.modal-form` 和 `.form-grid` 布局（与其他模块一致）
- ✅ 使用 `.btn-secondary` 和 `.btn-success` 按钮（与其他模块一致）
- ✅ 使用 `showModal` 单一状态控制显示
- ✅ 使用 `toast()` 显示成功/错误信息

## 具体改动

### 1. 页面结构统一

**改为使用标准的card布局：**
```vue
<div class="admin-wellness-tasks">
  <div class="card">
    <div class="card-header">
      <h3><i class="fas fa-spa"></i> 养生任务管理</h3>
      <button @click="openCreateModal" class="btn-primary">
        <i class="fas fa-plus"></i> 新建任务
      </button>
    </div>
    
    <div class="admin-list">
      <!-- 列表项 -->
    </div>
  </div>
</div>
```

### 2. 列表项结构统一

**改为使用标准的admin-item布局：**
```vue
<div class="admin-item">
  <span class="item-emoji">{{ task.emoji }}</span>
  <div class="item-content">
    <div class="item-header">
      <span class="item-name">{{ task.name }}</span>
      <span class="item-badge">{{ task.is_active ? '启用' : '禁用' }}</span>
      <span class="item-id">({{ task.task_key }})</span>
    </div>
    <div class="item-desc">{{ task.description }}</div>
    <div class="item-meta">
      <!-- 元信息标签 -->
    </div>
  </div>
  <div class="item-actions">
    <button class="btn-edit"><i class="fas fa-edit"></i></button>
    <button class="btn-delete"><i class="fas fa-trash"></i></button>
  </div>
</div>
```

### 3. Modal组件统一

**改为使用统一的Modal组件：**
```vue
<Modal v-model="showModal" :title="editingTask ? '编辑养生任务' : '新建养生任务'" size="large">
  <div class="modal-form">
    <div class="form-grid">
      <!-- 表单项 -->
    </div>
  </div>
  
  <template #footer>
    <button @click="showModal = false" class="btn-secondary">
      <i class="fas fa-times"></i> 取消
    </button>
    <button @click="saveTask" class="btn-success" :disabled="loading">
      <i class="fas fa-save"></i> {{ editingTask ? '保存' : '创建' }}
    </button>
  </template>
</Modal>
```

### 4. 表单布局统一

**改为使用form-grid布局：**
```vue
<div class="form-grid">
  <div class="form-item">
    <label>任务键名 *</label>
    <input v-model="formData.taskKey" placeholder="例如: ziwu" />
  </div>
  <!-- 更多表单项 -->
</div>
<div class="form-item full-width">
  <label>任务描述 *</label>
  <textarea v-model="formData.description" rows="3"></textarea>
</div>
```

### 5. 函数命名统一

**改为使用统一的函数命名：**
- `showCreateForm` → `showModal`
- `closeForm()` → `resetForm()` + `showModal = false`
- `submitForm()` → `saveTask()`
- 添加 `openCreateModal()` 和 `openEditModal()`

### 6. 错误处理统一

**改为使用toast提示：**
```typescript
// 修改前
alert(err.message || '操作失败')

// 修改后
toast(err.message || '操作失败', 'bad')
toast('养生任务创建成功', 'good')
```

### 7. 导入组件统一

**添加统一的组件导入：**
```typescript
import { api, toast } from '../../utils/api'
import Modal from '../../components/Modal.vue'
```

## 样式改进

### 元信息标签
使用统一的meta标签样式：
```vue
<div class="item-meta">
  <span class="meta-success">
    <i class="fas fa-hourglass"></i>
    寿命: {{ formatLife(task.life_reward) }}
  </span>
  <span class="meta-info">
    <i class="fas fa-gem"></i>
    功德: {{ task.merit_reward }}
  </span>
  <span class="meta-warning">
    <i class="fas fa-star"></i>
    碎片: {{ task.shard_reward }}
  </span>
  <span class="meta-special">
    <i class="fas fa-coins"></i>
    复活币: {{ task.coin_reward }}
  </span>
</div>
```

### 按钮样式
使用统一的图标按钮：
```vue
<button class="btn-edit" title="编辑">
  <i class="fas fa-edit"></i>
</button>
<button class="btn-delete" title="删除">
  <i class="fas fa-trash"></i>
</button>
```

## 优势

1. **视觉一致性** - 与其他管理模块完全一致的外观
2. **代码一致性** - 使用相同的组件和命名规范
3. **维护性提升** - 统一的代码结构更易维护
4. **用户体验** - 统一的交互模式降低学习成本
5. **样式复用** - 使用统一的CSS样式，减少重复代码

## 构建状态

```
✓ 85 modules transformed
✓ built in 2.58s (client)
✓ built in 751ms (server)
```

- ✅ 编译成功
- ✅ 无TypeScript错误
- ✅ Modal样式正常
- ✅ 表单布局正常
- ✅ 按钮样式统一

## 测试清单

- [x] 新建按钮在右上角
- [x] 点击新建打开Modal
- [x] Modal标题正确显示
- [x] 表单布局与其他模块一致
- [x] 表单项正确显示
- [x] 编辑按钮打开Modal并填充数据
- [x] 保存按钮功能正常
- [x] 取消按钮关闭Modal
- [x] 删除按钮功能正常
- [x] Toast提示正常显示
- [x] 列表项样式与其他模块一致
- [x] 元信息标签颜色正确

## 相关文件

- `src/client/views/admin/AdminWellnessTasks.vue` - 养生任务管理页面
- `src/client/components/Modal.vue` - 统一的Modal组件
- `src/client/views/admin/admin-form-styles.css` - 统一的表单样式
- `src/client/utils/api.ts` - API工具和toast函数

## 现在所有管理模块都使用统一的样式！

1. ✅ AdminEvents.vue - 全服事件管理
2. ✅ AdminPotionsConfig.vue - 丹药配置管理
3. ✅ AdminManuals.vue - 功法管理
4. ✅ AdminTasks.vue - 修炼项目管理
5. ✅ AdminExplore.vue - 历练项目管理
6. ✅ AdminWellnessTasks.vue - 养生任务管理 ⭐ 新优化
