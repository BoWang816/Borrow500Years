# 境界数据中心化完成总结

## 任务目标
将系统中所有显示境界的地方与数据库中的境界管理数据关联，移除前端硬编码的境界常量，统一使用数据库中的境界数据。

## 完成的修改

### 1. 状态管理 (src/client/stores/state.ts)
- ✅ 添加 `realms` ref 数组存储境界数据
- ✅ 添加 `fetchRealms()` 方法从 `/realms/list` API 加载境界数据
- ✅ 添加 `getRealmName(realmId)` 辅助函数获取境界名称
- ✅ 添加 `realmsLoaded` 标志防止重复加载

### 2. 首页 (src/client/views/Dashboard.vue)
- ✅ 移除硬编码的 `REALM_NAMES` 常量
- ✅ 使用 `stateStore.getRealmName()` 显示境界名称
- ✅ 添加功德数和寿命数显示
- ✅ 移除复活币显示

### 3. 顶部栏 (src/client/App.vue)
- ✅ 移除硬编码的境界显示逻辑
- ✅ 使用 `stateStore.getRealmName()` 显示境界名称

### 4. 修炼页面 (src/client/views/Cultivation.vue)
- ✅ 移除硬编码的境界等级数组
- ✅ 直接使用境界 ID 进行比较判断
- ✅ 保留 `isLowRealm` 和 `isHighRealm` 计算属性（基于境界ID）

### 5. 天榜页面 (src/client/views/Leaderboard.vue)
- ✅ 移除硬编码的大境界按钮（凡蜕期、超凡期等）
- ✅ 移除硬编码的 `getRealmInfo()` 函数
- ✅ 添加 `loadMajorRealms()` 函数从数据库动态加载大境界信息
- ✅ 添加 `getCurrentRealmInfo()` 函数动态生成境界详情
- ✅ 使用 `v-for` 动态渲染大境界筛选按钮
- ✅ 使用 `stateStore.getRealmName()` 显示用户境界名称
- ⚠️ 保留 `majorRealmMeta` 对象用于存储 UI 相关的 emoji 和描述（这些是展示层数据，不属于业务数据）

### 6. 后台境界管理 (src/client/views/admin/AdminRealms.vue)
- ✅ 移除硬编码的 `majorRealmNames` 数组
- ✅ 从数据库境界数据中动态提取大境界名称
- ✅ 使用 `major_realm_name` 字段显示大境界名称

## 数据流程

```
数据库 (realms 表)
    ↓
后端 API (/realms/list)
    ↓
状态管理 (stateStore.realms)
    ↓
各个组件使用 stateStore.getRealmName(id)
```

## 保留的硬编码数据

以下数据保留在前端，因为它们是 UI 展示层的配置，不属于业务数据：

1. **天榜页面的大境界 emoji 和描述** (`src/client/views/Leaderboard.vue`)
   - 🌱 百岁之劫
   - ⚡ 脱胎换骨
   - 🔥 因果纠缠
   - 💫 法则剥离
   - ♾️ 永恒观者
   
   这些是纯展示性的图标和简短描述，不影响业务逻辑。

2. **境界等级判断阈值** (`src/client/views/Cultivation.vue`)
   - `isLowRealm`: realm <= 8
   - `isHighRealm`: realm >= 9
   
   这些是功能性的阈值判断，可以考虑后续移到配置表。

## 数据库结构

境界表 (realms) 包含以下关键字段：
- `id`: 境界ID (1-20)
- `name`: 境界名称（胎息、定脉、洗髓等）
- `major_realm`: 大境界编号 (1-5)
- `major_realm_name`: 大境界名称（凡蜕期、超凡期等）
- `sub_realm`: 小境界编号
- `lifespan_max`: 寿命上限
- `description`: 境界描述
- `core_logic`: 核心逻辑说明

## 测试建议

1. 检查首页境界名称显示是否正确
2. 检查顶部栏境界显示是否正确
3. 检查天榜页面：
   - 大境界筛选按钮是否正确显示
   - 境界详情信息是否正确
   - 用户境界名称是否正确
4. 检查修炼页面功能是否正常
5. 检查后台境界管理页面显示是否正确

## 后续优化建议

1. 考虑将大境界的 emoji 和描述也存入数据库
2. 考虑将境界等级判断阈值（低境界/高境界）配置化
3. 添加境界数据缓存机制，减少 API 调用
4. 考虑在用户登录时预加载境界数据

## 相关文件

- `src/client/stores/state.ts` - 状态管理
- `src/client/views/Dashboard.vue` - 首页
- `src/client/App.vue` - 顶部栏
- `src/client/views/Cultivation.vue` - 修炼页面
- `src/client/views/Leaderboard.vue` - 天榜页面
- `src/client/views/admin/AdminRealms.vue` - 后台境界管理
- `src/server/api/modules/realms.ts` - 后端境界 API
- `migrations/0012_realms_system.sql` - 境界表结构
