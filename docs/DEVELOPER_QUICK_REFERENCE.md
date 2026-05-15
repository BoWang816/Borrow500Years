# 开发者快速参考 - 年单位系统

## 核心概念

系统使用**年**作为寿命的基础单位，但数据库仍然存储**秒**以保持向后兼容。

## 转换函数

### 基础转换

```typescript
// src/server/lib.ts
export const SEC_PER_YEAR = 31557600; // 365.25 * 86400

// 秒 → 年
export function secsToYears(secs: number): number {
  return secs / SEC_PER_YEAR;
}

// 年 → 秒
export function yearsToSecs(years: number): number {
  return years * SEC_PER_YEAR;
}
```

### 显示格式化

```typescript
// src/client/utils/api.ts
export function formatLife(years: number): string {
  if (years >= 1) return years.toFixed(2) + ' 年';
  const days = years * 365.25;
  if (days >= 1) return days.toFixed(1) + ' 天';
  const hours = days * 24;
  if (hours >= 1) return hours.toFixed(1) + ' 小时';
  const minutes = hours * 60;
  return minutes.toFixed(0) + ' 分钟';
}
```

## 后端开发规范

### 1. 从数据库读取

```typescript
// ❌ 错误 - 直接使用秒
const life = row.reward_life;

// ✅ 正确 - 转换为年
const lifeYears = secsToYears(row.reward_life);
```

### 2. API返回

```typescript
// ❌ 错误 - 返回秒字段
return {
  rewardLife: row.reward_life
};

// ✅ 正确 - 返回年字段
return {
  rewardLifeYears: secsToYears(row.reward_life)
};
```

### 3. 写入数据库

```typescript
// ❌ 错误 - 直接写入年
await db.prepare(`
  UPDATE table SET reward_life = ?
`).bind(rewardLifeYears).run();

// ✅ 正确 - 转换为秒后写入
await db.prepare(`
  UPDATE table SET reward_life = ?
`).bind(yearsToSecs(rewardLifeYears)).run();
```

### 4. 完整示例

```typescript
// 读取配置
export async function getCultivationPractices(db: D1Database) {
  const result = await db.prepare(`
    SELECT id, name, cost_life, reward_life, realm_id
    FROM cultivation_practices
  `).all();

  return result.results.map(row => ({
    id: row.id,
    name: row.name,
    costLifeYears: secsToYears(row.cost_life),      // 转换为年
    rewardLifeYears: secsToYears(row.reward_life),  // 转换为年
    realmId: row.realm_id
  }));
}

// 创建配置
export async function createPractice(
  db: D1Database,
  data: { costLifeYears: number; rewardLifeYears: number }
) {
  await db.prepare(`
    INSERT INTO cultivation_practices (cost_life, reward_life)
    VALUES (?, ?)
  `).bind(
    yearsToSecs(data.costLifeYears),      // 转换为秒
    yearsToSecs(data.rewardLifeYears)     // 转换为秒
  ).run();
}
```

## 前端开发规范

### 1. 显示数据

```vue
<!-- ❌ 错误 - 直接显示数字 -->
<div>{{ practice.rewardLifeYears }}</div>

<!-- ✅ 正确 - 使用格式化函数 -->
<div>{{ formatYears(practice.rewardLifeYears) }}</div>
```

### 2. 表单输入

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { secsToYears, yearsToSecs } from '@/utils/conversion';

// 表单数据使用年
const form = ref({
  rewardLifeYears: 0
});

// 编辑时：从API获取的年单位直接使用
function editPractice(practice: any) {
  form.value.rewardLifeYears = practice.rewardLifeYears;
}

// 提交时：转换为秒发送给API
async function submit() {
  await api.post('/admin/cultivation-practices', {
    rewardLife: yearsToSecs(form.value.rewardLifeYears)
  });
}
</script>

<template>
  <div>
    <label>奖励寿命（年）</label>
    <input v-model.number="form.rewardLifeYears" type="number" step="0.001" />
    <small>{{ formatYears(form.rewardLifeYears) }}</small>
  </div>
</template>
```

### 3. 格式化函数

```typescript
// 在组件中使用
import { formatYears } from '@/utils/api';

// 或者自定义格式化
function formatYears(years: number): string {
  if (years >= 1) return `${years.toFixed(2)}年`;
  const days = years * 365.25;
  if (days >= 1) return `${days.toFixed(1)}天`;
  const hours = days * 24;
  if (hours >= 1) return `${hours.toFixed(1)}小时`;
  const minutes = hours * 60;
  return `${minutes.toFixed(0)}分钟`;
}
```

## 常见场景

### 场景1：添加新的配置表

```typescript
// 1. 数据库迁移（字段名使用 *_sec）
CREATE TABLE new_config (
  id INTEGER PRIMARY KEY,
  reward_life INTEGER NOT NULL,  -- 存储秒
  cost_life INTEGER NOT NULL      -- 存储秒
);

// 2. 后端API（使用转换函数）
export async function getNewConfig(db: D1Database) {
  const result = await db.prepare(`SELECT * FROM new_config`).all();
  return result.results.map(row => ({
    id: row.id,
    rewardLifeYears: secsToYears(row.reward_life),  // 转换为年
    costLifeYears: secsToYears(row.cost_life)       // 转换为年
  }));
}

