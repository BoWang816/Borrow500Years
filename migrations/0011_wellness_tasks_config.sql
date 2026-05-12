-- 养生任务配置表
CREATE TABLE IF NOT EXISTS wellness_tasks_config (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '🧘',
  description TEXT NOT NULL,
  reward_type TEXT NOT NULL DEFAULT 'fixed', -- 'fixed', 'variable', 'input'
  life_reward INTEGER NOT NULL DEFAULT 0, -- 寿命奖励（秒）
  merit_reward INTEGER NOT NULL DEFAULT 0, -- 功德奖励
  shard_reward INTEGER NOT NULL DEFAULT 0, -- 碎片奖励
  coin_reward INTEGER NOT NULL DEFAULT 0, -- 复活币奖励
  modifier_value REAL NOT NULL DEFAULT 0, -- 修饰值（如衰减率变化）
  realm_requirement TEXT NOT NULL DEFAULT 'basic', -- 'basic', 'mortal', 'advanced', 'challenge'
  is_active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  input_config TEXT, -- JSON配置（用于特殊输入类型）
  created_at INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL DEFAULT 0
);

-- 插入初始6个养生任务（如果不存在）
INSERT OR IGNORE INTO wellness_tasks_config (task_key, name, emoji, description, reward_type, life_reward, merit_reward, shard_reward, coin_reward, modifier_value, realm_requirement, sort_order, input_config, created_at, updated_at) VALUES
('ziwu', '子午流注', '🌙', '23:00 前入睡，顺应天地阴阳', 'fixed', 1800, 2, 0, 0, 0, 'basic', 1, NULL, strftime('%s', 'now'), strftime('%s', 'now')),
('meditate', '静坐冥想', '🧘', '每日静心冥想 15 分钟', 'fixed', 900, 3, 1, 0, 0, 'basic', 2, NULL, strftime('%s', 'now'), strftime('%s', 'now')),
('steps', '步步为营', '🚶', '行走万步，强健筋骨', 'input', 0, 0, 0, 0, 0, 'basic', 3, '{"type":"slider","min":1000,"max":50000,"step":1000,"unit":"步","baseReward":720,"bonusThreshold":10000,"bonusReward":7200}', strftime('%s', 'now'), strftime('%s', 'now')),
('water', '上善若水', '💧', '每日饮水 8 杯，滋养身心', 'input', 300, 0, 0, 0, 0, 'basic', 4, '{"type":"counter","max":8,"rewardPerUnit":300,"completionMerit":3}', strftime('%s', 'now'), strftime('%s', 'now')),
('diet', '清淡饮食', '🥗', '三餐清淡，远离油腻', 'fixed', 1200, 1, 0, 0, 0, 'basic', 5, NULL, strftime('%s', 'now'), strftime('%s', 'now')),
('earlyrise', '早起挑战', '🌅', '连续 7 天早起，获得复活币', 'input', 1200, 4, 0, 0, 0, 'challenge', 6, '{"type":"streak","target":7,"coinReward":1}', strftime('%s', 'now'), strftime('%s', 'now'));
