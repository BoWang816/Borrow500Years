# 《向天再借500年》完整系统功能文档

> 一款融合赛博朋克与修仙元素的生命管理游戏  
> 版本：2.0  
> 最后更新：2024年

---

## 📖 目录

1. [系统概述](#系统概述)
2. [核心机制](#核心机制)
3. [用户系统](#用户系统)
4. [仪表盘功能](#仪表盘功能)
5. [修炼系统](#修炼系统)
6. [丹药系统](#丹药系统)
7. [历练系统](#历练系统)
8. [排行榜系统](#排行榜系统)
9. [个人资料](#个人资料)
10. [管理后台](#管理后台)
11. [技术架构](#技术架构)
12. [数据库设计](#数据库设计)

---

## 系统概述

### 游戏定位

《向天再借500年》是一款创新的生命管理游戏，将现实生活中的健康管理与修仙世界观相结合。玩家通过完成各种养生任务、修炼功法、炼制丹药来延长虚拟寿命，在游戏中体验"逆天改命"的修仙之旅。

### 核心理念

- **生命倒计时**: 每个玩家都有一个实时倒计时的寿命值
- **养生修炼**: 通过健康行为获得寿命增益
- **功德系统**: 完成任务获得功德，用于修炼和炼丹
- **境界提升**: 随着修炼深入，境界不断提升
- **社交竞技**: 排行榜系统激励玩家竞争

### 游戏特色

1. **赛博修仙风格**: 深色主题 + 金色/青色霓虹配色
2. **实时倒计时**: 寿命每秒递减，营造紧迫感
3. **科学算法**: 基于BMI等真实健康指标计算寿命
4. **丰富玩法**: 养生、修炼、探险、挑战多种玩法
5. **成就系统**: 记录玩家的修仙历程

---


## 核心机制

### 寿命计算公式

游戏的核心是寿命计算系统，公式如下：

```
L_current = L_initial + Σ L_gain − (T_now − T_start) × R_decay
```

**参数说明**:
- `L_current`: 当前剩余寿命（秒）
- `L_initial`: 初始寿命（基于天命测算）
- `Σ L_gain`: 所有养生行为的寿命增益总和
- `T_now`: 当前时间戳
- `T_start`: 命盘开启时间戳
- `R_decay`: 衰减系数（受丹药、状态影响）

### 天命测算算法

注册时根据用户输入计算初始寿命：

#### 步骤1：计算BMI
```
BMI = 体重(kg) / (身高(m))²
```

#### 步骤2：计算健康减损系数 δ
```
if BMI < 18.5 or BMI > 28:
    δ = 1.0 - (|BMI - 23.2| × 0.02)
    δ = max(δ, 0.5)  // 最低0.5
elif 18.5 ≤ BMI ≤ 24:
    δ = 1.0  // 完美健康
else:  // 24 < BMI ≤ 28
    δ = 1.0 - (|BMI - 23.2| × 0.02)
    δ = max(δ, 0.5)
```

#### 步骤3：计算初始总寿元
```
T_max = 100年 × δ
```

#### 步骤4：计算剩余可用寿元
```
T_now = (T_max - 当前年龄) × 31,536,000秒
```

#### 步骤5：一线生机机制
```
if T_now ≤ 0:
    T_now = 3600秒  // 1小时
    初始功德 = 100
    状态 = "逆天改命"
```

### 根骨评级系统

根据健康系数 δ 评定根骨品质：

| δ 范围 | 评级 | 颜色 | 说明 |
|--------|------|------|------|
| ≥ 0.95 | 上品 | 紫色 | 天赋异禀 |
| ≥ 0.85 | 中品 | 青色 | 资质优秀 |
| ≥ 0.70 | 凡品 | 金色 | 普通资质 |
| < 0.70 | 下品 | 橙色 | 根基薄弱 |
| 一线生机 | 逆命 | 红色 | 逆天改命 |

### 境界系统

玩家通过修炼提升境界，境界影响可用功法和任务：

**境界列表**（共17个境界）:
1. 凡胎肉身（0-80岁）
2. 练气初期
3. 练气中期
4. 练气后期
5. 练气大圆满
6. 筑基初期
7. 筑基中期
8. 筑基后期
9. 筑基大圆满（80-120岁）
10. 金丹初期
11. 金丹中期
12. 金丹后期
13. 金丹大圆满（120-200岁）
14. 元婴初期
15. 元婴中期
16. 元婴后期
17. 元婴大圆满（200-500岁）

**境界特权**:
- **低境界**（筑基大圆满及以下）：需要凡俗养生（步行、饮水、饮食等）
- **高境界**（金丹初期及以上）：可以高阶修炼（吐纳天地、观星悟道等）

---


## 用户系统

### 注册流程

1. **输入账号信息**
   - 道号（用户名）：2-24字符
   - 心法口诀（密码）：至少4位

2. **填写命盘信息**（注册时一步完成）
   - 年龄：1-100岁
   - 性别：乾身（男）/ 坤身（女）
   - 身高：100-250cm
   - 体重：30-200kg

3. **天命测算**
   - 系统实时计算并显示：
     - 天命寿元（总寿命）
     - 剩余寿元（可用寿命）
     - 根骨评级
     - 一线生机提示（如触发）

4. **命盘开启**
   - 自动创建用户档案
   - 初始化寿命倒计时
   - 分配初始资源（1复活币）
   - 如触发一线生机，额外获得100功德

### 登录系统

- **Token认证**: 使用JWT token进行身份验证
- **自动登录**: Token有效期30天
- **会话管理**: 支持多设备登录

### 用户资源

每个用户拥有以下资源：

1. **寿命值**（lifeSec）
   - 实时递减
   - 可通过养生任务增加
   - 归零后进入"濒死"状态

2. **复活币**（coin）
   - 初始1个
   - 用于濒死复活
   - 可通过任务获得碎片合成

3. **复活币碎片**（shard）
   - 5个碎片合成1个复活币
   - 通过冥想等任务获得

4. **功德值**（merit）
   - 完成任务获得
   - 用于修炼功法和炼制丹药
   - 累计功德影响排行榜

5. **连续签到**（streak）
   - 每日签到增加
   - 断签清零
   - 影响签到奖励

---

## 仪表盘功能

### 寿命倒计时

**核心显示区域**，展示玩家的生命状态：

#### 显示模式

1. **完整模式**（默认）
   ```
   XXX年 XXX日 XX:XX:XX
   ```
   - 年：3位数字
   - 日：3位数字
   - 时分秒：标准格式

2. **精确秒模式**
   ```
   X,XXX,XXX 秒
   ```
   - 显示总秒数
   - 千位分隔符

3. **总天数模式**
   ```
   X,XXX 天
   ```
   - 显示总天数
   - 便于快速了解

#### 元数据显示

- **衰减速率**: 当前生命衰减倍率（受丹药影响）
- **境界**: 当前修炼境界
- **复活币**: 剩余复活币数量

#### 视觉效果

- 脉冲动画：3层同心圆环
- 八卦图案：旋转背景
- 发光效果：金色/青色霓虹
- 实时更新：每秒刷新

### 今日运势

**每日签到系统**，提供运势加成：

#### 运势等级

| 等级 | 概率 | 效果 |
|------|------|------|
| 大吉 | 5% | 紫色，最强加成 |
| 吉 | 25% | 青色，良好加成 |
| 平 | 40% | 金色，普通加成 |
| 凶 | 25% | 橙色，轻微减益 |
| 大凶 | 5% | 红色，明显减益 |

#### 运势内容

每日运势包含：
- **运势标题**: 如"大吉"、"吉"等
- **运势诗句**: 古风诗词
- **运势描述**: 详细说明
- **宜**: 建议做的事
- **忌**: 建议避免的事
- **吉方**: 幸运方位
- **吉时**: 幸运时辰
- **幸运色**: 幸运颜色

#### 签到奖励

- 每日首次签到获得运势加成
- 连续签到增加streak计数
- 签到后运势效果生效
- 断签后streak清零

### 事件日志

**命运卷轴**，记录玩家的修仙历程：

#### 事件类型

1. **好事件**（good）
   - 绿色/青色显示
   - 向上箭头图标
   - 如：寿命增加、功德获得

2. **坏事件**（bad）
   - 红色显示
   - 向下箭头图标
   - 如：寿命减少、资源消耗

3. **普通事件**（normal）
   - 灰色显示
   - 圆点图标
   - 如：系统通知、状态变化

#### 事件来源

- 完成养生任务
- 修炼功法
- 炼制丹药
- 探险秘境
- 渡劫挑战
- 世界事件
- 系统通知

#### 随机事件触发

- 点击"掷天骰"按钮
- 随机触发世界事件
- 可能获得奖励或惩罚
- 增加游戏趣味性

---


## 修炼系统

修炼系统是游戏的核心玩法，分为**养生修炼**和**功法修炼**两大类。

### 养生修炼 · 筑基之道

凡人基础修行，为高深功法打基础。

#### 基础养生（永远可用）

1. **子午流注** 🌙
   - **描述**: 顺应天地阴阳，23:00前入睡调息
   - **奖励**: +30分钟寿命 · -0.2x衰减 · +2功德
   - **说明**: 基础任务，所有境界可用

2. **静坐冥想** 🧘
   - **描述**: 凝神静气，感悟天地灵机
   - **奖励**: +15分钟寿命 · +3功德 · 复活币碎片
   - **说明**: 基础任务，有概率获得碎片

#### 凡人养生（低境界专属）

仅在**筑基大圆满及以下**境界可用：

3. **步步为营** 👣
   - **描述**: 凡人炼体，步行千里始于足下
   - **输入**: 滑动条选择步数（0-20000步）
   - **奖励**: 
     - 每1000步 = +12分钟
     - 达到10000步额外 +120分钟
     - 功德 = 步数/2000
   - **说明**: 鼓励运动，步数越多奖励越高

4. **上善若水** 💧
   - **描述**: 凡人需水润体，修士渐脱此需
   - **奖励**: +5分钟寿命 · +1功德
   - **说明**: 每日可多次饮水

5. **清淡饮食** 🍚
   - **描述**: 凡胎肉身需食，高阶修士辟谷
   - **奖励**: +20分钟寿命 · +3功德
   - **说明**: 每日一次

#### 高阶养生（高境界解锁）

仅在**金丹初期及以上**境界可用：

6. **吐纳天地** 🌬️
   - **描述**: 不食人间烟火，吸纳天地灵气
   - **奖励**: +2小时寿命 · +10功德
   - **说明**: 高阶修士专属

7. **观星悟道** ⛰️
   - **描述**: 夜观天象，感悟宇宙奥秘
   - **奖励**: +3小时寿命 · +15功德
   - **说明**: 高阶修士专属

#### 挑战任务（所有境界）

8. **早起挑战 · 七日劫数** ☀️
   - **描述**: 连续7天卯时（5-7点）起床修行
   - **进度**: 显示当前连续天数（X/7）
   - **奖励**: 每次 +5功德
   - **说明**: 
     - 需连续7天完成
     - 断签重新计数
     - 培养早起习惯

#### 扩展凡俗修行

低境界玩家可以看到更多扩展任务（从extra_tasks表加载）：
- 动态配置的额外任务
- 管理员可通过后台添加
- 提供更多养生选择

### 功法修炼 · 逆天改命

消耗功德，大幅增加寿命。

#### 功法系统

功法是高级修炼方式，需要消耗大量功德：

**功法特点**:
- 消耗功德解锁和升级
- 每次修炼大幅增加寿命
- 功法有等级系统
- 等级越高效果越强

**功法类型**:
1. **基础功法**: 入门级，消耗少
2. **炼体功法**: 强化身体
3. **心法**: 修炼心境
4. **内功心法**: 内力修炼
5. **高级功法**: 高阶修士专属

**功法升级**:
- 首次解锁：学习功法
- 后续升级：提升境界
- 等级越高，消耗越多
- 奖励倍率递增

**预计奖励计算**:
```
基础奖励 = 消耗功德 × 10分钟
等级倍率 = (当前等级 + 1)
总奖励 = 基础奖励 × 等级倍率
```

示例：
- 消耗100功德的功法
- Lv.0 → Lv.1: +1000分钟（约16.7小时）
- Lv.1 → Lv.2: +2000分钟（约33.3小时）
- Lv.2 → Lv.3: +3000分钟（约50小时）

---


## 丹药系统

丹药系统提供强大的增益效果，分为三大类。

### A. 逆转造化类

能够逆转自然规律，改变物理法则：

#### ⚡ 无距砂
- **消耗**: 100功德
- **效果**: 持续6小时，衰减减少15%
- **描述**: 吞服后周身三尺无视距离之限，以此物抹在剑上，剑出即中，无视虚空
- **适用**: 短期战斗或任务

#### 🏔️ 镇狱沉汞
- **消耗**: 120功德
- **效果**: 持续8小时，衰减减少25%
- **描述**: 极沉之水，入腹后身体重如山岳根基，足踏大地则万法不动
- **适用**: 中期防护

#### 🔄 反朔散
- **消耗**: 150功德
- **效果**: 持续4小时，衰减减少20%
- **描述**: 受击瞬间，伤势反向转嫁于出招者，称之为"因果倒悬"
- **适用**: 反击战术

#### 🌫️ 息劫灰
- **消耗**: 200功德
- **效果**: 持续12小时，衰减减少35%
- **描述**: 采自寂灭星辰的余灰，服下后周身气机彻底静止，连时间也无法在其身上留下痕迹
- **适用**: 长期保护，最强衰减减少

### B. 禁忌玄理类

涉及天道玄理，能够改变因果逻辑：

#### ☯️ 两仪错位丹
- **消耗**: 180功德
- **效果**: 持续6小时，衰减减少30%
- **描述**: 使服用者处于"似在非在"之间，肉眼可见，神识却空无一物
- **适用**: 隐匿行踪

#### 🌊 遗世忘川水
- **消耗**: 250功德
- **效果**: 持续3小时，衰减减少40%
- **描述**: 洗去天道对自身的"注视"，服下后短时间内不沾因果，可躲避任何天劫探测
- **适用**: 最强短期保护

#### ✨ 溯源金液
- **消耗**: 300功德
- **效果**: 直接增加24小时寿命
- **描述**: 强行将身体状态拨回至全盛之时，如同枯木逢春，逆转寿元
- **适用**: 紧急续命

#### 👁️ 窥天盲片
- **消耗**: 220功德
- **效果**: 持续24小时，衰减减少10%，功德获取效率+150%
- **描述**: 借得一丝天道视角，虽只有一瞬，却能看破世间万物运行的脉络
- **适用**: 功德刷取

### C. 基础修仙丹药

为修仙者提供基础支持：

#### 💊 聚气丹
- **消耗**: 50功德
- **效果**: 直接增加2小时寿命
- **描述**: 凝聚天地灵气，增加寿命2小时
- **适用**: 入门级续命

#### 🔮 筑基丹
- **消耗**: 80功德
- **效果**: 持续24小时，衰减减少10%
- **描述**: 稳固修为根基，降低衰减10%，持续24小时
- **适用**: 日常保护

#### 🌿 延寿丹
- **消耗**: 120功德
- **效果**: 直接增加6小时寿命，持续12小时衰减减少5%
- **描述**: 延年益寿，增加寿命6小时，降低衰减5%，持续12小时
- **适用**: 综合续命

#### 🏆 功德丹
- **消耗**: 100功德
- **效果**: 持续8小时，功德获取效率+50%
- **描述**: 积累功德，提升功德获取效率50%，持续8小时
- **适用**: 功德积累

### 丹药效果机制

#### 即时效果
- 服用后立即增加寿命
- 直接加到当前寿命值
- 适合紧急情况

#### 持续效果
- 在指定时间内生效
- 降低衰减率或提升功德获取
- 适合长期规划

#### 效果叠加
- 同类效果不叠加（取最强）
- 不同类效果可叠加
- 显示在"我的丹炉"中

### 我的丹炉

显示当前生效的所有丹药：
- 丹药名称和图标
- 效果描述
- 剩余时间
- 实时倒计时

---


## 历练系统

历练系统提供多种挑战和奖励机会。

### 秘境探险

**消耗功德，探寻机缘**

#### 基本信息
- **消耗**: 20功德/次
- **机制**: 随机抽取奖励
- **冷却**: 无限制

#### 奖励等级

| 等级 | 概率 | 奖励 | 颜色 |
|------|------|------|------|
| 传说 | 1% | +1年寿命 | 金色 |
| 史诗 | 5% | +1天寿命 | 紫色 |
| 稀有 | 15% | +12小时寿命 | 蓝色 |
| 普通 | 79% | 灵气（小量功德/寿命） | 绿色 |

#### 探险结果
- 显示抽取结果
- 播放动画效果
- 自动添加到背包
- 记录到事件日志

### 天劫挑战

**每周一次，逆天改命**

#### 挑战机制

1. **周期**: 每周一次（周一重置）
2. **状态流转**:
   ```
   available（可接受）
   → accepted（已接受）
   → completed（已完成）/ failed（已失败）
   ```

3. **任务生成**: 系统随机选择3项修炼任务

#### 挑战流程

1. **查看天劫**
   - 显示3项指定任务
   - 如："子午流注"、"步步为营"、"静坐冥想"

2. **接受天劫**
   - 点击"接下天劫"按钮
   - 状态变为active
   - 开始计数进度

3. **完成任务**
   - 完成指定的3项任务
   - 进度显示：X/3
   - 可随时查看进度

4. **渡劫结果**
   - **成功**: 点击"完成"，获得+7天寿命
   - **失败**: 点击"放弃"，扣除-3小时寿命

#### 奖励机制
- **成功**: +7天（604,800秒）
- **失败**: -3小时（10,800秒）
- 本周完成后不可再次挑战

### 成就系统

**修仙路上的里程碑**

#### 成就类型

成就分为多个类别：

1. **寿命成就**
   - 达到特定寿命值
   - 如：100年、200年、500年

2. **修炼成就**
   - 完成特定次数任务
   - 如：完成100次养生、修炼10次功法

3. **境界成就**
   - 达到特定境界
   - 如：筑基、金丹、元婴

4. **资源成就**
   - 积累特定资源
   - 如：1000功德、10复活币

5. **社交成就**
   - 排行榜相关
   - 如：登顶长生榜、功德榜前三

6. **特殊成就**
   - 特殊条件触发
   - 如：一线生机、连续签到100天

#### 成就奖励

- 解锁成就获得称号
- 部分成就给予资源奖励
- 成就墙展示
- 社交炫耀

#### 成就检查

- 点击"检查"按钮
- 系统自动检测所有成就
- 显示新解锁的成就
- 更新成就墙

---


## 排行榜系统

展示顶尖修仙者的荣耀。

### 长生榜（剩余寿命）

**按当前剩余寿命排序**

#### 排名规则
- 实时计算剩余寿命
- 按寿命从高到低排序
- 显示前100名
- 自己的排名高亮显示

#### 显示信息
- 排名（1-100）
- 道号（用户名）
- 境界
- 剩余寿命（格式化显示）
- 特殊标记（自己）

#### 前三名特效
- 第1名：金色边框 + 皇冠图标
- 第2名：银色边框
- 第3名：铜色边框

### 功德榜（养生延寿）

**按累计功德获得量排序**

#### 排名规则
- 统计total_gained_sec（累计增益寿命）
- 按增益从高到低排序
- 显示前100名
- 自己的排名高亮显示

#### 显示信息
- 排名（1-100）
- 道号（用户名）
- 境界
- 累计功德（转换为寿命显示）
- 特殊标记（自己）

### 称号体系

根据寿命长度授予称号：

| 寿命范围 | 称号 | 说明 |
|---------|------|------|
| 0-80岁 | 凡胎肉身 | 普通人类寿命 |
| 80-120岁 | 寿比南山 | 长寿老人 |
| 120-200岁 | 地仙之姿 | 超越凡人 |
| 200-500岁 | 与天同寿 | 传说境界 |
| 500岁+ | 不老仙尊 | 终极目标 |

---

## 个人资料

展示玩家的详细信息和修仙日志。

### 统计信息栏

显示核心资源：

1. **复活币** 🪙
   - 当前数量
   - 用于濒死复活

2. **功德值** 💎
   - 当前数量
   - 用于修炼和炼丹

3. **复活币碎片** 🧩
   - 当前数量 / 5
   - 5个合成1个复活币

### 个人档案

#### 基础信息
- **道号**: 用户名
- **境界**: 当前修炼境界
- **性别**: 男/女
- **年龄**: 注册时填写
- **身高**: cm
- **体重**: kg
- **BMI**: 自动计算

#### 寿命信息
- **初始寿命**: 天命测算结果
- **累计增益**: 通过养生获得的总寿命
- **连续签到**: 当前连续天数

### 核心寿命公式

显示游戏的核心计算公式：

```
L_current = L_initial + Σ L_gain − (T_now − T_start) × R_decay
```

**公式说明**:
- L_gain：养生行为增量
- R_decay：衰减系数（受作息、心情等加成影响）

### 修仙日志

**记录修炼感悟和里程碑**

#### 日志功能

1. **创建日志**
   - 输入框：最多500字
   - 选择心情：平静、愉悦、疲惫、感悟、突破
   - 选择类型：修炼笔记、里程碑、感悟
   - 点击"记录"按钮

2. **日志列表**
   - 按时间倒序显示
   - 显示心情和类型标签
   - 显示创建时间
   - 显示日志内容

#### 日志类型

- **修炼笔记**: 日常修炼记录
- **里程碑**: 重要成就记录
- **感悟**: 修炼心得体会

#### 心情标签

- 平静：日常状态
- 愉悦：心情愉快
- 疲惫：修炼辛苦
- 感悟：有所领悟
- 突破：境界突破

---


## 管理后台

强大的管理系统，用于配置和监控游戏。

### 访问权限

- **管理员账号**: 在数据库中标记为admin
- **访问路径**: `/admin`
- **权限验证**: 自动检查admin状态

### 功能模块

#### 1. 总览（Overview）

**系统概况和快速统计**

显示内容：
- 总用户数
- 在线用户数
- 今日新增用户
- 系统运行时间
- 数据库大小
- 关键指标图表

#### 2. 丹药管理（Potions）

**管理所有丹药配置**

功能：
- 查看所有丹药列表
- 创建新丹药
- 编辑现有丹药
- 删除丹药
- 启用/禁用丹药
- 调整排序

丹药属性：
- ID（唯一标识）
- 名称
- 图标（emoji）
- 描述
- 消耗（数量）
- 消耗类型（功德/复活币）
- 即时寿命增加
- 持续时间
- 衰减减少
- 功德加成
- 排序顺序
- 启用状态

#### 3. 丹药配置（Potions Config）

**批量管理和导入导出**

功能：
- JSON格式批量导入
- 导出当前配置
- 重置为默认配置
- 备份和恢复

#### 4. 操作日志（Logs）

**查看所有管理员操作**

显示内容：
- 操作时间
- 管理员ID
- 操作类型
- 操作详情
- 操作结果

日志类型：
- 创建丹药
- 编辑丹药
- 删除丹药
- 修改配置
- 用户管理
- 系统设置

#### 5. 世界事件（Events）

**管理随机世界事件**

功能：
- 查看所有事件配置
- 创建新事件
- 编辑事件
- 删除事件
- 设置触发概率

事件属性：
- 事件ID
- 事件名称
- 事件描述
- 图标emoji
- 触发概率
- 奖励/惩罚
- 事件类型

#### 6. 功法管理（Manuals）

**管理修炼功法**

功能：
- 查看所有功法
- 创建新功法
- 编辑功法
- 删除功法
- 设置解锁条件

功法属性：
- 功法ID
- 功法名称
- 图标emoji
- 描述
- 消耗功德
- 奖励倍率
- 解锁境界
- 功法类型

#### 7. 任务管理（Tasks）

**管理扩展养生任务**

功能：
- 查看所有扩展任务
- 创建新任务
- 编辑任务
- 删除任务
- 设置可用境界

任务属性：
- 任务key
- 任务名称
- 图标emoji
- 描述
- 寿命奖励
- 功德奖励
- 可用境界范围

#### 8. 探险配置（Explore）

**配置秘境探险奖励**

功能：
- 设置各等级概率
- 配置奖励数值
- 调整探险消耗
- 查看探险统计

配置项：
- 传说概率和奖励
- 史诗概率和奖励
- 稀有概率和奖励
- 普通概率和奖励
- 探险消耗功德

### 管理员工具

#### 数据导出
- 导出用户数据
- 导出配置数据
- 导出日志数据

#### 数据导入
- 批量导入配置
- 恢复备份数据

#### 系统维护
- 清理过期数据
- 重建索引
- 数据库优化

---


## 技术架构

### 前端技术栈

#### 核心框架
- **Vue 3**: 渐进式JavaScript框架
- **TypeScript**: 类型安全的JavaScript超集
- **Vite**: 下一代前端构建工具

#### 状态管理
- **Pinia**: Vue 3官方推荐的状态管理库
- **Composition API**: Vue 3组合式API

#### 路由
- **Vue Router 4**: Vue 3官方路由

#### UI组件
- **自定义组件**: 完全自定义的UI组件
- **Font Awesome**: 图标库
- **Google Fonts**: 中文字体（Ma Shan Zheng、ZCOOL XiaoWei）

#### 样式
- **CSS Variables**: CSS自定义属性
- **CSS Modules**: 模块化CSS
- **动画**: CSS动画和过渡效果

### 后端技术栈

#### 运行环境
- **Cloudflare Workers**: 边缘计算平台
- **Hono**: 轻量级Web框架

#### 数据库
- **Cloudflare D1**: SQLite数据库
- **SQL**: 标准SQL查询语言

#### API设计
- **RESTful API**: REST风格的API设计
- **JSON**: 数据交换格式

#### 认证
- **Token认证**: 基于Token的身份验证
- **密码哈希**: SHA-256哈希算法

### 项目结构

```
Borrow500Years/
├── src/
│   ├── client/              # 前端代码
│   │   ├── components/      # Vue组件
│   │   │   ├── AuthModal.vue
│   │   │   ├── CrisisOverlay.vue
│   │   │   ├── Modal.vue
│   │   │   └── Pagination.vue
│   │   ├── views/           # 页面视图
│   │   │   ├── Dashboard.vue
│   │   │   ├── Cultivation.vue
│   │   │   ├── Inventory.vue
│   │   │   ├── Adventure.vue
│   │   │   ├── Leaderboard.vue
│   │   │   ├── Profile.vue
│   │   │   └── admin/       # 管理后台
│   │   ├── stores/          # 状态管理
│   │   │   ├── auth.ts
│   │   │   └── state.ts
│   │   ├── router/          # 路由配置
│   │   │   └── index.ts
│   │   ├── styles/          # 样式文件
│   │   │   ├── main.css
│   │   │   ├── variables.css
│   │   │   ├── base.css
│   │   │   ├── components.css
│   │   │   ├── dashboard.css
│   │   │   ├── cultivation.css
│   │   │   ├── inventory.css
│   │   │   ├── adventure.css
│   │   │   ├── leaderboard.css
│   │   │   ├── profile.css
│   │   │   ├── forms.css
│   │   │   ├── events.css
│   │   │   ├── fortune.css
│   │   │   ├── admin.css
│   │   │   └── logs.css
│   │   ├── types/           # TypeScript类型
│   │   │   └── index.ts
│   │   ├── utils/           # 工具函数
│   │   │   └── api.ts
│   │   ├── App.vue          # 根组件
│   │   └── main.ts          # 入口文件
│   └── server/              # 后端代码
│       ├── api/             # API路由
│       │   ├── index.ts
│       │   ├── middleware.ts
│       │   └── modules/     # API模块
│       │       ├── auth.ts
│       │       ├── state.ts
│       │       ├── tasks.ts
│       │       ├── potions.ts
│       │       ├── explore.ts
│       │       ├── tribulation.ts
│       │       ├── achievements.ts
│       │       ├── board.ts
│       │       ├── profile.ts
│       │       ├── fortune.ts
│       │       ├── manuals.ts
│       │       ├── extra-tasks.ts
│       │       ├── world-events.ts
│       │       ├── revive.ts
│       │       └── admin.ts
│       ├── index.ts         # 服务器入口
│       ├── lib.ts           # 工具函数
│       └── types.ts         # TypeScript类型
├── migrations/              # 数据库迁移
│   ├── 0001_initial_schema.sql
│   ├── 0002_features.sql
│   ├── 0003_admin.sql
│   ├── 0004_expansion.sql
│   ├── 0005_bulk_content.sql
│   ├── 0006_extra_tasks_50_more.sql
│   ├── 0007_admin_management_tables.sql
│   ├── 0008_potions_config_table.sql
│   └── 0010_cultivation_potions.sql
├── docs/                    # 文档
│   ├── QUICKSTART.md
│   ├── POTIONS_SYSTEM.md
│   ├── AUTH_SYSTEM.md
│   └── SYSTEM_COMPLETE_GUIDE.md
├── dist/                    # 构建输出
├── index.html               # HTML模板
├── package.json             # 项目配置
├── tsconfig.json            # TypeScript配置
├── vite.config.ts           # Vite配置（客户端）
├── vite.server.config.ts    # Vite配置（服务端）
└── wrangler.jsonc           # Cloudflare配置
```

### 部署架构

```
用户浏览器
    ↓
Cloudflare CDN（静态资源）
    ↓
Cloudflare Workers（API服务）
    ↓
Cloudflare D1（数据库）
```

**优势**:
- 全球边缘节点部署
- 低延迟响应
- 自动扩展
- 高可用性
- 免费额度充足

---


## 数据库设计

### 核心表结构

#### users（用户表）

存储用户账号和命盘信息：

```sql
CREATE TABLE users (
  -- 账号信息
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  token TEXT UNIQUE,
  token_expire_at INTEGER,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  
  -- 命盘信息
  name TEXT,                    -- 道号
  gender TEXT,                  -- male / female
  age INTEGER,
  height INTEGER,
  weight INTEGER,
  smoke INTEGER DEFAULT 0,      -- 0-3
  alcohol INTEGER DEFAULT 0,    -- 0-3
  stayup INTEGER DEFAULT 0,     -- 0-3
  hereditary INTEGER DEFAULT 0, -- 0-3
  exercise INTEGER DEFAULT 0,   -- 0-3
  meditate INTEGER DEFAULT 0,   -- 0-3
  
  -- 寿命核心
  initial_life_sec REAL,        -- 初始寿命（秒）
  bonus_sec REAL DEFAULT 0,     -- 额外寿命
  start_timestamp INTEGER,      -- 命盘开启时间（毫秒）
  total_gained_sec REAL DEFAULT 0, -- 累计增益（用于功德榜）
  
  -- 资源
  coin INTEGER DEFAULT 1,       -- 复活币
  shard INTEGER DEFAULT 0,      -- 复活币碎片
  merit INTEGER DEFAULT 0,      -- 功德值
  
  -- 状态
  streak INTEGER DEFAULT 0,     -- 连续签到天数
  dying INTEGER DEFAULT 0,      -- 是否濒死
  dying_start_at INTEGER,       -- 濒死开始时间
  updated_at INTEGER
);
```

**索引**:
- `idx_users_token`: token查询
- `idx_users_username`: 用户名查询
- `idx_users_name`: 道号查询

#### daily_tasks（每日任务记录）

记录用户每日完成的任务：

```sql
CREATE TABLE daily_tasks (
  user_id INTEGER NOT NULL,
  task_date TEXT NOT NULL,      -- YYYY-MM-DD
  ziwu INTEGER NOT NULL DEFAULT 0,
  steps INTEGER NOT NULL DEFAULT 0,
  water INTEGER NOT NULL DEFAULT 0,    -- 0~8
  meditate INTEGER NOT NULL DEFAULT 0,
  earlyrise INTEGER NOT NULL DEFAULT 0,
  diet INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, task_date),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### events（事件日志）

记录所有游戏事件：

```sql
CREATE TABLE events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  msg TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'normal',  -- good / bad / normal
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**索引**:
- `idx_events_user_time`: 用户事件时间查询

#### active_potions（已激活丹药）

记录用户当前生效的丹药：

```sql
CREATE TABLE active_potions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  potion_id TEXT NOT NULL,
  potion_name TEXT NOT NULL,
  potion_emoji TEXT,
  mod_id TEXT,
  mod_label TEXT,
  mod_value REAL DEFAULT 0,
  expire_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**索引**:
- `idx_active_potions_user`: 用户丹药查询

#### achievements（成就系统）

记录用户解锁的成就：

```sql
CREATE TABLE achievements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  ach_id TEXT NOT NULL,
  unlocked_at INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE(user_id, ach_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**索引**:
- `idx_ach_user`: 用户成就查询

#### tribulations（天劫挑战）

记录天劫挑战状态：

```sql
CREATE TABLE tribulations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  week_id TEXT NOT NULL,         -- YYYY-WNN
  status TEXT NOT NULL DEFAULT 'pending',
  tasks TEXT,                     -- JSON数组
  accepted_at INTEGER,
  completed_at INTEGER,
  reward_sec INTEGER DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**索引**:
- `idx_trib_user_week`: 用户周次查询

#### configs（配置表）

存储系统配置（key-value）：

```sql
CREATE TABLE configs (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);
```

#### admin_logs（管理员日志）

记录管理员操作：

```sql
CREATE TABLE admin_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  admin_user_id INTEGER NOT NULL,
  action TEXT NOT NULL,
  detail TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);
```

**索引**:
- `idx_admin_logs_time`: 时间查询

#### potions_config（丹药配置）

存储丹药配置信息：

```sql
CREATE TABLE potions_config (
  id TEXT PRIMARY KEY,
  emoji TEXT,
  name TEXT NOT NULL,
  desc TEXT,
  cost INTEGER DEFAULT 0,
  type TEXT DEFAULT 'merit',
  instant_life INTEGER DEFAULT 0,
  instant_merit INTEGER DEFAULT 0,
  dur INTEGER DEFAULT 0,
  dur_decay_reduction REAL DEFAULT 0,
  dur_merit_boost REAL DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT 1
);
```

#### extra_tasks_config（扩展任务配置）

存储扩展养生任务配置：

```sql
CREATE TABLE extra_tasks_config (
  task_key TEXT PRIMARY KEY,
  emoji TEXT,
  name TEXT NOT NULL,
  description TEXT,
  life_reward INTEGER DEFAULT 0,
  merit_reward INTEGER DEFAULT 0,
  min_realm_level INTEGER DEFAULT 0,
  max_realm_level INTEGER DEFAULT 7,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT 1
);
```

#### manuals_config（功法配置）

存储功法配置信息：

```sql
CREATE TABLE manuals_config (
  key TEXT PRIMARY KEY,
  emoji TEXT,
  name TEXT NOT NULL,
  description TEXT,
  cost_merit INTEGER DEFAULT 0,
  reward_multiplier REAL DEFAULT 1.0,
  min_realm_level INTEGER DEFAULT 0,
  manual_type TEXT DEFAULT 'basic',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT 1
);
```

#### user_manuals（用户功法进度）

记录用户功法修炼进度：

```sql
CREATE TABLE user_manuals (
  user_id INTEGER NOT NULL,
  manual_key TEXT NOT NULL,
  level INTEGER DEFAULT 0,
  last_practiced_at INTEGER,
  PRIMARY KEY (user_id, manual_key),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 数据关系图

```
users (1) ─── (N) daily_tasks
      │
      ├─── (N) events
      │
      ├─── (N) active_potions
      │
      ├─── (N) achievements
      │
      ├─── (N) tribulations
      │
      └─── (N) user_manuals

configs (独立配置表)
admin_logs (独立日志表)
potions_config (独立配置表)
extra_tasks_config (独立配置表)
manuals_config (独立配置表)
```

---


## API接口文档

### 认证接口

#### POST /api/auth/register
注册新用户

**请求体**:
```json
{
  "username": "道号",
  "password": "密码"
}
```

**响应**:
```json
{
  "token": "认证token",
  "userId": 1,
  "username": "道号",
  "needsOnboarding": true
}
```

#### POST /api/auth/login
用户登录

**请求体**:
```json
{
  "username": "道号",
  "password": "密码"
}
```

**响应**:
```json
{
  "token": "认证token",
  "userId": 1,
  "username": "道号",
  "needsOnboarding": false
}
```

#### POST /api/auth/logout
用户登出

**需要认证**: 是

**响应**:
```json
{
  "ok": true
}
```

### 状态接口

#### GET /api/state
获取用户状态

**需要认证**: 是

**响应**:
```json
{
  "profile": {
    "name": "道号",
    "realm": "凡胎肉身",
    "lifeSec": 2365200,
    "coin": 1,
    "merit": 50,
    "shard": 2,
    "streak": 5,
    ...
  },
  "potions": [...],
  "events": [...]
}
```

### 任务接口

#### POST /api/tasks/{taskKey}
完成指定任务

**需要认证**: 是

**路径参数**:
- `taskKey`: 任务标识（ziwu, meditate, water, diet等）

**请求体**（步数任务）:
```json
{
  "steps": 10000
}
```

**响应**:
```json
{
  "msg": "任务完成",
  "gainedSec": 1800,
  "gainedMerit": 5
}
```

### 丹药接口

#### GET /api/potions
获取所有可用丹药

**需要认证**: 是

**响应**:
```json
{
  "potions": [
    {
      "id": "wuju_sand",
      "name": "无距砂",
      "emoji": "⚡",
      "desc": "描述",
      "cost": 100,
      "type": "merit",
      ...
    }
  ]
}
```

#### POST /api/potions/{id}
炼制丹药

**需要认证**: 是

**路径参数**:
- `id`: 丹药ID

**响应**:
```json
{
  "msg": "炼制成功",
  "potion": {...}
}
```

### 探险接口

#### POST /api/explore
探险秘境

**需要认证**: 是

**响应**:
```json
{
  "msg": "获得传说奖励：+1年寿命",
  "type": "legendary",
  "reward": 31536000
}
```

### 天劫接口

#### GET /api/tribulation
获取天劫状态

**需要认证**: 是

**响应**:
```json
{
  "tribulation": {
    "status": "available",
    "tasks": ["子午流注", "步步为营", "静坐冥想"],
    "progress": 0
  }
}
```

#### POST /api/tribulation/accept
接受天劫

**需要认证**: 是

**响应**:
```json
{
  "msg": "天劫已接受"
}
```

#### POST /api/tribulation/complete
完成天劫

**需要认证**: 是

**响应**:
```json
{
  "msg": "渡劫成功，获得7天寿命",
  "reward": 604800
}
```

#### POST /api/tribulation/fail
放弃天劫

**需要认证**: 是

**响应**:
```json
{
  "msg": "渡劫失败，扣除3小时寿命",
  "penalty": -10800
}
```

### 成就接口

#### GET /api/achievements
获取所有成就

**需要认证**: 是

**响应**:
```json
{
  "achievements": [
    {
      "id": "first_100_years",
      "name": "百年之约",
      "description": "寿命达到100年",
      "emoji": "🎂",
      "unlocked": true
    }
  ]
}
```

#### POST /api/achievements/check
检查成就

**需要认证**: 是

**响应**:
```json
{
  "newAchievements": [
    {
      "id": "first_100_years",
      "name": "百年之约"
    }
  ]
}
```

### 排行榜接口

#### GET /api/board/life
长生榜

**需要认证**: 是

**响应**:
```json
{
  "rows": [
    {
      "userId": 1,
      "name": "道号",
      "realm": "金丹初期",
      "lifeSec": 31536000,
      "isMe": false
    }
  ]
}
```

#### GET /api/board/merit
功德榜

**需要认证**: 是

**响应**:
```json
{
  "rows": [
    {
      "userId": 1,
      "name": "道号",
      "realm": "金丹初期",
      "meritGained": 10000,
      "isMe": false
    }
  ]
}
```

### 个人资料接口

#### POST /api/profile/onboard
开启命盘

**需要认证**: 是

**请求体**:
```json
{
  "name": "道号",
  "gender": "male",
  "age": 25,
  "height": 170,
  "weight": 65,
  "smoke": 0,
  "alcohol": 0,
  "stayup": 0,
  "hereditary": 0,
  "exercise": 1,
  "meditate": 0,
  "initialLifeSec": 2365200,
  "initialMerit": 0
}
```

**响应**:
```json
{
  "ok": true,
  "remainYears": 75.0,
  "initialMerit": 0
}
```

### 运势接口

#### GET /api/fortune
获取今日运势

**需要认证**: 是

**响应**:
```json
{
  "fortune": "大吉",
  "title": "大吉",
  "poem": "运势诗句",
  "description": "运势描述",
  "advice": "宜做之事",
  "avoid": "忌做之事",
  "luckyDirection": "东方",
  "luckyTime": "子时",
  "luckyColor": "金色",
  "checkedIn": false
}
```

#### POST /api/fortune/checkin
签到

**需要认证**: 是

**响应**:
```json
{
  "msg": "签到成功"
}
```

#### GET /api/fortune/logs
获取修仙日志

**需要认证**: 是

**响应**:
```json
{
  "logs": [
    {
      "id": 1,
      "content": "今日修炼有所感悟",
      "mood": "感悟",
      "type": "note",
      "created_at": 1234567890
    }
  ]
}
```

#### POST /api/fortune/logs
创建修仙日志

**需要认证**: 是

**请求体**:
```json
{
  "content": "今日修炼有所感悟",
  "mood": "感悟",
  "type": "note"
}
```

**响应**:
```json
{
  "msg": "日志已记录"
}
```

### 功法接口

#### GET /api/manuals
获取所有功法

**需要认证**: 是

**响应**:
```json
{
  "manuals": [
    {
      "key": "basic_breathing",
      "name": "基础吐纳术",
      "emoji": "🌬️",
      "description": "描述",
      "costMerit": 100,
      "myLevel": 0
    }
  ]
}
```

#### POST /api/manuals/{key}/practice
修炼功法

**需要认证**: 是

**路径参数**:
- `key`: 功法标识

**响应**:
```json
{
  "msg": "修炼成功，境界提升",
  "newLevel": 1,
  "gainedSec": 60000
}
```

### 管理员接口

#### GET /api/admin/me
检查管理员权限

**需要认证**: 是

**响应**:
```json
{
  "admin": true
}
```

#### GET /api/admin/potions
获取丹药配置

**需要认证**: 是（管理员）

**响应**:
```json
{
  "potions": [...]
}
```

#### POST /api/admin/potions
创建丹药

**需要认证**: 是（管理员）

**请求体**:
```json
{
  "id": "new_potion",
  "name": "新丹药",
  "emoji": "💊",
  "desc": "描述",
  "cost": 100,
  "type": "merit",
  ...
}
```

#### PUT /api/admin/potions/{id}
更新丹药

**需要认证**: 是（管理员）

#### DELETE /api/admin/potions/{id}
删除丹药

**需要认证**: 是（管理员）

---


## 游戏玩法指南

### 新手入门

#### 第一步：注册账号
1. 输入道号（用户名）和心法口诀（密码）
2. 填写年龄、性别、身高、体重
3. 查看天命测算结果
4. 点击"开启命盘"完成注册

#### 第二步：了解界面
- **寿命倒计时**: 核心显示区，实时递减
- **今日运势**: 每日签到获得加成
- **事件日志**: 记录所有游戏事件

#### 第三步：开始修炼
1. 进入"修炼大道"页面
2. 完成基础养生任务（子午流注、静坐冥想）
3. 获得寿命和功德奖励
4. 查看寿命增加效果

#### 第四步：炼制丹药
1. 进入"丹房·商城"页面
2. 使用功德炼制丹药
3. 查看丹药效果
4. 在"我的丹炉"中查看生效的丹药

#### 第五步：探险历练
1. 进入"仙途历练"页面
2. 消耗功德探险秘境
3. 接受天劫挑战
4. 解锁成就

### 进阶策略

#### 寿命管理
1. **优先完成基础任务**: 子午流注、静坐冥想每日必做
2. **合理使用丹药**: 根据需求选择合适的丹药
3. **参与天劫挑战**: 每周一次，奖励丰厚
4. **探险秘境**: 有概率获得大量寿命

#### 功德积累
1. **每日签到**: 连续签到增加奖励
2. **完成所有养生任务**: 最大化功德获取
3. **使用功德丹**: 提升功德获取效率
4. **窥天盲片**: 功德获取效率+150%

#### 境界提升
1. **修炼功法**: 消耗功德提升境界
2. **完成挑战**: 天劫、成就等
3. **长期规划**: 高境界解锁高阶功法

#### 资源管理
1. **复活币**: 珍贵资源，谨慎使用
2. **复活币碎片**: 通过冥想等任务积累
3. **功德**: 主要货币，用于修炼和炼丹
4. **寿命**: 核心资源，通过各种方式增加

### 高级技巧

#### 最优养生路线
1. 早上5-7点：完成早起挑战
2. 白天：完成步数任务（10000步）
3. 饮水8杯：分散在全天
4. 清淡饮食：一日三餐
5. 23:00前：完成子午流注
6. 睡前：静坐冥想

#### 功德最大化
1. 使用窥天盲片（+150%功德）
2. 完成所有养生任务
3. 探险秘境（有概率获得功德）
4. 天劫挑战（完成后获得大量功德）

#### 丹药搭配
1. **日常保护**: 筑基丹（24小时-10%衰减）
2. **功德刷取**: 窥天盲片（+150%功德）
3. **紧急续命**: 溯源金液（+24小时）
4. **长期保护**: 息劫灰（12小时-35%衰减）

#### 排行榜冲刺
1. **长生榜**: 
   - 最大化寿命增益
   - 使用强力丹药减少衰减
   - 完成所有任务
   
2. **功德榜**:
   - 累计增益寿命
   - 长期坚持养生
   - 使用功德加成丹药

---

## 常见问题

### Q: 寿命归零会怎样？
A: 进入"濒死"状态，可以使用复活币复活，或者重新开始。

### Q: 如何获得复活币？
A: 初始1个，通过收集5个复活币碎片合成，碎片通过冥想等任务获得。

### Q: 功德有什么用？
A: 用于修炼功法、炼制丹药、探险秘境等。

### Q: 境界如何提升？
A: 通过修炼功法、完成挑战、积累寿命等方式提升。

### Q: 天劫挑战失败会怎样？
A: 扣除3小时寿命，本周不可再次挑战。

### Q: 丹药效果可以叠加吗？
A: 同类效果不叠加（取最强），不同类效果可叠加。

### Q: 如何成为管理员？
A: 需要在数据库中手动设置admin标记。

### Q: 数据会丢失吗？
A: 数据存储在Cloudflare D1数据库，安全可靠。

### Q: 可以多设备登录吗？
A: 可以，使用同一个token即可。

### Q: 如何修改个人信息？
A: 目前不支持修改，需要重新注册。

---

## 更新日志

### v2.0 (2024)
- ✨ 全新的登录注册系统
- ✨ 天命测算算法
- ✨ 根骨评级系统
- ✨ 一线生机机制
- 🎨 赛博修仙风格UI
- 🔧 优化寿命计算公式
- 🔧 改进丹药系统
- 📝 完善文档

### v1.0 (2023)
- 🎉 初始版本发布
- ✨ 基础养生系统
- ✨ 丹药系统
- ✨ 排行榜系统
- ✨ 成就系统
- ✨ 管理后台

---

## 开发指南

### 本地开发

#### 环境要求
- Node.js 18+
- npm 或 yarn
- Cloudflare账号（用于部署）

#### 安装依赖
```bash
npm install
```

#### 启动开发服务器
```bash
npm run dev
```

#### 构建生产版本
```bash
npm run build
```

#### 部署到Cloudflare
```bash
npm run deploy
```

### 数据库迁移

#### 应用迁移
```bash
wrangler d1 execute DB --file=migrations/0001_initial_schema.sql
wrangler d1 execute DB --file=migrations/0002_features.sql
wrangler d1 execute DB --file=migrations/0003_admin.sql
# ... 其他迁移文件
```

#### 查看数据库
```bash
wrangler d1 execute DB --command="SELECT * FROM users LIMIT 10"
```

### 添加新功能

#### 1. 添加新任务
1. 在 `src/server/api/modules/tasks.ts` 添加任务逻辑
2. 在 `src/client/views/Cultivation.vue` 添加UI
3. 更新数据库（如需要）

#### 2. 添加新丹药
1. 在管理后台创建丹药配置
2. 或直接在 `potions_config` 表插入数据

#### 3. 添加新成就
1. 在 `src/server/api/modules/achievements.ts` 定义成就
2. 实现检查逻辑
3. 在前端显示

### 代码规范

- 使用TypeScript
- 遵循ESLint规则
- 组件使用Composition API
- CSS使用CSS Variables
- 提交前运行lint

---

## 致谢

感谢所有为这个项目做出贡献的开发者和玩家！

---

## 许可证

MIT License

---

## 联系方式

如有问题或建议，请通过以下方式联系：

- GitHub Issues
- Email: [your-email@example.com]

---

**《向天再借500年》** - 让生命管理变得有趣！

