# 向天再借500年 · Borrow 500 Years

> 融合「健康管理」与「RPG 模拟」的寿命延长养成 Web 应用 — 赛博朋克 × 中医古风 — **D1 数据库后端版**。

## 项目概述
- **名称**:向天再借500年 (Borrow 500 Years)
- **目标**:通过将健康行为「数字化为寿命收益」,激励用户改善生活习惯,并在排行榜维度获得成就感
- **定位**:基于真实生命数据的放置类 RPG 模拟经营应用
- **架构**:Cloudflare Pages + Hono SSR + D1 (SQLite) 真后端

## 在线访问
- **沙盒预览**:https://3000-idcdgr14gtrx8afyfy33g-8f57ffe2.sandbox.novita.ai
- **本地开发**:http://localhost:3000

## ✅ 已完成功能(D1 后端版)

### 🔐 1. 账号系统(全新)
- 注册:道号 + 密令(SHA-256 加盐哈希存储)
- 登录:用户名密码登录,签发 30 天有效期 token
- 登出:服务端清空 token
- 顶栏显示当前用户徽章
- token 存于浏览器 localStorage,所有 API 通过 `Authorization: Bearer` 鉴权

### 🫀 2. 数字化生命系统 (Life Kernel)
- 注册测算:根据 **性别 / 年龄 / 身高 / 体重 (BMI) / 烟酒史 / 家族病史 / 习武 / 打坐** 服务端生成初始预期寿命
- 实时倒计时 (The Pulse):50ms 跳动,3 种显示模式
- 服务端 + 客户端同步衰减算法,服务端兜底防作弊
- 八卦旋转、命盘环、危机心跳红光

### 🌿 3. 养生修炼(任务系统)— 服务端校验
- 子午流注(早睡)/ 步步为营(步数)/ 上善若水(8 杯水)/ 静坐冥想 / 七日早起劫数 / 清淡饮食
- 每日打卡状态写入 `daily_tasks` 表,任务次日自动重置
- 重复打卡会被服务端拒绝

### ⚗️ 4. 道具与商城系统(丹房)
- 6 款丹药:护肝片 / 褪黑素 / 深睡胶囊 / 千年人参 / 九叶灵芝 / 九转金丹
- 持续型丹药写入 `active_potions` 表(含过期时间戳),状态拉取时自动清理过期
- 资源不足由服务端返回 400,前端 toast 提示

### 🏆 5. 排行榜(真实)
- 服务端实时计算所有用户的剩余寿命 / 累计延寿
- 长生榜 + 功德榜双榜,当前用户标注
- 境界筛选：支持按5大境界（凡蜕期、超凡期、化境期、极境期、道极期）筛选用户
- 分页显示：每页20位修士，智能页码导航
- 60+ NPC 由 `seed.sql` 预置，覆盖所有20个小境界
- 真实玩家加入后会进入排名

### 🎲 6. 命运卷轴 · 随机事件
- 服务端掷骰,10 种事件
- 弥留期不可触发(防止滥用复活)

### 💀 7. 状态机
- 生存 → 危机(<30 天血红预警)→ 弥留(24h 服务端跟踪 `dying_start_at`)
- 复活:消耗 1 枚复活币,服务端重置寿命到初始 50%
- 转世:清空 profile/events/potions/daily_tasks,账号保留
- 弥留期满:下次拉取状态时服务端自动转世

### 👤 8. 道号印鉴
- 古风印鉴头像、BMI、命盘开启天数、累积修炼增量
- 核心寿命计算公式展示

## 🗂️ API 路由表

| 方法 | 路径 | 鉴权 | 说明 |
|---|---|---|---|
| POST | `/api/auth/register` | - | 注册新道号 |
| POST | `/api/auth/login` | - | 登录,返回 token |
| POST | `/api/auth/logout` | ✅ | 登出 |
| POST | `/api/profile/onboard` | ✅ | 开启/重开命盘 |
| GET  | `/api/state` | ✅ | 一次拉取完整状态(profile / 任务 / 道具 / 事件 / 衰减率) |
| POST | `/api/task/:name` | ✅ | 完成任务:`ziwu`/`steps`/`water`/`meditate`/`earlyrise`/`diet` |
| GET  | `/api/potions` | - | 丹药目录 |
| POST | `/api/potion/:id` | ✅ | 炼制服用 |
| POST | `/api/event/random` | ✅ | 掷天骰触发随机事件 |
| POST | `/api/revive` | ✅ | 弥留期消耗复活币续命 |
| POST | `/api/reborn` | ✅ | 转世清档(账号保留) |
| GET  | `/api/board/:type` | (可选) | `longevity` / `merit` 排行榜 |

## 数据架构

### 数据模型(D1 SQLite)
```
users           id, username, password_hash, token, token_expire_at, created_at
profiles        user_id (PK), name, gender, age, height, weight,
                smoke, alcohol, stayup, hereditary, exercise, meditate,
                initial_life_sec, bonus_sec, start_timestamp, total_gained_sec,
                coin, shard, merit, streak, dying, dying_start_at, updated_at
daily_tasks     (user_id, task_date) PK, ziwu, steps, water, meditate, earlyrise, diet
events          id, user_id, msg, kind, created_at  (仅保留最近 100 条/人)
active_potions  id, user_id, potion_id, potion_name, potion_emoji,
                mod_id, mod_label, mod_value, expire_at
```

### 核心公式(服务端)
```
L_current = L_initial + bonus_sec − (now − start_timestamp) × baseDecayMultiplier(profile)
```

