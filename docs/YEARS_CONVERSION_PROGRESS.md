# 寿命单位转换进度报告

## 已完成 ✅

### 1. 数据库迁移
- ✅ 创建 `migrations/0025_convert_to_years.sql`
- ✅ 所有表的寿命字段从秒转换为年

### 2. 核心库
- ✅ `src/server/lib.ts`
  - 添加 `YEARS_PER_DAY` 常量
  - `currentLifeSec()` → `currentLifeYears()`
  - 更新 `formatLife()` 接受年参数
  - 更新 `getRealmByAge()` 直接使用年

### 3. 类型定义
- ✅ `src/server/types.ts`
  - Profile 类型字段更新

### 4. 后端API模块
- ✅ `src/server/api/modules/profile.ts` - 开启命盘
- ✅ `src/server/api/modules/state.ts` - 状态查询
- ✅ `src/server/api/modules/tasks.ts` - 养生任务
- ✅ `src/server/api/modules/achievements.ts` - 成就系统

## 待完成 ⏳

### 后端API模块（剩余）

1. **src/server/api/modules/cultivation.ts**
   - 修炼功法消耗和奖励
   - 更新 `bonus_years`, `total_gained_years`
   - 更新 `cost_life`, `reward_life` 字段

2. **src/server/api/modules/potions.ts**
   - 丹药即时寿命奖励
   - 更新 `instant_life` 字段
   - 更新 `bonus_years`, `total_gained_years`

3. **src/server/api/modules/explore.ts**
   - 秘境探险奖励
   - 更新 `life_reward` 字段
   - 更新 `bonus_years`, `total_gained_years`

4. **src/server/api/modules/extra-tasks.ts**
   - 历练项目奖励
   - 更新 `life_reward` 字段
   - 更新 `bonus_years`, `total_gained_years`

5. **src/server/api/modules/revive.ts**
   - 复活逻辑
   - 更新 `initial_life_years`, `bonus_years`

6. **src/server/api/modules/board.ts**
   - 排行榜计算
   - 更新所有寿命字段显示

7. **src/server/api/modules/tribulation.ts**
   - 天劫奖励/惩罚
   - 更新 `bonus_years`, `total_gained_years`

8. **src/server/api/modules/admin.ts**
   - 所有配置表的CRUD
   - wellness_tasks_config
   - potions_config
   - cultivation_practices
   - extra_tasks_config
   - explore_loot_config

### 前端组件（全部待更新）

1. **用户相关**
   - `src/client/views/Profile.vue`
   - `src/client/views/Dashboard.vue`

2. **功能页面**
   - `src/client/views/Cultivation.vue`
   - `src/client/views/Wellness.vue`
   - `src/client/views/Adventure.vue`
   - `src/client/views/Inventory.vue`
   - `src/client/views/Leaderboard.vue`

3. **管理后台**
   - `src/client/views/admin/AdminWellness.vue`
   - `src/client/views/admin/AdminPotions.vue`
   - `src/client/views/admin/AdminCultivation.vue`
   - `src/client/views/admin/AdminExtraTasks.vue`
   - `src/client/views/admin/AdminExplore.vue`

### 数据库操作

1. **运行迁移**
   ```bash
   wrangler d1 execute DB --local --file=migrations/0025_convert_to_years.sql
   ```

2. **验证数据**
   - 检查转换后的数值是否合理
   - 验证所有功能正常工作

## 转换常量

```typescript
// 在需要的地方使用这些常量
const MINUTES_TO_YEARS = 1 / (365.25 * 24 * 60)  // ≈ 0.0000019
const HOURS_TO_YEARS = 1 / (365.25 * 24)          // ≈ 0.000114
const DAYS_TO_YEARS = 1 / 365.25                  // ≈ 0.00274
```

## 关键变更点

### 数据库字段
- `initial_life_sec` → `initial_life_years`
- `bonus_sec` → `bonus_years`
- `total_gained_sec` → `total_gained_years`
- 所有配置表的 `life_reward` 从秒改为年
- 所有配置表的 `cost_life` 从秒改为年

### API响应字段
- `initialLifeSec` → `initialLifeYears`
- `bonusSec` → `bonusYears`
- `totalGainedSec` → `totalGainedYears`
- `lifeSec` → `lifeYears`
- `gainedSec` → `gainedYears`

### 计算逻辑
- 所有寿命计算使用年为单位
- `formatLife()` 函数接受年，智能显示单位
- 衰减率应用到年而不是秒

## 下一步行动

1. 继续更新剩余的后端API模块（cultivation, potions, explore, extra-tasks, revive, board, tribulation, admin）
2. 更新所有前端组件
3. 运行数据库迁移
4. 全面测试所有功能
5. 更新相关文档

## 注意事项

- 持续时间（dur）仍然使用秒
- 时间戳仍然使用毫秒
- 衰减率计算逻辑不变
- 前端需要同步更新字段名称
