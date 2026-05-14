# 系统重构路线图

## 概述
对《向天再借500年》游戏系统进行全面重构，使所有模块与境界系统深度关联，实现真正的修仙进阶体验。

## 已完成

### ✅ 境界系统基础（0012_realms_system.sql）
- 20个境界，5个大境界
- 境界数据库表结构
- 境界管理后台

### ✅ 境界动态匹配（0015 + lib.ts）
- `getRealmByAge()` 函数
- 移除所有硬编码境界
- 前端使用 `realmId` 进行逻辑判断

### ✅ 修炼系统重构（0015_realm_cultivation_system.sql）
- 新的 `cultivation_practices` 表
- 50个初始修炼项目（境界1-5）
- 修炼机制：成功率、暴击、等级系统
- 新的 `/cultivation` API模块
- 完整文档：`CULTIVATION_SYSTEM_REFACTOR.md`

## 待重构模块

### 🔄 养生任务系统（wellness_tasks_config）
**当前状态：** 简单的每日任务，与境界关联较弱

**重构目标：**
- 与境界深度关联
- 低境界（1-8）需要凡俗养生
- 高境界（9+）逐渐脱离凡俗需求
- 任务奖励随境界递增
- 添加境界专属养生任务

**数据库改造：**
```sql
ALTER TABLE wellness_tasks_config ADD COLUMN realm_id INTEGER;
ALTER TABLE wellness_tasks_config ADD COLUMN min_realm_level INTEGER;
ALTER TABLE wellness_tasks_config ADD COLUMN max_realm_level INTEGER;
```

**预计工作量：** 2-3小时

---

### 🔄 额外任务系统（extra_tasks_config）
**当前状态：** 固定的50个额外任务

**重构目标：**
- 按境界分类任务
- 每个境界有专属的额外任务
- 任务难度和奖励随境界递增
- 添加任务链和前置要求

**数据库改造：**
```sql
ALTER TABLE extra_tasks_config ADD COLUMN realm_id INTEGER;
ALTER TABLE extra_tasks_config ADD COLUMN difficulty INTEGER;
ALTER TABLE extra_tasks_config ADD COLUMN prerequisite_tasks TEXT;
```

**预计工作量：** 2-3小时

---

### 🔄 丹药系统（potions_config）
**当前状态：** 固定的丹药列表

**重构目标：**
- 境界专属丹药
- 低境界丹药效果弱，高境界丹药效果强
- 添加炼丹系统
- 丹药配方解锁机制
- 丹药品质系统（下品、中品、上品、极品）

**数据库改造：**
```sql
ALTER TABLE potions_config ADD COLUMN realm_id INTEGER;
ALTER TABLE potions_config ADD COLUMN min_realm_level INTEGER;
ALTER TABLE potions_config ADD COLUMN quality TEXT; -- 'low', 'medium', 'high', 'supreme'
ALTER TABLE potions_config ADD COLUMN recipe_unlocked INTEGER DEFAULT 0;
ALTER TABLE potions_config ADD COLUMN refine_difficulty INTEGER;
```

**新增表：**
```sql
CREATE TABLE potion_recipes (
  id INTEGER PRIMARY KEY,
  potion_id TEXT,
  material_1 TEXT,
  material_2 TEXT,
  material_3 TEXT,
  success_rate REAL,
  realm_requirement INTEGER
);

CREATE TABLE user_potion_recipes (
  user_id INTEGER,
  recipe_id INTEGER,
  unlocked_at INTEGER,
  refine_count INTEGER
);
```

**预计工作量：** 4-5小时

---

### 🔄 秘境探险系统（explore_loots）
**当前状态：** 固定的探险奖励

**重构目标：**
- 境界专属秘境
- 秘境难度分级
- 探险成功率与境界相关
- 添加秘境地图系统
- 秘境BOSS战
- 秘境宝藏

