-- 移除功法系统（已被修炼项目系统替代）
-- 删除功法相关表

-- 删除用户功法进度表
DROP TABLE IF EXISTS user_manuals;

-- 删除功法配置表
DROP TABLE IF EXISTS manuals;

-- 清理相关索引（如果存在）
DROP INDEX IF EXISTS idx_user_manuals_user;
