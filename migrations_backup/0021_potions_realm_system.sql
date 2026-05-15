-- 丹药境界系统重构
-- 将丹药与境界关联，不同境界有不同的丹药

-- 1. 添加境界相关字段
ALTER TABLE potions_config ADD COLUMN realm_id INTEGER DEFAULT 1;
ALTER TABLE potions_config ADD COLUMN min_realm_id INTEGER DEFAULT 1;
ALTER TABLE potions_config ADD COLUMN max_realm_id INTEGER DEFAULT 20;
ALTER TABLE potions_config ADD COLUMN rarity TEXT DEFAULT 'common'; -- common, rare, epic, legendary
ALTER TABLE potions_config ADD COLUMN category TEXT DEFAULT 'recovery'; -- recovery, buff, special

-- 2. 清空现有丹药数据
DELETE FROM potions_config;

-- 3. 插入境界1-5（凡蜕期）丹药 - 基础丹药
-- 胎息境（境界1）
INSERT INTO potions_config (id, emoji, name, desc, cost, type, instant_life, dur, dur_decay_reduction, realm_id, min_realm_id, max_realm_id, rarity, category, sort_order, is_active) VALUES
('qi_gathering_pill_1', '💊', '聚气丹', '凝聚天地灵气，增加寿命1小时', 10, 'merit', 3600, 0, 0, 1, 1, 5, 'common', 'recovery', 1, 1),
('foundation_pill_1', '🔮', '筑基丹', '稳固修为根基，降低衰减5%，持续12小时', 15, 'merit', 0, 43200, 0.05, 1, 1, 5, 'common', 'buff', 2, 1),
('healing_pill_1', '🌿', '疗伤丹', '治疗轻伤，增加寿命30分钟', 8, 'merit', 1800, 0, 0, 1, 1, 5, 'common', 'recovery', 3, 1),
('spirit_pill_1', '✨', '灵气丹', '补充灵力，降低衰减3%，持续6小时', 12, 'merit', 0, 21600, 0.03, 1, 1, 5, 'common', 'buff', 4, 1),
('vitality_pill_1', '❤️', '活力丹', '恢复体力，增加寿命45分钟', 10, 'merit', 2700, 0, 0, 1, 1, 5, 'common', 'recovery', 5, 1),
('clarity_pill_1', '🧠', '清心丹', '清除杂念，降低衰减4%，持续8小时', 13, 'merit', 0, 28800, 0.04, 1, 1, 5, 'rare', 'buff', 6, 1);

-- 定脉境（境界2）
INSERT INTO potions_config (id, emoji, name, desc, cost, type, instant_life, dur, dur_decay_reduction, realm_id, min_realm_id, max_realm_id, rarity, category, sort_order, is_active) VALUES
('meridian_pill_2', '🌊', '通脉丹', '疏通经脉，增加寿命1.5小时', 18, 'merit', 5400, 0, 0, 2, 2, 5, 'common', 'recovery', 10, 1),
('blood_pill_2', '🩸', '补血丹', '补充气血，降低衰减6%，持续12小时', 20, 'merit', 0, 43200, 0.06, 2, 2, 5, 'common', 'buff', 11, 1),
('bone_pill_2', '🦴', '强骨丹', '强化骨骼，增加寿命1小时', 16, 'merit', 3600, 0, 0, 2, 2, 5, 'common', 'recovery', 12, 1),
('essence_pill_2', '💫', '凝元丹', '凝聚元气，降低衰减7%，持续10小时', 22, 'merit', 0, 36000, 0.07, 2, 2, 5, 'rare', 'buff', 13, 1),
('recovery_pill_2', '🌸', '回春丹', '快速恢复，增加寿命2小时', 25, 'merit', 7200, 0, 0, 2, 2, 5, 'rare', 'recovery', 14, 1);

-- 洗髓境（境界3）
INSERT INTO potions_config (id, emoji, name, desc, cost, type, instant_life, dur, dur_decay_reduction, realm_id, min_realm_id, max_realm_id, rarity, category, sort_order, is_active) VALUES
('marrow_pill_3', '🏔️', '洗髓丹', '洗涤骨髓，增加寿命2.5小时', 30, 'merit', 9000, 0, 0, 3, 3, 5, 'common', 'recovery', 20, 1),
('purify_pill_3', '🌟', '净化丹', '净化杂质，降低衰减8%，持续14小时', 35, 'merit', 0, 50400, 0.08, 3, 3, 5, 'common', 'buff', 21, 1),
('strength_pill_3', '💪', '力量丹', '增强体质，增加寿命2小时', 28, 'merit', 7200, 0, 0, 3, 3, 5, 'common', 'recovery', 22, 1),
('wisdom_pill_3', '📚', '悟道丹', '提升悟性，降低衰减9%，持续12小时', 38, 'merit', 0, 43200, 0.09, 3, 3, 5, 'rare', 'buff', 23, 1),
('longevity_pill_3', '🕉️', '延寿丹', '延长寿命，增加寿命3小时', 40, 'merit', 10800, 0, 0, 3, 3, 5, 'rare', 'recovery', 24, 1),
('divine_pill_3', '⚡', '神力丹', '激发潜能，降低衰减10%，持续16小时', 45, 'merit', 0, 57600, 0.10, 3, 3, 5, 'epic', 'buff', 25, 1);

