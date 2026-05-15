-- 更新寿命相关数值以适配年单位系统
-- 将所有配置表中的寿命奖励从秒调整为更合理的年份数值
-- 确保不同境界之间有明显的差异

-- ==================== 修炼项目（cultivation_practices）====================
-- 基础修炼：0.01-0.1年（3.65-36.5天）
-- 进阶修炼：0.1-1年（36.5-365天）
-- 高级修炼：1-10年
-- 秘法修炼：10-100年

UPDATE cultivation_practices SET
  reward_life = CASE
    -- 境界1-5（凡蜕期）：0.01-0.5年
    WHEN realm_id = 1 THEN 315576    -- 0.01年（3.65天）
    WHEN realm_id = 2 THEN 631152    -- 0.02年（7.3天）
    WHEN realm_id = 3 THEN 1577880   -- 0.05年（18.25天）
    WHEN realm_id = 4 THEN 3155760   -- 0.1年（36.5天）
    WHEN realm_id = 5 THEN 15778800  -- 0.5年（182.5天）
    
    -- 境界6-9（超凡期）：0.5-5年
    WHEN realm_id = 6 THEN 31557600  -- 1年
    WHEN realm_id = 7 THEN 63115200  -- 2年
    WHEN realm_id = 8 THEN 94672800  -- 3年
    WHEN realm_id = 9 THEN 157788000 -- 5年
    
    -- 境界10-14（化境期）：5-50年
    WHEN realm_id = 10 THEN 315576000  -- 10年
    WHEN realm_id = 11 THEN 631152000  -- 20年
    WHEN realm_id = 12 THEN 946728000  -- 30年
    WHEN realm_id = 13 THEN 1262304000 -- 40年
    WHEN realm_id = 14 THEN 1577880000 -- 50年
    
    -- 境界15-18（极境期）：50-500年
    WHEN realm_id = 15 THEN 3155760000  -- 100年
    WHEN realm_id = 16 THEN 6311520000  -- 200年
    WHEN realm_id = 17 THEN 9467280000  -- 300年
    WHEN realm_id = 18 THEN 15778800000 -- 500年
    
    -- 境界19-20（道极期）：500-5000年
    WHEN realm_id = 19 THEN 31557600000  -- 1000年
    WHEN realm_id = 20 THEN 157788000000 -- 5000年
    
    ELSE reward_life
  END
WHERE reward_life > 0;

-- ==================== 养生任务（wellness_tasks_config）====================
-- 基础养生：0.001-0.01年（8.8小时-3.65天）
-- 进阶养生：0.01-0.1年（3.65-36.5天）
-- 高级养生：0.1-1年

UPDATE wellness_tasks_config SET
  life_reward = CASE task_key
    -- 基础养生任务（凡人期）
    WHEN 'ziwu' THEN 315576      -- 0.01年（3.65天）- 子午流注
    WHEN 'steps' THEN 157788     -- 0.005年（1.8天）- 步行万步
    WHEN 'water' THEN 126230     -- 0.004年（1.46天）- 饮水养生
    WHEN 'meditate' THEN 189346  -- 0.006年（2.19天）- 打坐冥想
    WHEN 'earlyrise' THEN 252461 -- 0.008年（2.92天）- 早起修行
    WHEN 'diet' THEN 220403      -- 0.007年（2.55天）- 清淡饮食
    
    -- 进阶养生任务（超凡期）
    WHEN 'qigong' THEN 631152    -- 0.02年（7.3天）- 气功修炼
    WHEN 'taichi' THEN 946728    -- 0.03年（10.95天）- 太极拳
    WHEN 'yoga' THEN 1262304     -- 0.04年（14.6天）- 瑜伽
    
    ELSE life_reward
  END
WHERE life_reward > 0;

-- ==================== 扩展养生项目（extra_tasks_config）====================
-- 根据境界和难度调整奖励

