# 需要恢复的页面清单

## 当前状态

### ✅ 已完成
1. **Dashboard.vue** - 命脉页面（已恢复脉冲环、时间显示）
2. **Cultivation.vue** - 修炼页面（已恢复所有任务卡片）
3. **Inventory.vue** - 丹房页面（已恢复功德栏、丹药网格）
4. **App.vue** - 主布局（已恢复背景层、导航栏）
5. **CrisisOverlay.vue** - 弥留期覆盖层（已创建）

### 🚧 需要完善
6. **Fortune.vue** - 运势页面
   - 今日运势卡片
   - 签到按钮
   - 功法修炼列表
   - 全服事件列表
   - 修仙日志表单和列表

7. **Adventure.vue** - 历练页面
   - 探险按钮和结果
   - 天劫系统
   - 成就系统

8. **Leaderboard.vue** - 长生榜页面
   - 排行榜切换（寿命/功德/境界）
   - 用户排名列表

9. **Profile.vue** - 道号页面
   - 个人信息展示
   - 统计数据
   - 成就展示

10. **Admin 相关页面** - 管理后台
    - AdminLayout.vue（已有基础）
    - AdminOverview.vue（已有基础）
    - 其他管理页面需要完善

## 快速恢复方案

由于所有原始页面都在 Git 历史中（HEAD~3），可以使用以下命令查看：

```bash
# 查看任意原始页面
git show HEAD~3:src/pages/fortune/Fortune.tsx
git show HEAD~3:src/pages/adventure/Adventure.tsx
git show HEAD~3:src/pages/leaderboard/Leaderboard.tsx
git show HEAD~3:src/pages/profile/Profile.tsx
```

## 优先级

1. **高优先级**：Fortune, Adventure（核心功能页面）
2. **中优先级**：Leaderboard, Profile（展示页面）
3. **低优先级**：Admin 页面（管理功能）

## 下一步

请告诉我你希望优先恢复哪个页面，我会立即完整恢复该页面的所有功能和样式。