-- 换血境（境界4）
INSERT INTO potions_config (id, emoji, name, desc, cost, type, instant_life, dur, dur_decay_reduction, realm_id, min_realm_id, max_realm_id, rarity, category, sort_order, is_active) VALUES
('blood_refine_pill_4', '🔴', '炼血丹', '炼化血液，增加寿命3小时', 50, 'merit', 10800, 0, 0, 4, 4, 5, 'common', 'recovery', 30, 1),
('circulation_pill_4', '🔄', '循环丹', '加速循环，降低衰减10%，持续16小时', 55, 'merit', 0, 57600, 0.10, 4, 4, 5, 'common', 'buff', 31, 1),
('vitality_boost_4', '💖', '生机丹', '激发生机，增加寿命3.5小时', 52, 'merit', 12600, 0, 0, 4, 4, 5, 'rare', 'recovery', 32, 1),
('phoenix_pill_4', '🔥', '凤血丹', '涅槃重生，降低衰减12%，持续18小时', 60, 'merit', 0, 64800, 0.12, 4, 4, 5, 'rare', 'buff', 33, 1),
('immortal_pill_4', '🌈', '仙元丹', '仙气灌体，增加寿命4小时', 65, 'merit', 14400, 0, 0, 4, 4, 5, 'epic', 'recovery', 34, 1);

-- 玉骨境（境界5）
INSERT INTO potions_config (id, emoji, name, desc, cost, type, instant_life, dur, dur_decay_reduction, realm_id, min_realm_id, max_realm_id, rarity, category, sort_order, is_active) VALUES
('jade_bone_pill_5', '💎', '玉骨丹', '骨骼如玉，增加寿命4小时', 70, 'merit', 14400, 0, 0, 5, 5, 5, 'common', 'recovery', 40, 1),
('crystal_pill_5', '💠', '晶体丹', '晶莹剔透，降低衰减13%，持续20小时', 75, 'merit', 0, 72000, 0.13, 5, 5, 5, 'common', 'buff', 41, 1),
('treasure_pill_5', '🏺', '宝体丹', '宝体初成，增加寿命4.5小时', 72, 'merit', 16200, 0, 0, 5, 5, 5, 'rare', 'recovery', 42, 1),
('supreme_pill_5', '👑', '至尊丹', '至高无上，降低衰减14%，持续22小时', 80, 'merit', 0, 79200, 0.14, 5, 5, 5, 'rare', 'buff', 43, 1),
('heaven_pill_5', '☁️', '天元丹', '天地精华，增加寿命5小时', 85, 'merit', 18000, 0, 0, 5, 5, 5, 'epic', 'recovery', 44, 1),
('legend_pill_5', '🌠', '传说丹', '传说之力，降低衰减15%，持续24小时', 90, 'merit', 0, 86400, 0.15, 5, 5, 5, 'legendary', 'buff', 45, 1);


-- 4. 插入境界6-9（超凡期）丹药 - 高级丹药
-- 聚灵境（境界6）
INSERT INTO potions_config (id, emoji, name, desc, cost, type, instant_life, dur, dur_decay_reduction, realm_id, min_realm_id, max_realm_id, rarity, category, sort_order, is_active) VALUES
('spirit_gather_pill_6', '✨', '聚灵丹', '聚集灵气，增加寿命5小时', 100, 'merit', 18000, 0, 0, 6, 6, 9, 'common', 'recovery', 50, 1),
('aura_pill_6', '🌟', '灵韵丹', '灵气环绕，降低衰减16%，持续24小时', 110, 'merit', 0, 86400, 0.16, 6, 6, 9, 'common', 'buff', 51, 1),
('spirit_sea_pill_6', '🌊', '灵海丹', '灵海无边，增加寿命6小时', 105, 'merit', 21600, 0, 0, 6, 6, 9, 'rare', 'recovery', 52, 1),
('transcend_pill_6', '🦅', '超凡丹', '超凡入圣，降低衰减17%，持续26小时', 120, 'merit', 0, 93600, 0.17, 6, 6, 9, 'rare', 'buff', 53, 1),
('celestial_pill_6', '☄️', '天灵丹', '天降灵气，增加寿命7小时', 130, 'merit', 25200, 0, 0, 6, 6, 9, 'epic', 'recovery', 54, 1);

