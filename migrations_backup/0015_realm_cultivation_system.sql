-- ========================================
-- 境界修炼系统重构
-- 将修炼项目与境界深度关联
-- ========================================

-- 1. 修炼项目配置表（替代原有的 manuals 表）
CREATE TABLE IF NOT EXISTS cultivation_practices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  emoji TEXT,
  description TEXT,
  
  -- 境界关联
  realm_id INTEGER NOT NULL,                    -- 所属境界
  required_realm_level INTEGER DEFAULT 1,       -- 需要达到的境界小境界（sub_realm）
  
  -- 修炼类型
  practice_type TEXT NOT NULL,                  -- 'basic'基础, 'advanced'高级, 'secret'秘法, 'forbidden'禁术
  category TEXT NOT NULL,                       -- 'breathing'吐纳, 'meditation'冥想, 'body'炼体, 'soul'炼魂, 'qi'炼气
  
  -- 修炼难度（随境界递增）
  difficulty INTEGER DEFAULT 1,                 -- 1-10 难度等级
  practice_time INTEGER DEFAULT 3600,           -- 修炼所需时间（秒）
  cooldown_time INTEGER DEFAULT 86400,          -- 冷却时间（秒）
  
  -- 消耗
  cost_merit INTEGER DEFAULT 0,                 -- 功德消耗
  cost_life INTEGER DEFAULT 0,                  -- 寿命消耗（某些禁术需要）
  cost_coin INTEGER DEFAULT 0,                  -- 复活币消耗
  
  -- 奖励（随境界递增）
  reward_life INTEGER DEFAULT 0,                -- 寿命奖励（秒）
  reward_merit INTEGER DEFAULT 0,               -- 功德奖励
  reward_shard INTEGER DEFAULT 0,               -- 碎片奖励
  reward_exp INTEGER DEFAULT 0,                 -- 修炼经验
  
  -- 效果
  effect_type TEXT,                             -- 'decay_reduction', 'merit_boost', 'life_boost', 'breakthrough_help'
  effect_value REAL DEFAULT 0,                  -- 效果数值
  effect_duration INTEGER DEFAULT 0,            -- 效果持续时间（秒，0表示永久）
  
  -- 突破相关
  helps_breakthrough INTEGER DEFAULT 0,         -- 是否有助于境界突破
  breakthrough_contribution INTEGER DEFAULT 0,  -- 对突破的贡献值
  
  -- 限制
  max_level INTEGER DEFAULT 10,                 -- 最大等级
  daily_limit INTEGER DEFAULT 0,                -- 每日修炼次数限制（0表示无限制）
  prerequisite_practice TEXT,                   -- 前置功法要求（JSON数组）
  
  -- 稀有度和排序
  rarity TEXT DEFAULT 'common',                 -- 'common', 'rare', 'epic', 'legendary', 'mythic'
  sort_order INTEGER DEFAULT 0,
  
  -- 状态
  is_active INTEGER DEFAULT 1,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_cultivation_realm ON cultivation_practices(realm_id);
CREATE INDEX IF NOT EXISTS idx_cultivation_type ON cultivation_practices(practice_type);
CREATE INDEX IF NOT EXISTS idx_cultivation_category ON cultivation_practices(category);

-- 2. 用户修炼进度表（增强版）
CREATE TABLE IF NOT EXISTS user_cultivation_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  practice_key TEXT NOT NULL,
  
  -- 修炼进度
  level INTEGER DEFAULT 0,                      -- 当前等级
  experience INTEGER DEFAULT 0,                 -- 当前经验
  total_practice_count INTEGER DEFAULT 0,       -- 总修炼次数
  success_count INTEGER DEFAULT 0,              -- 成功次数
  failure_count INTEGER DEFAULT 0,              -- 失败次数
  
  -- 时间记录
  first_practice_at INTEGER,                    -- 首次修炼时间
  last_practice_at INTEGER,                     -- 最后修炼时间
  last_success_at INTEGER,                      -- 最后成功时间
  
  -- 今日统计
  today_practice_count INTEGER DEFAULT 0,       -- 今日修炼次数
  today_date TEXT,                              -- 今日日期（用于重置计数）
  
  -- 状态
  is_active INTEGER DEFAULT 0,                  -- 是否激活（同时激活的功法有限制）
  is_mastered INTEGER DEFAULT 0,                -- 是否已精通（达到满级）
  
  -- 特殊标记
  breakthrough_ready INTEGER DEFAULT 0,         -- 是否已为突破做好准备
  
  UNIQUE(user_id, practice_key),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_cultivation_user ON user_cultivation_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_cultivation_active ON user_cultivation_progress(user_id, is_active);

