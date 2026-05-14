# 自动初始化系统实现总结

## 📋 任务概述

实现开发服务器自动初始化功能，包括：
1. 自动检测并初始化数据库
2. 自动创建管理员账号
3. 自动构建服务器代码
4. 自动清理端口占用
5. 提供便捷的重启脚本

## ✅ 已完成功能

### 1. 自动数据库初始化

**文件**: `dev-server.js`

**功能**:
- 启动时自动检测数据库文件是否存在
- 如果不存在，自动执行：
  - 应用所有数据库迁移
  - 导入种子数据（60个NPC + 5个事件）
  - 创建管理员账号
- 显示初始化进度和结果

**实现细节**:
```javascript
async function checkAndInitDatabase() {
  const dbPath = '.wrangler/state/v3/d1/miniflare-D1DatabaseObject/338bdf3d99df067ab93ef1cf1eb26b32e260ce07e7eeed83dedc4c72436e7938.sqlite'
  
  if (!fs.existsSync(dbPath)) {
    console.log('🗄️  首次运行，初始化数据库...\n')
    
    // 应用迁移
    await execAsync('npx wrangler d1 migrations apply webapp-production --local')
    
    // 导入种子数据
    await execAsync('npx wrangler d1 execute webapp-production --local --file=./seed.sql')
    
    console.log('📝 默认管理员账号：')
    console.log('   用户名: admin')
    console.log('   密码:   admin123\n')
  }
}
```

### 2. 自动创建管理员账号

**文件**: `seed.sql`

**功能**:
- 在种子数据中包含管理员账号
- 使用 `INSERT OR IGNORE` 避免重复插入
- 管理员账号信息：
  - ID: 1
  - 用户名: admin
  - 密码: admin123
  - 密码哈希: `d98cd541b88b0f34a23bf748de2287abcf62ba22da8904afe11180f70e9b87a0`

**实现细节**:
```sql
INSERT OR IGNORE INTO users (
  id, username, password_hash, created_at, 
  name, gender, age, height, weight, 
  smoke, alcohol, stayup, hereditary, exercise, meditate,
  initial_life_sec, bonus_sec, start_timestamp, total_gained_sec, 
  coin, shard, merit
) VALUES (
  1, 'admin', 'd98cd541b88b0f34a23bf748de2287abcf62ba22da8904afe11180f70e9b87a0', 
  unixepoch(), '系统管理员', 'male', 30, 175, 70, 
  0, 0, 0, 0, 1, 1, 
  2524608000, 0, unixepoch() * 1000, 0, 
  999999, 999999, 999999
);
```

### 3. 自动构建服务器代码

**文件**: `dev-server.js`

**功能**:
- 启动前自动构建服务器代码
- 生成 `dist/_worker.js` 和 `dist/_routes.json`
- 避免 405 错误

**实现细节**:
```javascript
async function buildServer() {
  console.log('🔨 构建服务器代码...')
  try {
    await execAsync('npx vite build --config vite.server.config.ts')
    console.log('✅ 服务器代码构建完成\n')
  } catch (err) {
    console.error('❌ 服务器构建失败:', err.message)
    process.exit(1)
  }
}
```

### 4. 自动清理端口占用

**文件**: `dev-server.js`

**功能**:
- 启动前自动清理 5173 和 8788 端口
- 避免端口占用错误
- 退出时自动清理子进程

**实现细节**:
```javascript
async function killPort(port) {
  try {
    const { stdout } = await execAsync(`lsof -ti:${port}`)
    const pids = stdout.trim().split('\n').filter(Boolean)
    if (pids.length > 0) {
      console.log(`🔪 清理端口 ${port} 上的残留进程: ${pids.join(', ')}`)
      await execAsync(`kill -9 ${pids.join(' ')}`)
    }
  } catch (err) {
    // 端口未被占用，忽略错误
  }
}

// 启动前清理
await killPort(5173)
await killPort(8788)
```

### 5. 手动初始化脚本

**文件**: `init-db.sh`

**功能**:
- 提供手动初始化数据库的脚本
- 检查数据库是否已存在
- 询问是否重新初始化（会清空数据）
- 显示数据库统计信息

**使用方法**:
```bash
./init-db.sh
```

## 📊 种子数据统计

