# 快速开始 - Vue 3 版本

## 安装依赖

```bash
npm install
```

## 开发模式

### 方式一：完整开发环境（推荐）

同时启动前端和后端：

```bash
npm run dev
```

- 前端：http://localhost:5173
- 后端 API：http://localhost:8788

### 方式二：分别启动

```bash
# 终端 1 - 启动后端 API
npm run dev:server

# 终端 2 - 启动前端
npm run dev:client
```

## 构建生产版本

```bash
npm run build
```

构建产物在 `dist/` 目录：
- `dist/index.html` - 前端入口
- `dist/assets/` - 前端资源
- `dist/_worker.js` - Cloudflare Worker

## 预览生产构建

```bash
npm run preview
```

访问：http://localhost:8788

## 部署到 Cloudflare Pages

```bash
npm run deploy
```

## 数据库管理

### 应用迁移

```bash
# 远程数据库
npm run db:migrate

# 本地数据库
npx wrangler d1 migrations apply webapp-production --local
```

### 导入种子数据

```bash
# 远程数据库
npm run db:seed

# 本地数据库
npx wrangler d1 execute webapp-production --local --file=./seed.sql
```

## 项目特点

### ✨ 现代化技术栈
- Vue 3 Composition API
- TypeScript 类型安全
- Pinia 状态管理
- Vue Router 路由管理
- Vite 快速构建

### 🚀 开发体验
- 热模块替换（HMR）
- 即时类型检查
- 组件化开发
- 代码分割

### 📦 生产优化
- Tree-shaking
- 代码压缩
- 懒加载
- 资源优化

## 目录结构

```
src/
├── client/          # Vue 前端
│   ├── components/  # 组件
│   ├── views/       # 页面
│   ├── stores/      # 状态
│   ├── router/      # 路由
│   └── utils/       # 工具
└── server/          # Hono 后端
    └── api/         # API 路由
```

## 常见问题

### Q: 如何添加新页面？

1. 在 `src/client/views/` 创建 `.vue` 文件
2. 在 `src/client/router/index.ts` 添加路由
3. 在导航中添加链接

### Q: 如何调用 API？

```typescript
import { api } from '@/utils/api'

const data = await api('/endpoint')
```

### Q: 如何管理状态？

```typescript
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
console.log(authStore.isAuthenticated)
```

### Q: 开发模式下 API 请求失败？

确保后端服务器在运行（port 8788），Vite 会自动代理 `/api` 请求。

## 下一步

查看完整文档：
- [Vue 迁移说明](./VUE_MIGRATION.md)
- [Vue 3 官方文档](https://vuejs.org/)
- [Pinia 文档](https://pinia.vuejs.org/)