**数据库改造：**
```sql
CREATE TABLE secret_realms (
  id INTEGER PRIMARY KEY,
  key TEXT UNIQUE,
  name TEXT,
  description TEXT,
  required_realm_id INTEGER,
  difficulty INTEGER,
  entry_cost_merit INTEGER,
  entry_cost_coin INTEGER,
  boss_name TEXT,
  boss_difficulty INTEGER
);

CREATE TABLE secret_realm_loots (
  id INTEGER PRIMARY KEY,
  realm_key TEXT,
  loot_type TEXT,
  loot_value INTEGER,
  drop_rate REAL
);

CREATE TABLE user_secret_realm_records (
  user_id INTEGER,
  realm_key TEXT,
  enter_count INTEGER,
  success_count INTEGER,
  best_score INTEGER,
  last_enter_at INTEGER
);
```

**预计工作量：** 5-6小时

---

### 🔄 天劫系统（tribulations）
**当前状态：** 简单的每周挑战

**重构目标：**
- 境界突破天劫
- 每个大境界突破都有专属天劫
- 天劫难度递增
- 天劫失败惩罚
- 天劫成功奖励丰厚
- 添加天劫类型：雷劫、心魔劫、因果劫等

**数据库改造：**
```sql
CREATE TABLE realm_tribulations (
  id INTEGER PRIMARY KEY,
  realm_id INTEGER,
  tribulation_type TEXT, -- 'thunder', 'inner_demon', 'karma'
  name TEXT,
  description TEXT,
  difficulty INTEGER,
  required_cultivation_points INTEGER,
  success_reward_life INTEGER,
  success_reward_merit INTEGER,
  failure_penalty_life INTEGER
);

ALTER TABLE tribulations ADD COLUMN tribulation_type TEXT;
ALTER TABLE tribulations ADD COLUMN realm_id INTEGER;
```

**预计工作量：** 4-5小时

---

### 🔄 成就系统（achievements）
**当前状态：** 固定的成就列表

**重构目标：**
- 境界相关成就
- 每个境界都有专属成就
- 成就链系统
- 隐藏成就
- 成就称号系统

**数据库改造：**
```sql
ALTER TABLE achievements ADD COLUMN realm_id INTEGER;
ALTER TABLE achievements ADD COLUMN is_hidden INTEGER DEFAULT 0;
ALTER TABLE achievements ADD COLUMN prerequisite_achievement TEXT;
ALTER TABLE achievements ADD COLUMN title TEXT; -- 成就称号

CREATE TABLE user_titles (
  user_id INTEGER,
  title TEXT,
  unlocked_at INTEGER,
  is_active INTEGER DEFAULT 0
);
```

**预计工作量：** 3-4小时

---

### 🔄 排行榜系统（board）
**当前状态：** 简单的寿命排行

**重构目标：**
- 多维度排行榜
- 境界排行榜
- 修炼排行榜
- 功德排行榜
- 探险排行榜
- 赛季排行榜

**数据库改造：**
```sql
CREATE TABLE leaderboard_seasons (
  id INTEGER PRIMARY KEY,
  season_name TEXT,
  start_at INTEGER,
  end_at INTEGER,
  is_active INTEGER
);

CREATE TABLE leaderboard_records (
  user_id INTEGER,
  season_id INTEGER,
  category TEXT, -- 'life', 'realm', 'cultivation', 'merit', 'explore'
  score INTEGER,
  rank INTEGER,
  updated_at INTEGER
);
```

**预计工作量：** 3-4小时

---

### 🔄 运势系统（fortune）
**当前状态：** 简单的每日运势

**重构目标：**
- 境界影响运势
- 运势影响修炼成功率
- 添加改运系统
- 添加占卜系统
- 添加风水系统

**数据库改造：**
```sql
ALTER TABLE daily_fortune ADD COLUMN realm_bonus REAL;
ALTER TABLE daily_fortune ADD COLUMN cultivation_bonus REAL;

CREATE TABLE fortune_items (
  id INTEGER PRIMARY KEY,
  key TEXT UNIQUE,
  name TEXT,
  type TEXT, -- 'talisman', 'feng_shui', 'divination'
  effect_type TEXT,
  effect_value REAL,
  cost_merit INTEGER
);

CREATE TABLE user_fortune_items (
  user_id INTEGER,
  item_key TEXT,
  is_active INTEGER,
  expire_at INTEGER
);
```

**预计工作量：** 4-5小时

---

### 🔄 世界事件系统（world_events）
**当前状态：** 简单的全服事件

