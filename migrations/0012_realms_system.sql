-- 境界管理系统
-- 5大境界，每个境界包含多个小境界

CREATE TABLE IF NOT EXISTS realms (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,                    -- 境界名称：胎息、定脉、洗髓等
  major_realm INTEGER NOT NULL,          -- 大境界：1=凡蜕期, 2=超凡期, 3=化境期, 4=极境期, 5=道极期
  sub_realm INTEGER NOT NULL,            -- 小境界：1-5或更多
  major_realm_name TEXT NOT NULL,        -- 大境界名称
  lifespan_max INTEGER NOT NULL,         -- 寿命上限（秒）
  breakthrough_age_min INTEGER,          -- 建议突破最小年龄（秒）
  breakthrough_age_max INTEGER,          -- 建议突破最大年龄（秒）
  description TEXT,                      -- 境界描述
  core_logic TEXT,                       -- 核心逻辑说明
  cultivation_span_min INTEGER,          -- 修炼跨度最小值（秒）
  cultivation_span_max INTEGER,          -- 修炼跨度最大值（秒）
  sort_order INTEGER NOT NULL,           -- 排序
  UNIQUE(major_realm, sub_realm)
);

-- 插入凡蜕期：百岁之劫 (1-5境)
INSERT OR IGNORE INTO realms (id, name, major_realm, sub_realm, major_realm_name, lifespan_max, breakthrough_age_min, breakthrough_age_max, description, core_logic, cultivation_span_min, cultivation_span_max, sort_order) VALUES
(1, '胎息', 1, 1, '凡蜕期', 3153600000, 0, 157680000, '锁住先天灵气', '若5岁前未入此境，先天灵气散尽，沦为凡人', NULL, NULL, 1),
(2, '定脉', 1, 2, '凡蜕期', 3784320000, 157680000, 473040000, '疏通经络', '此阶段不修功法，身体发育会压迫经脉，导致终身无法修行', NULL, NULL, 2),
(3, '洗髓', 1, 3, '凡蜕期', 4730400000, 473040000, 946080000, '彻底排除凡胎杂质', '30岁是人体巅峰，若不洗髓，肉身开始走下坡路', NULL, NULL, 3),
(4, '换血', 1, 4, '凡蜕期', 6307200000, 946080000, 1892160000, '逆转生理衰老', '通过更换灵血，使器官功能重回18岁水平', NULL, NULL, 4),
(5, '玉骨', 1, 5, '凡蜕期', 9460800000, 1892160000, 3153600000, '骨骼结晶化', '这是百岁大关的最后屏障，成则增寿两百年', NULL, NULL, 5);

-- 插入超凡期：脱胎换骨 (6-9境)
INSERT OR IGNORE INTO realms (id, name, major_realm, sub_realm, major_realm_name, lifespan_max, breakthrough_age_min, breakthrough_age_max, description, core_logic, cultivation_span_min, cultivation_span_max, sort_order) VALUES
(6, '聚灵', 2, 1, '超凡期', 15768000000, NULL, NULL, '丹田形成灵压', '身体不再依赖五谷，需通过养生维持灵气平衡', 3153600000, 6307200000, 6),
(7, '神识', 2, 2, '超凡期', 25228800000, NULL, NULL, '脑域开发，诞生神识', '此时若停止修炼，神魂会因肉身老化而崩溃', 6307200000, 12614400000, 7),
(8, '玄府', 2, 3, '超凡期', 37843200000, NULL, NULL, '体内开辟亚空间', '对功德消耗开始激增', 12614400000, 22075200000, 8),
(9, '凝丹', 2, 4, '超凡期', 63072000000, NULL, NULL, '寿元核心成型', '若无法成丹，千岁之时即是坐化之日', 22075200000, 31536000000, 9);