UPDATE extra_tasks_config SET
  life_reward = CASE
    -- 境界1-5（凡蜕期）：0.005-0.2年
    WHEN realm_id <= 5 AND difficulty = 'easy' THEN 157788      -- 0.005年（1.8天）
    WHEN realm_id <= 5 AND difficulty = 'normal' THEN 315576    -- 0.01年（3.65天）
    WHEN realm_id <= 5 AND difficulty = 'hard' THEN 631152      -- 0.02年（7.3天）
    WHEN realm_id <= 5 AND difficulty = 'extreme' THEN 6311520  -- 0.2年（73天）
    
    -- 境界6-9（超凡期）：0.2-2年
    WHEN realm_id BETWEEN 6 AND 9 AND difficulty = 'easy' THEN 6311520   -- 0.2年
    WHEN realm_id BETWEEN 6 AND 9 AND difficulty = 'normal' THEN 15778800 -- 0.5年
    WHEN realm_id BETWEEN 6 AND 9 AND difficulty = 'hard' THEN 31557600   -- 1年
    WHEN realm_id BETWEEN 6 AND 9 AND difficulty = 'extreme' THEN 63115200 -- 2年
    
    -- 境界10-14（化境期）：2-20年
    WHEN realm_id BETWEEN 10 AND 14 AND difficulty = 'easy' THEN 63115200   -- 2年
    WHEN realm_id BETWEEN 10 AND 14 AND difficulty = 'normal' THEN 157788000 -- 5年
    WHEN realm_id BETWEEN 10 AND 14 AND difficulty = 'hard' THEN 315576000   -- 10年
    WHEN realm_id BETWEEN 10 AND 14 AND difficulty = 'extreme' THEN 631152000 -- 20年
    
    -- 境界15-18（极境期）：20-200年
    WHEN realm_id BETWEEN 15 AND 18 AND difficulty = 'easy' THEN 631152000   -- 20年
    WHEN realm_id BETWEEN 15 AND 18 AND difficulty = 'normal' THEN 1577880000 -- 50年
    WHEN realm_id BETWEEN 15 AND 18 AND difficulty = 'hard' THEN 3155760000   -- 100年
    WHEN realm_id BETWEEN 15 AND 18 AND difficulty = 'extreme' THEN 6311520000 -- 200年
    
    -- 境界19-20（道极期）：200-2000年
    WHEN realm_id >= 19 AND difficulty = 'easy' THEN 6311520000    -- 200年
    WHEN realm_id >= 19 AND difficulty = 'normal' THEN 15778800000  -- 500年
    WHEN realm_id >= 19 AND difficulty = 'hard' THEN 31557600000    -- 1000年
    WHEN realm_id >= 19 AND difficulty = 'extreme' THEN 63115200000 -- 2000年
    
    ELSE life_reward
  END
WHERE life_reward > 0;

-- ==================== 历练项目（explore_loot_config）====================
-- 根据境界和品质调整奖励

UPDATE explore_loot_config SET
  life = CASE
    -- 境界1-5（凡蜕期）：0.001-0.5年
    WHEN realm_id <= 5 AND category = 'common' THEN 31558      -- 0.001年（8.8小时）
    WHEN realm_id <= 5 AND category = 'rare' THEN 157788       -- 0.005年（1.8天）
    WHEN realm_id <= 5 AND category = 'epic' THEN 631152       -- 0.02年（7.3天）
    WHEN realm_id <= 5 AND category = 'legendary' THEN 15778800 -- 0.5年（182.5天）
    
    -- 境界6-9（超凡期）：0.5-5年
    WHEN realm_id BETWEEN 6 AND 9 AND category = 'common' THEN 15778800  -- 0.5年
    WHEN realm_id BETWEEN 6 AND 9 AND category = 'rare' THEN 31557600    -- 1年
    WHEN realm_id BETWEEN 6 AND 9 AND category = 'epic' THEN 63115200    -- 2年
    WHEN realm_id BETWEEN 6 AND 9 AND category = 'legendary' THEN 157788000 -- 5年
    
    -- 境界10-14（化境期）：5-50年
    WHEN realm_id BETWEEN 10 AND 14 AND category = 'common' THEN 157788000  -- 5年
    WHEN realm_id BETWEEN 10 AND 14 AND category = 'rare' THEN 315576000    -- 10年
    WHEN realm_id BETWEEN 10 AND 14 AND category = 'epic' THEN 631152000    -- 20年
    WHEN realm_id BETWEEN 10 AND 14 AND category = 'legendary' THEN 1577880000 -- 50年
    
    -- 境界15-18（极境期）：50-500年
    WHEN realm_id BETWEEN 15 AND 18 AND category = 'common' THEN 1577880000  -- 50年
    WHEN realm_id BETWEEN 15 AND 18 AND category = 'rare' THEN 3155760000    -- 100年
    WHEN realm_id BETWEEN 15 AND 18 AND category = 'epic' THEN 6311520000    -- 200年
    WHEN realm_id BETWEEN 15 AND 18 AND category = 'legendary' THEN 15778800000 -- 500年
    
    -- 境界19-20（道极期）：500-5000年
    WHEN realm_id >= 19 AND category = 'common' THEN 15778800000  -- 500年
    WHEN realm_id >= 19 AND category = 'rare' THEN 31557600000    -- 1000年
    WHEN realm_id >= 19 AND category = 'epic' THEN 63115200000    -- 2000年
    WHEN realm_id >= 19 AND category = 'legendary' THEN 157788000000 -- 5000年
    
    ELSE life
  END
