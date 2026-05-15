-- 补充缺失的表结构
-- 这些表在之前的迁移清理中被删除，现在补充回来

-- 先创建 realms 表（境界配置）- 其他表依赖它
CREATE TABLE IF NOT EXISTS realms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  major_realm INTEGER NOT NULL,
  sub_realm INTEGER NOT NULL,
  major_realm_name TEXT NOT NULL,
  lifespan_max INTEGER NOT NULL,
  breakthrough_age_min INTEGER,
  breakthrough_age_max INTEGER,
  description TEXT,
  core_logic TEXT,
  cultivation_span_min INTEGER,
  cultivation_span_max INTEGER,
  sort_order INTEGER NOT NULL
);

-- user_realms 表（用户境界）
CREATE TABLE IF NOT EXISTS user_realms (
  user_id INTEGER PRIMARY KEY,
  current_realm_id INTEGER NOT NULL DEFAULT 1,
  breakthrough_count INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- cultivation_practices 表（修炼项目）
CREATE TABLE IF NOT EXISTS cultivation_practices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  emoji TEXT,
  description TEXT,
  realm_id INTEGER NOT NULL,
  required_realm_level INTEGER NOT NULL DEFAULT 1,
  practice_type TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty INTEGER NOT NULL DEFAULT 1,
  practice_time INTEGER NOT NULL DEFAULT 3600,
  cooldown_time INTEGER NOT NULL DEFAULT 86400,
  cost_merit INTEGER NOT NULL DEFAULT 0,
  cost_life INTEGER NOT NULL DEFAULT 0,
  cost_coin INTEGER NOT NULL DEFAULT 0,
  reward_life INTEGER NOT NULL DEFAULT 0,
  reward_merit INTEGER NOT NULL DEFAULT 0,
  reward_shard INTEGER NOT NULL DEFAULT 0,
  reward_exp INTEGER NOT NULL DEFAULT 0,
  effect_type TEXT,
  effect_value REAL DEFAULT 0,
  effect_duration INTEGER DEFAULT 0,
  helps_breakthrough INTEGER DEFAULT 0,
  breakthrough_contribution INTEGER DEFAULT 0,
  max_level INTEGER DEFAULT 10,
  daily_limit INTEGER DEFAULT 3,
  prerequisite_practice TEXT,
  rarity TEXT DEFAULT 'common',
  sort_order INTEGER NOT NULL,
  is_active INTEGER DEFAULT 1,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- wellness_tasks_config 表（养生任务配置）
CREATE TABLE IF NOT EXISTS wellness_tasks_config (
  task_key TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  emoji TEXT,
  description TEXT,
  life_reward INTEGER NOT NULL DEFAULT 0,
  merit_reward INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL,
  is_active INTEGER DEFAULT 1,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_cultivation_practices_realm ON cultivation_practices(realm_id);
CREATE INDEX IF NOT EXISTS idx_user_realms_realm ON user_realms(current_realm_id);