-- 3. 修炼记录表（详细日志）
CREATE TABLE IF NOT EXISTS cultivation_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  practice_key TEXT NOT NULL,
  
  -- 修炼详情
  practice_level INTEGER NOT NULL,              -- 修炼时的等级
  result TEXT NOT NULL,                         -- 'success', 'failure', 'breakthrough', 'critical'
  
  -- 消耗和奖励
  cost_merit INTEGER DEFAULT 0,
  cost_life INTEGER DEFAULT 0,
  reward_life INTEGER DEFAULT 0,
  reward_merit INTEGER DEFAULT 0,
  reward_shard INTEGER DEFAULT 0,
  reward_exp INTEGER DEFAULT 0,
  
  -- 额外信息
  notes TEXT,                                   -- 修炼心得
  created_at INTEGER DEFAULT (unixepoch()),
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_cultivation_records_user ON cultivation_records(user_id, created_at DESC);

-- 4. 迁移旧数据（如果需要）
-- 将旧的 manuals 数据迁移到新表（可选）
-- INSERT INTO cultivation_practices (key, name, emoji, description, realm_id, practice_type, category, ...)
-- SELECT key, name, emoji, description, 1, 'basic', 'meditation', ... FROM manuals;

-- 5. 插入初始修炼项目数据（凡蜕期 - 境界1-5）

-- 境界1：胎息境（0-5岁）- 基础修炼
INSERT OR IGNORE INTO cultivation_practices (key, name, emoji, description, realm_id, required_realm_level, practice_type, category, difficulty, cost_merit, reward_life, reward_merit, reward_shard, max_level, daily_limit, rarity, sort_order) VALUES
('taixin_basic', '胎息入门', '👶', '锁住先天灵气，初窥修炼之门', 1, 1, 'basic', 'breathing', 1, 0, 1800, 5, 0, 10, 3, 'common', 1),
('xiantian_guard', '先天护体', '✨', '保护先天真气不散', 1, 1, 'basic', 'qi', 1, 10, 3600, 8, 0, 10, 2, 'common', 2),
('lingtai_awaken', '灵台初醒', '🧘', '开启灵台，感知天地', 1, 1, 'basic', 'meditation', 2, 15, 2400, 10, 0, 10, 2, 'common', 3),
('yuanqi_gather', '元气聚集', '💫', '聚集周身元气', 1, 1, 'basic', 'qi', 2, 20, 4800, 12, 1, 10, 2, 'rare', 4),
('tiandi_resonate', '天地共鸣', '🌟', '与天地灵气产生共鸣', 1, 1, 'advanced', 'breathing', 3, 30, 7200, 15, 1, 8, 1, 'rare', 5),
('xiantian_refine', '先天炼化', '⚡', '炼化先天之气', 1, 1, 'advanced', 'qi', 3, 40, 9000, 20, 2, 8, 1, 'epic', 6),
('linghun_nourish', '灵魂滋养', '🌸', '滋养初生灵魂', 1, 1, 'basic', 'soul', 2, 25, 5400, 15, 1, 10, 2, 'rare', 7),
('zhenqi_cycle', '真气循环', '🔄', '建立真气循环', 1, 1, 'basic', 'qi', 2, 20, 4200, 12, 0, 10, 3, 'common', 8),
('tianzhen_preserve', '天真守护', '🛡️', '保持天真本性', 1, 1, 'basic', 'meditation', 1, 15, 3000, 10, 0, 10, 3, 'common', 9),
('xiantian_breakthrough', '先天突破', '💥', '为突破定脉境做准备', 1, 1, 'secret', 'breakthrough', 4, 50, 12000, 30, 3, 5, 1, 'epic', 10);

