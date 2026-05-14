# 运势系统文档

## 📋 系统概述

运势系统是一个每日签到和运势查看功能，用户可以：
- 查看每日运势（大吉、吉、平、凶）
- 签到领取运势加成奖励
- 累积连签天数获得额外奖励
- 管理员可以在后台查看运势统计和签到记录

## 🎯 功能特性

### 1. 每日运势生成
- **算法**：基于日期的伪随机生成，确保同一天所有用户看到相同的运势
- **运势等级**：
  - 大吉（10%概率）：大吉大利
  - 吉（30%概率）：吉星高照
  - 平（40%概率）：平安顺遂
  - 凶（20%概率）：诸事不宜

### 2. 运势内容
每日运势包含：
- **运势等级**：大吉/吉/平/凶
- **运势诗句**：古风诗句，每个等级4首随机
- **运势描述**：详细说明今日运势情况
- **宜**：适合做的事情
- **忌**：不宜做的事情
- **吉方**：8个方位随机
- **吉时**：12个时辰随机
- **幸运色**：10种颜色随机

### 3. 签到奖励
用户签到可获得：

| 运势等级 | 功德奖励 | 金币奖励 |
|---------|---------|---------|
| 大吉    | 100     | 10      |
| 吉      | 50      | 5       |
| 平      | 20      | 2       |
| 凶      | 10      | 1       |

**连签奖励**：
- 连续签到7天及以上：额外获得 50 功德 + 5 金币

### 4. 管理后台功能
管理员可以：
- 查看今日运势预览
- 查看运势统计（签到人数、签到率、最高连签）
- 查看今日签到记录
- 刷新运势数据

## 📊 数据库设计

### fortune_checkins 表
```sql
CREATE TABLE fortune_checkins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  date TEXT NOT NULL,  -- 签到日期 YYYY-MM-DD
  fortune TEXT NOT NULL,  -- 运势等级：大吉、吉、平、凶
  fortune_title TEXT NOT NULL,  -- 运势标题
  streak INTEGER DEFAULT 1,  -- 连签天数
  checkin_at INTEGER NOT NULL,  -- 签到时间戳（秒）
  UNIQUE(user_id, date),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**索引**：
- `idx_fortune_checkins_user_date`：用户ID + 日期
- `idx_fortune_checkins_date`：日期
- `idx_fortune_checkins_streak`：连签天数

## 🔌 API 接口

### 用户端接口

#### 1. 获取今日运势
```
GET /api/fortune
```

**响应**：
```json
{
  "date": "2026-05-14",
  "fortune": "大吉",
  "title": "大吉大利",
  "poem": "紫气东来三千里，鸿运当头万事兴",
  "description": "今日运势极佳，诸事顺遂，是开展新计划的绝佳时机",
  "advice": "开业",
  "avoid": "犹豫不决",
  "luckyDirection": "东方",
  "luckyTime": "辰时(07-09)",
  "luckyColor": "红色",
  "checkedIn": false
}
```

#### 2. 签到领取奖励
```
POST /api/fortune/checkin
```

**响应**：
```json
{
  "msg": "签到成功！获得 100 功德、10 金币",
  "streak": 3,
  "meritBonus": 100,
  "coinBonus": 10
}
```

**错误**：
- `400`：今日已签到

### 管理端接口

#### 1. 获取今日运势
```
GET /api/admin/fortune/today
```

**响应**：
```json
{
  "fortune": {
    "date": "2026-05-14",
    "fortune": "大吉",
    "title": "大吉大利",
    ...
  }
}
```

#### 2. 获取运势统计
```
GET /api/admin/fortune/stats
```

**响应**：
```json
{
  "stats": {
    "totalCheckins": 45,
    "totalUsers": 61,
    "checkinRate": 74,
    "maxStreak": 15
  }
}
```

#### 3. 获取今日签到记录
```
GET /api/admin/fortune/checkins
```

**响应**：
```json
{
  "records": [
    {
      "id": 1,
      "userId": 2,
      "username": "admin",
      "fortune": "大吉",
      "fortuneTitle": "大吉大利",
      "streak": 5,
      "checkinAt": 1715654400
    }
  ]
}
```

#### 4. 刷新运势
```
POST /api/admin/fortune/refresh
```

**响应**：
```json
{
  "msg": "运势已刷新",
  "fortune": { ... }
}
```

## 🎨 前端页面

### 1. 命脉页面（Dashboard）
- 显示今日运势卡片
- 运势等级徽章（不同颜色）
- 运势诗句（带引号装饰）
- 运势详情（描述、宜忌、吉方吉时等）
- 签到按钮（未签到时显示）
- 已签到标识（已签到时显示）

### 2. 管理后台 - 运势管理
- **今日运势预览**：完整的运势信息展示
- **运势统计**：4个统计卡片
  - 今日签到人数
  - 总用户数
  - 签到率
  - 最高连签
- **签到记录表格**：显示今日所有签到记录
- **API 配置信息**：显示数据源和更新策略

## 🎯 运势生成算法

### 伪随机种子
```typescript
const seed = date.split('-').reduce((acc, val) => acc + parseInt(val), 0)

