-- ========================================
-- 修炼项目扩展：境界11-15
-- 每个境界10个修炼项目，共50个
-- ========================================

-- 境界11：化神境（化境期第2境）- 元神出窍
INSERT OR IGNORE INTO cultivation_practices (key, name, emoji, description, realm_id, required_realm_level, practice_type, category, difficulty, cost_merit, reward_life, reward_merit, reward_shard, max_level, daily_limit, rarity, sort_order, helps_breakthrough, breakthrough_contribution) VALUES
('huashen_begin', '化神启程', '👻', '开始元神修炼', 11, 2, 'basic', 'soul', 10, 4000, 720000, 1800, 100, 10, 2, 'mythic', 101, 0, 0),
('yuanshen_out', '元神出窍', '🌟', '元神脱离肉身', 11, 2, 'advanced', 'soul', 11, 5000, 900000, 2200, 120, 8, 2, 'mythic', 102, 1, 70),
('yuanshen_travel', '元神游历', '🚀', '元神自由游历', 11, 2, 'advanced', 'soul', 11, 5500, 990000, 2400, 130, 8, 2, 'mythic', 103, 1, 75),
('yuanshen_fight', '元神战斗', '⚔️', '以元神战斗', 11, 2, 'secret', 'soul', 13, 7000, 1260000, 3000, 155, 5, 1, 'mythic', 104, 1, 95),
('routi_abandon', '肉体舍弃', '💀', '完全舍弃肉体依赖', 11, 2, 'advanced', 'body', 12, 6000, 1080000, 2600, 140, 8, 1, 'mythic', 105, 1, 80),
('yuanshen_strengthen', '元神强化', '💪', '强化元神本质', 11, 2, 'basic', 'soul', 10, 4500, 810000, 2000, 110, 10, 2, 'mythic', 106, 0, 0),
('siwang_transcend', '死亡超越', '☠️', '超越死亡概念', 11, 2, 'secret', 'soul', 14, 8000, 1440000, 3500, 175, 5, 1, 'mythic', 107, 1, 110),
('yuanshen_perfect', '元神圆满', '✨', '元神达到圆满', 11, 2, 'advanced', 'soul', 12, 6500, 1170000, 2800, 150, 8, 1, 'mythic', 108, 1, 85),
('huashen_breakthrough', '化神突破', '🚪', '化神境突破', 11, 2, 'secret', 'breakthrough', 15, 10000, 1800000, 4500, 200, 5, 1, 'mythic', 109, 1, 160),
('huashen_supreme', '化神至尊', '👑', '化神境大圆满', 11, 2, 'secret', 'breakthrough', 16, 12000, 2160000, 5500, 240, 3, 1, 'mythic', 110, 1, 220);

-- 境界12：炼虚境（化境期第3境）- 领悟空间
INSERT OR IGNORE INTO cultivation_practices (key, name, emoji, description, realm_id, required_realm_level, practice_type, category, difficulty, cost_merit, reward_life, reward_merit, reward_shard, max_level, daily_limit, rarity, sort_order, helps_breakthrough, breakthrough_contribution) VALUES
('lianxu_start', '炼虚入门', '🌌', '开始炼虚修炼', 12, 3, 'basic', 'qi', 11, 6000, 1080000, 2700, 145, 10, 2, 'mythic', 111, 0, 0),
('xukong_comprehend', '虚空领悟', '🕳️', '领悟虚空奥义', 12, 3, 'advanced', 'meditation', 12, 7500, 1350000, 3300, 170, 8, 2, 'mythic', 112, 1, 80),
('kongjian_master', '空间掌控', '🎯', '完全掌控空间', 12, 3, 'secret', 'qi', 14, 10000, 1800000, 4500, 210, 5, 1, 'mythic', 113, 1, 110),
('xukong_walk', '虚空行走', '👣', '在虚空中行走', 12, 3, 'advanced', 'qi', 13, 8500, 1530000, 3800, 190, 8, 2, 'mythic', 114, 1, 95),
('kongjian_tear', '空间撕裂', '✂️', '撕裂空间', 12, 3, 'secret', 'qi', 15, 12000, 2160000, 5400, 240, 5, 1, 'mythic', 115, 1, 130),
('xukong_refine', '虚空炼化', '🔥', '炼化虚空之力', 12, 3, 'advanced', 'qi', 13, 9000, 1620000, 4000, 200, 8, 2, 'mythic', 116, 1, 100),
('kongjian_create', '空间创造', '🏗️', '创造独立空间', 12, 3, 'secret', 'qi', 16, 15000, 2700000, 6800, 280, 5, 1, 'mythic', 117, 1, 150),
('lianxu_perfect', '炼虚完美', '💎', '炼虚达到完美', 12, 3, 'advanced', 'qi', 14, 11000, 1980000, 4900, 230, 8, 1, 'mythic', 118, 1, 120),
('lianxu_transcend', '炼虚超越', '🌟', '超越炼虚极限', 12, 3, 'secret', 'breakthrough', 17, 18000, 3240000, 8100, 340, 5, 1, 'mythic', 119, 1, 180),
('lianxu_ultimate', '炼虚极境', '👑', '炼虚境大圆满', 12, 3, 'secret', 'breakthrough', 18, 22000, 3960000, 9900, 400, 3, 1, 'mythic', 120, 1, 250);