WHERE life > 0;

-- ==================== 丹药配置（potions_config）====================
-- 即时寿命：根据境界和稀有度调整
-- 持续时间保持不变（24小时、7天等）

UPDATE potions_config SET
  instant_life = CASE
    -- 境界1-5（凡蜕期）：0.01-1年
    WHEN realm_id <= 5 AND rarity = 'common' THEN 315576      -- 0.01年（3.65天）
    WHEN realm_id <= 5 AND rarity = 'rare' THEN 1577880       -- 0.05年（18.25天）
    WHEN realm_id <= 5 AND rarity = 'epic' THEN 7889400       -- 0.25年（91天）
    WHEN realm_id <= 5 AND rarity = 'legendary' THEN 31557600 -- 1年
    
    -- 境界6-9（超凡期）：1-10年
    WHEN realm_id BETWEEN 6 AND 9 AND rarity = 'common' THEN 31557600  -- 1年
    WHEN realm_id BETWEEN 6 AND 9 AND rarity = 'rare' THEN 63115200    -- 2年
    WHEN realm_id BETWEEN 6 AND 9 AND rarity = 'epic' THEN 157788000   -- 5年
    WHEN realm_id BETWEEN 6 AND 9 AND rarity = 'legendary' THEN 315576000 -- 10年
    
    -- 境界10-14（化境期）：10-100年
    WHEN realm_id BETWEEN 10 AND 14 AND rarity = 'common' THEN 315576000  -- 10年
    WHEN realm_id BETWEEN 10 AND 14 AND rarity = 'rare' THEN 631152000    -- 20年
    WHEN realm_id BETWEEN 10 AND 14 AND rarity = 'epic' THEN 1577880000   -- 50年
    WHEN realm_id BETWEEN 10 AND 14 AND rarity = 'legendary' THEN 3155760000 -- 100年
    
    -- 境界15-18（极境期）：100-1000年
    WHEN realm_id BETWEEN 15 AND 18 AND rarity = 'common' THEN 3155760000  -- 100年
    WHEN realm_id BETWEEN 15 AND 18 AND rarity = 'rare' THEN 6311520000    -- 200年
    WHEN realm_id BETWEEN 15 AND 18 AND rarity = 'epic' THEN 15778800000   -- 500年
    WHEN realm_id BETWEEN 15 AND 18 AND rarity = 'legendary' THEN 31557600000 -- 1000年
    
    -- 境界19-20（道极期）：1000-10000年
    WHEN realm_id >= 19 AND rarity = 'common' THEN 31557600000  -- 1000年
    WHEN realm_id >= 19 AND rarity = 'rare' THEN 63115200000    -- 2000年
    WHEN realm_id >= 19 AND rarity = 'epic' THEN 157788000000   -- 5000年
    WHEN realm_id >= 19 AND rarity = 'legendary' THEN 315576000000 -- 10000年
    
    ELSE instant_life
  END
WHERE instant_life > 0;

-- ==================== 数值说明 ====================
-- SEC_PER_YEAR = 31557600（365.25天）
-- 
-- 转换参考：
-- 0.001年 = 31558秒 ≈ 8.8小时
-- 0.005年 = 157788秒 ≈ 1.8天
-- 0.01年 = 315576秒 ≈ 3.65天
-- 0.05年 = 1577880秒 ≈ 18.25天
-- 0.1年 = 3155760秒 ≈ 36.5天
-- 0.5年 = 15778800秒 ≈ 182.5天
-- 1年 = 31557600秒
-- 10年 = 315576000秒
-- 100年 = 3155760000秒
-- 1000年 = 31557600000秒
-- 10000年 = 315576000000秒

