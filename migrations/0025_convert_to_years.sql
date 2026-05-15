-- ========================================
-- 重大调整：将所有寿命单位从秒改为年
-- 修仙系统中寿命应该以年为基础单位
-- ========================================

-- 1. 修改 users 表的寿命相关字段
-- 将 initial_life_sec, bonus_sec, total_gained_sec 改为年单位
-- 注意：需要先备份数据，然后转换

-- 创建临时表存储转换后的数据
CREATE TABLE IF NOT EXISTS users_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  token TEXT UNIQUE,
  token_expire_at INTEGER,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  -- 命盘 / 用户画像
  name TEXT,
  gender TEXT,
  age INTEGER,
  height INTEGER,
  weight INTEGER,
  smoke INTEGER DEFAULT 0,
  alcohol INTEGER DEFAULT 0,
  stayup INTEGER DEFAULT 0,
  hereditary INTEGER DEFAULT 0,
  exercise INTEGER DEFAULT 0,
  meditate INTEGER DEFAULT 0,
  -- 寿命核心 (年)
  initial_life_years REAL,
  bonus_years REAL DEFAULT 0,
  start_timestamp INTEGER,
  total_gained_years REAL DEFAULT 0,
  -- 资源
  coin INTEGER DEFAULT 1,
  shard INTEGER DEFAULT 0,
  merit INTEGER DEFAULT 0,
  -- 状态
  streak INTEGER DEFAULT 0,
  dying INTEGER DEFAULT 0,
  dying_start_at INTEGER,
  updated_at INTEGER
);

-- 复制并转换数据 (1年 = 31557600秒)
INSERT INTO users_new 
SELECT 
  id, username, password_hash, token, token_expire_at, created_at,
  name, gender, age, height, weight,
  smoke, alcohol, stayup, hereditary, exercise, meditate,
  CASE WHEN initial_life_sec IS NOT NULL THEN initial_life_sec / 31557600.0 ELSE NULL END as initial_life_years,
  bonus_sec / 31557600.0 as bonus_years,
  start_timestamp,
  total_gained_sec / 31557600.0 as total_gained_years,
  coin, shard, merit,
  streak, dying, dying_start_at, updated_at
FROM users;

-- 删除旧表并重命名
DROP TABLE users;
ALTER TABLE users_new RENAME TO users;

-- 重建索引
CREATE INDEX IF NOT EXISTS idx_users_token ON users(token);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_name ON users(name);

-- 2. 修改 wellness_tasks_config 表
-- 将 life_reward 从秒改为年
ALTER TABLE wellness_tasks_config RENAME TO wellness_tasks_config_old;

CREATE TABLE IF NOT EXISTS wellness_tasks_config (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '🧘',
  description TEXT NOT NULL,
  reward_type TEXT NOT NULL DEFAULT 'fixed',
  life_reward REAL NOT NULL DEFAULT 0, -- 寿命奖励（年）
  merit_reward INTEGER NOT NULL DEFAULT 0,
  shard_reward INTEGER NOT NULL DEFAULT 0,
  coin_reward INTEGER NOT NULL DEFAULT 0,
  modifier_value REAL NOT NULL DEFAULT 0,
  realm_requirement TEXT NOT NULL DEFAULT 'basic',
  is_active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  input_config TEXT,
  created_at INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL DEFAULT 0
);

-- 复制并转换数据
INSERT INTO wellness_tasks_config
SELECT 
  id, task_key, name, emoji, description, reward_type,
  life_reward / 31557600.0 as life_reward,
  merit_reward, shard_reward, coin_reward, modifier_value,
  realm_requirement, is_active, sort_order, input_config,
  created_at, updated_at
FROM wellness_tasks_config_old;

DROP TABLE wellness_tasks_config_old;

-- 3. 修改 potions_config 表
-- 将 instant_life 从秒改为年
ALTER TABLE potions_config RENAME TO potions_config_old;

CREATE TABLE IF NOT EXISTS potions_config (
  id TEXT PRIMARY KEY,
  emoji TEXT NOT NULL,
  name TEXT NOT NULL,
  desc TEXT NOT NULL,
  cost INTEGER NOT NULL,
  type TEXT NOT NULL DEFAULT 'merit',
  instant_life REAL NOT NULL DEFAULT 0, -- 立即增加寿命（年）
  dur INTEGER NOT NULL DEFAULT 0, -- 持续时间（秒，保持不变）
  dur_decay_reduction REAL NOT NULL DEFAULT 0,
  dur_merit_boost REAL NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  realm_id INTEGER,
  created_at INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL DEFAULT 0
);