-- 境界2：定脉境（5-15岁）- 疏通经络
INSERT OR IGNORE INTO cultivation_practices (key, name, emoji, description, realm_id, required_realm_level, practice_type, category, difficulty, cost_merit, reward_life, reward_merit, reward_shard, max_level, daily_limit, rarity, sort_order, helps_breakthrough, breakthrough_contribution) VALUES
('dingmai_basic', '定脉基础', '🌊', '疏通十二正经', 2, 2, 'basic', 'body', 2, 30, 7200, 15, 1, 10, 3, 'common', 11, 0, 0),
('jingmai_open', '经脉开拓', '🔓', '打开闭塞的经脉', 2, 2, 'basic', 'body', 2, 40, 9000, 18, 1, 10, 2, 'common', 12, 0, 0),
('qixue_activate', '气血激活', '❤️', '激活气血运行', 2, 2, 'basic', 'qi', 3, 50, 10800, 20, 2, 10, 2, 'rare', 13, 0, 0),
('rendu_connect', '任督贯通', '⚡', '贯通任督二脉', 2, 2, 'advanced', 'qi', 4, 80, 14400, 30, 3, 8, 1, 'epic', 14, 1, 20),
('baimai_harmony', '百脉调和', '🎵', '调和全身经脉', 2, 2, 'advanced', 'body', 3, 60, 12000, 25, 2, 10, 2, 'rare', 15, 0, 0),
('zhenqi_strengthen', '真气强化', '💪', '强化真气质量', 2, 2, 'basic', 'qi', 3, 45, 10000, 20, 1, 10, 2, 'common', 16, 0, 0),
('jingmai_expand', '经脉拓宽', '📏', '拓宽经脉容量', 2, 2, 'advanced', 'body', 4, 70, 13200, 28, 2, 8, 1, 'rare', 17, 1, 15),
('qihai_build', '气海筑基', '🌊', '在丹田建立气海', 2, 2, 'advanced', 'qi', 4, 90, 15600, 35, 3, 8, 1, 'epic', 18, 1, 25),
('xuemo_purify', '血脉净化', '💎', '净化血脉杂质', 2, 2, 'basic', 'body', 3, 55, 11400, 22, 2, 10, 2, 'rare', 19, 0, 0),
('dingmai_perfection', '定脉圆满', '✨', '定脉境圆满，准备洗髓', 2, 2, 'secret', 'breakthrough', 5, 120, 18000, 50, 5, 5, 1, 'legendary', 20, 1, 50);

-- 境界3：洗髓境（15-30岁）- 排除杂质
INSERT OR IGNORE INTO cultivation_practices (key, name, emoji, description, realm_id, required_realm_level, practice_type, category, difficulty, cost_merit, reward_life, reward_merit, reward_shard, max_level, daily_limit, rarity, sort_order, helps_breakthrough, breakthrough_contribution) VALUES
('xisui_initiate', '洗髓启动', '🌀', '开始洗髓伐毛', 3, 3, 'basic', 'body', 3, 80, 14400, 30, 2, 10, 2, 'common', 21, 0, 0),
('gusui_cleanse', '骨髓清洗', '🦴', '清洗骨髓中的杂质', 3, 3, 'advanced', 'body', 4, 120, 18000, 40, 3, 8, 2, 'rare', 22, 1, 20),
('zangfu_purify', '脏腑净化', '💚', '净化五脏六腑', 3, 3, 'basic', 'body', 3, 90, 15600, 35, 2, 10, 2, 'common', 23, 0, 0),
('xuemo_rebirth', '血脉重生', '🔴', '重塑血脉根基', 3, 3, 'advanced', 'body', 5, 150, 21600, 50, 4, 8, 1, 'epic', 24, 1, 30),
('jingmai_reforge', '经脉重铸', '⚒️', '重铸经脉结构', 3, 3, 'advanced', 'body', 4, 110, 17400, 42, 3, 8, 2, 'rare', 25, 1, 25),
('tigu_strengthen', '体骨强化', '💪', '强化骨骼密度', 3, 3, 'basic', 'body', 3, 85, 15000, 32, 2, 10, 2, 'common', 26, 0, 0),
('neishi_expel', '内视排毒', '👁️', '内视身体，排出毒素', 3, 3, 'advanced', 'meditation', 4, 130, 19200, 45, 3, 8, 1, 'rare', 27, 0, 0),
('xiantian_restore', '先天复原', '🌟', '恢复先天之体', 3, 3, 'secret', 'body', 6, 200, 28800, 70, 6, 5, 1, 'epic', 28, 1, 40),
('fanti_shed', '凡体蜕变', '🦋', '蜕去凡胎', 3, 3, 'advanced', 'body', 5, 160, 23400, 55, 4, 8, 1, 'epic', 29, 1, 35),
('xisui_complete', '洗髓大成', '✨', '洗髓圆满，准备换血', 3, 3, 'secret', 'breakthrough', 6, 250, 36000, 100, 8, 5, 1, 'legendary', 30, 1, 60);

