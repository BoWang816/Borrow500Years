#!/bin/bash
# 批量提取所有原始页面
for page in Fortune Adventure Leaderboard Profile; do
  git show HEAD~3:src/pages/${page,,}/${page}.tsx > /tmp/${page}.tsx 2>/dev/null
  echo "Extracted: ${page}"
done
echo "All pages extracted to /tmp/"