// 3. 前端显示（使用格式化函数）
<div>{{ formatYears(config.rewardLifeYears) }}</div>
```

### 场景2：用户获得寿命奖励

```typescript
// 后端处理
export async function giveReward(db: D1Database, userId: number, rewardYears: number) {
  const rewardSecs = yearsToSecs(rewardYears);  // 转换为秒
  
  await db.prepare(`
    UPDATE users 
    SET bonus_sec = bonus_sec + ?,
        total_gained_sec = total_gained_sec + ?
    WHERE id = ?
  `).bind(rewardSecs, rewardSecs, userId).run();
  
  // 记录日志
  await db.prepare(`
    INSERT INTO event_logs (user_id, event_type, life_change)
    VALUES (?, ?, ?)
  `).bind(userId, 'reward', rewardSecs).run();
}
```

### 场景3：计算剩余寿命

```typescript
// 后端计算
export function currentLifeYears(user: any): number {
  const elapsedYears = (Date.now() - user.start_timestamp) / 1000 / SEC_PER_YEAR;
  const baseDecay = baseDecayMultiplier(user);
  const initialYears = secsToYears(user.initial_life_sec);
  const bonusYears = secsToYears(user.bonus_sec);
  
  return initialYears + bonusYears - elapsedYears * baseDecay;
}
```

## 数值参考

### 常用转换

| 年 | 秒 | 说明 |
|----|----|----|
| 0.0001年 | 3,156秒 | 约52.8分钟 |
| 0.001年 | 31,558秒 | 约8.8小时 |
| 0.01年 | 315,576秒 | 约3.65天 |
| 0.1年 | 3,155,760秒 | 约36.5天 |
| 1年 | 31,557,600秒 | 365.25天 |
| 10年 | 315,576,000秒 | |
| 100年 | 3,155,760,000秒 | |
| 1000年 | 31,557,600,000秒 | |

### 境界对应数值范围

| 境界阶段 | 修炼奖励 | 丹药奖励 | 历练奖励 |
|---------|---------|---------|---------|
| 凡蜕期（1-5） | 0.01-0.5年 | 0.01-1年 | 0.001-0.5年 |
| 超凡期（6-9） | 0.5-5年 | 1-10年 | 0.5-5年 |
| 化境期（10-14） | 5-50年 | 10-100年 | 5-50年 |
| 极境期（15-18） | 50-500年 | 100-1000年 | 50-500年 |
| 道极期（19-20） | 500-5000年 | 1000-10000年 | 500-5000年 |

## 调试技巧

### 1. 检查转换是否正确

```typescript
// 在浏览器控制台或Node.js中测试
const SEC_PER_YEAR = 31557600;
const secsToYears = (s) => s / SEC_PER_YEAR;
const yearsToSecs = (y) => y * SEC_PER_YEAR;

// 测试往返转换
const years = 1;
const secs = yearsToSecs(years);
const backToYears = secsToYears(secs);
console.log({ years, secs, backToYears }); // 应该相等
```

### 2. 验证数据库数值

```sql
-- 查看原始秒值
SELECT id, name, reward_life FROM cultivation_practices;

-- 查看转换后的年值
SELECT 
  id, 
  name, 
  reward_life,
  CAST(reward_life AS REAL) / 31557600 as reward_years
FROM cultivation_practices;
```

### 3. 前端调试

```typescript
// 在组件中添加调试信息
console.log('原始数据（年）:', practice.rewardLifeYears);
console.log('格式化显示:', formatYears(practice.rewardLifeYears));
console.log('转换为秒:', yearsToSecs(practice.rewardLifeYears));
```

## 常见错误

### ❌ 错误1：忘记转换

```typescript
// 错误：直接使用数据库的秒值
const life = row.reward_life; // 这是秒！
return { rewardLife: life };  // 前端会显示很大的数字
```

### ❌ 错误2：重复转换

```typescript
// 错误：API已经返回年，又转换一次
const lifeYears = secsToYears(practice.rewardLifeYears); // 错误！
```

### ❌ 错误3：字段命名不一致

```typescript
// 错误：字段名没有表明单位
return {
  rewardLife: secsToYears(row.reward_life) // 应该叫 rewardLifeYears
};
```

## 最佳实践

1. **命名规范**
   - 数据库字段：`*_sec`（如 `reward_life`）
   - API返回字段：`*Years`（如 `rewardLifeYears`）
   - 前端变量：`*Years`（如 `rewardLifeYears`）

2. **类型安全**
   - 使用TypeScript类型定义
   - 明确标注单位（秒/年）

3. **一致性**
   - 所有新功能都使用年单位
   - 保持转换函数的使用一致

4. **文档**
   - 在代码注释中说明单位
   - 在API文档中标明返回值单位

## 相关文档

- [最终完成总结](./FINAL_COMPLETE_SUMMARY.md)
- [数据库数值更新](./DATABASE_VALUES_UPDATE_COMPLETE.md)
- [管理页面转换](./ADMIN_PAGES_CONVERSION_COMPLETE.md)
- [测试清单](./TESTING_CHECKLIST.md)
