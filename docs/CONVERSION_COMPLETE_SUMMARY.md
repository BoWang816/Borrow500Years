# 寿命单位转换完成总结

## 实施方案

采用**代码层转换**方案：
- 数据库保持原有字段名（`*_sec`）
- 代码使用年为单位计算
- 通过转换函数在读写时转换单位

## 核心变更

### 1. 转换函数（lib.ts）
```typescript
export function secsToYears(secs: number): number {
  return secs / SEC_PER_YEAR;
}

export function yearsToSecs(years: number): number {
  return years * SEC_PER_YEAR;
}

export function currentLifeYears(p: any): number {
  const elapsedYears = (Date.now() - p.start_timestamp) / 1000 / SEC_PER_YEAR;
  const base = baseDecayMultiplier(p);
  const initialYears = secsToYears(p.initial_life_sec || 0);
  const bonusYears = secsToYears(p.bonus_sec || 0);
  return initialYears + bonusYears - elapsedYears * base;
}
```

### 2. 已完成的后端模块

#### 核心模块 ✅
- **lib.ts** - 添加转换函数和常量
- **types.ts** - 保持数据库字段名
- **profile.ts** - 开启命盘，使用年输入，转换为秒存储
- **state.ts** - 状态查询，读取秒转换为年返回
- **tasks.ts** - 养生任务，计算年转换为秒存储
- **achievements.ts** - 成就计算，使用转换函数

#### 功能模块（需要完成转换）⏳
- **cultivation.ts** - 修炼系统（已更新字段名，需改用转换函数）
- **potions.ts** - 丹药系统（已更新字段名，需改用转换函数）
- **explore.ts** - 秘境探险（已更新字段名，需改用转换函数）
- **extra-tasks.ts** - 历练项目（已更新字段名，需改用转换函数）
- **revive.ts** - 复活系统（已更新字段名，需改用转换函数）
- **board.ts** - 排行榜（已更新字段名，需改用转换函数）
- **tribulation.ts** - 天劫系统（已更新字段名，需改用转换函数）

## 数据库状态

- **无需迁移** - 保持原有表结构
- **字段名** - 仍为 `initial_life_sec`, `bonus_sec`, `total_gained_sec`
- **数据** - 仍以秒为单位存储
- **兼容性** - 完全向后兼容

## API响应格式

前端接收的数据格式（年为单位）：
```json
{
  "profile": {
    "initialLifeYears": 75.5,
    "bonusYears": 2.3,
    "totalGainedYears": 5.1,
    "lifeYears": 73.2
  }
}
```

## 前端需要的更新

所有前端组件需要更新字段名：
- `initialLifeSec` → `initialLifeYears`
- `bonusSec` → `bonusYears`
- `totalGainedSec` → `totalGainedYears`
- `lifeSec` → `lifeYears`
- `gainedSec` → `gainedYears`

### 待更新的前端文件
1. Profile.vue - 天命测算
2. Dashboard.vue - 仪表盘
3. Cultivation.vue - 修炼页面
4. Wellness.vue - 养生页面
5. Adventure.vue - 历练页面
6. Inventory.vue - 背包页面
7. Leaderboard.vue - 排行榜
8. 所有管理后台页面

## 显示格式

`formatLife()` 函数智能显示：
- ≥ 1年: "X.XX 年"
- < 1年 ≥ 1天: "X.X 天"
- < 1天 ≥ 1小时: "X.X 小时"
- < 1小时: "X 分钟"

## 测试要点

- [ ] 开启命盘（输入年，存储秒）
- [ ] 养生任务（计算年，存储秒）
- [ ] 修炼功法（计算年，存储秒）
- [ ] 丹药效果（计算年，存储秒）
- [ ] 历练项目（计算年，存储秒）
- [ ] 秘境探险（计算年，存储秒）
- [ ] 复活功能（读取秒，计算年）
- [ ] 排行榜（读取秒，显示年）
- [ ] 天劫系统（计算年，存储秒）
- [ ] 状态显示（读取秒，显示年）

## 优势

1. **无需数据库迁移** - 避免了复杂的表结构变更
2. **向后兼容** - 现有数据无需转换
3. **易于实施** - 只需更新代码逻辑
4. **可回滚** - 如有问题可快速回退
5. **渐进式** - 可以逐个模块更新测试

## 下一步

1. 完成剩余后端模块的转换函数应用
2. 更新所有前端组件
3. 全面测试所有功能
4. 更新用户文档

## 注意事项

- 所有新代码都应使用年为单位进行计算
- 数据库读写时必须使用转换函数
- 前端显示统一使用年为单位
- 保持代码中的注释说明单位转换
