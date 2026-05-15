-- ========================================
-- 修炼项目扩展：境界6-10
-- 每个境界10个修炼项目，共50个
-- ========================================

-- 境界6：聚灵境（超凡期第1境）- 丹田形成灵压
INSERT OR IGNORE INTO cultivation_practices (key, name, emoji, description, realm_id, required_realm_level, practice_type, category, difficulty, cost_merit, reward_life, reward_merit, reward_shard, max_level, daily_limit, rarity, sort_order, helps_breakthrough, breakthrough_contribution) VALUES
('juling_initiate', '聚灵启蒙', '🌀', '开始聚集天地灵气', 6, 1, 'basic', 'qi', 5, 500, 86400, 200, 15, 10, 2, 'epic', 51, 0, 0),
('dantian_expand', '丹田拓展', '⭕', '扩大丹田容量', 6, 1, 'basic', 'qi', 6, 600, 108000, 250, 18, 10, 2, 'epic', 52, 0, 0),
('lingyali_form', '灵压成型', '💨', '在丹田形成灵压', 6, 1, 'advanced', 'qi', 7, 800, 144000, 320, 22, 8, 1, 'legendary', 53, 1, 40),
('lingqi_absorb', '灵气吸纳', '🌬️', '高效吸收天地灵气', 6, 1, 'basic', 'breathing', 5, 550, 93600, 220, 16, 10, 2, 'epic', 54, 0, 0),
('wugu_transcend', '无谷超脱', '🍃', '脱离五谷依赖', 6, 1, 'advanced', 'body', 6, 700, 122400, 280, 20, 8, 2, 'epic', 55, 0, 0),
('linggen_awaken', '灵根觉醒', '🌱', '觉醒修炼灵根', 6, 1, 'secret', 'qi', 8, 1000, 172800, 400, 28, 5, 1, 'legendary', 56, 1, 50),
('qihai_stabilize', '气海稳固', '🌊', '稳固气海根基', 6, 1, 'basic', 'qi', 6, 650, 115200, 260, 19, 10, 2, 'epic', 57, 0, 0),
('lingli_refine', '灵力精炼', '✨', '提纯灵力质量', 6, 1, 'advanced', 'qi', 7, 850, 151200, 340, 24, 8, 1, 'legendary', 58, 1, 45),
('chaofan_step', '超凡初步', '🚀', '迈入超凡境界', 6, 1, 'secret', 'breakthrough', 9, 1200, 201600, 480, 32, 5, 1, 'mythic', 59, 1, 80),
('juling_complete', '聚灵圆满', '👑', '聚灵境大圆满', 6, 1, 'secret', 'breakthrough', 10, 1500, 259200, 600, 40, 3, 1, 'mythic', 60, 1, 120);

-- 境界7：神识境（超凡期第2境）- 脑域开发，诞生神识
INSERT OR IGNORE INTO cultivation_practices (key, name, emoji, description, realm_id, required_realm_level, practice_type, category, difficulty, cost_merit, reward_life, reward_merit, reward_shard, max_level, daily_limit, rarity, sort_order, helps_breakthrough, breakthrough_contribution) VALUES
('shenshi_awaken', '神识初醒', '🧠', '开启神识之门', 7, 2, 'basic', 'soul', 6, 800, 144000, 350, 25, 10, 2, 'legendary', 61, 0, 0),
('naoyu_develop', '脑域开发', '💡', '开发大脑潜能', 7, 2, 'advanced', 'soul', 7, 1000, 180000, 420, 30, 8, 2, 'legendary', 62, 1, 40),
('shenshi_extend', '神识延伸', '📡', '延伸神识范围', 7, 2, 'basic', 'soul', 6, 850, 154800, 370, 26, 10, 2, 'legendary', 63, 0, 0),
('linghun_strengthen', '灵魂强化', '👻', '强化灵魂本质', 7, 2, 'advanced', 'soul', 8, 1200, 216000, 500, 35, 8, 1, 'legendary', 64, 1, 50),
('shenshi_attack', '神识攻击', '⚔️', '以神识攻击', 7, 2, 'advanced', 'soul', 7, 1100, 198000, 460, 32, 8, 2, 'legendary', 65, 0, 0),
('yuanshen_nurture', '元神孕育', '🌟', '孕育元神雏形', 7, 2, 'secret', 'soul', 9, 1500, 270000, 620, 42, 5, 1, 'mythic', 66, 1, 70),
('shenshi_defense', '神识防御', '🛡️', '构建神识防护', 7, 2, 'basic', 'soul', 6, 900, 162000, 390, 28, 10, 2, 'legendary', 67, 0, 0),
('lingtai_clear', '灵台清明', '🔮', '保持灵台清明', 7, 2, 'advanced', 'meditation', 7, 1150, 207000, 480, 34, 8, 2, 'legendary', 68, 1, 45),
('shenshi_fusion', '神识融合', '🔗', '神识与肉身融合', 7, 2, 'secret', 'breakthrough', 10, 1800, 324000, 750, 50, 5, 1, 'mythic', 69, 1, 100),
('shenshi_mastery', '神识至境', '👑', '神识境大圆满', 7, 2, 'secret', 'breakthrough', 11, 2200, 396000, 900, 60, 3, 1, 'mythic', 70, 1, 150);

