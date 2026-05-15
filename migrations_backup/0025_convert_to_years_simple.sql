-- ========================================
-- 简化版：将所有寿命单位从秒改为年
-- 使用ALTER TABLE ADD COLUMN + UPDATE的方式
-- ========================================

-- 1. users表：添加新的年字段
ALTER TABLE users ADD COLUMN initial_life_years REAL;
ALTER TABLE users ADD COLUMN bonus_years REAL DEFAULT 0;
ALTER TABLE users ADD COLUMN total_gained_years REAL DEFAULT 0;

-- 转换数据（1年 = 31557600秒）
UPDATE users SET 
  initial_life_years = COALESCE(initial_life_sec, 0) / 31557600.0,
  bonus_years = COALESCE(bonus_sec, 0) / 31557600.0,
  total_gained_years = COALESCE(total_gained_sec, 0) / 31557600.0
WHERE initial_life_sec IS NOT NULL OR bonus_sec IS NOT NULL OR total_gained_sec IS NOT NULL;

-- 注意：SQLite不支持DROP COLUMN，所以旧字段会保留
-- 但代码会使用新字段

-- 2. wellness_tasks_config表：添加新字段并转换
ALTER TABLE wellness_tasks_config ADD COLUMN life_reward_years REAL DEFAULT 0;

UPDATE wellness_tasks_config SET 
  life_reward_years = COALESCE(life_reward, 0) / 31557600.0;

-- 3. potions_config表：添加新字段并转换
ALTER TABLE potions_config ADD COLUMN instant_life_years REAL DEFAULT 0;

UPDATE potions_config SET 
  instant_life_years = COALESCE(instant_life, 0) / 31557600.0;

-- 4. cultivation_practices表：添加新字段并转换
ALTER TABLE cultivation_practices ADD COLUMN cost_life_years REAL DEFAULT 0;
ALTER TABLE cultivation_practices ADD COLUMN reward_life_years REAL DEFAULT 0;

UPDATE cultivation_practices SET 
  cost_life_years = COALESCE(cost_life, 0) / 31557600.0,
  reward_life_years = COALESCE(reward_life, 0) / 31557600.0;

-- 5. extra_tasks_config表：添加新字段并转换
ALTER TABLE extra_tasks_config ADD COLUMN life_reward_years REAL DEFAULT 0;

UPDATE extra_tasks_config SET 
  life_reward_years = COALESCE(life_reward, 0) / 31557600.0;

-- 6. explore_loot_config表：添加新字段并转换
ALTER TABLE explore_loot_config ADD COLUMN life_reward_years REAL DEFAULT 0;

UPDATE explore_loot_config SET 
  life_reward_years = COALESCE(life_reward, 0) / 31557600.0;

-- 完成！
-- 注意：代码需要更新为使用新的字段名（*_years）
