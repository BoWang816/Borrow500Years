-- 删除运势系统相关表
-- 创建时间: 2026-05-15

-- 删除运势签到表
DROP TABLE IF EXISTS fortune_checkins;

-- 说明：
-- 本迁移删除了运势系统相关的数据库表
-- fortune_checkins 表用于记录用户的运势签到信息
-- 
-- 删除原因：简化系统功能，移除运势模块
