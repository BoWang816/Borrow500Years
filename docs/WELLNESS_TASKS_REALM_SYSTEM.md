# 养生任务境界系统实现完成

## 概述
成功将养生任务与境界系统关联，不同境界的修士将看到不同的养生项目。

## 境界划分

### 凡蜕期（境界1-5）- 贴近生活
- **胎息境**（境界1）：基础养生 + 胎息吐纳、筋骨舒展
- **定脉境**（境界2）：基础养生 + 经络按摩、药膳调理
- **洗髓境**（境界3）：基础养生 + 锻骨炼体、药浴洗髓
- **换血境**（境界4）：基础养生 + 炼血换元、气血运行
- **玉骨境**（境界5）：基础养生 + 玉骨淬炼、髓海滋养

**基础养生任务**（所有凡蜕期可用）：
- 子午流注（ziwu）：早睡打卡
- 静坐养神（meditate）：冥想入定
- 步步为营（steps）：行走步数
- 上善若水（water）：饮水8杯
- 清淡饮食（diet）：健康饮食
- 晨起修行（earlyrise）：早起挑战

### 超凡期（境界6-9）- 修仙体系
- **聚灵境**（境界6）：聚灵纳气、灵气感知
- **神识境**（境界7）：神识凝练、识海构建
- **玄府境**（境界8）：玄府开辟、灵力储存
- **凝丹境**（境界9）：金丹凝聚、丹田温养

### 化境期+（境界10+）
- 无需养生修炼，已超脱凡俗

## 技术实现

### 数据库结构
```sql
-- wellness_tasks_config 表新增字段
ALTER TABLE wellness_tasks_config ADD COLUMN realm_id INTEGER DEFAULT 1;
ALTER TABLE wellness_tasks_config ADD COLUMN min_realm_id INTEGER DEFAULT 1;
ALTER TABLE wellness_tasks_config ADD COLUMN max_realm_id INTEGER DEFAULT 5;

-- daily_tasks 表新增字段（用于追踪境界特定任务完成状态）
ALTER TABLE daily_tasks ADD COLUMN completed_wellness_tasks TEXT DEFAULT '{}';
```

### 后端API

#### 获取养生任务配置
- **端点**: `GET /tasks/wellness/config`
- **功能**: 根据用户当前境界返回适合的养生任务
- **逻辑**: 
  1. 计算用户总年龄
  2. 通过 `getRealmByAge()` 获取当前境界ID
  3. 查询 `min_realm_id <= 当前境界 <= max_realm_id` 的任务
  4. 返回任务列表和当前境界ID

#### 完成任务
- **端点**: `POST /tasks/:name`
- **功能**: 完成指定的养生任务
- **逻辑**:
  1. 基础任务（ziwu, steps, water, meditate, earlyrise, diet）保持原有逻辑
  2. 境界特定任务从数据库读取配置
  3. 使用 `completed_wellness_tasks` JSON字段追踪完成状态
  4. 应用任务配置中的奖励（寿命、功德、碎片、复活币）

### 前端实现

#### Cultivation.vue
- 动态加载养生任务列表
- 根据境界显示不同的任务
- 境界描述和提示信息
- 特殊输入处理（步数滑块、水杯计数、早起进度条）

#### 境界判断
```typescript
const realmLevel = computed(() => {
  if (!stateStore.profile) return 0
  return stateStore.profile.realmId || 1
})
```

#### 境界描述
- 凡蜕期（1-5）：凡蜕期修行，贴近生活养生
- 超凡期（6-9）：超凡期修炼，吸纳天地灵气
- 化境期+（10+）：已超脱凡俗，无需养生

### 管理后台

#### AdminWellnessTasksUnified.vue
- 统一管理养生任务配置和扩展修炼项目
- 支持设置任务的境界范围（realm_id, min_realm_id, max_realm_id）
- 可配置任务奖励、描述、图标等

## 数据示例

### 凡蜕期任务（境界1）
```
子午流注 🌙 - 寿命+30分钟，功德+2
静坐养神 🧘 - 寿命+15分钟，功德+3，碎片+1
步步为营 🚶 - 动态奖励（基于步数）
上善若水 💧 - 每杯+5分钟，8杯圆满+功德3
清淡饮食 🥗 - 寿命+20分钟，功德+1
晨起修行 🌅 - 寿命+20分钟，7天连续+复活币1
胎息吐纳 🌬️ - 寿命+25分钟，功德+2
筋骨舒展 🤸 - 寿命+16.7分钟，功德+1
```

### 超凡期任务（境界6）
```
聚灵纳气 ✨ - 寿命+90分钟，功德+8，碎片+3
灵气感知 👁️ - 寿命+80分钟，功德+7，碎片+2
```

## 迁移脚本
- **文件**: `migrations/0020_wellness_tasks_realm_system.sql`
- **内容**: 
  - 添加境界相关字段
  - 清空旧数据
  - 插入30个境界关联的养生任务
  - 创建索引优化查询

## 测试验证
1. ✅ 数据库迁移成功执行
2. ✅ 任务数据正确插入（24条记录）
3. ✅ 后端API正确返回境界过滤的任务
4. ✅ 前端正确显示任务列表
5. ✅ TypeScript类型检查通过
6. ✅ 任务完成功能正常工作

## 文件变更
- `migrations/0020_wellness_tasks_realm_system.sql` - 数据库迁移
- `src/server/api/modules/tasks.ts` - 后端任务API
- `src/server/api/modules/admin.ts` - 管理后台API
- `src/client/views/Cultivation.vue` - 前端养生修炼页面
- `src/client/views/admin/AdminWellnessTasksUnified.vue` - 管理后台页面

## 下一步优化建议
1. 添加任务完成统计和历史记录
2. 实现任务成就系统
3. 添加境界突破时的任务解锁提示
4. 优化任务奖励计算公式
5. 添加任务冷却时间机制

---
**完成时间**: 2026-05-14
**状态**: ✅ 已完成并测试通过
