-- 功法修炼系统
CREATE TABLE IF NOT EXISTS manuals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  emoji TEXT,
  description TEXT,
  effect_type TEXT NOT NULL, -- 'decay_reduction', 'merit_boost', 'life_boost', 'task_bonus'
  effect_value REAL NOT NULL,
  max_level INTEGER DEFAULT 10,
  cost_merit INTEGER DEFAULT 100,
  unlock_requirement TEXT -- JSON: {achievement_id, merit_min, etc}
);

-- 用户功法修炼进度
CREATE TABLE IF NOT EXISTS user_manuals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  manual_key TEXT NOT NULL,
  level INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 0,
  last_practice_at INTEGER,
  total_practice_count INTEGER DEFAULT 0,
  UNIQUE(user_id, manual_key)
);
CREATE INDEX IF NOT EXISTS idx_user_manuals_user ON user_manuals(user_id);

-- 每日运势
CREATE TABLE IF NOT EXISTS daily_fortune (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  fortune_date TEXT NOT NULL,
  fortune_type TEXT NOT NULL, -- '大吉', '吉', '平', '凶', '大凶'
  life_multiplier REAL DEFAULT 1.0,
  merit_multiplier REAL DEFAULT 1.0,
  special_event TEXT,
  checked_in INTEGER DEFAULT 0,
  UNIQUE(user_id, fortune_date)
);
CREATE INDEX IF NOT EXISTS idx_fortune_user_date ON daily_fortune(user_id, fortune_date);

-- 修仙日志
CREATE TABLE IF NOT EXISTS cultivation_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  log_type TEXT NOT NULL, -- 'milestone', 'note', 'reflection'
  content TEXT NOT NULL,
  mood TEXT,
  created_at INTEGER DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_cult_logs_user ON cultivation_logs(user_id, created_at DESC);

-- 全服事件
CREATE TABLE IF NOT EXISTS world_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  emoji TEXT,
  start_at INTEGER NOT NULL,
  end_at INTEGER NOT NULL,
  effect_type TEXT NOT NULL, -- 'global_decay', 'global_merit', 'global_life', 'task_double'
  effect_value REAL NOT NULL,
  is_active INTEGER DEFAULT 0
);

-- 用户参与全服事件记录
CREATE TABLE IF NOT EXISTS user_world_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  event_id INTEGER NOT NULL,
  joined_at INTEGER DEFAULT (unixepoch()),
  contribution INTEGER DEFAULT 0,
  reward_claimed INTEGER DEFAULT 0,
  UNIQUE(user_id, event_id)
);

-- 插入默认功法
INSERT OR IGNORE INTO manuals (key, name, emoji, description, effect_type, effect_value, max_level, cost_merit) VALUES
('taiqing', '太清心法', '📿', '清静无为，降低寿命衰减速度', 'decay_reduction', 0.05, 10, 100),
('yulong', '玉龙真诀', '🐉', '吐纳天地灵气，增加任务功德收益', 'merit_boost', 0.10, 10, 150),
('xuanwu', '玄武长寿功', '🐢', '固本培元，直接增加寿命上限', 'life_boost', 3600, 10, 200),
('zixia', '紫霞神功', '☁️', '日出而作，早起任务额外加成', 'task_bonus', 0.20, 5, 300);
