-- ========================================
-- 向天再借500年 - 完整数据库Schema
-- ========================================
-- 说明：此文件包含所有数据表的创建语句
-- 使用方法：
--   1. 先执行此文件创建所有表结构
--   2. 再执行seed.sql导入初始数据
-- ========================================

-- ==================== 用户系统 ====================

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  token TEXT UNIQUE,
  token_expire_at INTEGER,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  
  -- 个人信息
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
  
  -- 寿命相关
  initial_life_sec REAL,
  bonus_sec REAL DEFAULT 0,
  start_timestamp INTEGER,    
  total_gained_sec REAL DEFAULT 0,  
  
  -- 资源
  coin INTEGER DEFAULT 1,
  shard INTEGER DEFAULT 0,
  merit INTEGER DEFAULT 0,
  
  -- 状态
  streak INTEGER DEFAULT 0,
  dying INTEGER DEFAULT 0,
  dying_start_at INTEGER,
  updated_at INTEGER,
  zodiac TEXT DEFAULT '白羊座'
);

CREATE INDEX IF NOT EXISTS idx_users_token ON users(token);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_name ON users(name);

-- ==================== 境界系统 ====================

-- 境界配置表
CREATE TABLE IF NOT EXISTS realms (
  id INTEGER PRIMARY KEY,
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
  sort_order INTEGER NOT NULL,           
  UNIQUE(major_realm, sub_realm)
);

CREATE INDEX IF NOT EXISTS idx_realms_major_sub ON realms(major_realm, sub_realm);

-- 用户境界表
CREATE TABLE IF NOT EXISTS user_realms (
  user_id INTEGER PRIMARY KEY,
  current_realm_id INTEGER NOT NULL DEFAULT 1,
  breakthrough_count INTEGER NOT NULL DEFAULT 0,
  last_breakthrough_at INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (current_realm_id) REFERENCES realms(id)
);

CREATE INDEX IF NOT EXISTS idx_user_realms_user ON user_realms(user_id);

-- 突破记录表
CREATE TABLE IF NOT EXISTS realm_breakthrough_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  from_realm_id INTEGER NOT NULL,
  to_realm_id INTEGER NOT NULL,
  breakthrough_at INTEGER NOT NULL,
  age_at_breakthrough INTEGER NOT NULL,  
  merit_cost INTEGER NOT NULL DEFAULT 0,
  success INTEGER NOT NULL DEFAULT 1,    
  notes TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (from_realm_id) REFERENCES realms(id),
  FOREIGN KEY (to_realm_id) REFERENCES realms(id)
);

CREATE INDEX IF NOT EXISTS idx_breakthrough_logs_user ON realm_breakthrough_logs(user_id);

-- ==================== 修炼系统 ====================

-- 修炼项目配置表
CREATE TABLE IF NOT EXISTS cultivation_practices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  emoji TEXT,
  description TEXT,
  
  -- 境界要求
  realm_id INTEGER NOT NULL,                    
  required_realm_level INTEGER DEFAULT 1,       
  
  -- 类型分类
  practice_type TEXT NOT NULL,                  
  category TEXT NOT NULL,                       
  
  -- 时间消耗
  difficulty INTEGER DEFAULT 1,                 
  practice_time INTEGER DEFAULT 3600,           
  cooldown_time INTEGER DEFAULT 86400,          
  
  -- 消耗
  cost_merit INTEGER DEFAULT 0,                 
  cost_life INTEGER DEFAULT 0,                  
  cost_coin INTEGER DEFAULT 0,                  
  
  -- 奖励
  reward_life INTEGER DEFAULT 0,                
  reward_merit INTEGER DEFAULT 0,               
  reward_shard INTEGER DEFAULT 0,               
  reward_exp INTEGER DEFAULT 0,                 
  
  -- 效果
  effect_type TEXT,                             
  effect_value REAL DEFAULT 0,                  
  effect_duration INTEGER DEFAULT 0,            
  
  -- 突破相关
  helps_breakthrough INTEGER DEFAULT 0,         
  breakthrough_contribution INTEGER DEFAULT 0,  
  
  -- 限制
  max_level INTEGER DEFAULT 10,                 
  daily_limit INTEGER DEFAULT 0,                
  prerequisite_practice TEXT,                   
  
  -- 其他
  rarity TEXT DEFAULT 'common',                 
  sort_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_cultivation_realm ON cultivation_practices(realm_id);
CREATE INDEX IF NOT EXISTS idx_cultivation_type ON cultivation_practices(practice_type);
CREATE INDEX IF NOT EXISTS idx_cultivation_category ON cultivation_practices(category);

