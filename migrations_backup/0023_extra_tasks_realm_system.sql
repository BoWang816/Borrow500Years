-- 扩展养生项目境界系统重构
-- 将扩展养生项目与境界关联，不同境界有不同的养生项目

-- 1. 添加境界相关字段
ALTER TABLE extra_tasks_config ADD COLUMN realm_id INTEGER DEFAULT 1;
ALTER TABLE extra_tasks_config ADD COLUMN min_realm_id INTEGER DEFAULT 1;
ALTER TABLE extra_tasks_config ADD COLUMN max_realm_id INTEGER DEFAULT 20;
ALTER TABLE extra_tasks_config ADD COLUMN difficulty TEXT DEFAULT 'normal'; -- easy, normal, hard, extreme
ALTER TABLE extra_tasks_config ADD COLUMN category TEXT DEFAULT 'basic'; -- basic, advanced, special

-- 2. 清空现有扩展养生项目数据
DELETE FROM extra_tasks_config;

-- 3. 插入境界1-5（凡蜕期）扩展养生项目 - 基础养生
-- 胎息境（境界1）- 基础养生
INSERT INTO extra_tasks_config (id, task_key, name, emoji, description, life_reward, merit_reward, shard_reward, realm_id, min_realm_id, max_realm_id, difficulty, category, sort_order, is_active) VALUES
(1, 'morning_breath', '晨起吐纳', '🌅', '清晨吐故纳新，调理气息', 600, 1, 0, 1, 1, 5, 'easy', 'basic', 1, 1),
(2, 'reading', '晨读经典', '📖', '晨起诵读经典，开启智慧', 600, 2, 0, 1, 1, 5, 'easy', 'basic', 2, 1),
(3, 'stretching', '舒展筋骨', '🧘', '晨起拉伸，唤醒身体', 900, 1, 0, 1, 1, 5, 'easy', 'basic', 3, 1),
(4, 'breakfast', '营养早餐', '🥣', '享用营养早餐，补充能量', 600, 1, 0, 1, 1, 5, 'easy', 'basic', 4, 1),
(5, 'tea', '品茗静心', '🍵', '品一杯清茶，静心养性', 300, 2, 0, 1, 1, 5, 'easy', 'basic', 5, 1);

-- 定脉境（境界2）
INSERT INTO extra_tasks_config (id, task_key, name, emoji, description, life_reward, merit_reward, shard_reward, realm_id, min_realm_id, max_realm_id, difficulty, category, sort_order, is_active) VALUES
(6, 'walk', '散步消食', '🚶', '饭后百步走，活到九十九', 1200, 1, 0, 2, 2, 5, 'easy', 'basic', 10, 1),
(7, 'sun', '晒太阳', '☀️', '吸收阳光精华，补充阳气', 900, 1, 0, 2, 2, 5, 'easy', 'basic', 11, 1),
(8, 'nap', '午休养神', '😴', '小憩片刻，恢复精力', 1800, 2, 0, 2, 2, 5, 'normal', 'basic', 12, 1),
(9, 'eyes', '眼保健操', '👁️', '保护视力，远离近视', 600, 1, 0, 2, 2, 5, 'easy', 'basic', 13, 1);

-- 洗髓境（境界3）
INSERT INTO extra_tasks_config (id, task_key, name, emoji, description, life_reward, merit_reward, shard_reward, realm_id, min_realm_id, max_realm_id, difficulty, category, sort_order, is_active) VALUES
(10, 'neck', '颈椎操', '🦒', '舒缓颈椎，预防职业病', 900, 1, 0, 3, 3, 5, 'easy', 'basic', 20, 1),
(11, 'posture', '站桩练气', '🧍', '站桩养气，强健体魄', 2400, 3, 0, 3, 3, 5, 'normal', 'advanced', 21, 1),
(12, 'herbs', '药膳调理', '🍲', '食用药膳，滋补身体', 1800, 2, 0, 3, 3, 5, 'normal', 'basic', 22, 1),
(13, 'acupoint', '穴位按摩', '👆', '按摩穴位，疏通经络', 1500, 2, 0, 3, 3, 5, 'normal', 'advanced', 23, 1);

