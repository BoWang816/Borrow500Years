# 平台概览用户管理功能

## 功能概述

为平台概览（AdminOverview）页面添加了完整的用户管理功能，管理员可以：
- 查看所有用户列表
- 搜索用户（按用户名或姓名）
- 分页浏览用户
- 新建用户
- 编辑用户信息
- 重置用户（清除游戏数据）
- 删除用户

## 数据库结构说明

**重要**：本系统使用单表设计，users表包含所有用户信息（账号+个人资料）

### users表结构
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  token TEXT UNIQUE,
  token_expire_at INTEGER,
  created_at INTEGER NOT NULL,
  -- 个人资料
  name TEXT,
  gender TEXT,
  age INTEGER,
  height INTEGER,
  weight INTEGER,
  smoke INTEGER DEFAULT 0,
  alcohol INTEGER DEFAULT 0,
  stayup INTEGER DEFAULT 0,
  hereditary INTEGER DEFAULT 0,
  exercise INTEGER DEFAULT 0,
  meditate INTEGER DEFAULT 0,
  -- 寿命核心
  initial_life_sec REAL,
  bonus_sec REAL DEFAULT 0,
  start_timestamp INTEGER,
  total_gained_sec REAL DEFAULT 0,
  -- 资源
  coin INTEGER DEFAULT 1,
  shard INTEGER DEFAULT 0,
  merit INTEGER DEFAULT 0,
  -- 状态
  streak INTEGER DEFAULT 0,
  dying INTEGER DEFAULT 0,
  dying_start_at INTEGER,
  updated_at INTEGER
);
```

**注意**：
- 没有独立的profiles表
- 没有is_admin字段（通过username === 'admin'判断）
- start_timestamp为NULL表示用户未激活（未创建命盘）

## 前端实现

### 文件：`src/client/views/admin/AdminOverview.vue`

#### 新增功能

1. **用户列表展示**
   - 显示用户头像图标
   - 用户名和真实姓名
   - 状态标签（弥留、未激活）
   - 用户统计信息（寿命、功德、境界、注册时间）
   - 操作按钮（编辑、重置、删除）

2. **搜索功能**
   - 实时搜索用户名或姓名
   - 搜索时自动重置到第一页

3. **分页功能**
   - 每页显示20条记录
   - 使用统一的Pagination组件
   - 支持页码跳转

4. **新建用户**
   - 用户名（必填，唯一）
   - 密码（必填）
   - 姓名、性别、年龄
   - 身高、体重
   - 初始寿命（默认80年）
   - 功德值
   - **注意**：管理员权限通过用户名判断（username === 'admin'）

5. **编辑用户**
   - 修改用户个人信息
   - 修改功德值
   - 用户名不可修改
   - **注意**：无法修改管理员权限

6. **重置用户**
   - 清除用户所有游戏数据
   - 保留用户账号
   - 需要二次确认

7. **删除用户**
   - 完全删除用户及所有关联数据
   - 不可恢复
   - 需要二次确认

#### UI设计

- 保持原有的jade green (#36ffd0) 和 gold (#d4af37) 配色
- 使用 `.admin-item` 卡片式列表布局
- 图标按钮样式（编辑、重置、删除）
- 统一的Modal弹窗组件
- 响应式表单布局

## 后端实现

### 文件：`src/server/api/modules/admin.ts`

#### 新增API端点

1. **GET /admin/users**
   - 获取用户列表（支持分页）
   - 返回用户详细信息和统计数据
   - 查询参数：`page`, `limit`

2. **POST /admin/users**
   - 创建新用户
   - 直接在users表中创建记录
   - 如果提供了name或age，设置start_timestamp激活用户
   - 自动创建user_realms记录（如果激活）
   - 检查用户名唯一性
   - 记录管理日志

3. **PUT /admin/users/:id**
   - 更新用户信息
   - 直接更新users表
   - 如果用户未激活且提供了个人信息，则激活用户
   - 激活时自动创建user_realms记录
   - 记录管理日志

4. **POST /admin/users/:id/reset**
   - 重置用户游戏数据
   - 清空users表中的个人资料字段
   - 重置资源和状态字段
   - 删除以下关联数据：
     - user_realms（境界）
     - active_potions（丹药）
     - daily_tasks（任务）
     - user_manuals（功法）
     - events（事件）
     - realm_breakthrough_logs（突破记录）
     - fortune_checkins（签到记录）
   - 保留用户账号（username, password_hash）
   - 记录管理日志

5. **DELETE /admin/users/:id**
   - 删除用户及所有关联数据
   - 通过外键级联删除
   - 记录管理日志

#### 数据结构

用户列表返回格式：
```typescript
{
  users: [
    {
      userId: number
      username: string
      createdAt: number
      hasProfile: boolean
      name: string
      gender: string
      age: number
      height: number
      weight: number
      bmi: string | null
      lifeSec: number
      totalAge: number
      realm: string | null
      realmId: number
      coin: number
      shard: number
      merit: number
      streak: number
      dying: boolean
      bonusSec: number
      totalGained: number
      initialLifeSec: number
      isAdmin: boolean
    }
  ],
  stats: {
    total: number
    active: number
    avgLifeYears: number
    totalMerit: number
    dyingCount: number
  },
  pagination: {
    page: number
    limit: number
    total: number
  }
}
```

## 安全性

1. **权限控制**
   - 所有API都需要管理员权限（adminMiddleware）
   - 管理员通过username === 'admin'判断
   - 记录所有管理操作到admin_logs表

2. **数据验证**
   - 用户名唯一性检查
   - 必填字段验证
   - 用户存在性检查

3. **操作确认**
   - 重置和删除操作需要用户二次确认
   - 明确提示操作后果

## 管理员说明

- 系统通过用户名判断管理员权限（username === 'admin'）
- 如需添加更多管理员，需要修改后端代码的判断逻辑
- 建议后续添加is_admin字段到users表以支持多管理员

## 管理日志

所有用户管理操作都会记录到 `admin_logs` 表：
- 创建用户
- 更新用户
- 重置用户
- 删除用户

日志包含：
- 管理员ID
- 操作类型
- 操作详情
- 操作时间

## 使用说明

### 新建用户

1. 点击"新建用户"按钮
2. 填写用户名和密码（必填）
3. 可选填写个人信息
4. 设置初始寿命和功德
5. 勾选"设为管理员"可赋予管理员权限
6. 点击"保存"创建用户

### 编辑用户

1. 点击用户行的编辑按钮
2. 修改用户信息
3. 点击"保存"更新

注意：用户名不可修改

### 重置用户

1. 点击用户行的重置按钮
2. 确认操作
3. 用户游戏数据被清空，账号保留

### 删除用户

1. 点击用户行的删除按钮
2. 确认操作
3. 用户及所有数据被永久删除

## 相关文件

- `src/client/views/admin/AdminOverview.vue` - 前端页面
- `src/server/api/modules/admin.ts` - 后端API
- `src/client/components/Modal.vue` - 弹窗组件
- `src/client/components/Pagination.vue` - 分页组件
- `src/client/views/admin/admin-form-styles.css` - 样式文件

## 测试建议

1. 测试新建用户功能
   - 只填必填字段
   - 填写完整信息
   - 测试用户名重复
   
2. 测试编辑用户功能
   - 修改个人信息
   - 修改管理员权限
   
3. 测试搜索功能
   - 搜索用户名
   - 搜索姓名
   - 搜索不存在的用户
   
4. 测试分页功能
   - 翻页
   - 搜索后分页
   
5. 测试重置功能
   - 重置后检查数据是否清空
   - 账号是否保留
   
6. 测试删除功能
   - 删除后用户是否完全移除
   - 关联数据是否清理

## 后续优化建议

1. 添加批量操作功能
2. 添加用户导入/导出功能
3. 添加更多筛选条件（按境界、按状态等）
4. 添加用户活跃度统计
5. 添加密码重置功能
6. 添加用户登录日志查看
