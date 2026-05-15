# 寿命单位转换为年 - 重大系统调整

## 调整原因
修仙系统中寿命应该以年为基础单位，因为：
1. 境界跨度年份很大（从几十年到数千年）
2. 以秒为单位不符合修仙世界观
3. 所有增益效果（功法、丹药、历练、养生）都应该以年为最小单位

## 已完成的工作

### 1. 数据库迁移 ✅
- 创建 `migrations/0025_convert_to_years.sql`
- 转换所有表的寿命字段从秒到年
- 转换比例：1年 = 31,557,600秒

#### 转换的表和字段：
- **users**: `initial_life_sec` → `initial_life_years`, `bonus_sec` → `bonus_years`, `total_gained_sec` → `total_gained_years`
- **wellness_tasks_config**: `life_reward` (秒→年)
- **potions_config**: `instant_life` (秒→年)
- **cultivation_practices**: `reward_life`, `cost_life` (秒→年)
- **extra_tasks_config**: `life_reward` (秒→年)
- **explore_loot_config**: `life_reward` (秒→年)

### 2. 核心库更新 ✅
- **src/server/lib.ts**
  - 添加 `YEARS_PER_DAY` 常量
  - `currentLifeSec()` → `currentLifeYears()` 返回年
  - `formatLife()` 接受年参数，智能显示（年/天/小时/分钟）
  - `getRealmByAge()` 直接使用年龄（不再转换为秒）

### 3. 类型定义更新 ✅
- **src/server/types.ts**
  - Profile 类型字段更新为 `initial_life_years`, `bonus_years`, `total_gained_years`

### 4. API模块更新 ✅
- **src/server/api/modules/profile.ts** - 开启命盘使用年
- **src/server/api/modules/state.ts** - 状态计算使用年

## 待完成的工作

### 后端API模块（需要更新）

1. **src/server/api/modules/tasks.ts** ⏳
   - 养生任务奖励使用年
   - 更新 `bonus_years`, `total_gained_years`

2. **src/server/api/modules/cultivation.ts** ⏳
   - 修炼功法消耗和奖励使用年
   - 更新所有寿命字段

3. **src/server/api/modules/potions.ts** ⏳
   - 丹药效果使用年
   - 更新寿命字段

4. **src/server/api/modules/explore.ts** ⏳
   - 秘境探险奖励使用年
   - 更新寿命字段

5. **src/server/api/modules/extra-tasks.ts** ⏳
   - 历练项目奖励使用年
   - 更新寿命字段

6. **src/server/api/modules/revive.ts** ⏳
   - 复活逻辑使用年
   - 更新 `initial_life_years`, `bonus_years`

7. **src/server/api/modules/board.ts** ⏳
   - 排行榜计算使用年
   - 更新所有寿命字段

8. **src/server/api/modules/tribulation.ts** ⏳
   - 天劫奖励/惩罚使用年
   - 更新寿命字段

9. **src/server/api/modules/achievements.ts** ⏳
   - 成就计算使用年

10. **src/server/api/modules/admin.ts** ⏳
    - 管理接口配置使用年
    - 所有配置表的CRUD

### 前端组件（需要更新）

1. **src/client/views/Profile.vue** ⏳
   - `initialLifeSec` → `initialLifeYears`
   - 天命测算结果使用年

2. **src/client/views/Dashboard.vue** ⏳
   - 显示寿命使用年
   - `lifeSec` → `lifeYears`
   - `bonusSec` → `bonusYears`

3. **src/client/views/Cultivation.vue** ⏳
   - 修炼奖励显示年
   - 消耗显示年

4. **src/client/views/Wellness.vue** ⏳
   - 养生任务奖励显示年

5. **src/client/views/Adventure.vue** ⏳
   - 历练项目奖励显示年

6. **src/client/views/Inventory.vue** ⏳
   - 丹药效果显示年

7. **src/client/views/Leaderboard.vue** ⏳
   - 排行榜显示年

8. **管理页面** ⏳
   - `src/client/views/admin/AdminWellness.vue`
   - `src/client/views/admin/AdminPotions.vue`
   - `src/client/views/admin/AdminCultivation.vue`
   - `src/client/views/admin/AdminExtraTasks.vue`
   - `src/client/views/admin/AdminExplore.vue`

### 数据库操作

1. **运行迁移** ⏳
   ```bash
   # 需要在本地D1数据库上运行
   wrangler d1 execute DB --local --file=migrations/0025_convert_to_years.sql
   ```

2. **验证数据** ⏳
   - 检查所有表的数据是否正确转换
   - 验证年份数值是否合理

## 转换规则

### 数值转换
- **秒 → 年**: 除以 31,557,600
- **年 → 秒**: 乘以 31,557,600

### 常见数值参考
- 1小时 = 0.000114 年
- 1天 = 0.00274 年
- 1周 = 0.0192 年
- 1月 = 0.0833 年
- 1年 = 1 年

### 显示格式
- ≥ 1年: 显示"X.XX 年"
- < 1年 ≥ 1天: 显示"X.X 天"
- < 1天 ≥ 1小时: 显示"X.X 小时"
- < 1小时: 显示"X 分钟"

## 注意事项

1. **持续时间保持秒**
   - 丹药持续时间（dur）仍然使用秒
   - 这是短期效果，用秒更合适

2. **时间戳不变**
   - 所有时间戳仍然使用毫秒
   - `created_at`, `updated_at`, `start_timestamp` 等

3. **衰减率不变**
   - 衰减率（decay_rate）的计算逻辑保持不变
   - 只是应用到年而不是秒

4. **前端兼容性**
   - 需要更新所有显示寿命的地方
   - API响应字段名称已改变

## 测试清单

- [ ] 开启命盘功能正常
- [ ] 养生任务奖励正确
- [ ] 修炼功法效果正确
- [ ] 丹药效果正确
- [ ] 历练项目奖励正确
- [ ] 秘境探险奖励正确
- [ ] 复活功能正常
- [ ] 排行榜显示正确
- [ ] 天劫系统正常
- [ ] 管理后台配置正常

## 下一步

1. 继续更新剩余的后端API模块
2. 更新所有前端组件
3. 运行数据库迁移
4. 全面测试所有功能
5. 更新文档和注释
