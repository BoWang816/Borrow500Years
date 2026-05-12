# Vue 3 重构说明

## 技术栈

### 前端
- **Vue 3** - 渐进式 JavaScript 框架
- **TypeScript** - 类型安全
- **Vue Router** - 客户端路由
- **Pinia** - 状态管理
- **Vite** - 构建工具

### 后端
- **Hono** - 轻量级 Web 框架（保持不变）
- **Cloudflare Pages** - 部署平台
- **D1 Database** - 数据库（保持不变）

## 项目结构

```
src/
├── client/                 # Vue 前端代码
│   ├── components/        # 可复用组件
│   │   └── AuthModal.vue # 认证模态框
│   ├── stores/           # Pinia 状态管理
│   │   ├── auth.ts       # 认证状态
│   │   └── state.ts      # 应用状态
│   ├── views/            # 页面组件
│   │   ├── Dashboard.vue
│   │   ├── Cultivation.vue
│   │   ├── Inventory.vue
│   │   ├── Adventure.vue
│   │   ├── Fortune.vue
│   │   ├── Leaderboard.vue
│   │   ├── Profile.vue
│   │   └── admin/        # 管理后台页面
│   ├── router/           # 路由配置
│   ├── utils/            # 工具函数
│   ├── types/            # TypeScript 类型
│   ├── App.vue           # 根组件
│   ├── main.ts           # 入口文件
│   └── style.css         # 全局样式
├── server/               # Hono 后端代码
│   ├── api/             # API 路由（保持不变）
│   ├── index.ts         # 服务端入口
│   ├── lib.ts           # 工具函数
│   └── types.ts         # 类型定义
└── index.html           # HTML 模板

dist/                    # 构建输出
├── assets/             # 静态资源
├── index.html          # 客户端入口
└── _worker.js          # Cloudflare Worker
```

## 开发命令

```bash
# 安装依赖
npm install

# 开发模式（Vite 开发服务器）
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview

# 部署到 Cloudflare Pages
npm run deploy

# 数据库迁移
npm run db:migrate

# 导入种子数据
npm run db:seed
```

## 核心特性

### 1. 组件化开发
- 使用 Vue 单文件组件（SFC）
- 组合式 API（Composition API）
- TypeScript 类型支持

### 2. 状态管理
- Pinia 管理全局状态
- 认证状态（auth store）
- 应用状态（state store）

### 3. 路由管理
- Vue Router 客户端路由
- 路由守卫（认证检查）
- 懒加载优化

### 4. API 集成
- 统一的 API 调用函数
- 自动 Token 管理
- 错误处理

## 开发指南

### 添加新页面

1. 在 `src/client/views/` 创建 Vue 组件
2. 在 `src/client/router/index.ts` 添加路由
3. 在导航菜单中添加链接

### 添加新 API

1. 在 `src/server/api/modules/` 添加路由处理
2. 在前端使用 `api()` 函数调用

### 状态管理

```typescript
// 使用 store
import { useAuthStore } from '@/stores/auth'
import { useStateStore } from '@/stores/state'

const authStore = useAuthStore()
const stateStore = useStateStore()

// 访问状态
console.log(authStore.isAuthenticated)
console.log(stateStore.profile)

// 调用方法
await authStore.login(username, password)
await stateStore.fetchState()
```

### API 调用

```typescript
import { api, toast } from '@/utils/api'

// GET 请求
const data = await api('/endpoint')

// POST 请求
const result = await api('/endpoint', {
  method: 'POST',
  body: JSON.stringify({ key: 'value' })
})

// 显示提示
toast('操作成功', 'good')
toast('操作失败', 'bad')
toast('重要提示', 'gold')
```

## 迁移优势

### 1. 开发体验
- ✅ 热模块替换（HMR）
- ✅ TypeScript 类型检查
- ✅ 组件化开发
- ✅ 更好的代码组织

### 2. 性能优化
- ✅ 代码分割
- ✅ 懒加载路由
- ✅ Tree-shaking
- ✅ 更小的包体积

### 3. 可维护性
- ✅ 清晰的项目结构
- ✅ 类型安全
- ✅ 状态管理
- ✅ 更好的测试支持

### 4. 用户体验
- ✅ 单页应用（SPA）
- ✅ 更快的页面切换
- ✅ 更流畅的交互
- ✅ 更好的响应式设计

## 后续优化

### 短期
- [ ] 完善所有页面功能
- [ ] 添加加载状态
- [ ] 优化错误处理
- [ ] 添加表单验证

### 中期
- [ ] 添加单元测试
- [ ] 优化移动端体验
- [ ] 添加动画效果
- [ ] 性能监控

### 长期
- [ ] PWA 支持
- [ ] 国际化（i18n）
- [ ] 主题切换
- [ ] 更多功能模块

## 注意事项

1. **API 兼容性**：后端 API 保持不变，前端完全兼容
2. **数据库**：数据库结构和数据保持不变
3. **部署**：部署流程保持不变，使用 Cloudflare Pages
4. **样式**：保留原有样式，逐步优化

## 技术支持

如有问题，请查看：
- [Vue 3 文档](https://vuejs.org/)
- [Pinia 文档](https://pinia.vuejs.org/)
- [Vue Router 文档](https://router.vuejs.org/)
- [Vite 文档](https://vitejs.dev/)
