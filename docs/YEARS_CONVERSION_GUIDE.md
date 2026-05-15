# 寿命单位转换指南

## 概述
将整个系统的寿命单位从秒改为年，这是一个重大的系统调整。

## 数据库变更

### 迁移文件
- `migrations/0025_convert_to_years.sql` - 已创建

### 表字段变更
1. **users** 表
   - `initial_life_sec` → `initial_life_years`
   - `bonus_sec` → `bonus_years`
   - `total_gained_sec` → `total_gained_years`

2. **wellness_tasks_config** 表
   - `life_reward` (秒) → `life_reward` (年)

3. **potions_config** 表
   - `instant_life` (秒) → `instant_life` (年)
   - `dur` 保持秒（持续时间）

4. **cultivation_practices** 表
   - `reward_life` (秒) → `reward_life` (年)
   - `cost_life` (秒) → `cost_life` (年)

5. **extra_tasks_config** 表
   - `life_reward` (秒) → `life_reward` (年)

6. **explore_loot_config** 表
   - `life_reward` (秒) → `life_reward` (年)

## 后端代码变更

### src/server/lib.ts
- ✅ 添加 `YEARS_PER_DAY` 常量
- ✅ `currentLifeSec()` → `currentLifeYears()`
- ✅ 更新 `formatLife()` 接受年为参数
- ✅ 更新 `getRealmByAge()` 直接使用年龄

### src/server/types.ts
- ✅ Profile 类型字段更新

### 需要更新的API模块

1. **src/server/api/modules/profile.ts** - ✅ 已更新
   - onboard 接口使用 `initial_life_years`

2. **src/server/api/modules/state.ts**
   - 计算总年龄时使用 `bonus_years`
   - 更新 `initialLifeSec` → `initialLifeYears`

3. **src/server/api/modules/tasks.ts**
   - 计算总年龄使用 `bonus_years`
   - 更新 `bonus_sec` → `bonus_years`
   - 更新 `total_gained_sec` → `total_gained_years`

4. **src/server/api/modules/cultivation.ts**
   - 计算总年龄使用 `bonus_years`
   - 修炼消耗和奖励使用年
   - 更新所有 `bonus_sec` → `bonus_years`

5. **src/server/api/modules/potions.ts**
   - 丹药奖励使用年
   - 更新 `bonus_sec` → `bonus_years`

6. **src/server/api/modules/explore.ts**
   - 探险奖励使用年
   - 更新 `bonus_sec` → `bonus_years`

7. **src/server/api/modules/extra-tasks.ts**
   - 历练奖励使用年
   - 更新 `bonus_sec` → `bonus_years`

8. **src/server/api/modules/revive.ts**
   - 复活时使用 `initial_life_years`
   - 更新 `bonus_sec` → `bonus_years`

9. **src/server/api/modules/board.ts**
   - 排行榜计算使用年
   - 更新所有寿命字段

10. **src/server/api/modules/tribulation.ts**
    - 天劫奖励/惩罚使用年
    - 更新 `bonus_sec` → `bonus_years`

11. **src/server/api/modules/achievements.ts**
    - 计算总年龄使用 `bonus_years`

12. **src/server/api/modules/admin.ts**
    - 管理接口中的配置使用年

## 前端代码变更

### 需要更新的文件
1. **src/client/views/Profile.vue**
   - `initialLifeSec` → `initialLifeYears`

2. **src/client/views/Dashboard.vue**
   - 显示寿命使用年

3. **src/client/views/Cultivation.vue**
   - 修炼奖励显示年

4. **src/client/views/Wellness.vue**
   - 养生奖励显示年

5. **src/client/views/Adventure.vue**
   - 历练奖励显示年

6. **src/client/views/Inventory.vue**
   - 丹药效果显示年

7. **src/client/views/admin/*.vue**
   - 所有管理页面的配置使用年

## 转换比例
- 1 年 = 31,557,600 秒 (365.25 * 24 * 3600)
- 1 天 = 1/365.25 年
- 1 小时 = 1/(365.25 * 24) 年

## 注意事项
1. 持续时间（duration）仍然使用秒，因为这是短期效果
2. 时间戳（timestamp）仍然使用毫秒
3. 所有寿命奖励/消耗改为年
4. 前端显示时可以根据数值大小选择合适的单位（年/天/小时）
