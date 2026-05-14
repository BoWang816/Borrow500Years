#!/bin/bash

# 数据库初始化脚本
# 自动应用迁移和导入种子数据

echo "🗄️  初始化数据库..."
echo ""

# 检查是否已经初始化
DB_PATH=".wrangler/state/v3/d1/miniflare-D1DatabaseObject/338bdf3d99df067ab93ef1cf1eb26b32e260ce07e7eeed83dedc4c72436e7938.sqlite"

if [ -f "$DB_PATH" ]; then
    # 检查是否有数据
    USER_COUNT=$(npx wrangler d1 execute webapp-production --local --command "SELECT COUNT(*) as count FROM users" 2>/dev/null | grep -oE '[0-9]+' | tail -1)
    
    if [ "$USER_COUNT" -gt 0 ]; then
        echo "✅ 数据库已初始化（包含 $USER_COUNT 个用户）"
        echo ""
        read -p "是否重新初始化数据库？这将清空所有数据！(y/N) " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "跳过初始化"
            exit 0
        fi
    fi
fi

echo "📋 应用数据库迁移..."
npx wrangler d1 migrations apply webapp-production --local

if [ $? -ne 0 ]; then
    echo "❌ 迁移失败"
    exit 1
fi

echo "✅ 迁移完成"
echo ""

echo "🌱 导入种子数据..."
npx wrangler d1 execute webapp-production --local --file=./seed.sql

if [ $? -ne 0 ]; then
    echo "❌ 种子数据导入失败"
    exit 1
fi

echo "✅ 种子数据导入完成"
echo ""

echo "📊 数据库统计："
echo ""

# 统计用户数
TOTAL_USERS=$(npx wrangler d1 execute webapp-production --local --command "SELECT COUNT(*) as count FROM users WHERE name IS NOT NULL" 2>/dev/null | grep -oE '[0-9]+' | tail -1)
echo "  总用户数: $TOTAL_USERS"

# 统计各境界用户数
echo ""
echo "  境界分布:"
npx wrangler d1 execute webapp-production --local --command "
SELECT 
  r.major_realm_name as '大境界',
  COUNT(*) as '用户数'
FROM users u
LEFT JOIN user_realms ur ON u.id = ur.user_id
LEFT JOIN realms r ON ur.current_realm_id = r.id
WHERE u.name IS NOT NULL
GROUP BY r.major_realm
ORDER BY r.major_realm
" 2>/dev/null | grep -E '(凡蜕期|超凡期|化境期|极境期|道极期|[0-9]+)'

echo ""
echo "🔥 初始化修炼项目系统..."
echo ""

# 执行修炼项目迁移
npx wrangler d1 execute webapp-production --local --file=./migrations/0015_realm_cultivation_system.sql 2>/dev/null
npx wrangler d1 execute webapp-production --local --file=./migrations/0016_cultivation_practices_expansion.sql 2>/dev/null
npx wrangler d1 execute webapp-production --local --file=./migrations/0017_cultivation_practices_realms_11_15.sql 2>/dev/null
npx wrangler d1 execute webapp-production --local --file=./migrations/0018_cultivation_practices_realms_16_20.sql 2>/dev/null

# 统计修炼项目
PRACTICE_COUNT=$(npx wrangler d1 execute webapp-production --local --command "SELECT COUNT(*) as count FROM cultivation_practices" 2>/dev/null | grep -oE '[0-9]+' | tail -1)
echo "  修炼项目总数: $PRACTICE_COUNT"

echo ""
echo "🎉 数据库初始化完成！"
echo ""
echo "📝 默认管理员账号："
echo "   用户名: admin"
echo "   密码:   admin123"
echo ""
