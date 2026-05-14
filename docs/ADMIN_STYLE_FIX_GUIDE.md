# 后台管理页面样式统一指南

## 问题
平台概览和境界管理页面的背景颜色和表格风格与丹药配置页面不一致。

## 解决方案

### 1. 使用统一的HTML结构

参考丹药配置页面（AdminPotionsConfig.vue）的结构：

```vue
<template>
  <div class="admin-xxx">
    <!-- 统计卡片（可选） -->
    <div class="stats-grid">
      <div class="stat-card card">
        <div class="stat-icon"><i class="fas fa-icon"></i></div>
        <div class="stat-value">{{ value }}</div>
        <div class="stat-label">标签</div>
      </div>
    </div>

    <!-- 主内容卡片 -->
    <div class="card">
      <div class="card-header">
        <h3><i class="fas fa-icon"></i> 标题</h3>
        <button @click="action" class="btn-primary">
          <i class="fas fa-plus"></i> 新建
        </button>
      </div>

      <!-- 列表 -->
      <div class="admin-list">
        <div v-for="item in items" :key="item.id" class="admin-item">
          <span class="item-emoji">{{ item.emoji }}</span>
          <div class="item-content">
            <div class="item-header">
              <span class="item-name">{{ item.name }}</span>
              <span class="item-badge active">状态</span>
              <span class="item-id">#{{ item.id }}</span>
            </div>
            <div class="item-meta">
              <span><i class="fas fa-icon"></i> 信息</span>
            </div>
          </div>
          <div class="item-actions">
            <button class="btn-edit"><i class="fas fa-edit"></i></button>
            <button class="btn-delete"><i class="fas fa-trash"></i></button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
```

### 2. 使用统一的样式文件

```vue
<style scoped src="./admin-form-styles.css"></style>
```

### 3. 关键CSS类说明

#### 容器类
- `.admin-xxx` - 页面根容器
- `.card` - 卡片容器
- `.card-header` - 卡片头部

#### 列表类
- `.admin-list` - 列表容器
- `.admin-item` - 列表项
- `.item-emoji` - 图标/emoji
- `.item-content` - 内容区域
- `.item-header` - 项目头部
- `.item-name` - 项目名称
- `.item-badge` - 状态徽章
- `.item-id` - ID标识
- `.item-meta` - 元信息
- `.item-actions` - 操作按钮组

#### 按钮类
- `.btn-primary` - 主按钮（青金渐变）
- `.btn-secondary` - 次要按钮（灰色）
- `.btn-success` - 成功按钮（青金渐变）
- `.btn-edit` - 编辑按钮（青色）
- `.btn-warning` - 警告按钮（橙色）
- `.btn-delete` - 删除按钮（红色）

#### 表单类
- `.form-item` - 表单项
- `.form-grid` - 表单网格
- `.form-hint` - 提示文字

### 4. 平台概览页面修改要点

#### 修改前（错误）
```vue
<div class="users-list">
  <div class="admin-item">
    <div class="user-main-info">
      <div class="user-avatar">...</div>
      <div class="user-details">...</div>
    </div>
    <div class="user-actions">...</div>
  </div>
</div>
```

#### 修改后（正确）
```vue
<div class="admin-list">
  <div class="admin-item">
    <span class="item-emoji">
      <i class="fas fa-user-circle"></i>
    </span>
    <div class="item-content">
      <div class="item-header">
        <span class="item-name">用户名</span>
        <span class="item-badge">状态</span>
      </div>
      <div class="item-meta">
        <span>信息</span>
      </div>
    </div>
    <div class="item-actions">
      <button class="btn-edit">...</button>
      <button class="btn-delete">...</button>
    </div>
  </div>
</div>
```

### 5. 按钮样式修改

#### 修改前
```vue
<button class="btn-create">新建</button>
<button class="btn-icon btn-edit">编辑</button>
```

#### 修改后
```vue
<button class="btn-primary">新建</button>
<button class="btn-edit">编辑</button>
```

### 6. 表单样式修改

#### 修改前
```vue
<div class="form-group">
  <label>标签</label>
  <input class="form-input" />
</div>
```

#### 修改后
```vue
<div class="form-item">
  <label>标签</label>
  <input />
</div>
```

### 7. 统一的颜色变量

确保使用CSS变量：
- `var(--jade)` - 青色 #36ffd0
- `var(--gold)` - 金色 #d4af37
- `var(--gold-soft)` - 柔和金色
- `var(--crimson)` - 红色 #ff4d6d
- `var(--ink)` - 墨色（浅）
- `var(--ink-dim)` - 墨色（暗）
- `var(--line)` - 线条色
- `var(--panel)` - 面板背景

### 8. 检查清单

- [ ] 使用 `.admin-list` 而不是自定义列表类
- [ ] 使用 `.admin-item` 标准结构
- [ ] 使用 `.item-emoji` 显示图标
- [ ] 使用 `.item-content` 包裹内容
- [ ] 使用 `.item-header` 和 `.item-meta` 组织信息
- [ ] 使用标准按钮类（btn-primary, btn-edit等）
- [ ] 使用 `.form-item` 而不是 `.form-group`
- [ ] 引用 `admin-form-styles.css`
- [ ] 移除自定义的重复样式

### 9. 完整示例

参考文件：
- `src/client/views/admin/AdminPotionsConfig.vue` - 丹药配置（标准）
- `src/client/views/admin/AdminEvents.vue` - 全服事件
- `src/client/views/admin/AdminManuals.vue` - 功法管理
- `src/client/styles/admin.css` - 基础样式
- `src/client/views/admin/admin-form-styles.css` - 表单样式

## 实施步骤

1. 备份当前文件
2. 修改HTML结构，使用标准类名
3. 移除自定义样式
4. 引用 `admin-form-styles.css`
5. 测试页面显示效果
6. 调整特定页面的额外样式（如有需要）

## 注意事项

- 不要创建新的列表结构类，使用现有的 `.admin-list` 和 `.admin-item`
- 不要重复定义按钮样式，使用现有的按钮类
- 保持与丹药配置页面完全一致的视觉效果
- 特殊需求可以在 `<style scoped>` 中添加，但要最小化
