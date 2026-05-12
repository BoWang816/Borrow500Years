#!/bin/bash

# 从 Git 历史中提取所有原始页面并创建对应的 Vue 组件

echo "正在从 Git 历史恢复原始页面结构..."

# 提取所有页面到临时目录
mkdir -p .temp/pages
git show HEAD~3:src/pages/fortune/Fortune.tsx > .temp/pages/Fortune.tsx
git show HEAD~3:src/pages/adventure/Adventure.tsx > .temp/pages/Adventure.tsx
git show HEAD~3:src/pages/leaderboard/Leaderboard.tsx > .temp/pages/Leaderboard.tsx
git show HEAD~3:src/pages/profile/Profile.tsx > .temp/pages/Profile.tsx
git show HEAD~3:src/pages/admin/Admin.tsx > .temp/pages/Admin.tsx

echo "原始页面已提取到 .temp/pages/"
echo "请手动将这些 TSX 结构转换为 Vue 组件"