-- 神识境（境界7）
INSERT INTO potions_config (id, emoji, name, desc, cost, type, instant_life, dur, dur_decay_reduction, realm_id, min_realm_id, max_realm_id, rarity, category, sort_order, is_active) VALUES
('soul_pill_7', '🧠', '神识丹', '凝练神识，增加寿命7小时', 140, 'merit', 25200, 0, 0, 7, 7, 9, 'common', 'recovery', 60, 1),
('mind_pill_7', '💭', '心神丹', '心神合一，降低衰减18%，持续28小时', 150, 'merit', 0, 100800, 0.18, 7, 7, 9, 'common', 'buff', 61, 1),
('consciousness_pill_7', '👁️', '识海丹', '识海扩张，增加寿命8小时', 145, 'merit', 28800, 0, 0, 7, 7, 9, 'rare', 'recovery', 62, 1),
('divine_sense_pill_7', '🔮', '神念丹', '神念通达，降低衰减19%，持续30小时', 160, 'merit', 0, 108000, 0.19, 7, 7, 9, 'rare', 'buff', 63, 1),
('soul_master_pill_7', '👻', '御魂丹', '御使魂魄，增加寿命9小时', 170, 'merit', 32400, 0, 0, 7, 7, 9, 'epic', 'recovery', 64, 1),
('spirit_king_pill_7', '👑', '灵王丹', '灵界之王，降低衰减20%，持续32小时', 180, 'merit', 0, 115200, 0.20, 7, 7, 9, 'legendary', 'buff', 65, 1);

-- 玄府境（境界8）
INSERT INTO potions_config (id, emoji, name, desc, cost, type, instant_life, dur, dur_decay_reduction, realm_id, min_realm_id, max_realm_id, rarity, category, sort_order, is_active) VALUES
('mystic_pill_8', '🚪', '玄府丹', '开辟玄府，增加寿命9小时', 190, 'merit', 32400, 0, 0, 8, 8, 9, 'common', 'recovery', 70, 1),
('void_pill_8', '🌌', '虚空丹', '虚空之力，降低衰减21%，持续34小时', 200, 'merit', 0, 122400, 0.21, 8, 8, 9, 'common', 'buff', 71, 1),
('dimension_pill_8', '🔷', '次元丹', '次元之门，增加寿命10小时', 195, 'merit', 36000, 0, 0, 8, 8, 9, 'rare', 'recovery', 72, 1),
('space_pill_8', '🌠', '空间丹', '空间掌控，降低衰减22%，持续36小时', 210, 'merit', 0, 129600, 0.22, 8, 8, 9, 'rare', 'buff', 73, 1),
('universe_pill_8', '🌌', '宇宙丹', '宇宙之力，增加寿命11小时', 220, 'merit', 39600, 0, 0, 8, 8, 9, 'epic', 'recovery', 74, 1);

-- 凝丹境（境界9）
INSERT INTO potions_config (id, emoji, name, desc, cost, type, instant_life, dur, dur_decay_reduction, realm_id, min_realm_id, max_realm_id, rarity, category, sort_order, is_active) VALUES
('golden_pill_9', '🔮', '金丹', '凝聚金丹，增加寿命11小时', 230, 'merit', 39600, 0, 0, 9, 9, 9, 'common', 'recovery', 80, 1),
('core_pill_9', '⚛️', '丹核丹', '丹核凝实，降低衰减23%，持续38小时', 240, 'merit', 0, 136800, 0.23, 9, 9, 9, 'common', 'buff', 81, 1),
('perfect_pill_9', '💫', '圆满丹', '丹成圆满，增加寿命12小时', 235, 'merit', 43200, 0, 0, 9, 9, 9, 'rare', 'recovery', 82, 1),
('supreme_core_pill_9', '🌟', '至尊金丹', '至尊之丹，降低衰减24%，持续40小时', 250, 'merit', 0, 144000, 0.24, 9, 9, 9, 'rare', 'buff', 83, 1),
('immortal_core_pill_9', '✨', '仙丹', '仙人之丹，增加寿命13小时', 260, 'merit', 46800, 0, 0, 9, 9, 9, 'epic', 'recovery', 84, 1),
('heaven_core_pill_9', '☁️', '天丹', '天道之丹，降低衰减25%，持续42小时', 270, 'merit', 0, 151200, 0.25, 9, 9, 9, 'legendary', 'buff', 85, 1);