-- 换血境（境界4）
INSERT INTO extra_tasks_config (id, task_key, name, emoji, description, life_reward, merit_reward, shard_reward, realm_id, min_realm_id, max_realm_id, difficulty, category, sort_order, is_active) VALUES
(14, 'qigong', '气功导引', '🌀', '练习气功，导引真气', 3600, 4, 1, 4, 4, 5, 'normal', 'advanced', 30, 1),
(15, 'meridian', '经络疏通', '💫', '疏通经络，畅通气血', 3000, 3, 0, 4, 4, 5, 'normal', 'advanced', 31, 1),
(16, 'bath', '药浴养生', '🛁', '药浴浸泡，排毒养颜', 2400, 3, 0, 4, 4, 5, 'normal', 'basic', 32, 1),
(17, 'incense', '香道养心', '🕯️', '品香静心，陶冶性情', 1800, 4, 0, 4, 4, 5, 'normal', 'special', 33, 1);

-- 玉骨境（境界5）
INSERT INTO extra_tasks_config (id, task_key, name, emoji, description, life_reward, merit_reward, shard_reward, realm_id, min_realm_id, max_realm_id, difficulty, category, sort_order, is_active) VALUES
(18, 'taichi', '太极拳法', '☯️', '练习太极，阴阳调和', 4800, 5, 1, 5, 5, 5, 'hard', 'advanced', 40, 1),
(19, 'calligraphy', '书法养性', '✍️', '挥毫泼墨，修身养性', 3600, 4, 1, 5, 5, 5, 'normal', 'special', 41, 1),
(20, 'music', '琴音养神', '🎵', '抚琴奏乐，陶冶心神', 3600, 5, 1, 5, 5, 5, 'normal', 'special', 42, 1);

-- 4. 插入境界6-10（超凡期）扩展养生项目 - 进阶养生
-- 聚灵境（境界6）
INSERT INTO extra_tasks_config (id, task_key, name, emoji, description, life_reward, merit_reward, shard_reward, realm_id, min_realm_id, max_realm_id, difficulty, category, sort_order, is_active) VALUES
(21, 'inner_vision', '内视观想', '🔮', '内视脏腑，观想丹田', 5400, 6, 1, 6, 6, 10, 'hard', 'advanced', 50, 1),
(22, 'breath_control', '吐纳控息', '💨', '控制呼吸，调理真气', 6000, 6, 1, 6, 6, 10, 'hard', 'advanced', 51, 1),
(23, 'energy_gather', '聚气凝神', '⚡', '聚集灵气，凝练神识', 6600, 7, 2, 6, 6, 10, 'hard', 'advanced', 52, 1);

-- 神识境（境界7）
INSERT INTO extra_tasks_config (id, task_key, name, emoji, description, life_reward, merit_reward, shard_reward, realm_id, min_realm_id, max_realm_id, difficulty, category, sort_order, is_active) VALUES
(24, 'spirit_refine', '炼神还虚', '✨', '炼化神识，返璞归真', 7200, 8, 2, 7, 7, 10, 'hard', 'advanced', 60, 1),
(25, 'soul_cleanse', '洗涤心灵', '🌟', '净化心灵，提升境界', 7800, 8, 2, 7, 7, 10, 'hard', 'special', 61, 1),
(26, 'dao_comprehend', '参悟道法', '📜', '参悟天地大道', 8400, 9, 2, 7, 7, 10, 'extreme', 'special', 62, 1);

-- 玄府境（境界8）
INSERT INTO extra_tasks_config (id, task_key, name, emoji, description, life_reward, merit_reward, shard_reward, realm_id, min_realm_id, max_realm_id, difficulty, category, sort_order, is_active) VALUES
(27, 'aperture_open', '开启玄府', '🌌', '开启玄府，沟通天地', 9000, 10, 3, 8, 8, 10, 'extreme', 'advanced', 70, 1),
(28, 'star_absorb', '吸纳星辰', '⭐', '吸收星辰之力', 9600, 10, 3, 8, 8, 10, 'extreme', 'advanced', 71, 1);