-- 境界8：玄府境（超凡期第3境）- 体内开辟亚空间
INSERT OR IGNORE INTO cultivation_practices (key, name, emoji, description, realm_id, required_realm_level, practice_type, category, difficulty, cost_merit, reward_life, reward_merit, reward_shard, max_level, daily_limit, rarity, sort_order, helps_breakthrough, breakthrough_contribution) VALUES
('xuanfu_locate', '玄府定位', '🎯', '定位体内玄府', 8, 3, 'basic', 'body', 7, 1200, 216000, 550, 38, 10, 2, 'legendary', 71, 0, 0),
('kongji an_sense', '空间感知', '🌌', '感知空间法则', 8, 3, 'advanced', 'meditation', 8, 1500, 270000, 680, 45, 8, 2, 'legendary', 72, 1, 45),
('xuanfu_open', '玄府开辟', '🔓', '开辟体内玄府', 8, 3, 'advanced', 'body', 9, 1800, 324000, 800, 52, 8, 1, 'mythic', 73, 1, 60),
('yakongjian_build', '亚空间构建', '🏗️', '构建亚空间结构', 8, 3, 'secret', 'qi', 10, 2200, 396000, 950, 62, 5, 1, 'mythic', 74, 1, 80),
('xuanfu_stabilize', '玄府稳固', '⚓', '稳固玄府空间', 8, 3, 'basic', 'body', 7, 1300, 234000, 600, 40, 10, 2, 'legendary', 75, 0, 0),
('kongjian_store', '空间储物', '📦', '在玄府中储物', 8, 3, 'advanced', 'qi', 8, 1600, 288000, 720, 48, 8, 2, 'legendary', 76, 0, 0),
('xuanfu_expand', '玄府扩展', '📏', '扩大玄府容量', 8, 3, 'advanced', 'body', 9, 1900, 342000, 840, 55, 8, 1, 'mythic', 77, 1, 65),
('kongjian_teleport', '空间挪移', '🌀', '短距离空间移动', 8, 3, 'secret', 'qi', 11, 2500, 450000, 1100, 70, 5, 1, 'mythic', 78, 1, 90),
('xuanfu_perfect', '玄府完美', '💎', '玄府达到完美', 8, 3, 'secret', 'breakthrough', 12, 3000, 540000, 1300, 80, 5, 1, 'mythic', 79, 1, 120),
('xuanfu_transcend', '玄府超越', '👑', '玄府境大圆满', 8, 3, 'secret', 'breakthrough', 13, 3500, 630000, 1500, 95, 3, 1, 'mythic', 80, 1, 180);