### 用户数据
- **总用户数**: 61（1个管理员 + 60个NPC）
- **境界分布**:
  - 凡蜕期（1-5境）: 16人
  - 超凡期（6-9境）: 12人
  - 化境期（10-14境）: 15人
  - 极境期（15-18境）: 12人
  - 道极期（19-20境）: 6人

### 全服事件
- 春节庆典：修炼效率提升50%
- 端午龙舟：寿命衰减降低30%
- 中秋赏月：功德收益增加40%
- 冬至养生：生命值额外增加20%
- 天劫降临：寿命衰减加速50%，功德收益翻倍

## 🔄 启动流程

### 首次启动
```
npm run dev
  ↓
清理端口 (5173, 8788)
  ↓
检测数据库是否存在
  ↓
[不存在] 初始化数据库
  ├─ 应用迁移
  ├─ 导入种子数据
  └─ 显示管理员账号
  ↓
构建服务器代码
  ├─ 编译 TypeScript
  └─ 生成 dist/_worker.js
  ↓
启动后端服务 (8788)
  ↓
启动前端服务 (5173)
  ↓
✅ 开发服务器就绪
```

### 日常启动
```
npm run dev
  ↓
清理端口 (5173, 8788)
  ↓
检测数据库 [已存在，跳过初始化]
  ↓
构建服务器代码
  ↓
启动后端服务 (8788)
  ↓
启动前端服务 (5173)
  ↓
✅ 开发服务器就绪
```

## 🐛 问题修复

### 1. 405 错误
**原因**: `dist/_worker.js` 不存在或过期
**解决**: 自动构建服务器代码

### 2. 端口占用
**原因**: 上次进程未正确清理
**解决**: 启动前自动清理端口

### 3. 数据库未初始化
**原因**: 首次启动未运行迁移
**解决**: 自动检测并初始化

### 4. 管理员账号不存在
**原因**: 种子数据未导入
**解决**: 自动导入种子数据

## 📝 使用指南

### 首次启动
```bash
# 一键启动（自动初始化）
npm run dev

# 访问应用
# 前端: http://localhost:5173
# 后端: http://localhost:8788

# 管理员登录
# 用户名: admin
# 密码: admin123
```

### 重启服务
```bash
# 推荐：使用重启脚本
./restart-dev.sh

# 或手动重启
npm run dev
```

### 重置数据库
```bash
# 删除数据库文件
rm -rf .wrangler/state/v3/d1/miniflare-D1DatabaseObject/*.sqlite*

# 重新初始化
npm run dev
```

## 🔍 验证方法

### 1. 验证数据库初始化
```bash
# 查看用户数
npx wrangler d1 execute webapp-production --local --command "SELECT COUNT(*) as count FROM users WHERE name IS NOT NULL"
# 应该返回 61

# 查看管理员账号
npx wrangler d1 execute webapp-production --local --command "SELECT id, username, name FROM users WHERE username = 'admin'"
# 应该返回 admin 用户
```

### 2. 验证服务器构建
```bash
# 检查构建文件
ls -la dist/
# 应该包含 _worker.js 和 _routes.json
```

### 3. 验证 API 功能
```bash
# 测试登录
curl -X POST http://localhost:8788/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
# 应该返回 token

# 测试长生榜
curl http://localhost:8788/api/board/longevity | jq '.total'
# 应该返回 61
```

## 📚 相关文档

- [STARTUP_GUIDE.md](./STARTUP_GUIDE.md) - 详细启动指南
- [README.md](../README.md) - 项目概述
- [SYSTEM_COMPLETE_GUIDE.md](./SYSTEM_COMPLETE_GUIDE.md) - 系统完整指南

## 🎯 下一步优化

1. **环境检测**
   - 检测 Node.js 版本
   - 检测必要的依赖是否安装

2. **错误处理**
   - 更详细的错误提示
   - 自动修复常见问题

3. **配置管理**
   - 支持自定义端口
   - 支持自定义数据库路径

4. **日志系统**
   - 记录初始化日志
   - 记录错误日志

5. **测试覆盖**
   - 单元测试
   - 集成测试
   - E2E 测试

## 📅 更新历史

- **2026-05-14**: 实现自动初始化系统
  - 自动数据库初始化
  - 自动创建管理员账号
  - 自动构建服务器代码
  - 自动清理端口占用
  - 创建重启脚本和初始化脚本
  - 更新文档
