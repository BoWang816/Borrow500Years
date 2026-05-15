# 寿命单位转换为年 - 总结

## 背景

修仙系统中寿命应该以年为基础单位，原因：
1. 境界跨度年份很大（从几十年到数千年）
2. 以秒为单位不符合修仙世界观
3. 所有增益效果应该以年为最小单位，更符合修仙设定

## 核心变更

### 数据库层面
所有寿命相关字段从秒改为年：
- users表：`initial_life_sec` → `initial_life_years`, `bonus_sec` → `bonus_years`, `total_gained_sec` → `total_gained_years`
- wellness_tasks_config表：`life_reward` (秒→年)
- potions_config表：`instant_life` (秒→年)
- cultivation_practices表：`reward_life`, `cost_life` (秒→年)
- extra_tasks_config表：`life_reward` (秒→年)
- explore_loot_config表：`life_reward` (秒→年)

### 代码层面
1. **核心库** (`src/server/lib.ts`)
   - 新增 `YEARS_PER_DAY` 常量
   - `currentLifeSec()` → `currentLifeYears()` 返回年
   - `formatLife()` 接受年参数，智能显示（年/天/小时/分钟）
   - `getRealmByAge()` 直接使用年龄

2. **类型定义** (`src/server/types.ts`)
   - Profile 类型字段更新

3. **API模块**
   - profile.ts: 开启命盘使用年
   - state.ts: 状态查询使用年
   - tasks.ts: 养生任务奖励使用年
   - achievements.ts: 成就计算使用年

## 已完成的工作 ✅

1. ✅ 创建数据库迁移文件 `migrations/0025_convert_to_years.sql`
2. ✅ 更新核心库 `src/server/lib.ts`
3. ✅ 更新类型定义 `src/server/types.ts`
4. ✅ 更新 profile.ts 模块
5. ✅ 更新 state.ts 模块
6. ✅ 更新 tasks.ts 模块（包括硬编码的基础任务）
7. ✅ 更新 achievements.ts 模块
8. ✅ 创建详细的转换指南文档

## 待完成的工作 ⏳

### 后端（剩余8个模块）
1. cultivation.ts - 修炼功法
2. potions.ts - 丹药系统
3. explore.ts - 秘境探险
4. extra-tasks.ts - 历练项目
5. revive.ts - 复活系统
6. board.ts - 排行榜
7. tribulation.ts - 天劫系统
8. admin.ts - 管理后台（所有配置表CRUD）

### 前端（所有组件）
1. Profile.vue - 天命测算
2. Dashboard.vue - 仪表盘
3. Cultivation.vue - 修炼页面
4. Wellness.vue - 养生页面
5. Adventure.vue - 历练页面
6. Inventory.vue - 背包页面
7. Leaderboard.vue - 排行榜
8. 所有管理后台页面（AdminWellness, AdminPotions, AdminCultivation, AdminExtraTasks, AdminExplore）

### 数据库
1. 运行迁移：`wrangler d1 execute DB --local --file=migrations/0025_convert_to_years.sql`
2. 验证数据转换正确性

## 转换比例

```
1 年 = 31,557,600 秒
1 天 = 0.00274 年
1 小时 = 0.000114 年
1 分钟 = 0.0000019 年
```

## 代码中的转换常量

```typescript
const MINUTES_TO_YEARS = 1 / (365.25 * 24 * 60)  // 分钟转年
const HOURS_TO_YEARS = 1 / (365.25 * 24)          // 小时转年
const DAYS_TO_YEARS = 1 / 365.25                  // 天转年
```

## 显示格式

`formatLife()` 函数会根据数值大小智能选择单位：
- ≥ 1年: "X.XX 年"
- < 1年 ≥ 1天: "X.X 天"
- < 1天 ≥ 1小时: "X.X 小时"
- < 1小时: "X 分钟"

## 重要注意事项

1. **持续时间保持秒**
   - 丹药持续时间（dur）仍然使用秒
   - 这是短期效果，用秒更合适

2. **时间戳不变**
   - 所有时间戳仍然使用毫秒
   - `created_at`, `updated_at`, `start_timestamp` 等

3. **衰减率不变**
   - 衰减率的计算逻辑保持不变
   - 只是应用到年而不是秒

4. **API字段名变更**
   - 前端需要同步更新所有字段名
   - `*Sec` → `*Years`

## 测试要点

- [ ] 开启命盘功能
- [ ] 养生任务奖励
- [ ] 修炼功法效果
- [ ] 丹药效果
- [ ] 历练项目奖励
- [ ] 秘境探险奖励
- [ ] 复活功能
- [ ] 排行榜显示
- [ ] 天劫系统
- [ ] 管理后台配置

## 相关文档

- `docs/YEARS_CONVERSION_GUIDE.md` - 详细转换指南
- `docs/YEARS_CONVERSION_PROGRESS.md` - 进度跟踪
- `migrations/0025_convert_to_years.sql` - 数据库迁移脚本

## 下一步

建议按以下顺序继续：
1. 更新剩余的后端API模块（cultivation → potions → explore → extra-tasks → revive → board → tribulation → admin）
2. 运行数据库迁移
3. 更新前端组件
4. 全面测试
5. 部署上线
