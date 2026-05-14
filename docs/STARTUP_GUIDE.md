# 开发服务器启动指南

## 🚀 快速开始

### 首次启动（推荐）

```bash
npm run dev
```

首次启动时，开发服务器会自动完成以下操作：

1. **清理端口冲突**
   - 自动检测并清理 5173（前端）和 8788（后端）端口
   - 确保没有残留进程占用端口

2. **数据库初始化**（仅首次）
   - 检测数据库是否存在
   - 如果不存在，自动应用所有迁移
   - 导入种子数据：
     - 1个管理员账号（admin/admin123）
     - 60个NPC用户（覆盖所有20个境界）
     - 5个全服事件

3. **构建服务器代码**
   - 编译 TypeScript 服务器代码
   - 生成 `dist/_worker.js` 和 `dist/_routes.json`

4. **启动服务**
   - 后端 API 服务器：http://localhost:8788
   - 前端开发服务器：http://localhost:5173

### 访问应用

- **前端界面**: http://localhost:5173
- **后端 API**: http://localhost:8788/api/state
- **管理员登录**: 
  - 用户名: `admin`
  - 密码: `admin123`

## 🔄 日常开发

### 正常启动

```bash
npm run dev
```

如果数据库已初始化，会跳过初始化步骤，直接启动服务。

### 重启服务

每次运行 `npm run dev` 都会自动：
1. 清理端口占用（5173 和 8788）
2. 重新构建服务器代码
3. 启动开发服务器

**使用场景**：
- 修改了服务器代码
- 遇到端口占用问题
- API 返回 405 错误

### 停止服务

按 `Ctrl+C` 停止开发服务器。脚本会自动清理所有子进程和端口占用。

## 🗄️ 数据库管理

### 手动初始化数据库

```bash
./init-db.sh
```

这个脚本会：
1. 检查数据库是否已存在
2. 如果已存在，询问是否重新初始化（会清空所有数据）
3. 应用所有迁移
4. 导入种子数据
5. 显示数据库统计信息

### 查询数据库

```bash
# 查看所有用户
npx wrangler d1 execute webapp-production --local --command "SELECT * FROM users LIMIT 10"

# 查看境界分布
npx wrangler d1 execute webapp-production --local --command "
SELECT r.major_realm_name, COUNT(*) as count 
FROM users u 
LEFT JOIN user_realms ur ON u.id = ur.user_id 
LEFT JOIN realms r ON ur.current_realm_id = r.id 
WHERE u.name IS NOT NULL 
GROUP BY r.major_realm 
ORDER BY r.major_realm
"

# 查看管理员账号
npx wrangler d1 execute webapp-production --local --command "SELECT id, username, name FROM users WHERE username = 'admin'"
```

### 重置数据库

```bash
# 删除数据库文件
rm -rf .wrangler/state/v3/d1/miniflare-D1DatabaseObject/*.sqlite*

# 重新初始化
./init-db.sh
```

## 🐛 常见问题

### 1. 端口被占用

**症状**: 启动时提示 `Error: listen EADDRINUSE: address already in use :::5173`

**解决方案**:
```bash
# 直接重新启动（会自动清理端口）
npm run dev

# 或手动清理端口
lsof -ti:5173 | xargs kill -9
lsof -ti:8788 | xargs kill -9
npm run dev
```

### 2. API 返回 405 错误

**症状**: 登录接口返回 `405 Method Not Allowed`

**原因**: `dist/_worker.js` 文件不存在或过期

**解决方案**:
```bash
# 重新启动（会自动重新构建）
npm run dev

# 或手动构建
npx vite build --config vite.server.config.ts
npm run dev
```

### 3. 数据库未初始化

**症状**: API 返回数据库错误或表不存在

**解决方案**:
```bash
# 手动初始化数据库
./init-db.sh
```

### 4. 管理员账号无法登录

**症状**: 提示"账号或密码错误"

**检查步骤**:
```bash
# 1. 检查管理员账号是否存在
npx wrangler d1 execute webapp-production --local --command "SELECT id, username, name FROM users WHERE username = 'admin'"

# 2. 如果不存在，重新导入种子数据
npx wrangler d1 execute webapp-production --local --file=./seed.sql

# 3. 确认密码是 admin123
```

### 5. 长生榜只显示部分用户

**症状**: 长生榜只显示20个用户，没有分页

**原因**: 浏览器缓存了旧的前端代码

