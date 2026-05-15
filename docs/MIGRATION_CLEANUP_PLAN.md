# 迁移文件清理方案

## 背景

seed.sql现在已经包含了所有游戏配置数据，因此包含数据插入（INSERT）的迁移文件可以删除，只保留schema定义的迁移文件。

## 分析结果

### 保留的文件（Schema定义）

这些文件只包含表结构定义（CREATE TABLE, ALTER TABLE等），需要保留：

1. ✅ **0001_initial_schema.sql** - 初始数据库schema
2. ✅ **0002_features.sql** - 功能表schema
3. ✅ **0003_admin.sql** - 管理功能schema
4. ✅ **0013_fortune_checkins.sql** - 签到表schema（已删除）
5. ✅ **0014_add_zodiac_to_users.sql** - 添加zodiac字段
6. ✅ **0017_cultivation_practices_final.sql** - 修炼表最终schema
7. ✅ **0019_remove_manuals_system.sql** - 删除功法系统
8. ✅ **0024_remove_fortune_system.sql** - 删除fortune系统
9. ✅ **0025_convert_to_years_simple.sql** - 年单位转换（无数据）
10. ✅ **0026_update_lifespan_values_for_years.sql** - 更新数值（UPDATE语句）

### 删除的文件（包含数据插入）

这些文件包含INSERT语句，数据已在seed.sql中，可以删除：

1. ❌ **0004_expansion.sql** - 包含1个INSERT
2. ❌ **0005_bulk_content.sql** - 包含2个INSERT（功法、丹药）
3. ❌ **0006_extra_tasks_50_more.sql** - 包含2个INSERT（扩展任务）
4. ❌ **0007_admin_management_tables.sql** - 包含1个INSERT
5. ❌ **0008_potions_config_table.sql** - 包含1个INSERT
6. ❌ **0010_cultivation_potions.sql** - 包含3个INSERT
7. ❌ **0011_wellness_tasks_config.sql** - 包含1个INSERT
8. ❌ **0012_realms_system.sql** - 包含6个INSERT（境界数据）
9. ❌ **0015_realm_cultivation_system.sql** - 包含6个INSERT
10. ❌ **0016_cultivation_practices_expansion.sql** - 包含5个INSERT
11. ❌ **0017_cultivation_practices_realms_11_15.sql** - 包含5个INSERT
12. ❌ **0018_cultivation_practices_realms_16_20.sql** - 包含5个INSERT
13. ❌ **0020_wellness_tasks_realm_system.sql** - 包含1个INSERT
14. ❌ **0021_potions_realm_system.sql** - 包含12个INSERT
15. ❌ **0022_explore_loot_realm_system.sql** - 包含12个INSERT
16. ❌ **0023_extra_tasks_realm_system.sql** - 包含12个INSERT
17. ❌ **0025_convert_to_years.sql** - 包含6个INSERT（重复文件）

**总计删除**: 17个文件

### 特殊说明

- **0025_convert_to_years.sql** 和 **0025_convert_to_years_simple.sql** 是重复的，保留simple版本
- **0026_update_lifespan_values_for_years.sql** 虽然包含UPDATE语句，但这是数值更新，需要保留

## 清理后的迁移顺序

清理后，新服务部署只需要执行以下迁移：

```bash
# 1. 基础Schema
migrations/0001_initial_schema.sql
migrations/0002_features.sql
migrations/0003_admin.sql

# 2. 字段调整
migrations/0014_add_zodiac_to_users.sql

# 3. 表结构调整
migrations/0017_cultivation_practices_final.sql
migrations/0019_remove_manuals_system.sql
migrations/0024_remove_fortune_system.sql

# 4. 年单位转换
migrations/0025_convert_to_years_simple.sql
migrations/0026_update_lifespan_values_for_years.sql

# 5. 导入数据
seed.sql
```

## 新的部署流程

### 方案A：简化迁移（推荐）

将所有schema合并为一个初始化脚本：

```bash
# 1. 执行合并后的schema
migrations/0000_complete_schema.sql

# 2. 导入数据
seed.sql
```

### 方案B：保留现有迁移

```bash
# 1. 执行保留的迁移文件（10个）
for file in migrations/*.sql; do
  npx wrangler d1 execute webapp-production --local --file=$file
done

# 2. 导入数据
npx wrangler d1 execute webapp-production --local --file=seed.sql
```

## 执行清理

### 备份

```bash
# 创建备份目录
mkdir -p migrations_backup

# 备份所有迁移文件
cp migrations/*.sql migrations_backup/
```

### 删除文件

```bash
# 删除包含数据插入的迁移文件
rm migrations/0004_expansion.sql
rm migrations/0005_bulk_content.sql
rm migrations/0006_extra_tasks_50_more.sql
rm migrations/0007_admin_management_tables.sql
rm migrations/0008_potions_config_table.sql
rm migrations/0010_cultivation_potions.sql
rm migrations/0011_wellness_tasks_config.sql
rm migrations/0012_realms_system.sql
rm migrations/0015_realm_cultivation_system.sql
rm migrations/0016_cultivation_practices_expansion.sql
rm migrations/0017_cultivation_practices_realms_11_15.sql
rm migrations/0018_cultivation_practices_realms_16_20.sql
rm migrations/0020_wellness_tasks_realm_system.sql
rm migrations/0021_potions_realm_system.sql
rm migrations/0022_explore_loot_realm_system.sql
rm migrations/0023_extra_tasks_realm_system.sql
rm migrations/0025_convert_to_years.sql
```

## 验证

清理后验证：

```bash
# 1. 列出剩余的迁移文件
ls -la migrations/

# 2. 测试新的部署流程
# 创建测试数据库
npx wrangler d1 create test-db

# 执行迁移
for file in migrations/*.sql; do
  echo "Executing $file"
  npx wrangler d1 execute test-db --local --file=$file
done

# 导入seed数据
npx wrangler d1 execute test-db --local --file=seed.sql

# 验证数据
npx wrangler d1 execute test-db --local --command "SELECT COUNT(*) FROM realms"
npx wrangler d1 execute test-db --local --command "SELECT COUNT(*) FROM cultivation_practices"
```

## 优点

1. **简化部署**：减少迁移文件数量，部署更快
2. **避免重复**：数据只在seed.sql中维护
3. **易于维护**：schema和数据分离
4. **减少错误**：减少迁移文件执行顺序问题

## 风险

1. **现有数据库**：如果已有数据库执行过这些迁移，删除文件不影响
2. **新部署**：新部署只需要schema迁移 + seed.sql
3. **回滚**：如需回滚，可从备份恢复

## 建议

**推荐执行清理**，因为：
- seed.sql已包含所有配置数据
- 简化部署流程
- 减少维护成本
- 避免数据重复

## 后续优化

考虑创建一个合并的schema文件：

```sql
-- migrations/0000_complete_schema.sql
-- 包含所有表结构定义，不包含数据
```

这样新部署只需要：
1. 执行 `0000_complete_schema.sql`
2. 执行 `seed.sql`

## 相关文档

- [Seed数据更新说明](./SEED_DATA_UPDATE.md)
- [部署指南](./DEPLOYMENT_GUIDE.md)
- [项目状态总览](./PROJECT_STATUS.md)