-- 复制并转换数据
INSERT INTO potions_config
SELECT 
  id, emoji, name, desc, cost, type,
  instant_life / 31557600.0 as instant_life,
  dur, dur_decay_reduction, dur_merit_boost,
  sort_order, is_active, realm_id,
  created_at, updated_at
FROM potions_config_old;

DROP TABLE potions_config_old;

-- 4. 修改 cultivation_practices 表
-- 将 reward_life 和 cost_life 从秒改为年
ALTER TABLE cultivation_practices RENAME TO cultivation_practices_old;

CREATE TABLE IF NOT EXISTS cultivation_practices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '🧘',
  description TEXT NOT NULL,
  realm_id INTEGER NOT NULL,
  required_realm_level INTEGER NOT NULL DEFAULT 1,
  practice_type TEXT NOT NULL DEFAULT 'basic',
  category TEXT NOT NULL DEFAULT 'qi',
  difficulty INTEGER NOT NULL DEFAULT 1,
  cost_merit INTEGER NOT NULL DEFAULT 0,
  cost_life REAL NOT NULL DEFAULT 0, -- 消耗寿命（年）
  reward_life REAL NOT NULL DEFAULT 0, -- 奖励寿命（年）
  reward_merit INTEGER NOT NULL DEFAULT 0,
  reward_shard INTEGER NOT NULL DEFAULT 0,
  max_level INTEGER NOT NULL DEFAULT 10,
  daily_limit INTEGER NOT NULL DEFAULT 1,
  rarity TEXT NOT NULL DEFAULT 'common',
  sort_order INTEGER NOT NULL DEFAULT 0,
  helps_breakthrough INTEGER NOT NULL DEFAULT 0,
  breakthrough_contribution INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (realm_id) REFERENCES realms(id)
);

-- 复制并转换数据
INSERT INTO cultivation_practices
SELECT 
  id, key, name, emoji, description,
  realm_id, required_realm_level, practice_type, category, difficulty,
  cost_merit,
  COALESCE(cost_life, 0) / 31557600.0 as cost_life,
  reward_life / 31557600.0 as reward_life,
  reward_merit, reward_shard,
  max_level, daily_limit, rarity, sort_order,
  helps_breakthrough, breakthrough_contribution, is_active,
  created_at, updated_at
FROM cultivation_practices_old;

DROP TABLE cultivation_practices_old;

-- 5. 修改 extra_tasks_config 表（历练项目）
-- 将 life_reward 从秒改为年
ALTER TABLE extra_tasks_config RENAME TO extra_tasks_config_old;

CREATE TABLE IF NOT EXISTS extra_tasks_config (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '⚔️',
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'adventure',
  difficulty INTEGER NOT NULL DEFAULT 1,
  life_reward REAL NOT NULL DEFAULT 0, -- 寿命奖励（年）
  merit_reward INTEGER NOT NULL DEFAULT 0,
  shard_reward INTEGER NOT NULL DEFAULT 0,
  coin_reward INTEGER NOT NULL DEFAULT 0,
  realm_id INTEGER,
  is_active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (realm_id) REFERENCES realms(id)
);

-- 复制并转换数据
INSERT INTO extra_tasks_config
SELECT 
  id, task_key, name, emoji, description,
  category, difficulty,
  life_reward / 31557600.0 as life_reward,
  merit_reward, shard_reward, coin_reward,
  realm_id, is_active, sort_order,
  created_at, updated_at
FROM extra_tasks_config_old;

DROP TABLE extra_tasks_config_old;

-- 6. 修改 explore_loot_config 表（秘境探险）
-- 将 life_reward 从秒改为年
ALTER TABLE explore_loot_config RENAME TO explore_loot_config_old;

CREATE TABLE IF NOT EXISTS explore_loot_config (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  loot_key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '💎',
  description TEXT NOT NULL,
  rarity TEXT NOT NULL DEFAULT 'common',
  life_reward REAL NOT NULL DEFAULT 0, -- 寿命奖励（年）
  merit_reward INTEGER NOT NULL DEFAULT 0,
  shard_reward INTEGER NOT NULL DEFAULT 0,
  coin_reward INTEGER NOT NULL DEFAULT 0,
  weight INTEGER NOT NULL DEFAULT 100,
  realm_id INTEGER,
  is_active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (realm_id) REFERENCES realms(id)
);

-- 复制并转换数据
INSERT INTO explore_loot_config
SELECT 
  id, loot_key, name, emoji, description, rarity,
  life_reward / 31557600.0 as life_reward,
  merit_reward, shard_reward, coin_reward, weight,
  realm_id, is_active, sort_order,
  created_at, updated_at
FROM explore_loot_config_old;

DROP TABLE explore_loot_config_old;

-- 完成迁移
-- 所有寿命相关字段已从秒转换为年
