# 部署指南

## 新服务部署流程

本指南说明如何部署一个全新的"借你五百年"服务实例。

## 前置要求

- Node.js 18+
- npm 或 yarn
- Cloudflare账号（用于D1数据库和Pages部署）
- wrangler CLI工具

## 步骤1：克隆项目

```bash
git clone https://github.com/BoWang816/Borrow500Years.git
cd Borrow500Years
```

## 步骤2：安装依赖

```bash
npm install
```

## 步骤3：配置Cloudflare D1数据库

### 3.1 创建D1数据库

```bash
# 创建生产数据库
npx wrangler d1 create webapp-production

# 记录返回的database_id
```

### 3.2 更新wrangler.jsonc

编辑 `wrangler.jsonc`，更新database_id：

```jsonc
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "webapp-production",
      "database_id": "你的-database-id",  // 替换为实际ID
      "preview_database_id": "你的-database-id"
    }
  ]
}
```

## 步骤4：初始化数据库

### 4.1 执行迁移

按顺序执行所有迁移文件：

```bash
# 本地开发环境
npx wrangler d1 execute webapp-production --local --file=migrations/0001_initial_schema.sql
npx wrangler d1 execute webapp-production --local --file=migrations/0002_features.sql
npx wrangler d1 execute webapp-production --local --file=migrations/0003_admin.sql
npx wrangler d1 execute webapp-production --local --file=migrations/0004_expansion.sql
npx wrangler d1 execute webapp-production --local --file=migrations/0005_bulk_content.sql
npx wrangler d1 execute webapp-production --local --file=migrations/0006_extra_tasks_50_more.sql
npx wrangler d1 execute webapp-production --local --file=migrations/0007_admin_management_tables.sql
npx wrangler d1 execute webapp-production --local --file=migrations/0008_potions_config_table.sql
npx wrangler d1 execute webapp-production --local --file=migrations/0010_cultivation_potions.sql
npx wrangler d1 execute webapp-production --local --file=migrations/0011_wellness_tasks_config.sql
npx wrangler d1 execute webapp-production --local --file=migrations/0012_realms_system.sql
npx wrangler d1 execute webapp-production --local --file=migrations/0013_fortune_checkins.sql
npx wrangler d1 execute webapp-production --local --file=migrations/0014_add_zodiac_to_users.sql
npx wrangler d1 execute webapp-production --local --file=migrations/0015_realm_cultivation_system.sql
npx wrangler d1 execute webapp-production --local --file=migrations/0016_cultivation_practices_expansion.sql
npx wrangler d1 execute webapp-production --local --file=migrations/0017_cultivation_practices_final.sql
npx wrangler d1 execute webapp-production --local --file=migrations/0018_cultivation_practices_realms_16_20.sql
npx wrangler d1 execute webapp-production --local --file=migrations/0019_remove_manuals_system.sql
npx wrangler d1 execute webapp-production --local --file=migrations/0020_wellness_tasks_realm_system.sql
npx wrangler d1 execute webapp-production --local --file=migrations/0021_potions_realm_system.sql
npx wrangler d1 execute webapp-production --local --file=migrations/0022_explore_loot_realm_system.sql
npx wrangler d1 execute webapp-production --local --file=migrations/0023_extra_tasks_realm_system.sql
npx wrangler d1 execute webapp-production --local --file=migrations/0024_remove_fortune_system.sql
npx wrangler d1 execute webapp-production --local --file=migrations/0025_convert_to_years_simple.sql
npx wrangler d1 execute webapp-production --local --file=migrations/0026_update_lifespan_values_for_years.sql

# 生产环境（添加 --remote 标志）
npx wrangler d1 execute webapp-production --remote --file=migrations/0001_initial_schema.sql
# ... 依次执行其他迁移
```

**提示**：可以创建一个脚本自动执行所有迁移：

```bash
# init-db.sh 已包含在项目中
chmod +x init-db.sh
./init-db.sh
```

### 4.2 导入种子数据

```bash
# 本地开发环境
npx wrangler d1 execute webapp-production --local --file=seed.sql

# 生产环境
npx wrangler d1 execute webapp-production --remote --file=seed.sql
```

seed.sql包含：
- 系统管理员账号（admin/admin123）
- 60+ 个NPC用户
- 所有游戏配置数据（境界、修炼、丹药、养生、历练、事件）

## 步骤5：构建项目

```bash
npm run build
```

验证构建成功，无TypeScript错误。

## 步骤6：本地测试