**解决方案**:
```bash
# 1. 重启开发服务器（会自动重新构建）
npm run dev

# 2. 清除浏览器缓存
# Chrome/Edge: Cmd+Shift+R (Mac) 或 Ctrl+Shift+R (Windows)
# Firefox: Cmd+Shift+Delete (Mac) 或 Ctrl+Shift+Delete (Windows)

# 3. 验证 API 返回所有用户
curl http://localhost:8788/api/board/longevity | jq '.total'
# 应该返回 61（1个管理员 + 60个NPC）
```

### 6. 切换境界没有反应

**症状**: 点击境界筛选按钮，用户列表不变

**原因**: 前端筛选逻辑问题或数据未加载

**解决方案**:
1. 打开浏览器开发者工具（F12）
2. 查看 Console 是否有错误
3. 查看 Network 标签，确认 API 请求成功
4. 清除浏览器缓存并刷新

## 📊 数据统计

### 种子数据概览

- **总用户数**: 61（1个管理员 + 60个NPC）
- **境界分布**:
  - 凡蜕期（1-5境）: 16人
  - 超凡期（6-9境）: 12人
  - 化境期（10-14境）: 15人
  - 极境期（15-18境）: 12人
  - 道极期（19-20境）: 6人
- **全服事件**: 5个

### 验证数据

```bash
# 查看总用户数
npx wrangler d1 execute webapp-production --local --command "SELECT COUNT(*) as count FROM users WHERE name IS NOT NULL"

# 查看境界分布
npx wrangler d1 execute webapp-production --local --command "
SELECT r.major_realm_name, COUNT(*) as count 
FROM users u 
LEFT JOIN user_realms ur ON u.id = ur.user_id 
LEFT JOIN realms r ON ur.current_realm_id = r.id 
WHERE u.name IS NOT NULL 
GROUP BY r.major_realm 
ORDER BY r.major_realm
"
```

## 🔧 开发工具

### 推荐的 VS Code 扩展

- **ESLint**: 代码检查
- **Prettier**: 代码格式化
- **Volar**: Vue 3 支持
- **SQLite Viewer**: 查看数据库文件

### 调试技巧

1. **查看实时日志**
   - 开发服务器会输出所有 API 请求
   - 使用 `console.log` 在服务器代码中调试

2. **测试 API**
   ```bash
   # 测试登录
   curl -X POST http://localhost:8788/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"admin123"}'
   
   # 测试长生榜
   curl http://localhost:8788/api/board/longevity | jq
   ```

3. **查看数据库**
   ```bash
   # 使用 SQLite 命令行
   sqlite3 .wrangler/state/v3/d1/miniflare-D1DatabaseObject/338bdf3d99df067ab93ef1cf1eb26b32e260ce07e7eeed83dedc4c72436e7938.sqlite
   
   # 或使用 wrangler
   npx wrangler d1 execute webapp-production --local --command "SELECT * FROM users LIMIT 5"
   ```

## 📝 开发流程

### 修改前端代码

1. 修改 `src/client/` 下的文件
2. Vite 会自动热重载
3. 浏览器自动刷新

### 修改后端代码

1. 修改 `src/server/` 下的文件
2. 运行 `./restart-dev.sh` 重新构建
3. 测试 API 端点

### 修改数据库结构

1. 创建新的迁移文件 `migrations/XXXX_description.sql`
2. 运行迁移：
   ```bash
   npx wrangler d1 migrations apply webapp-production --local
   ```
3. 更新 TypeScript 类型定义

### 添加种子数据

1. 编辑 `seed.sql`
2. 重新导入：
   ```bash
   npx wrangler d1 execute webapp-production --local --file=./seed.sql
   ```

## 🚀 部署到生产

```bash
# 1. 构建生产版本
npm run build

# 2. 部署到 Cloudflare Pages
npm run deploy

# 3. 应用生产数据库迁移
npx wrangler d1 migrations apply webapp-production --remote

# 4. 导入生产种子数据（可选）
npx wrangler d1 execute webapp-production --remote --file=./seed.sql
```

## 📚 相关文档

- [README.md](../README.md) - 项目概述
- [SYSTEM_COMPLETE_GUIDE.md](./SYSTEM_COMPLETE_GUIDE.md) - 系统完整指南
- [AUTH_SYSTEM.md](./AUTH_SYSTEM.md) - 认证系统文档
- [REALMS_SYSTEM.md](./REALMS_SYSTEM.md) - 境界系统文档
- [POTIONS_SYSTEM.md](./POTIONS_SYSTEM.md) - 丹药系统文档
