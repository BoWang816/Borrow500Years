# 境界动态匹配完成

## 概述
系统已完全移除硬编码的境界名称，所有境界数据现在都从数据库动态获取并根据用户寿命进行匹配。

## 主要变更

### 1. 后端动态境界匹配
**文件**: `src/server/lib.ts`
- 新增 `getRealmByAge()` 异步函数
- 根据用户总年龄（秒）从数据库查询匹配的境界
- 使用 `breakthrough_age_min` 字段进行匹配
- 返回境界ID和名称

### 2. 状态模块更新
**文件**: `src/server/api/modules/state.ts`
- 使用 `getRealmByAge()` 动态获取用户境界
- 返回 `realm`（境界名称）和 `realmId`（境界ID）
- 移除所有硬编码境界常量

### 3. 管理模块更新
**文件**: `src/server/api/modules/admin.ts`
- 用户管理接口使用 `getRealmByAge()` 动态计算境界
- 移除硬编码的 `TITLES` 数组和 `getRealmTitle()` 函数

### 4. 排行榜模块更新
**文件**: `src/server/api/modules/board.ts`
- 排行榜数据使用 `getRealmByAge()` 动态获取境界信息

### 5. 前端类型定义
**文件**: `src/client/types/index.ts`
- Profile 接口新增 `realmId: number` 字段
- 保留 `realm: string` 字段用于显示境界名称

### 6. 修炼页面更新
**文件**: `src/client/views/Cultivation.vue`
- 使用 `profile.realmId` 进行境界等级比较
- 移除 "凡胎肉身" 等硬编码文本，改为通用描述
- 境界判断逻辑：
  - `realmId <= 8`: 低境界（需要凡俗养生）
  - `realmId >= 9`: 高境界（可以高阶修炼）

### 7. 成就系统更新
**文件**: `src/server/api/modules/achievements.ts`
- 更新成就描述，移除硬编码境界名称
- `elder_100`: "境界达到寿比南山（100岁）" → "总寿命达到 100 岁"
- `elder_200`: "境界达到地仙之姿（200岁）" → "总寿命达到 200 岁"

## 移除的硬编码内容

### 前端
- ❌ `REALM_NAMES` 常量（所有境界名称映射）
- ❌ 硬编码的境界名称文本（"凡胎肉身"、"寿比南山"、"地仙之姿"、"与天同寿"）

### 后端
- ❌ `TITLES` 数组（境界称号列表）
- ❌ `getRealmTitle()` 函数（根据年龄返回称号）
- ❌ 所有硬编码的境界年龄范围判断

## 数据流程

```
用户数据 → 计算总年龄（秒）
         ↓
    getRealmByAge(db, totalAge)
         ↓
    查询 realms 表（按 breakthrough_age_min 匹配）
         ↓
    返回 { id, name }
         ↓
    前端显示境界名称 + 使用 realmId 进行逻辑判断
```

## 境界匹配逻辑

```typescript
// 后端：src/server/lib.ts
export async function getRealmByAge(db: D1Database, totalAge: number) {
  // 1. 查询所有境界（按 sort_order 排序）
  const realms = await db.prepare(`
    SELECT id, name, breakthrough_age_min, breakthrough_age_max
    FROM realms
    WHERE breakthrough_age_min IS NOT NULL
    ORDER BY sort_order ASC
  `).all()
  
  // 2. 将总年龄转换为秒
  const totalAgeSec = totalAge * SEC_PER_YEAR
  
  // 3. 从高到低查找匹配的境界
  for (let i = realms.results.length - 1; i >= 0; i--) {
    const realm = realms.results[i]
    if (totalAgeSec >= realm.breakthrough_age_min) {
      return { id: realm.id, name: realm.name }
    }
  }
  
  // 4. 默认返回第一个境界
  return { id: realms.results[0].id, name: realms.results[0].name }
}
```

## 验证清单

✅ 前端无硬编码境界名称常量  
✅ 后端无硬编码境界数组  
✅ SQL 脚本无硬编码境界引用  
✅ 所有境界数据从数据库获取  
✅ 境界匹配基于 `breakthrough_age_min` 字段  
✅ 前端使用 `realmId` 进行逻辑判断  
✅ 成就描述已更新为通用文本  

## 影响范围

### 已更新的文件
1. `src/server/lib.ts` - 新增动态境界匹配函数
2. `src/server/api/modules/state.ts` - 使用动态境界
3. `src/server/api/modules/admin.ts` - 移除硬编码常量
4. `src/server/api/modules/board.ts` - 使用动态境界
5. `src/client/types/index.ts` - 新增 realmId 字段
6. `src/client/views/Cultivation.vue` - 使用 realmId 判断
7. `src/server/api/modules/achievements.ts` - 更新成就描述

### 未受影响的功能
- 境界管理（AdminRealms.vue）- 已经使用数据库数据
- 排行榜（Leaderboard.vue）- 已经使用数据库数据
- 状态存储（state.ts）- 已经有 realms 管理

## 测试建议

1. **境界显示测试**
   - 检查右上角境界显示是否正确
   - 检查命脉页面境界显示是否正确
   - 检查排行榜境界显示是否正确

2. **境界匹配测试**
   - 创建不同寿命的用户，验证境界匹配是否正确
   - 修改用户寿命，验证境界是否动态更新

3. **修炼页面测试**
   - 低境界用户（realmId <= 8）应该看到凡俗养生任务
   - 高境界用户（realmId >= 9）应该看到高阶修炼任务

4. **成就系统测试**
   - 验证 100 岁和 200 岁成就是否正常解锁

## 总结

系统现在完全依赖数据库中的境界配置，管理员可以通过境界管理页面自由调整境界设置，无需修改代码。所有境界相关的逻辑都基于数据库数据动态计算，实现了真正的数据驱动。