-- 境界13：合道境（化境期第4境）- 意志与天地融合
INSERT OR IGNORE INTO cultivation_practices (key, name, emoji, description, realm_id, required_realm_level, practice_type, category, difficulty, cost_merit, reward_life, reward_merit, reward_shard, max_level, daily_limit, rarity, sort_order, helps_breakthrough, breakthrough_contribution) VALUES
('hedao_initiate', '合道启程', '🌍', '开始与天地合道', 13, 4, 'basic', 'meditation', 12, 9000, 1620000, 4100, 220, 10, 2, 'mythic', 121, 0, 0),
('tiandi_resonate', '天地共鸣', '🎵', '与天地产生共鸣', 13, 4, 'advanced', 'meditation', 13, 11000, 1980000, 5000, 260, 8, 2, 'mythic', 122, 1, 90),
('dao_comprehend', '道法领悟', '📜', '领悟天地大道', 13, 4, 'secret', 'meditation', 15, 15000, 2700000, 6800, 320, 5, 1, 'mythic', 123, 1, 130),
('yizhi_merge', '意志融合', '🔗', '意志与天地融合', 13, 4, 'secret', 'soul', 16, 18000, 3240000, 8200, 370, 5, 1, 'mythic', 124, 1, 150),
('tiandi_borrow', '天地借力', '⚡', '借用天地之力', 13, 4, 'advanced', 'qi', 14, 13000, 2340000, 5900, 290, 8, 2, 'mythic', 125, 1, 110),
('dao_mark', '道痕刻印', '✍️', '刻印道之痕迹', 13, 4, 'secret', 'soul', 17, 20000, 3600000, 9100, 410, 5, 1, 'mythic', 126, 1, 170),
('hedao_stabilize', '合道稳固', '⚓', '稳固合道状态', 13, 4, 'basic', 'meditation', 13, 10000, 1800000, 4500, 240, 10, 2, 'mythic', 127, 0, 0),
('tiandi_control', '天地掌控', '🎮', '部分掌控天地', 13, 4, 'advanced', 'qi', 15, 16000, 2880000, 7300, 350, 8, 1, 'mythic', 128, 1, 140),
('hedao_perfect', '合道圆满', '✨', '合道达到圆满', 13, 4, 'secret', 'breakthrough', 18, 25000, 4500000, 11400, 480, 5, 1, 'mythic', 129, 1, 200),
('hedao_supreme', '合道至尊', '👑', '合道境大圆满', 13, 4, 'secret', 'breakthrough', 19, 30000, 5400000, 13700, 560, 3, 1, 'mythic', 130, 1, 280);

