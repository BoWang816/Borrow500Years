# 后台管理页面寿命单位转换计划

## 问题描述

后台管理页面中的寿命相关字段仍然使用秒作为单位，显示为天/小时/分钟，需要统一转换为年单位。

## 需要修复的文件

### 1. AdminCultivationPractices.vue（修炼项目管理）
**问题：**
- `reward_life` 字段标签显示"奖励寿命(秒)"
- `formatTime()` 函数显示天/小时/分钟
- 表单输入使用秒

**修复方案：**
- 标签改为"奖励寿命(年)"
- `formatTime()` 改为 `formatYears()` 显示年
- 表单输入改为年，提交时转换为秒

### 2. AdminExplore.vue（历练项目管理）
**问题：**
- `life` 字段标签显示"寿命奖励（秒）"
- `formatLife()` 函数显示天/小时/分钟
- 表单输入使用秒

**修复方案：**
- 标签改为"寿命奖励（年）"
- `formatLife()` 改为 `formatYears()` 显示年
- 表单输入改为年，提交时转换为秒

### 3. AdminPotionsConfig.vue（丹药配置管理）
**问题：**
- `instant_life` 字段标签显示"即时寿命(秒)"
- `formatSeconds()` 函数显示天/小时/分钟
- 表单输入使用秒

**修复方案：**
- 标签改为"即时寿命(年)"
- `formatSeconds()` 改为 `formatYears()` 显示年
- 表单输入改为年，提交时转换为秒

### 4. AdminWellnessTasksUnified.vue（养生任务管理）
**问题：**
- `life_reward` 字段标签显示"寿命奖励（秒）"
- `formatLife()` 函数显示分钟/秒
- 表单输入使用秒

**修复方案：**
- 标签改为"寿命奖励（年）"
- `formatLife()` 改为 `formatYears()` 显示年
- 表单输入改为年，提交时转换为秒

## 统一的转换函数

```typescript
// 秒转年（用于显示）
function secsToYears(secs: number): number {
  const SEC_PER_YEAR = 365.25 * 86400
  return secs / SEC_PER_YEAR
}

// 年转秒（用于提交）
function yearsToSecs(years: number): number {
  const SEC_PER_YEAR = 365.25 * 86400
  return years * SEC_PER_YEAR
}

// 格式化显示年份
function formatYears(years: number): string {
  if (years >= 1) return `${years.toFixed(2)}年`
  const days = years * 365.25
  if (days >= 1) return `${days.toFixed(1)}天`
  const hours = days * 24
  if (hours >= 1) return `${hours.toFixed(1)}小时`
  const minutes = hours * 60
  return `${minutes.toFixed(0)}分钟`
}
```

## 数据流

### 显示数据（从后端到前端）
```
后端返回秒 → secsToYears() → 显示年
```

### 提交数据（从前端到后端）
```
用户输入年 → yearsToSecs() → 提交秒
```

### 编辑数据（从后端到表单）
```
后端返回秒 → secsToYears() → 表单显示年
```

## 实施步骤

1. 在每个文件中添加转换函数
2. 修改显示函数（formatTime/formatLife/formatSeconds → formatYears）
3. 修改表单标签（秒 → 年）
4. 修改表单初始值（从秒转换为年）
5. 修改表单提交（从年转换为秒）
6. 测试所有CRUD操作

## 注意事项

1. **数据库不变**：数据库仍然存储秒
2. **API不变**：后端API仍然接收和返回秒
3. **仅前端转换**：转换只在前端进行
4. **保持精度**：使用 SEC_PER_YEAR = 365.25 * 86400
5. **智能显示**：根据数值大小选择合适的单位

## 测试清单

- [ ] AdminCultivationPractices - 创建/编辑/显示
- [ ] AdminExplore - 创建/编辑/显示
- [ ] AdminPotionsConfig - 创建/编辑/显示
- [ ] AdminWellnessTasksUnified - 创建/编辑/显示（养生任务）
- [ ] AdminWellnessTasksUnified - 创建/编辑/显示（扩展任务）