-- 插入化境期：因果纠缠 (10-14境)
INSERT OR IGNORE INTO realms (id, name, major_realm, sub_realm, major_realm_name, lifespan_max, breakthrough_age_min, breakthrough_age_max, description, core_logic, cultivation_span_min, cultivation_span_max, sort_order) VALUES
(10, '破茧', 3, 1, '化境期', 126144000000, NULL, NULL, '彻底抛弃凡人肉身', '修成法躯', 31536000000, 63072000000, 10),
(11, '化神', 3, 2, '化境期', 252288000000, NULL, NULL, '元神出窍', '死亡判定不再看肉身，只看元神能量', 63072000000, 126144000000, 11),
(12, '炼虚', 3, 3, '化境期', 630720000000, NULL, NULL, '领悟空间', '寿元开始出现非线性跳跃', 126144000000, 252288000000, 12),
(13, '合道', 3, 4, '化境期', 1576800000000, NULL, NULL, '意志与局部天地融合', '与天地共鸣', 252288000000, 630720000000, 13),
(14, '渡厄', 3, 5, '化境期', 3153600000000, NULL, NULL, '经历第一重"死劫"', '每秒流逝寿元变为2倍，逼迫玩家加快进度', 630720000000, 1576800000000, 14);

-- 插入极境期：法则剥离 (15-18境)
INSERT OR IGNORE INTO realms (id, name, major_realm, sub_realm, major_realm_name, lifespan_max, breakthrough_age_min, breakthrough_age_max, description, core_logic, cultivation_span_min, cultivation_span_max, sort_order) VALUES
(15, '大乘', 4, 1, '极境期', 9460800000000, NULL, NULL, '法力圆满', '开始斩断现世羁绊', 1576800000000, 4730400000000, 15),
(16, '斩因', 4, 2, '极境期', 25228800000000, NULL, NULL, '斩断因果', '不会因他人推算或诅咒而减寿', 4730400000000, 12614400000000, 16),
(17, '溯源', 4, 3, '极境期', 94608000000000, NULL, NULL, '寻找生命最初的编码', '追溯本源', 12614400000000, 31536000000000, 17),
(18, '轮回', 4, 4, '极境期', 315360000000000, NULL, NULL, '掌控生死律', '可赋予NPC或其他玩家寿元', 31536000000000, 157680000000000, 18);

-- 插入道极期：永恒观者 (19-20境)
INSERT OR IGNORE INTO realms (id, name, major_realm, sub_realm, major_realm_name, lifespan_max, breakthrough_age_min, breakthrough_age_max, description, core_logic, cultivation_span_min, cultivation_span_max, sort_order) VALUES
(19, '涅槃', 5, 1, '道极期', 3153600000000000, NULL, NULL, '经历九次宇宙毁灭而不死', '每次重生提升200%效率', NULL, NULL, 19),
(20, '永恒', 5, 2, '道极期', 9999999999999999, NULL, NULL, '彻底超越时间维度', '不再受系统"寿命扣除"机制限制', NULL, NULL, 20);

-- 用户境界关联表
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

-- 境界突破记录
CREATE TABLE IF NOT EXISTS realm_breakthrough_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  from_realm_id INTEGER NOT NULL,
  to_realm_id INTEGER NOT NULL,
  breakthrough_at INTEGER NOT NULL,
  age_at_breakthrough INTEGER NOT NULL,  -- 突破时的年龄（秒）
  merit_cost INTEGER NOT NULL DEFAULT 0,
  success INTEGER NOT NULL DEFAULT 1,    -- 1=成功, 0=失败
  notes TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (from_realm_id) REFERENCES realms(id),
  FOREIGN KEY (to_realm_id) REFERENCES realms(id)
);

CREATE INDEX IF NOT EXISTS idx_user_realms_user ON user_realms(user_id);
CREATE INDEX IF NOT EXISTS idx_breakthrough_logs_user ON realm_breakthrough_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_realms_major_sub ON realms(major_realm, sub_realm);

-- 为现有用户初始化境界（默认为胎息境）
INSERT OR IGNORE INTO user_realms (user_id, current_realm_id, breakthrough_count, created_at, updated_at)
SELECT id, 1, 0, strftime('%s', 'now'), strftime('%s', 'now')
FROM users
WHERE id NOT IN (SELECT user_id FROM user_realms);
