# Seed数据更新说明

## 更新时间
2026年5月15日

## 更新内容

将数据库中的所有游戏配置数据导出并合并到 `seed.sql` 文件中，确保新服务部署时可以使用完整的初始化数据。

## 包含的数据

### 1. 用户数据（NPC）
- 系统管理员账号（admin/admin123）
- 60+ 个NPC用户，覆盖所有20个境界
- 每个境界至少3个用户
- 用户境界关联数据（user_realms）

### 2. 游戏配置数据

#### 境界管理（realms）
- 20个境界配置
- 包含5个大境界：凡蜕期、超凡期、化境期、极境期、道极期
- 每个境界包含：名称、寿命上限、突破年龄范围、描述、核心逻辑等

#### 修炼项目（cultivation_practices）
- 100+ 个修炼项目
- 覆盖所有20个境界
- 包含基础修炼、进阶修炼、秘法修炼等
- 寿命奖励范围：0.01年 - 5000年

#### 丹药配置（potions_config）
- 多个境界的丹药配置
- 4种稀有度：common, rare, epic, legendary
- 3种类别：recovery, buff, special
- 即时寿命范围：0.01年 - 10000年
- 持续时间：24小时、7天等

#### 养生任务（wellness_tasks_config）
- 基础养生任务：子午流注、步行万步、饮水养生等
- 进阶养生任务：气功修炼、太极拳、瑜伽等
- 寿命奖励范围：0.001年 - 0.1年

#### 扩展任务（extra_tasks_config）
- 根据境界和难度分级
- 4种难度：easy, normal, hard, extreme
- 寿命奖励范围：0.005年 - 2000年

#### 历练项目（explore_loot_config）
- 根据境界和品质分级
- 4种品质：common, rare, epic, legendary
- 寿命奖励范围：0.001年 - 5000年

#### 全服事件（world_events）
- 示例全服事件：春节庆典、端午龙舟、中秋赏月等
- 包含事件效果：修炼加成、衰减降低、功德增加等

## 数据特点

### 1. 完整性
- 包含所有必需的游戏配置
- 覆盖所有境界和难度等级
- 数据之间关联完整

### 2. 一致性
- 所有寿命数值已更新为年单位系统
- 数值范围符合境界递增规律
- 不同品质/难度有明显差异

### 3. 可用性
- 可直接用于新服务初始化
- 使用 `INSERT OR IGNORE` 避免重复插入
- 使用 `INSERT OR REPLACE` 确保配置更新

## 使用方法

### 初始化新数据库

```bash
# 方法1：使用wrangler（本地开发）
npx wrangler d1 execute webapp-production --local --file=seed.sql

# 方法2：使用wrangler（远程生产）
npx wrangler d1 execute webapp-production --remote --file=seed.sql

# 方法3：使用SQLite命令行
sqlite3 your_database.db < seed.sql
```

### 更新现有数据库

如果数据库已存在，seed.sql会：
- 跳过已存在的用户（INSERT OR IGNORE）
- 更新配置数据（INSERT OR REPLACE）

## 数据导出流程

本次更新使用以下流程导出数据：

1. **导出各配置表数据**
   ```bash
   npx wrangler d1 execute webapp-production --local --command "SELECT * FROM realms" --json
   npx wrangler d1 execute webapp-production --local --command "SELECT * FROM cultivation_practices" --json
   # ... 其他表
   ```

2. **转换为SQL格式**
   - 使用Python脚本将JSON转换为SQL INSERT语句
   - 处理NULL值和字符串转义
   - 使用 `INSERT OR REPLACE` 确保可重复执行

3. **合并到seed.sql**
   - 保留原有用户数据
   - 追加配置数据
   - 添加注释说明

## 文件结构

```
seed.sql
├── 用户数据部分
│   ├── 系统管理员
│   ├── NPC用户（60+）
│   └── 用户境界关联
│
└── 游戏配置数据部分
    ├── 境界管理（realms）
    ├── 修炼项目（cultivation_practices）
    ├── 丹药配置（potions_config）
    ├── 养生任务（wellness_tasks_config）
    ├── 扩展任务（extra_tasks_config）
    ├── 历练项目（explore_loot_config）
    └── 全服事件（world_events）
```

## 备份说明

原始seed.sql已备份为 `seed.sql.backup`，如需恢复：

```bash
cp seed.sql.backup seed.sql
```

## 数据统计

| 数据类型 | 数量 | 说明 |
|---------|------|------|
| 用户（NPC） | 60+ | 覆盖所有20个境界 |
| 境界配置 | 20 | 5个大境界 |
| 修炼项目 | 100+ | 所有境界的修炼方法 |
| 丹药配置 | 50+ | 不同境界和稀有度 |
| 养生任务 | 10+ | 基础和进阶任务 |
| 扩展任务 | 100+ | 不同境界和难度 |
| 历练项目 | 100+ | 不同境界和品质 |
| 全服事件 | 10+ | 示例事件 |

## 注意事项

1. **数据库版本**
   - 确保数据库schema已通过所有迁移更新
   - 特别是 `0026_update_lifespan_values_for_years.sql`

2. **数据一致性**
   - 所有寿命数值使用秒存储
   - 数值已根据年单位系统更新
   - 境界ID与其他表的realm_id对应

3. **重复执行**
   - seed.sql可以安全地重复执行
   - 用户数据使用 `INSERT OR IGNORE`（不会覆盖）
   - 配置数据使用 `INSERT OR REPLACE`（会更新）

4. **生产环境**
   - 在生产环境执行前请先备份数据库
   - 建议先在本地测试
   - 确认数据正确后再部署到生产

## 后续维护

### 更新配置数据

当配置数据在数据库中更新后，需要重新导出并更新seed.sql：

```bash
# 1. 导出最新配置数据
# （使用本文档中的导出流程）

# 2. 合并到seed.sql
# （使用Python脚本或手动合并）

# 3. 提交到版本控制
git add seed.sql
git commit -m "chore: update seed data with latest config"
```

### 添加新配置表

如果添加了新的配置表，需要：

1. 在导出脚本中添加新表
2. 重新生成seed.sql
3. 更新本文档

## 相关文档

- [数据库数值更新完成](./DATABASE_VALUES_UPDATE_COMPLETE.md)
- [最终完成总结](./FINAL_COMPLETE_SUMMARY.md)
- [开发者快速参考](./DEVELOPER_QUICK_REFERENCE.md)

## 总结

seed.sql现在包含完整的游戏初始化数据，可以用于：
- 新服务部署
- 开发环境初始化
- 测试环境搭建
- 数据恢复

所有配置数据已从实际运行的数据库导出，确保数据的准确性和一致性。