-- 凝丹境（境界9）
INSERT INTO extra_tasks_config (id, task_key, name, emoji, description, life_reward, merit_reward, shard_reward, realm_id, min_realm_id, max_realm_id, difficulty, category, sort_order, is_active) VALUES
(29, 'pill_condense', '凝聚金丹', '💊', '凝聚体内金丹', 10800, 12, 3, 9, 9, 10, 'extreme', 'advanced', 80, 1),
(30, 'essence_refine', '炼精化气', '🔥', '炼化精气，提升修为', 11400, 12, 3, 9, 9, 10, 'extreme', 'advanced', 81, 1);

-- 破茧境（境界10）
INSERT INTO extra_tasks_config (id, task_key, name, emoji, description, life_reward, merit_reward, shard_reward, realm_id, min_realm_id, max_realm_id, difficulty, category, sort_order, is_active) VALUES
(31, 'cocoon_break', '破茧重生', '🦋', '破茧而出，脱胎换骨', 12000, 15, 4, 10, 10, 15, 'extreme', 'special', 90, 1),
(32, 'nirvana', '涅槃重生', '🔆', '经历涅槃，获得新生', 13200, 15, 4, 10, 10, 15, 'extreme', 'special', 91, 1);

-- 5. 插入境界11-20（化境期及以上）扩展养生项目 - 高级养生
-- 羽化境（境界11-15）
INSERT INTO extra_tasks_config (id, task_key, name, emoji, description, life_reward, merit_reward, shard_reward, realm_id, min_realm_id, max_realm_id, difficulty, category, sort_order, is_active) VALUES
(33, 'feather_transform', '羽化登仙', '🕊️', '羽化飞升，超凡入圣', 14400, 18, 5, 11, 11, 15, 'extreme', 'special', 100, 1),
(34, 'heaven_dao', '天道感悟', '☁️', '感悟天道，领悟真谛', 16800, 20, 6, 11, 11, 15, 'extreme', 'special', 101, 1),
(35, 'immortal_qi', '仙气灌体', '🌈', '吸收仙气，洗涤凡身', 18000, 22, 6, 11, 11, 15, 'extreme', 'advanced', 102, 1);

-- 真仙境（境界16-20）
INSERT INTO extra_tasks_config (id, task_key, name, emoji, description, life_reward, merit_reward, shard_reward, realm_id, min_realm_id, max_realm_id, difficulty, category, sort_order, is_active) VALUES
(36, 'chaos_comprehend', '混沌悟道', '🌀', '参悟混沌，洞察本源', 21600, 25, 8, 16, 16, 20, 'extreme', 'special', 110, 1),
(37, 'law_master', '掌控法则', '⚖️', '掌控天地法则', 25200, 30, 10, 16, 16, 20, 'extreme', 'special', 111, 1),
(38, 'universe_merge', '天人合一', '🌍', '与天地融为一体', 28800, 35, 12, 16, 16, 20, 'extreme', 'special', 112, 1),
(39, 'eternal_life', '长生不老', '♾️', '获得永恒生命', 32400, 40, 15, 16, 16, 20, 'extreme', 'special', 113, 1),
(40, 'transcend', '超脱轮回', '🎭', '超脱生死轮回', 36000, 50, 20, 16, 16, 20, 'extreme', 'special', 114, 1);

-- 6. 创建索引优化查询
CREATE INDEX IF NOT EXISTS idx_extra_tasks_realm ON extra_tasks_config(realm_id);
CREATE INDEX IF NOT EXISTS idx_extra_tasks_realm_range ON extra_tasks_config(min_realm_id, max_realm_id);
CREATE INDEX IF NOT EXISTS idx_extra_tasks_difficulty ON extra_tasks_config(difficulty);
CREATE INDEX IF NOT EXISTS idx_extra_tasks_category ON extra_tasks_config(category);