-- 境界4：换血境（30-60岁）- 逆转衰老
INSERT OR IGNORE INTO cultivation_practices (key, name, emoji, description, realm_id, required_realm_level, practice_type, category, difficulty, cost_merit, reward_life, reward_merit, reward_shard, max_level, daily_limit, rarity, sort_order, helps_breakthrough, breakthrough_contribution) VALUES
('huanxue_begin', '换血启程', '💉', '开始换血过程', 4, 4, 'basic', 'body', 4, 150, 21600, 50, 3, 10, 2, 'rare', 31, 0, 0),
('lingxue_refine', '灵血炼制', '🧪', '炼制灵血', 4, 4, 'advanced', 'qi', 5, 200, 28800, 70, 5, 8, 1, 'epic', 32, 1, 25),
('xuemo_replace', '血脉置换', '🔄', '置换全身血液', 4, 4, 'advanced', 'body', 5, 220, 32400, 80, 6, 8, 1, 'epic', 33, 1, 30),
('qiguan_rejuvenate', '器官回春', '🌱', '使器官恢复年轻', 4, 4, 'advanced', 'body', 6, 280, 39600, 100, 7, 8, 1, 'legendary', 34, 1, 40),
('xibao_activate', '细胞激活', '⚡', '激活细胞活性', 4, 4, 'basic', 'body', 4, 180, 25200, 60, 4, 10, 2, 'rare', 35, 0, 0),
('shengli_reverse', '生理逆转', '⏪', '逆转生理年龄', 4, 4, 'secret', 'body', 7, 350, 50400, 130, 10, 5, 1, 'legendary', 36, 1, 50),
('jingxue_purify', '精血提纯', '💎', '提纯精血质量', 4, 4, 'advanced', 'body', 5, 240, 34200, 85, 6, 8, 1, 'epic', 37, 1, 35),
('shengji_enhance', '生机增强', '🌿', '增强生命力', 4, 4, 'basic', 'qi', 4, 190, 27000, 65, 4, 10, 2, 'rare', 38, 0, 0),
('huanxue_stabilize', '换血稳固', '🛡️', '稳固换血成果', 4, 4, 'advanced', 'body', 5, 260, 36000, 90, 6, 8, 1, 'epic', 39, 1, 30),
('huanxue_mastery', '换血至境', '👑', '换血境大圆满', 4, 4, 'secret', 'breakthrough', 8, 500, 72000, 200, 15, 5, 1, 'mythic', 40, 1, 80);

-- 境界5：玉骨境（60-100岁）- 骨骼结晶化
INSERT OR IGNORE INTO cultivation_practices (key, name, emoji, description, realm_id, required_realm_level, practice_type, category, difficulty, cost_merit, reward_life, reward_merit, reward_shard, max_level, daily_limit, rarity, sort_order, helps_breakthrough, breakthrough_contribution) VALUES
('yugu_foundation', '玉骨筑基', '💎', '开始骨骼结晶化', 5, 5, 'basic', 'body', 5, 300, 43200, 100, 8, 10, 2, 'epic', 41, 0, 0),
('guge_crystallize', '骨骼晶化', '💠', '骨骼逐渐晶化', 5, 5, 'advanced', 'body', 6, 400, 57600, 140, 10, 8, 1, 'legendary', 42, 1, 35),
('suigu_jade', '髓骨如玉', '🦴', '骨髓转化为玉质', 5, 5, 'advanced', 'body', 6, 450, 64800, 160, 12, 8, 1, 'legendary', 43, 1, 40),
('gujie_strengthen', '骨节强化', '⚡', '强化骨节连接', 5, 5, 'basic', 'body', 5, 350, 50400, 120, 9, 10, 2, 'epic', 44, 0, 0),
('yuti_transform', '玉体转化', '✨', '全身转化为玉体', 5, 5, 'secret', 'body', 8, 600, 86400, 220, 18, 5, 1, 'mythic', 45, 1, 60),
('jinggu_refine', '精骨炼化', '🔥', '炼化骨骼精华', 5, 5, 'advanced', 'body', 6, 480, 69120, 170, 13, 8, 1, 'legendary', 46, 1, 45),
('guli_enhance', '骨力增强', '💪', '增强骨骼力量', 5, 5, 'basic', 'body', 5, 380, 54000, 130, 10, 10, 2, 'epic', 47, 0, 0),
('yugu_defense', '玉骨护体', '🛡️', '玉骨形成防护', 5, 5, 'advanced', 'body', 7, 520, 75600, 190, 14, 8, 1, 'legendary', 48, 1, 50),
('bainian_barrier', '百年屏障', '🚧', '突破百岁屏障', 5, 5, 'secret', 'breakthrough', 9, 800, 115200, 300, 25, 5, 1, 'mythic', 49, 1, 100),
('yugu_perfection', '玉骨圆满', '👑', '玉骨境大圆满，准备超凡', 5, 5, 'secret', 'breakthrough', 10, 1000, 144000, 400, 30, 3, 1, 'mythic', 50, 1, 150);

-- 注：后续境界（6-20）的修炼项目可以继续添加，每个境界至少10个修炼项目
-- 随着境界提升，消耗和奖励都会递增