-- 境界14：渡厄境（化境期第5境）- 经历第一重"死劫"
INSERT OR IGNORE INTO cultivation_practices (key, name, emoji, description, realm_id, required_realm_level, practice_type, category, difficulty, cost_merit, reward_life, reward_merit, reward_shard, max_level, daily_limit, rarity, sort_order, helps_breakthrough, breakthrough_contribution) VALUES
('duoe_prepare', '渡厄准备', '🛡️', '为渡劫做准备', 14, 5, 'basic', 'body', 14, 15000, 2700000, 6900, 350, 10, 2, 'mythic', 131, 0, 0),
('sijie_face', '死劫直面', '☠️', '直面死亡之劫', 14, 5, 'advanced', 'soul', 15, 18000, 3240000, 8300, 410, 8, 2, 'mythic', 132, 1, 100),
('shengsi_transcend', '生死超脱', '♾️', '超脱生死轮回', 14, 5, 'secret', 'soul', 17, 25000, 4500000, 11500, 520, 5, 1, 'mythic', 133, 1, 150),
('jie_resist', '劫难抵抗', '🛡️', '抵抗劫难侵蚀', 14, 5, 'advanced', 'body', 16, 20000, 3600000, 9200, 450, 8, 2, 'mythic', 134, 1, 120),
('shouyuan_lock', '寿元锁定', '🔒', '锁定寿元流逝', 14, 5, 'secret', 'qi', 18, 28000, 5040000, 12900, 580, 5, 1, 'mythic', 135, 1, 170),
('duoe_breakthrough', '渡厄突破', '💥', '突破死劫封锁', 14, 5, 'secret', 'breakthrough', 19, 35000, 6300000, 16100, 680, 5, 1, 'mythic', 136, 1, 200),
('jienan_adapt', '劫难适应', '🧬', '适应劫难环境', 14, 5, 'basic', 'body', 15, 17000, 3060000, 7800, 390, 10, 2, 'mythic', 137, 0, 0),
('sijie_overcome', '死劫克服', '✅', '克服死亡之劫', 14, 5, 'advanced', 'soul', 17, 23000, 4140000, 10600, 500, 8, 1, 'mythic', 138, 1, 160),
('duoe_perfect', '渡厄圆满', '✨', '渡厄达到圆满', 14, 5, 'secret', 'breakthrough', 20, 40000, 7200000, 18400, 780, 5, 1, 'mythic', 139, 1, 240),
('duoe_ultimate', '渡厄极境', '👑', '渡厄境大圆满', 14, 5, 'secret', 'breakthrough', 21, 50000, 9000000, 23000, 920, 3, 1, 'mythic', 140, 1, 320);

-- 境界15：大乘境（极境期第1境）- 法力圆满
INSERT OR IGNORE INTO cultivation_practices (key, name, emoji, description, realm_id, required_realm_level, practice_type, category, difficulty, cost_merit, reward_life, reward_merit, reward_shard, max_level, daily_limit, rarity, sort_order, helps_breakthrough, breakthrough_contribution) VALUES
('dacheng_enter', '大乘入门', '🚪', '进入大乘境界', 15, 1, 'basic', 'qi', 16, 25000, 4500000, 11600, 580, 10, 2, 'mythic', 141, 0, 0),
('fali_perfect', '法力圆满', '⭕', '法力达到圆满', 15, 1, 'advanced', 'qi', 17, 30000, 5400000, 13900, 680, 8, 2, 'mythic', 142, 1, 110),
('xianshu_master', '仙术精通', '✨', '精通各种仙术', 15, 1, 'advanced', 'qi', 18, 35000, 6300000, 16200, 780, 8, 2, 'mythic', 143, 1, 130),
('jiban_cut', '羁绊斩断', '✂️', '斩断现世羁绊', 15, 1, 'secret', 'soul', 19, 45000, 8100000, 20800, 940, 5, 1, 'mythic', 144, 1, 170),
('fali_transform', '法力蜕变', '🦋', '法力质的飞跃', 15, 1, 'secret', 'qi', 20, 50000, 9000000, 23100, 1050, 5, 1, 'mythic', 145, 1, 190),
('dacheng_stabilize', '大乘稳固', '⚓', '稳固大乘境界', 15, 1, 'basic', 'qi', 17, 28000, 5040000, 12900, 640, 10, 2, 'mythic', 146, 0, 0),
('xianli_pure', '仙力纯化', '💎', '纯化仙力本质', 15, 1, 'advanced', 'qi', 19, 40000, 7200000, 18500, 880, 8, 1, 'mythic', 147, 1, 160),
('dacheng_transcend', '大乘超越', '🚀', '超越大乘极限', 15, 1, 'secret', 'breakthrough', 21, 60000, 10800000, 27700, 1200, 5, 1, 'mythic', 148, 1, 220),
('dacheng_perfect', '大乘圆满', '✨', '大乘达到圆满', 15, 1, 'secret', 'breakthrough', 22, 70000, 12600000, 32300, 1380, 5, 1, 'mythic', 149, 1, 270),
('dacheng_supreme', '大乘至尊', '👑', '大乘境大圆满', 15, 1, 'secret', 'breakthrough', 23, 85000, 15300000, 39200, 1600, 3, 1, 'mythic', 150, 1, 350);