-- 境界9：凝丹境（超凡期第4境）- 寿元核心成型
INSERT OR IGNORE INTO cultivation_practices (key, name, emoji, description, realm_id, required_realm_level, practice_type, category, difficulty, cost_merit, reward_life, reward_merit, reward_shard, max_level, daily_limit, rarity, sort_order, helps_breakthrough, breakthrough_contribution) VALUES
('ningdan_prepare', '凝丹准备', '🔮', '为凝丹做准备', 9, 4, 'basic', 'qi', 8, 1800, 324000, 800, 55, 10, 2, 'legendary', 81, 0, 0),
('jindan_condense', '金丹凝聚', '⚪', '凝聚金丹雏形', 9, 4, 'advanced', 'qi', 9, 2200, 396000, 980, 65, 8, 2, 'mythic', 82, 1, 50),
('shouyuan_core', '寿元核心', '💫', '形成寿元核心', 9, 4, 'secret', 'qi', 11, 2800, 504000, 1200, 78, 5, 1, 'mythic', 83, 1, 80),
('jindan_refine', '金丹炼化', '🔥', '炼化金丹杂质', 9, 4, 'advanced', 'qi', 9, 2400, 432000, 1050, 68, 8, 2, 'mythic', 84, 1, 55),
('daowen_engrave', '道纹刻印', '📜', '在金丹上刻印道纹', 9, 4, 'secret', 'qi', 12, 3200, 576000, 1400, 88, 5, 1, 'mythic', 85, 1, 90),
('jindan_nourish', '金丹滋养', '💧', '滋养金丹成长', 9, 4, 'basic', 'qi', 8, 2000, 360000, 880, 60, 10, 2, 'legendary', 86, 0, 0),
('yuanying_seed', '元婴种子', '🌱', '种下元婴种子', 9, 4, 'secret', 'soul', 11, 3000, 540000, 1300, 82, 5, 1, 'mythic', 87, 1, 85),
('jindan_perfect', '金丹圆满', '✨', '金丹达到圆满', 9, 4, 'advanced', 'qi', 10, 2600, 468000, 1150, 72, 8, 1, 'mythic', 88, 1, 70),
('qiansui_barrier', '千岁屏障', '🚧', '突破千岁大关', 9, 4, 'secret', 'breakthrough', 13, 4000, 720000, 1800, 110, 5, 1, 'mythic', 89, 1, 150),
('ningdan_supreme', '凝丹至尊', '👑', '凝丹境大圆满', 9, 4, 'secret', 'breakthrough', 14, 5000, 900000, 2200, 130, 3, 1, 'mythic', 90, 1, 200);

-- 境界10：破茧境（化境期第1境）- 彻底抛弃凡人肉身
INSERT OR IGNORE INTO cultivation_practices (key, name, emoji, description, realm_id, required_realm_level, practice_type, category, difficulty, cost_merit, reward_life, reward_merit, reward_shard, max_level, daily_limit, rarity, sort_order, helps_breakthrough, breakthrough_contribution) VALUES
('pojian_initiate', '破茧启程', '🦋', '开始破茧重生', 10, 1, 'basic', 'body', 9, 2500, 450000, 1100, 75, 10, 2, 'mythic', 91, 0, 0),
('routi_shed', '肉体蜕变', '🔄', '蜕去凡人肉体', 10, 1, 'advanced', 'body', 10, 3000, 540000, 1350, 88, 8, 2, 'mythic', 92, 1, 60),
('faju_form', '法躯成型', '✨', '凝聚法力之躯', 10, 1, 'secret', 'body', 12, 3800, 684000, 1650, 105, 5, 1, 'mythic', 93, 1, 90),
('fansu_transcend', '凡俗超脱', '🌟', '彻底超脱凡俗', 10, 1, 'advanced', 'soul', 10, 3200, 576000, 1450, 92, 8, 2, 'mythic', 94, 1, 65),
('faju_strengthen', '法躯强化', '💪', '强化法力之躯', 10, 1, 'basic', 'body', 9, 2700, 486000, 1200, 80, 10, 2, 'mythic', 95, 0, 0),
('xianli_convert', '仙力转化', '⚡', '灵力转化为仙力', 10, 1, 'secret', 'qi', 13, 4500, 810000, 2000, 120, 5, 1, 'mythic', 96, 1, 110),
('faju_perfect', '法躯完美', '💎', '法躯达到完美', 10, 1, 'advanced', 'body', 11, 3500, 630000, 1550, 98, 8, 1, 'mythic', 97, 1, 75),
('huajing_enter', '化境入门', '🚪', '进入化境期', 10, 1, 'secret', 'breakthrough', 14, 5000, 900000, 2300, 135, 5, 1, 'mythic', 98, 1, 140),
('pojian_rebirth', '破茧重生', '🦅', '完成破茧重生', 10, 1, 'secret', 'breakthrough', 15, 6000, 1080000, 2700, 155, 5, 1, 'mythic', 99, 1, 180),
('pojian_ultimate', '破茧极境', '👑', '破茧境大圆满', 10, 1, 'secret', 'breakthrough', 16, 7500, 1350000, 3300, 185, 3, 1, 'mythic', 100, 1, 250);

-- 注：境界11-20的修炼项目可以继续添加
-- 目前已有100个修炼项目（境界1-10）

