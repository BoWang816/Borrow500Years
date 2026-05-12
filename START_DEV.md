# 开发环境启动指南

## 问题：页面空白？

如果你看到页面空白，可能是以下原因：

### 1. 后端服务器未启动

Vue 前端需要后端 API 才能获取数据。你需要**同时运行前端和后端**。

#### 方法一：使用开发脚本（推荐）
```bash
npm run dev
```
这会同时启动前端（5173）和后端（8788）

#### 方法二：分别启动
```bash
# 终端 1 - 启动后端
npm run dev:server

# 终端 2 - 启动前端  
npm run dev:client
```

### 2. 数据库未初始化

如果是第一次运行，需要初始化数据库：

```bash
# 应用迁移（本地数据库）
npx wrangler d1 migrations apply webapp-production --local

# 导入种子数据
npx wrangler d1 execute webapp-production --local --file=./seed.sql

# 创建管理员账号
npx wrangler d1 execute webapp-production --local --command "
INSERT INTO users (username, password_hash, created_at) 
VALUES ('admin', 'd98cd541b88b0f34a23bf748de2287abcf62ba22da8904afe11180f70e9b87a0', unixepoch())
"
```

### 3. 浏览器控制台错误

打开浏览器开发者工具（F12），查看：
- **Console** 标签：查看 JavaScript 错误
- **Network** 标签：查看 API 请求是否成功

常见错误：
- `401 Unauthorized` → 需要登录
- `404 Not Found` → 后端服务器未启动
- `500 Internal Server Error` → 数据库问题

### 4. 端口被占用

如果看到端口被占用的错误：

```bash
# 查找占用端口的进程
lsof -i :5173  # 前端端口
lsof -i :8788  # 后端端口

# 杀死进程
kill -9 <PID>
```

## 正确的启动流程

### 首次启动
```bash
# 1. 安装依赖
npm install

# 2. 初始化数据库
npx wrangler d1 migrations apply webapp-production --local
npx wrangler d1 execute webapp-production --local --file=./seed.sql

# 3. 构建一次（生成 dist 目录）
npm run build

# 4. 启动开发服务器
npm run dev
```

### 日常开发
```bash
# 直接启动
npm run dev
```

## 访问地址

启动成功后，访问：
- **前端**: http://localhost:5173
- **后端 API**: http://localhost:8788

## 登录账号

### 管理员账号
- 用户名: `admin`
- 密码: `admin123`

### 测试账号
- 用户名: `wangbo`
- 密码: `password123`

或者注册新账号。

## 调试技巧

### 查看 API 响应
```bash
# 测试后端是否运行
curl http://localhost:8788/api/state

# 应该返回 401（未登录）或数据
```

### 查看数据库
```bash
# 查看用户表
npx wrangler d1 execute webapp-production --local --command "SELECT * FROM users"

# 查看所有表
npx wrangler d1 execute webapp-production --local --command "SELECT name FROM sqlite_master WHERE type='table'"
```

### 清除浏览器缓存
如果页面显示异常：
1. 打开开发者工具（F12）
2. 右键点击刷新按钮
3. 选择"清空缓存并硬性重新加载"

## 常见问题

### Q: 页面一直显示"加载中..."
A: 后端服务器未启动或 API 请求失败。检查：
1. 后端是否在 8788 端口运行
2. 浏览器控制台是否有错误
3. Network 标签中 API 请求状态

### Q: 登录后页面空白
A: 可能是：
1. 用户没有 profile 数据 → 需要完成注册命盘
2. API 返回错误 → 检查控制台
3. 路由问题 → 刷新页面

### Q: 修改代码后没有效果
A: 
1. 确保 Vite 开发服务器在运行
2. 检查终端是否有编译错误
3. 清除浏览器缓存

### Q: 数据库错误
A: 重新初始化数据库：
```bash
# 删除本地数据库
rm -rf .wrangler/state/v3/d1/

# 重新应用迁移
npx wrangler d1 migrations apply webapp-production --local
npx wrangler d1 execute webapp-production --local --file=./seed.sql
```

## 需要帮助？

如果以上方法都不行，请提供：
1. 浏览器控制台的错误信息
2. 终端的错误输出
3. 你执行的命令
