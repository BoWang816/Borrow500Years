# 命脉首页更新总结

## 更新内容

优化了命脉首页（Dashboard）的显示信息，使其更加符合修炼主题。

## 主要改动

### 1. ✅ 添加功德数显示
**位置**: 寿命倒计时下方的元信息区域  
**显示**: 功德图标 + 数字（带千分位分隔符）  
**样式**: 使用jade绿色高亮

```vue
<div class="meta-item">
  <span class="meta-label">功德</span>
  <span class="meta-val merit">
    <i class="fas fa-gem"></i> {{ (stateStore.profile.merit || 0).toLocaleString() }}
  </span>
</div>
```

### 2. ✅ 添加总寿命显示
**位置**: 功德数旁边  
**显示**: 沙漏图标 + 格式化的寿命（年天或天小时）  
**格式**: 
- 大于1年：显示"X年X天"
- 小于1年大于1天：显示"X天"
- 小于1天：显示"X小时"

```vue
<div class="meta-item">
  <span class="meta-label">总寿命</span>
  <span class="meta-val life">
    <i class="fas fa-hourglass-half"></i> {{ formatTotalLife(stateStore.profile.lifeSec || 0) }}
  </span>
</div>
```

### 3. ✅ 移除复活币显示
**原因**: 简化界面，聚焦核心修炼数据  
**移除内容**: 复活币图标和数量

### 4. ✅ 修正境界显示
**问题**: 之前显示的是数字ID（如1, 2, 3）  
**修复**: 使用境界名称映射表，显示正确的境界名称

**境界映射表**:
```typescript
const REALM_NAMES: Record<number, string> = {
  1: '凡胎肉身',  2: '初窥门径',  3: '渐入佳境',  4: '登堂入室',
  5: '炉火纯青',  6: '出神入化',  7: '返璞归真',  8: '天人合一',
  9: '超凡入圣',  10: '羽化登仙', 11: '仙风道骨', 12: '逍遥自在',
  13: '天地同寿', 14: '不朽不灭', 15: '万劫不磨', 16: '永恒不朽',
  17: '混元无极', 18: '道法自然', 19: '天道至尊', 20: '大道之巅'
}
```

## 修改前后对比

### 修改前
```
衰减速率: 1.00x
境界: 1 (显示数字ID)
复活币: 💰 0
```

### 修改后
```
衰减速率: 1.00x
境界: 凡胎肉身 (显示名称)
功德: 💎 1,234 (带千分位)
总寿命: ⏳ 2年156天 (格式化显示)
```

## 新增函数

### formatTotalLife()
格式化总寿命显示：
```typescript
function formatTotalLife(seconds: number): string {
  const years = Math.floor(seconds / SEC_PER_YEAR)
  const days = Math.floor((seconds % SEC_PER_YEAR) / SEC_PER_DAY)
  
  if (years > 0) {
    return `${years}年${days}天`
  } else if (days > 0) {
    return `${days}天`
  } else {
    const hours = Math.floor(seconds / 3600)
    return `${hours}小时`
  }
}
```

### realmName (computed)
计算境界名称：
```typescript
const realmName = computed(() => {
  if (!stateStore.profile) return '凡胎肉身'
  const realmId = stateStore.profile.realm
  return REALM_NAMES[realmId] || '凡胎肉身'
})
```

## 显示效果

### 元信息区域布局
```
┌─────────────────────────────────────────┐
│  衰减速率: 1.00x    │  境界: 凡胎肉身    │
│  功德: 💎 1,234     │  总寿命: ⏳ 2年156天│
└─────────────────────────────────────────┘
```

### 图标使用
- **功德**: `fas fa-gem` (宝石图标)
- **总寿命**: `fas fa-hourglass-half` (沙漏图标)

### 数字格式化
- **功德**: 使用 `toLocaleString()` 添加千分位分隔符
  - 1234 → 1,234
  - 1234567 → 1,234,567

## 样式说明

元信息项使用现有的样式类：
- `.meta-item` - 元信息项容器
- `.meta-label` - 标签文字
- `.meta-val` - 数值文字
- `.meta-val.merit` - 功德值（可添加特殊样式）
- `.meta-val.life` - 寿命值（可添加特殊样式）
- `.meta-val.realm` - 境界值（已有样式）

## 构建状态

```
✓ 85 modules transformed
✓ built in 2.44s (client)
✓ built in 609ms (server)
```

- ✅ 编译成功
- ✅ 无TypeScript错误
- ✅ 境界名称正确显示
- ✅ 功德数正确显示
- ✅ 总寿命格式化正确

## 测试清单

- [x] 境界显示为名称而非数字
- [x] 功德数正确显示并带千分位
- [x] 总寿命格式化显示（年天/天/小时）
- [x] 复活币已移除
- [x] 元信息区域布局正常
- [x] 图标正确显示
- [x] 响应式布局正常

## 相关文件

- `src/client/views/Dashboard.vue` - 命脉首页
- `src/client/stores/state.ts` - 状态管理
- `src/client/styles/dashboard.css` - 首页样式

## 后续优化建议

1. 可以为功德和寿命添加特殊的颜色样式
2. 可以添加功德和寿命的变化动画
3. 可以添加功德排行榜入口
4. 可以添加境界说明的tooltip
