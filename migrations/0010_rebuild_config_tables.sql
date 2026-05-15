-- 重建配置表以匹配seed.sql的结构

-- 删除旧的配置表
DROP TABLE IF EXISTS potions_config;
DROP TABLE IF EXISTS explore_loot_config;
DROP TABLE IF EXISTS extra_tasks_config;
DROP TABLE IF EXISTS world_events;

-- 重新创建 potions_config 表
CREATE TABLE potions_config (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  emoji TEXT,
  description TEXT,
  realm_id INTEGER NOT NULL,
  category TEXT NOT NULL,
  rarity TEXT NOT NULL,
  instant_life INTEGER DEFAULT 0,
  dur INTEGER DEFAULT 0,
  mod_id TEXT,
  mod_label TEXT,
  mod_value REAL DEFAULT 0,
  cost_coin INTEGER DEFAULT 0,
  cost_shard INTEGER DEFAULT 0,
  cost_merit INTEGER DEFAULT 0,
  sort_order INTEGER NOT NULL,
  is_active INTEGER DEFAULT 1,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- 重新创建 extra_tasks_config 表
CREATE TABLE extra_tasks_config (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  emoji TEXT,
  description TEXT,
  realm_id INTEGER NOT NULL,
  difficulty TEXT NOT NULL,
  life_reward INTEGER NOT NULL DEFAULT 0,
  merit_reward INTEGER NOT NULL DEFAULT 0,
  coin_reward INTEGER NOT NULL DEFAULT 0,
  shard_reward INTEGER NOT NULL DEFAULT 0,
  cooldown_hours INTEGER NOT NULL DEFAULT 24,
  sort_order INTEGER NOT NULL,
  is_active INTEGER DEFAULT 1,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- 重新创建 explore_loot_config 表
CREATE TABLE explore_loot_config (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  emoji TEXT,
  description TEXT,
  realm_id INTEGER NOT NULL,
  category TEXT NOT NULL,
  life INTEGER NOT NULL DEFAULT 0,
  merit INTEGER NOT NULL DEFAULT 0,
  coin INTEGER NOT NULL DEFAULT 0,
  shard INTEGER NOT NULL DEFAULT 0,
  probability REAL NOT NULL DEFAULT 0.1,
  sort_order INTEGER NOT NULL,
  is_active INTEGER DEFAULT 1,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- 重新创建 world_events 表
CREATE TABLE world_events (
  event_key TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  emoji TEXT,
  start_at INTEGER NOT NULL,
  end_at INTEGER NOT NULL,
  effect_type TEXT NOT NULL,
  effect_value REAL NOT NULL DEFAULT 0,
  is_active INTEGER DEFAULT 1
);

-- 创建索引
CREATE INDEX idx_potions_config_realm ON potions_config(realm_id);
CREATE INDEX idx_extra_tasks_config_realm ON extra_tasks_config(realm_id);
CREATE INDEX idx_explore_loot_config_realm ON explore_loot_config(realm_id);
CREATE INDEX idx_world_events_active ON world_events(is_active, start_at, end_at);
