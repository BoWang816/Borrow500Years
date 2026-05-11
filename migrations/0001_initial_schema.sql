-- 《向天再借500年》 D1 Schema

-- 用户表（合并了原profiles表）
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  token TEXT UNIQUE,
  token_expire_at INTEGER,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  -- 命盘 / 用户画像
  name TEXT,
  gender TEXT,        -- male / female
  age INTEGER,
  height INTEGER,
  weight INTEGER,
  smoke INTEGER DEFAULT 0,
  alcohol INTEGER DEFAULT 0,
  stayup INTEGER DEFAULT 0,
  hereditary INTEGER DEFAULT 0,
  exercise INTEGER DEFAULT 0,
  meditate INTEGER DEFAULT 0,
  -- 寿命核心 (秒)
  initial_life_sec REAL,
  bonus_sec REAL DEFAULT 0,
  start_timestamp INTEGER,    -- 命盘开启 ms
  total_gained_sec REAL DEFAULT 0,  -- 用于功德榜
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
CREATE INDEX IF NOT EXISTS idx_users_token ON users(token);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_name ON users(name);

-- 每日任务记录
CREATE TABLE IF NOT EXISTS daily_tasks (
  user_id INTEGER NOT NULL,
  task_date TEXT NOT NULL,          -- YYYY-MM-DD
  ziwu INTEGER NOT NULL DEFAULT 0,
  steps INTEGER NOT NULL DEFAULT 0,
  water INTEGER NOT NULL DEFAULT 0, -- 0~8
  meditate INTEGER NOT NULL DEFAULT 0,
  earlyrise INTEGER NOT NULL DEFAULT 0,
  diet INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, task_date),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 事件日志
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  msg TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'normal',   -- good / bad / normal
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_events_user_time ON events(user_id, created_at DESC);

-- 已激活道具 / 衰减修正项
CREATE TABLE IF NOT EXISTS active_potions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  potion_id TEXT NOT NULL,
  potion_name TEXT NOT NULL,
  potion_emoji TEXT,
  mod_id TEXT,
  mod_label TEXT,
  mod_value REAL DEFAULT 0,
  expire_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_active_potions_user ON active_potions(user_id, expire_at);