-- 5. 插入境界10-20（化境期及以上）丹药 - 顶级丹药
-- 破茧境（境界10）
INSERT INTO potions_config (id, emoji, name, desc, cost, type, instant_life, dur, dur_decay_reduction, realm_id, min_realm_id, max_realm_id, rarity, category, sort_order, is_active) VALUES
('cocoon_pill_10', '🦋', '破茧丹', '破茧成蝶，增加寿命14小时', 280, 'merit', 50400, 0, 0, 10, 10, 20, 'rare', 'recovery', 90, 1),
('transform_pill_10', '🌈', '化形丹', '脱胎换骨，降低衰减26%，持续44小时', 290, 'merit', 0, 158400, 0.26, 10, 10, 20, 'rare', 'buff', 91, 1),
('rebirth_pill_10', '🔥', '重生丹', '涅槃重生，增加寿命15小时', 300, 'merit', 54000, 0, 0, 10, 10, 20, 'epic', 'recovery', 92, 1),
('phoenix_rebirth_pill_10', '🦅', '凤凰丹', '凤凰涅槃，降低衰减27%，持续46小时', 310, 'merit', 0, 165600, 0.27, 10, 10, 20, 'epic', 'buff', 93, 1),
('eternal_pill_10', '♾️', '永恒丹', '永恒之力，增加寿命16小时', 320, 'merit', 57600, 0, 0, 10, 10, 20, 'legendary', 'recovery', 94, 1);

-- 羽化境（境界11-15）- 每个境界5个丹药
INSERT INTO potions_config (id, emoji, name, desc, cost, type, instant_life, dur, dur_decay_reduction, realm_id, min_realm_id, max_realm_id, rarity, category, sort_order, is_active) VALUES
('feather_pill_11', '🪶', '羽化丹', '羽化飞升，增加寿命17小时', 350, 'merit', 61200, 0, 0, 11, 11, 15, 'rare', 'recovery', 100, 1),
('ascend_pill_11', '☁️', '飞升丹', '飞升九天，降低衰减28%，持续48小时', 360, 'merit', 0, 172800, 0.28, 11, 11, 15, 'rare', 'buff', 101, 1),
('cloud_pill_11', '🌥️', '云游丹', '云游四海，增加寿命18小时', 370, 'merit', 64800, 0, 0, 11, 11, 15, 'epic', 'recovery', 102, 1),
('sky_pill_11', '🌌', '天穹丹', '天穹之力，降低衰减29%，持续50小时', 380, 'merit', 0, 180000, 0.29, 11, 11, 15, 'epic', 'buff', 103, 1),
('immortal_feather_pill_11', '✨', '仙羽丹', '仙人羽翼，增加寿命19小时', 390, 'merit', 68400, 0, 0, 11, 11, 15, 'legendary', 'recovery', 104, 1);

-- 真仙境（境界16-20）- 每个境界5个丹药
INSERT INTO potions_config (id, emoji, name, desc, cost, type, instant_life, dur, dur_decay_reduction, realm_id, min_realm_id, max_realm_id, rarity, category, sort_order, is_active) VALUES
('true_immortal_pill_16', '🌟', '真仙丹', '真仙之力，增加寿命20小时', 450, 'merit', 72000, 0, 0, 16, 16, 20, 'epic', 'recovery', 110, 1),
('dao_pill_16', '☯️', '悟道丹', '道法自然，降低衰减30%，持续52小时', 460, 'merit', 0, 187200, 0.30, 16, 16, 20, 'epic', 'buff', 111, 1),
('heaven_dao_pill_16', '⚡', '天道丹', '天道之力，增加寿命22小时', 470, 'merit', 79200, 0, 0, 16, 16, 20, 'legendary', 'recovery', 112, 1),
('supreme_dao_pill_16', '👑', '至道丹', '至高大道，降低衰减32%，持续54小时', 480, 'merit', 0, 194400, 0.32, 16, 16, 20, 'legendary', 'buff', 113, 1),
('chaos_pill_16', '🌀', '混沌丹', '混沌初开，增加寿命24小时', 500, 'merit', 86400, 0, 0, 16, 16, 20, 'legendary', 'recovery', 114, 1);

-- 6. 创建索引优化查询
CREATE INDEX IF NOT EXISTS idx_potions_realm ON potions_config(realm_id);
CREATE INDEX IF NOT EXISTS idx_potions_realm_range ON potions_config(min_realm_id, max_realm_id);
CREATE INDEX IF NOT EXISTS idx_potions_rarity ON potions_config(rarity);
CREATE INDEX IF NOT EXISTS idx_potions_category ON potions_config(category);
