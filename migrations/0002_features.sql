-- 成就系统
CREATE TABLE IF NOT EXISTS achievements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  ach_id TEXT NOT NULL,
  unlocked_at INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE(user_id, ach_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_ach_user ON achievements(user_id);

-- 天劫挑战记录
CREATE TABLE IF NOT EXISTS tribulations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  week_id TEXT NOT NULL,         -- YYYY-WNN 格式
  status TEXT NOT NULL DEFAULT 'pending', -- pending / accepted / completed / failed
  tasks TEXT,                      -- JSON 数组 ["ziwu","steps","water","meditate","diet"]
  accepted_at INTEGER,
  completed_at INTEGER,
  reward_sec INTEGER DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_trib_user_week ON tribulations(user_id, week_id);