-- 用户修炼进度表
CREATE TABLE IF NOT EXISTS user_cultivation_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  practice_key TEXT NOT NULL,
  
  -- 进度
  level INTEGER DEFAULT 0,                      
  experience INTEGER DEFAULT 0,                 
  total_practice_count INTEGER DEFAULT 0,       
  success_count INTEGER DEFAULT 0,              
  failure_count INTEGER DEFAULT 0,              
  
  -- 时间记录
  first_practice_at INTEGER,                    
  last_practice_at INTEGER,                     
  last_success_at INTEGER,                      
  
  -- 每日限制
  today_practice_count INTEGER DEFAULT 0,       
  today_date TEXT,                              
  
  -- 状态
  is_active INTEGER DEFAULT 0,                  
  is_mastered INTEGER DEFAULT 0,                
  breakthrough_ready INTEGER DEFAULT 0,         
  
  UNIQUE(user_id, practice_key),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_cultivation_user ON user_cultivation_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_cultivation_active ON user_cultivation_progress(user_id, is_active);

-- 修炼记录表
CREATE TABLE IF NOT EXISTS cultivation_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  practice_key TEXT NOT NULL,
  
  -- 修炼信息
  practice_level INTEGER NOT NULL,              
  result TEXT NOT NULL,                         
  
  -- 消耗和奖励
  cost_merit INTEGER DEFAULT 0,
  cost_life INTEGER DEFAULT 0,
  reward_life INTEGER DEFAULT 0,
  reward_merit INTEGER DEFAULT 0,
  reward_shard INTEGER DEFAULT 0,
  reward_exp INTEGER DEFAULT 0,
  
  -- 备注
  notes TEXT,                                   
  created_at INTEGER DEFAULT (unixepoch()),
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_cultivation_records_user ON cultivation_records(user_id, created_at DESC);

-- 修炼日志表
CREATE TABLE IF NOT EXISTS cultivation_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  log_type TEXT NOT NULL, 
  content TEXT NOT NULL,
  mood TEXT,
  created_at INTEGER DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_cult_logs_user ON cultivation_logs(user_id, created_at DESC);

-- ==================== 养生任务系统 ====================

-- 养生任务配置表
CREATE TABLE IF NOT EXISTS wellness_tasks_config (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '🧘',
  description TEXT NOT NULL,
  reward_type TEXT NOT NULL DEFAULT 'fixed', 
  life_reward INTEGER NOT NULL DEFAULT 0, 
  merit_reward INTEGER NOT NULL DEFAULT 0, 
  shard_reward INTEGER NOT NULL DEFAULT 0, 
  coin_reward INTEGER NOT NULL DEFAULT 0, 
  modifier_value REAL NOT NULL DEFAULT 0, 
  realm_requirement TEXT NOT NULL DEFAULT 'basic', 
  is_active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  input_config TEXT, 
  created_at INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL DEFAULT 0,
  realm_id INTEGER DEFAULT 1,
  min_realm_id INTEGER DEFAULT 1,
  max_realm_id INTEGER DEFAULT 5
);

CREATE INDEX IF NOT EXISTS idx_wellness_realm ON wellness_tasks_config(realm_id);
CREATE INDEX IF NOT EXISTS idx_wellness_realm_range ON wellness_tasks_config(min_realm_id, max_realm_id);

-- 每日任务表
CREATE TABLE IF NOT EXISTS daily_tasks (
  user_id INTEGER NOT NULL,
  task_date TEXT NOT NULL,          
  ziwu INTEGER NOT NULL DEFAULT 0,
  steps INTEGER NOT NULL DEFAULT 0,
  water INTEGER NOT NULL DEFAULT 0, 
  meditate INTEGER NOT NULL DEFAULT 0,
  earlyrise INTEGER NOT NULL DEFAULT 0,
  diet INTEGER NOT NULL DEFAULT 0,
  completed_wellness_tasks TEXT DEFAULT '{}',
  PRIMARY KEY (user_id, task_date),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ==================== 额外任务系统 ====================

-- 额外任务配置表
CREATE TABLE IF NOT EXISTS extra_tasks_config (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  emoji TEXT,
  description TEXT,
  life_reward INTEGER DEFAULT 0,
  merit_reward INTEGER DEFAULT 0,
  shard_reward INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT 1,
  realm_id INTEGER DEFAULT 1,
  min_realm_id INTEGER DEFAULT 1,
  max_realm_id INTEGER DEFAULT 20,
  difficulty TEXT DEFAULT 'normal',
  category TEXT DEFAULT 'basic'
);

CREATE INDEX IF NOT EXISTS idx_extra_tasks_realm ON extra_tasks_config(realm_id);
CREATE INDEX IF NOT EXISTS idx_extra_tasks_realm_range ON extra_tasks_config(min_realm_id, max_realm_id);
CREATE INDEX IF NOT EXISTS idx_extra_tasks_difficulty ON extra_tasks_config(difficulty);
CREATE INDEX IF NOT EXISTS idx_extra_tasks_category ON extra_tasks_config(category);

-- 用户额外任务表
CREATE TABLE IF NOT EXISTS user_extra_tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  task_date TEXT NOT NULL,
  reading INTEGER DEFAULT 0,
  stretching INTEGER DEFAULT 0,
  breakfast INTEGER DEFAULT 0,
  tea INTEGER DEFAULT 0,
  walk INTEGER DEFAULT 0,
  sun INTEGER DEFAULT 0,
  nap INTEGER DEFAULT 0,
  eyes INTEGER DEFAULT 0,
  neck INTEGER DEFAULT 0,
  breathing INTEGER DEFAULT 0,
  gratitude INTEGER DEFAULT 0,
  journal INTEGER DEFAULT 0,
  bath INTEGER DEFAULT 0,
  massage INTEGER DEFAULT 0,
  music INTEGER DEFAULT 0,
  calligraphy INTEGER DEFAULT 0,
  gardening INTEGER DEFAULT 0,
  cleaning INTEGER DEFAULT 0,
  learning INTEGER DEFAULT 0,
  kindness INTEGER DEFAULT 0,
  created_at INTEGER,
  updated_at INTEGER,
  UNIQUE(user_id, task_date)
);

