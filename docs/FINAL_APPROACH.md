# 最终实施方案：代码层转换

## 策略
由于SQLite不支持DROP COLUMN，我们采用代码层转换的方式：
- **数据库**：保持原有字段名（`*_sec`）
- **代码**：使用年为单位进行计算
- **转换**：在读写时进行单位转换

## 核心转换函数

```typescript
// lib.ts
export function secsToYears(secs: number): number {
  return secs / SEC_PER_YEAR;
}

export function yearsToSecs(years: number): number {
  return years * SEC_PER_YEAR;
}
```

## 使用模式

### 读取数据
```typescript
// 从数据库读取秒，转换为年
const bonusYears = secsToYears(profile.bonus_sec || 0);
const initialYears = secsToYears(profile.initial_life_sec || 0);
```

### 写入数据
```typescript
// 计算得到年，转换为秒写入数据库
const gainedYears = 0.5; // 半年
await db.prepare('UPDATE users SET bonus_sec = bonus_sec + ? WHERE id = ?')
  .bind(yearsToSecs(gainedYears), userId).run();
```

### API响应
```typescript
// 返回给前端使用年
return c.json({
  profile: {
    initialLifeYears: secsToYears(profile.initial_life_sec || 0),
    bonusYears: secsToYears(profile.bonus_sec || 0),
    lifeYears: currentLifeYears(profile)
  }
});
```

## 已完成的更新

### 核心库
- ✅ lib.ts - 添加转换函数
- ✅ types.ts - 保持数据库字段名
- ✅ profile.ts - 使用转换
- ✅ state.ts - 使用转换
- ✅ tasks.ts - 使用转换（部分）

### 待完成
- ⏳ tasks.ts - 完成所有硬编码值的转换
- ⏳ cultivation.ts - 使用转换
- ⏳ potions.ts - 使用转换
- ⏳ explore.ts - 使用转换
- ⏳ extra-tasks.ts - 使用转换
- ⏳ revive.ts - 使用转换
- ⏳ board.ts - 使用转换
- ⏳ tribulation.ts - 使用转换
- ⏳ achievements.ts - 使用转换

## 优点
1. 不需要复杂的数据库迁移
2. 向后兼容
3. 可以逐步更新代码
4. 易于回滚

## 缺点
1. 代码中需要显式转换
2. 数据库字段名与实际单位不匹配

## 下一步
继续更新剩余的API模块，确保所有地方都使用转换函数。