```bash
# 启动开发服务器
npm run dev

# 或使用自定义开发服务器
node dev-server.js
```

访问 `http://localhost:5173` 测试：

1. 注册新用户
2. 登录系统
3. 测试各个功能模块
4. 使用管理员账号（admin/admin123）访问后台

## 步骤7：部署到Cloudflare Pages

### 7.1 创建Pages项目

```bash
npx wrangler pages project create borrow-500-years
```

### 7.2 部署

```bash
# 构建并部署
npm run build
npx wrangler pages deploy dist
```

### 7.3 配置环境变量

在Cloudflare Pages控制台中配置：

- `ADMIN_USERS`: 管理员用户名列表（逗号分隔）
- 其他必要的环境变量

### 7.4 绑定D1数据库

在Pages项目设置中绑定D1数据库：
- Binding name: `DB`
- D1 database: 选择你创建的数据库

## 步骤8：验证部署

访问你的Pages URL，验证：

1. ✅ 网站可以正常访问
2. ✅ 用户可以注册和登录
3. ✅ 所有功能模块正常工作
4. ✅ 管理后台可以访问
5. ✅ 数据正确显示（寿命单位为年）

## 常见问题

### Q1: 迁移执行失败

**A**: 确保按顺序执行所有迁移，不要跳过任何一个。如果某个迁移失败，检查错误信息并修复后重新执行。

### Q2: seed.sql导入失败

**A**: 确保所有迁移都已成功执行。seed.sql依赖完整的数据库schema。

### Q3: 管理员无法登录

**A**: 检查：
1. seed.sql是否成功导入
2. wrangler.jsonc中的ADMIN_USERS是否包含"admin"
3. 密码是否正确（admin123）

### Q4: 寿命显示异常

**A**: 确保执行了 `0026_update_lifespan_values_for_years.sql` 迁移。这个迁移更新了所有配置表的寿命数值。

### Q5: 本地开发和生产环境数据不同步

**A**: 本地使用 `--local` 标志，生产使用 `--remote` 标志。它们是独立的数据库实例。

## 数据库管理

### 查看数据库内容

```bash
# 本地
npx wrangler d1 execute webapp-production --local --command "SELECT * FROM users LIMIT 10"

# 生产
npx wrangler d1 execute webapp-production --remote --command "SELECT * FROM users LIMIT 10"
```

### 备份数据库

```bash
# 导出所有表数据
npx wrangler d1 export webapp-production --remote --output backup.sql
```

### 恢复数据库

```bash
# 从备份恢复
npx wrangler d1 execute webapp-production --remote --file=backup.sql
```

## 更新部署

### 更新代码

```bash
git pull origin main
npm install
npm run build
npx wrangler pages deploy dist
```

### 更新数据库

如果有新的迁移文件：

```bash
# 执行新的迁移
npx wrangler d1 execute webapp-production --remote --file=migrations/XXXX_new_migration.sql
```

如果需要更新配置数据：

```bash
# 重新导入seed.sql（会更新配置，不会覆盖用户数据）
npx wrangler d1 execute webapp-production --remote --file=seed.sql
```

## 监控和日志

### 查看Pages日志

在Cloudflare Pages控制台中查看：
- 部署日志
- 函数日志
- 实时日志

### 查看D1数据库统计

```bash
npx wrangler d1 info webapp-production
```

## 安全建议

1. **修改默认管理员密码**
   - 首次部署后立即修改admin账号密码
   - 使用强密码

2. **限制管理员访问**
   - 在wrangler.jsonc中配置ADMIN_USERS
   - 只添加可信用户

3. **定期备份**
   - 定期导出数据库备份
   - 保存在安全的地方

4. **监控异常**
   - 定期检查日志
   - 监控异常登录和操作

## 性能优化

1. **启用缓存**
   - Cloudflare自动缓存静态资源
   - 配置合适的缓存策略

2. **优化数据库查询**
   - 使用索引
   - 避免N+1查询
   - 使用分页

3. **监控性能**
   - 使用Cloudflare Analytics
   - 监控响应时间
   - 优化慢查询

## 相关文档

- [Seed数据更新说明](./SEED_DATA_UPDATE.md)
- [数据库数值更新完成](./DATABASE_VALUES_UPDATE_COMPLETE.md)
- [测试清单](./TESTING_CHECKLIST.md)
- [开发者快速参考](./DEVELOPER_QUICK_REFERENCE.md)

## 支持

如有问题，请：
1. 查看文档
2. 检查GitHub Issues
3. 联系开发团队

---

**祝部署顺利！** 🎉