**重构目标：**
- 境界相关世界事件
- 事件影响不同境界的玩家
- 添加世界BOSS
- 添加宗门战
- 添加跨服竞技

**数据库改造：**
```sql
ALTER TABLE world_events ADD COLUMN target_realm_min INTEGER;
ALTER TABLE world_events ADD COLUMN target_realm_max INTEGER;
ALTER TABLE world_events ADD COLUMN event_category TEXT; -- 'boss', 'war', 'competition'

CREATE TABLE world_bosses (
  id INTEGER PRIMARY KEY,
  name TEXT,
  realm_level INTEGER,
  hp INTEGER,
  current_hp INTEGER,
  reward_pool_merit INTEGER,
  reward_pool_life INTEGER,
  spawn_at INTEGER,
  defeat_at INTEGER
);

CREATE TABLE world_boss_participants (
  user_id INTEGER,
  boss_id INTEGER,
  damage_dealt INTEGER,
  reward_merit INTEGER,
  reward_life INTEGER
);
```

**预计工作量：** 6-7小时

---

## 新增模块

### 🆕 宗门系统
**功能：**
- 创建/加入宗门
- 宗门等级和贡献
- 宗门任务
- 宗门商店
- 宗门战

**预计工作量：** 10-12小时

---

### 🆕 法宝系统
**功能：**
- 法宝收集
- 法宝炼制
- 法宝升级
- 法宝套装
- 法宝技能

**预计工作量：** 8-10小时

---

### 🆕 灵兽系统
**功能：**
- 灵兽捕捉
- 灵兽培养
- 灵兽战斗
- 灵兽进化
- 灵兽技能

**预计工作量：** 10-12小时

---

### 🆕 师徒系统
**功能：**
- 拜师学艺
- 师父传授
- 徒弟贡献
- 师徒任务
- 师徒奖励

**预计工作量：** 6-8小时

---

### 🆕 道侣系统
**功能：**
- 结为道侣
- 双修加成
- 道侣任务
- 道侣技能
- 道侣羁绊

**预计工作量：** 6-8小时

---

## 重构优先级

### 第一阶段（核心系统）
1. ✅ 修炼系统重构
2. 🔄 养生任务系统
3. 🔄 额外任务系统
4. 🔄 丹药系统

**预计完成时间：** 2周

### 第二阶段（战斗系统）
5. 🔄 秘境探险系统
6. 🔄 天劫系统
7. 🔄 世界事件系统

**预计完成时间：** 2周

### 第三阶段（社交系统）
8. 🔄 成就系统
9. 🔄 排行榜系统
10. 🔄 运势系统

**预计完成时间：** 1.5周

### 第四阶段（新增系统）
11. 🆕 宗门系统
12. 🆕 法宝系统
13. 🆕 灵兽系统

**预计完成时间：** 4周

### 第五阶段（高级系统）
14. 🆕 师徒系统
15. 🆕 道侣系统

**预计完成时间：** 2周

---

## 总预计时间
**11.5周（约3个月）**

## 重构原则

1. **境界为核心** - 所有系统都围绕境界展开
2. **渐进式解锁** - 随境界提升逐步解锁新内容
3. **难度递增** - 消耗和奖励随境界递增
4. **数据驱动** - 所有配置都存储在数据库中
5. **向后兼容** - 保留旧数据，平滑迁移
6. **可扩展性** - 易于添加新境界和新内容
7. **平衡性** - 确保游戏平衡，避免数值膨胀

## 技术债务

### 需要解决的问题
- [ ] 统一 API 响应格式
- [ ] 添加 API 错误处理中间件
- [ ] 优化数据库查询性能
- [ ] 添加缓存机制
- [ ] 完善 TypeScript 类型定义
- [ ] 添加单元测试
- [ ] 添加集成测试
- [ ] 优化前端性能
- [ ] 添加前端状态管理
- [ ] 完善文档

## 下一步行动

1. **立即开始：** 养生任务系统重构
2. **准备工作：** 设计额外任务系统的新结构
3. **文档完善：** 为每个模块创建详细的重构文档
4. **测试计划：** 制定完整的测试策略

---

**最后更新：** 2024年（根据当前进度更新）
