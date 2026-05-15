# 数据库初始化指南

## 文件说明

本项目提供两个SQL文件用于数据库初始化：

1. **schema.sql** - 数据库表结构文件
   - 包含所有数据表的CREATE TABLE语句
   - 包含所有索引的CREATE INDEX语句
   - 定义了完整的数据库结构

2. **seed.sql** - 初始数据文件
   - 包含管理员账号
   - 包含60+个NPC用户（用于排行榜）
   - 包含20个修炼境界配置
   - 包含200个修炼项目
   - 包含养生任务、丹药、历练奖励等配置数据
   - 包含全服事件数据

## 使用方法

### 方法一：本地开发环境

```bash
# 1. 创建数据库表结构
npx wrangler d1 execute webapp-production --local --file=schema.sql

# 2. 导入初始数据
npx wrangler d1 execute webapp-production --local --file=seed.sql

# 3. 启动本地开发服务器
npm run dev
```

### 方法二：生产环境部署

```bash
# 1. 创建数据库表结构
npx wrangler d1 execute webapp-production --remote --file=schema.sql

# 2. 导入初始数据
npx wrangler d1 execute webapp-production --remote --file=seed.sql

# 3. 构建并部署应用
npm run build
npx wrangler pages deploy dist --project-name=borrow-500-years
```

### 方法三：重置数据库（清空并重新初始化）

```bash
# 本地环境
npx wrangler d1 execute webapp-production --local --command "DROP TABLE IF EXISTS users; DROP TABLE IF EXISTS realms; DROP TABLE IF EXISTS cultivation_practices; DROP TABLE IF EXISTS wellness_tasks_config; DROP TABLE IF EXISTS potions_config; DROP TABLE IF EXISTS extra_tasks_config; DROP TABLE IF EXISTS explore_loot_config; DROP TABLE IF EXISTS world_events; DROP TABLE IF EXISTS user_realms; DROP TABLE IF EXISTS daily_tasks; DROP TABLE IF EXISTS events; DROP TABLE IF EXISTS active_potions; DROP TABLE IF EXISTS achievements; DROP TABLE IF EXISTS tribulations; DROP TABLE IF EXISTS configs; DROP TABLE IF EXISTS admin_logs; DROP TABLE IF EXISTS daily_fortune; DROP TABLE IF EXISTS cultivation_logs; DROP TABLE IF EXISTS user_world_events; DROP TABLE IF EXISTS user_extra_tasks; DROP TABLE IF EXISTS user_cultivation_progress; DROP TABLE IF EXISTS cultivation_records; DROP TABLE IF EXISTS realm_breakthrough_logs;"

# 然后重新执行schema.sql和seed.sql
npx wrangler d1 execute webapp-production --local --file=schema.sql
npx wrangler d1 execute webapp-production --local --file=seed.sql
```

## 数据库表结构说明

### 核心表

| 表名 | 说明 | 记录数（初始） |
|------|------|----------------|
| users | 用户表 | 61（1个admin + 60个NPC） |
| realms | 境界配置表 | 20 |
| user_realms | 用户境界表 | 61 |
| cultivation_practices | 修炼项目配置表 | 200 |
| wellness_tasks_config | 养生任务配置表 | 24 |
| potions_config | 丹药配置表 | 65 |
| extra_tasks_config | 额外任务配置表 | 40 |
| explore_loot_config | 历练奖励配置表 | 43 |
| world_events | 全服事件表 | 17 |

### 运行时表

| 表名 | 说明 |
|------|------|
| daily_tasks | 每日任务完成记录 |
| user_extra_tasks | 用户额外任务记录 |
| user_cultivation_progress | 用户修炼进度 |
| cultivation_records | 修炼记录 |
| cultivation_logs | 修炼日志 |
| active_potions | 激活的丹药 |
| user_world_events | 用户参与的全服事件 |
| events | 事件日志 |
| achievements | 成就 |
| tribulations | 劫难 |
| daily_fortune | 每日运势 |
| realm_breakthrough_logs | 突破记录 |

### 系统表

| 表名 | 说明 |
|------|------|
| configs | 系统配置 |
| admin_logs | 管理日志 |

## 默认管理员账号

- **用户名**: admin
- **密码**: admin123
- **权限**: 超级管理员

⚠️ **安全提示**: 部署到生产环境后，请立即修改管理员密码！

## 数据说明

### 境界系统
- 共20个境界，分为5个大境界
- 凡蜕期（1-5境）：胎息、定脉、洗髓、换血、玉骨
- 超凡期（6-9境）：聚灵、神识、玄府、凝丹
- 化境期（10-14境）：破茧、化神、炼虚、合道、渡厄
- 极境期（15-18境）：大乘、斩因、溯源、轮回
- 道极期（19-20境）：涅槃、永恒境

### 修炼项目
- 每个境界10个修炼项目
- 包含基础、进阶、秘传等不同类型
- 涵盖呼吸、气功、冥想、突破等多个类别

### NPC用户
- 60+个NPC用户，覆盖所有境界
- 用于排行榜展示
- 每个境界至少3个用户

## 验证数据

导入完成后，可以执行以下命令验证：

```bash
# 检查表数量
npx wrangler d1 execute webapp-production --local --command "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;"

# 检查数据量
npx wrangler d1 execute webapp-production --local --command "SELECT COUNT(*) as users FROM users; SELECT COUNT(*) as realms FROM realms; SELECT COUNT(*) as cultivation FROM cultivation_practices;"
```

预期结果：
- users: 61条记录
- realms: 20条记录
- cultivation_practices: 200条记录

## 故障排除

### 问题1: 表已存在错误
**解决方案**: schema.sql中所有CREATE TABLE都使用了`IF NOT EXISTS`，不会报错。如需重建，请先删除表。

### 问题2: 外键约束错误
**解决方案**: 确保先执行schema.sql创建所有表，再执行seed.sql导入数据。

### 问题3: 数据导入失败
**解决方案**: 检查seed.sql中的INSERT语句是否与schema.sql中的表结构匹配。