CREATE INDEX IF NOT EXISTS idx_user_extra_tasks_user_date ON user_extra_tasks(user_id, task_date);

-- ==================== 历练系统 ====================

-- 历练奖励配置表
CREATE TABLE IF NOT EXISTS explore_loot_config (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  msg TEXT NOT NULL,
  weight REAL NOT NULL DEFAULT 1.0,
  life INTEGER DEFAULT 0,
  merit INTEGER DEFAULT 0,
  shard INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT 1,
  realm_id INTEGER DEFAULT 1,
  min_realm_id INTEGER DEFAULT 1,
  max_realm_id INTEGER DEFAULT 20,
  difficulty TEXT DEFAULT 'normal',
  category TEXT DEFAULT 'common'
);

-- ==================== 丹药系统 ====================

-- 丹药配置表
CREATE TABLE IF NOT EXISTS potions_config (
  id TEXT PRIMARY KEY,
  emoji TEXT,
  name TEXT NOT NULL,
  desc TEXT,
  cost INTEGER DEFAULT 0,
  type TEXT DEFAULT 'merit',
  instant_life INTEGER DEFAULT 0,
  instant_merit INTEGER DEFAULT 0,
  dur INTEGER DEFAULT 0,
  dur_decay_reduction REAL DEFAULT 0,
  dur_merit_boost REAL DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT 1,
  realm_id INTEGER DEFAULT 1,
  min_realm_id INTEGER DEFAULT 1,
  max_realm_id INTEGER DEFAULT 20,
  rarity TEXT DEFAULT 'common',
  category TEXT DEFAULT 'recovery'
);

CREATE INDEX IF NOT EXISTS idx_potions_realm ON potions_config(realm_id);
CREATE INDEX IF NOT EXISTS idx_potions_realm_range ON potions_config(min_realm_id, max_realm_id);
CREATE INDEX IF NOT EXISTS idx_potions_rarity ON potions_config(rarity);
CREATE INDEX IF NOT EXISTS idx_potions_category ON potions_config(category);

-- 激活的丹药表
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

-- ==================== 全服事件系统 ====================

-- 全服事件表
CREATE TABLE IF NOT EXISTS world_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  emoji TEXT,
  start_at INTEGER NOT NULL,
  end_at INTEGER NOT NULL,
  effect_type TEXT NOT NULL, 
  effect_value REAL NOT NULL,
  is_active INTEGER DEFAULT 0
);

-- 用户参与事件表
CREATE TABLE IF NOT EXISTS user_world_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  event_id INTEGER NOT NULL,
  joined_at INTEGER DEFAULT (unixepoch()),
  contribution INTEGER DEFAULT 0,
  reward_claimed INTEGER DEFAULT 0,
  UNIQUE(user_id, event_id)
);

-- ==================== 其他系统 ====================

-- 事件日志表
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  msg TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'normal',   
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_events_user_time ON events(user_id, created_at DESC);

-- 成就表
CREATE TABLE IF NOT EXISTS achievements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  ach_id TEXT NOT NULL,
  unlocked_at INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE(user_id, ach_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_ach_user ON achievements(user_id);

-- 劫难表
CREATE TABLE IF NOT EXISTS tribulations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  week_id TEXT NOT NULL,         
  status TEXT NOT NULL DEFAULT 'pending', 
  tasks TEXT,                      
  accepted_at INTEGER,
  completed_at INTEGER,
  reward_sec INTEGER DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_trib_user_week ON tribulations(user_id, week_id);

-- 每日运势表
CREATE TABLE IF NOT EXISTS daily_fortune (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  fortune_date TEXT NOT NULL,
  fortune_type TEXT NOT NULL, 
  life_multiplier REAL DEFAULT 1.0,
  merit_multiplier REAL DEFAULT 1.0,
  special_event TEXT,
  checked_in INTEGER DEFAULT 0,
  UNIQUE(user_id, fortune_date)
);

CREATE INDEX IF NOT EXISTS idx_fortune_user_date ON daily_fortune(user_id, fortune_date);

-- 配置表
CREATE TABLE IF NOT EXISTS configs (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- 管理日志表
CREATE TABLE IF NOT EXISTS admin_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  admin_user_id INTEGER NOT NULL,
  action TEXT NOT NULL,
  detail TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_admin_logs_time ON admin_logs(created_at DESC);

-- ========================================
-- Schema创建完成
-- 接下来请执行seed.sql导入初始数据
-- ========================================