const seededRandom = (index: number) => {
  const x = Math.sin(seed + index) * 10000
  return x - Math.floor(x)
}
```

### 特点
1. **确定性**：同一天生成相同的运势
2. **随机性**：不同天生成不同的运势
3. **可预测**：可以提前计算未来的运势
4. **无需存储**：不需要在数据库中存储运势数据

## 📱 用户体验

### 签到流程
1. 用户进入命脉页面
2. 查看今日运势
3. 点击"签到领取运势加成"按钮
4. 系统检查是否已签到
5. 计算连签天数
6. 发放奖励（功德 + 金币）
7. 显示签到成功提示
8. 更新用户资源

### 连签机制
- 连续每天签到，连签天数累加
- 中断一天，连签天数重置为1
- 连签7天及以上，获得额外奖励

## 🔧 配置说明

### 运势等级权重
可以在 `fortune.ts` 和 `admin-fortune.ts` 中调整：
```typescript
const FORTUNE_LEVELS = [
  { level: '大吉', title: '大吉大利', weight: 10 },
  { level: '吉', title: '吉星高照', weight: 30 },
  { level: '平', title: '平安顺遂', weight: 40 },
  { level: '凶', title: '诸事不宜', weight: 20 }
]
```

### 奖励配置
在 `fortune.ts` 的 `checkin` 函数中调整：
```typescript
switch (fortuneData.fortune) {
  case '大吉':
    meritBonus = 100
    coinBonus = 10
    break
  // ...
}

// 连签奖励
if (streak >= 7) {
  meritBonus += 50
  coinBonus += 5
}
```

## 🚀 未来扩展

### 1. 个性化运势
- 根据用户生辰八字生成个性化运势
- 不同星座/属相有不同的运势

### 2. 运势历史
- 记录用户的历史运势
- 统计用户的运势分布
- 生成运势报告

### 3. 运势分享
- 分享今日运势到社交媒体
- 生成运势海报图片

### 4. 运势提醒
- 每日推送运势通知
- 提醒用户签到

### 5. 运势互动
- 用户可以评价运势准确度
- 根据反馈调整运势算法

## 📝 使用示例

### 用户端
```typescript
// 获取今日运势
const fortune = await api('/fortune')

// 签到
const result = await api('/fortune/checkin', { method: 'POST' })
console.log(result.msg) // "签到成功！获得 100 功德、10 金币"
```

### 管理端
```typescript
// 获取统计
const stats = await api('/admin/fortune/stats')
console.log(stats.stats.checkinRate) // 74

// 获取签到记录
const records = await api('/admin/fortune/checkins')
console.log(records.records.length) // 45
```

## 🐛 常见问题

### 1. 为什么不调用外部 API？
- **稳定性**：不依赖外部服务，避免接口失效
- **性能**：本地生成，响应速度快
- **成本**：无需支付 API 费用
- **可控性**：完全控制运势生成逻辑

### 2. 运势是否真实？
- 运势内容是基于传统文化和算法生成的
- 仅供娱乐参考，不具有实际预测能力
- 主要目的是增加用户互动和趣味性

### 3. 如何修改运势内容？
- 编辑 `fortune.ts` 中的常量数组
- 添加新的诗句、描述、建议等
- 重新构建服务器代码

## 📚 相关文档

- [README.md](../README.md) - 项目概述
- [SYSTEM_COMPLETE_GUIDE.md](./SYSTEM_COMPLETE_GUIDE.md) - 系统完整指南
- [AUTH_SYSTEM.md](./AUTH_SYSTEM.md) - 认证系统文档