## 用户指南

### 管理员登录
- **用户名**: admin
- **密码**: admin123
- 管理员账号在首次启动时自动创建

### 普通用户使用流程
1. **首次访问**:弹出登仙籍弹窗 → 选「注册新道号」→ 填道号 + 密令
2. **天命测算**:填根骨问卷,服务端生成初始命盘
3. **首页 · 命脉**:观看寿命倒计时、点击「掷天骰」触发随机事件
4. **修炼 Tab**:每日完成 6 项任务延长寿命、积累功德
5. **丹房 Tab**:用功德值或复活币换购延寿补剂
6. **长生榜 Tab**:与全部真实玩家 + NPC 比拼排名，支持按境界筛选
7. **顶部 ⟳ 按钮**:转世重修(账号保留)/ 登出按钮:退出账号

## 🔧 技术栈
- **框架**:Hono 4.x (SSR + API) + Cloudflare Pages
- **数据库**:Cloudflare D1 (SQLite) 生产环境（通过 wrangler.jsonc 绑定）
- **环境变量**:通过 wrangler.jsonc 配置（不使用 .dev.vars）
- **样式**:原生 CSS(赛博朋克 + 古风)+ FontAwesome + Google Fonts
- **构建**:Vite 6 + `@hono/vite-build`
- **运行**:Wrangler Pages Dev（自动连接配置的 D1 数据库）
- **加密**:Web Crypto API (SHA-256),Cloudflare Workers 兼容

## 🚀 快速开始

### 首次启动（自动初始化）
```bash
# 启动开发服务器（自动检测并初始化数据库）
npm run dev

# 访问应用
# 前端: http://localhost:5173
# 后端: http://localhost:8788
```

**首次启动时会自动：**
1. 检测数据库是否存在
2. 应用所有数据库迁移
3. 导入种子数据（60个NPC用户 + 5个全服事件）
4. 创建默认管理员账号（用户名: admin, 密码: admin123）
5. 构建服务器代码
6. 启动前后端服务

### 日常开发
```bash
# 启动开发服务器（自动清理端口 + 重新构建）
npm run dev
```

### 数据库管理
```bash
# 手动初始化数据库（可选）
./init-db.sh

# 查询数据库
npx wrangler d1 execute webapp-production --local --command "SELECT * FROM users LIMIT 5"

# 应用新的迁移
npx wrangler d1 migrations apply webapp-production --local

# 重新灌入种子数据
npx wrangler d1 execute webapp-production --local --file=./seed.sql
```

### 部署到生产
```bash
# 部署（会自动构建）
npm run deploy
```

**注意**：
- 开发环境通过 `wrangler.jsonc` 中的 D1 绑定自动连接生产数据库
- 数据库操作命令使用 `--remote` 标志直接操作远程数据库
- 无需本地数据库，所有数据存储在 Cloudflare D1 生产环境
- 环境变量（如 `ADMIN_USERS`）必须在 `wrangler.jsonc` 的 `vars` 部分配置
- `.dev.vars` 文件已弃用（仅在使用 `--local` 时生效）

## ⚠️ 暂未实现
- 真实穿戴设备接入(Apple Watch/华为健康)
- GPS / 加速度传感器防作弊
- 公会系统(养生宗门)
- 服务端定时任务(目前事件清理是写入时触发)

## 🚀 推荐下一步
1. **管理后台**:运营查看用户分布、调整丹药参数
2. **WebSocket / SSE 推送**:好友延寿排行实时通知
3. **PWA 化** + Service Worker 推送危机提醒
4. **OAuth 登录**:GitHub / 微信扫码
5. **AI 命理点评**:用大模型每周生成「命盘周报」
6. **公会道场**:组队累计步数 PK

## 📊 项目状态

### 当前状态：🎉 生产就绪

- ✅ **寿命单位系统**: 已完全转换为年单位（0.001年-10000年）
- ✅ **数据库配置**: 完整的游戏配置数据（7个配置表）
- ✅ **文档体系**: 完善的技术和操作文档
- ✅ **构建状态**: 0 TypeScript错误
- ✅ **Seed数据**: 包含60+ NPC用户和所有配置

### 部署信息
- **平台**: Cloudflare Pages + D1
- **数据库**: 生产 D1 数据库 (database_id: 78428bf5-aa55-4119-92e9-42d42e53c120)
- **开发模式**: 使用 `--remote` 连接生产数据库
- **最近更新**: 2026-05-15（完成年单位系统转换和数据库更新）

## 📚 文档导航

### 快速开始
- [部署指南](./docs/DEPLOYMENT_GUIDE.md) - 新服务部署完整流程
- [快速启动](./docs/QUICK_START_AFTER_CONVERSION.md) - 开发环境快速启动

### 技术文档
- [项目状态总览](./docs/PROJECT_STATUS.md) - 完整的项目状态和进度
- [最终完成总结](./docs/FINAL_COMPLETE_SUMMARY.md) - 年单位系统转换总结
- [开发者快速参考](./docs/DEVELOPER_QUICK_REFERENCE.md) - 开发规范和最佳实践
- [数据库数值更新](./docs/DATABASE_VALUES_UPDATE_COMPLETE.md) - 数据库更新详情

### 操作指南
- [测试清单](./docs/TESTING_CHECKLIST.md) - 完整的功能测试清单
- [Seed数据说明](./docs/SEED_DATA_UPDATE.md) - 初始化数据说明
- [管理页面转换](./docs/ADMIN_PAGES_CONVERSION_COMPLETE.md) - 管理后台使用指南
