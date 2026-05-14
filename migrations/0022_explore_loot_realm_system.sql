-- 历练项目境界系统重构
-- 将历练项目与境界关联，不同境界有不同的历练收益

-- 1. 添加境界相关字段
ALTER TABLE explore_loot_config ADD COLUMN realm_id INTEGER DEFAULT 1;
ALTER TABLE explore_loot_config ADD COLUMN min_realm_id INTEGER DEFAULT 1;
ALTER TABLE explore_loot_config ADD COLUMN max_realm_id INTEGER DEFAULT 20;
ALTER TABLE explore_loot_config ADD COLUMN difficulty TEXT DEFAULT 'normal'; -- easy, normal, hard, extreme
ALTER TABLE explore_loot_config ADD COLUMN category TEXT DEFAULT 'common'; -- common, rare, epic, legendary

-- 2. 清空现有历练项目数据
DELETE FROM explore_loot_config;

-- 3. 插入境界1-5（凡蜕期）历练项目 - 基础历练
-- 胎息境（境界1）- 低收益
INSERT INTO explore_loot_config (id, name, msg, weight, life, merit, shard, realm_id, min_realm_id, max_realm_id, difficulty, category, sort_order, is_active) VALUES
(1, '灵气稀薄', '此地灵气稀薄，一无所获', 20.0, 0, 0, 0, 1, 1, 5, 'easy', 'common', 1, 1),
(2, '拾得灵草', '在路边发现一株灵草', 25.0, 900, 5, 0, 1, 1, 5, 'easy', 'common', 2, 1),
(3, '灵气灌体', '吸收周围灵气，略有所得', 20.0, 1800, 8, 0, 1, 1, 5, 'normal', 'common', 3, 1),
(4, '野果奇珍', '采集到一些野果，略有灵气', 15.0, 1200, 6, 0, 1, 1, 5, 'easy', 'common', 4, 1),
(5, '山泉精华', '饮用山泉，精神一振', 10.0, 2400, 10, 0, 1, 1, 5, 'normal', 'rare', 5, 1);

-- 定脉境（境界2）
INSERT INTO explore_loot_config (id, name, msg, weight, life, merit, shard, realm_id, min_realm_id, max_realm_id, difficulty, category, sort_order, is_active) VALUES
(6, '枯木逢春', '发现一株枯木重生，感悟生机', 18.0, 3600, 12, 0, 2, 2, 5, 'normal', 'common', 10, 1),
(7, '石中玉髓', '从石缝中提取玉髓', 15.0, 4200, 15, 0, 2, 2, 5, 'normal', 'rare', 11, 1),
(8, '古藤露珠', '收集古藤上的露珠', 12.0, 5400, 18, 1, 2, 2, 5, 'hard', 'rare', 12, 1),
(9, '鸟巢遗珠', '在鸟巢中发现灵珠', 10.0, 6000, 20, 1, 2, 2, 5, 'hard', 'epic', 13, 1);

-- 洗髓境（境界3）
INSERT INTO explore_loot_config (id, name, msg, weight, life, merit, shard, realm_id, min_realm_id, max_realm_id, difficulty, category, sort_order, is_active) VALUES
(10, '地脉微流', '感应到地脉流动，获得灵气', 15.0, 7200, 22, 1, 3, 3, 5, 'normal', 'common', 20, 1),
(11, '苔藓灵华', '采集苔藓中的灵华', 12.0, 8400, 25, 1, 3, 3, 5, 'normal', 'rare', 21, 1),
(12, '萤火微光', '捕捉萤火虫的灵光', 10.0, 9600, 28, 1, 3, 3, 5, 'hard', 'rare', 22, 1),
(13, '蚁穴灵砂', '从蚁穴中挖掘灵砂', 8.0, 10800, 30, 2, 3, 3, 5, 'hard', 'epic', 23, 1);

-- 换血境（境界4）
INSERT INTO explore_loot_config (id, name, msg, weight, life, merit, shard, realm_id, min_realm_id, max_realm_id, difficulty, category, sort_order, is_active) VALUES
(14, '蛛网晶丝', '收集蜘蛛网上的晶丝', 12.0, 12600, 32, 2, 4, 4, 5, 'normal', 'rare', 30, 1),
(15, '蛙鸣灵波', '聆听蛙鸣，感悟灵波', 10.0, 14400, 35, 2, 4, 4, 5, 'hard', 'rare', 31, 1),
(16, '蝉蜕金衣', '收集蝉蜕，提炼金衣', 8.0, 16200, 38, 2, 4, 4, 5, 'hard', 'epic', 32, 1),
(17, '蛇蜕宝鳞', '获得蛇蜕宝鳞', 6.0, 18000, 40, 3, 4, 4, 5, 'extreme', 'epic', 33, 1);

-- 玉骨境（境界5）
INSERT INTO explore_loot_config (id, name, msg, weight, life, merit, shard, realm_id, min_realm_id, max_realm_id, difficulty, category, sort_order, is_active) VALUES
(18, '灵泉之眼', '发现灵泉之眼，获得大量灵气', 10.0, 21600, 45, 3, 5, 5, 5, 'normal', 'rare', 40, 1),
(19, '古树心材', '从古树中提取心材', 8.0, 25200, 50, 3, 5, 5, 5, 'hard', 'epic', 41, 1),
(20, '寒潭玄冰', '从寒潭中取得玄冰', 6.0, 28800, 55, 4, 5, 5, 5, 'hard', 'epic', 42, 1),
(21, '洞天福地', '发现洞天福地，修为大进', 4.0, 32400, 60, 4, 5, 5, 5, 'extreme', 'legendary', 43, 1);

-- 4. 插入境界6-10（超凡期）历练项目 - 中级历练
-- 聚灵境（境界6）
INSERT INTO explore_loot_config (id, name, msg, weight, life, merit, shard, realm_id, min_realm_id, max_realm_id, difficulty, category, sort_order, is_active) VALUES
(22, '月华结晶', '收集月华结晶', 10.0, 36000, 65, 4, 6, 6, 10, 'normal', 'rare', 50, 1),
(23, '云雾灵核', '从云雾中凝聚灵核', 8.0, 39600, 70, 5, 6, 6, 10, 'hard', 'epic', 51, 1),
(24, '火山余烬', '收集火山余烬', 6.0, 43200, 75, 5, 6, 6, 10, 'hard', 'epic', 52, 1),
(25, '遗迹碎片', '在古代遗迹中发现碎片', 5.0, 46800, 80, 6, 6, 6, 10, 'extreme', 'legendary', 53, 1);

-- 神识境（境界7）
INSERT INTO explore_loot_config (id, name, msg, weight, life, merit, shard, realm_id, min_realm_id, max_realm_id, difficulty, category, sort_order, is_active) VALUES
(26, '日精石髓', '提炼日精石髓', 8.0, 50400, 85, 6, 7, 7, 10, 'normal', 'epic', 60, 1),
(27, '地火结晶', '收集地火结晶', 6.0, 54000, 90, 7, 7, 7, 10, 'hard', 'epic', 61, 1),
(28, '雷击木心', '获得雷击木心', 5.0, 57600, 95, 7, 7, 7, 10, 'hard', 'legendary', 62, 1),
(29, '星沙聚核', '聚集星沙成核', 4.0, 61200, 100, 8, 7, 7, 10, 'extreme', 'legendary', 63, 1);

-- 玄府境（境界8）
INSERT INTO explore_loot_config (id, name, msg, weight, life, merit, shard, realm_id, min_realm_id, max_realm_id, difficulty, category, sort_order, is_active) VALUES
(30, '少阳晶', '凝聚少阳之气成晶', 6.0, 64800, 105, 8, 8, 8, 10, 'normal', 'epic', 70, 1),
(31, '玄阴珠', '凝聚玄阴之气成珠', 5.0, 68400, 110, 9, 8, 8, 10, 'hard', 'legendary', 71, 1),
(32, '五行灵珠', '收集五行灵珠', 4.0, 72000, 115, 9, 8, 8, 10, 'extreme', 'legendary', 72, 1);

-- 凝丹境（境界9）
INSERT INTO explore_loot_config (id, name, msg, weight, life, merit, shard, realm_id, min_realm_id, max_realm_id, difficulty, category, sort_order, is_active) VALUES
(33, '八卦阵盘', '发现八卦阵盘', 5.0, 75600, 120, 10, 9, 9, 10, 'hard', 'legendary', 80, 1),
(34, '九宫飞星', '领悟九宫飞星之法', 4.0, 79200, 125, 10, 9, 10, 'extreme', 'legendary', 81, 1);

-- 破茧境（境界10）
INSERT INTO explore_loot_config (id, name, msg, weight, life, merit, shard, realm_id, min_realm_id, max_realm_id, difficulty, category, sort_order, is_active) VALUES
(35, '河图拓片', '获得河图拓片', 4.0, 82800, 130, 11, 10, 15, 'extreme', 'legendary', 90, 1),
(36, '洛书残页', '发现洛书残页', 3.0, 86400, 135, 11, 10, 15, 'extreme', 'legendary', 91, 1);

-- 5. 插入境界11-20（化境期及以上）历练项目 - 高级历练
-- 羽化境（境界11-15）
INSERT INTO explore_loot_config (id, name, msg, weight, life, merit, shard, realm_id, min_realm_id, max_realm_id, difficulty, category, sort_order, is_active) VALUES
(37, '仙缘天降', '遇到仙缘，修为大增', 3.0, 108000, 150, 12, 11, 15, 'extreme', 'legendary', 100, 1),
(38, '悟道机缘', '顿悟大道，境界提升', 2.0, 129600, 180, 15, 11, 15, 'extreme', 'legendary', 101, 1),
(39, '天材地宝', '发现天材地宝', 2.5, 144000, 200, 18, 11, 15, 'extreme', 'legendary', 102, 1);

-- 真仙境（境界16-20）
INSERT INTO explore_loot_config (id, name, msg, weight, life, merit, shard, realm_id, min_realm_id, max_realm_id, difficulty, category, sort_order, is_active) VALUES
(40, '上古传承', '获得上古传承，实力暴涨', 1.5, 172800, 250, 20, 16, 20, 'extreme', 'legendary', 110, 1),
(41, '混沌灵宝', '发现混沌灵宝', 1.0, 216000, 300, 25, 16, 20, 'extreme', 'legendary', 111, 1),
(42, '先天道韵', '领悟先天道韵', 0.8, 259200, 350, 30, 16, 20, 'extreme', 'legendary', 112, 1),
(43, '天道碎片', '获得天道碎片', 0.5, 302400, 400, 35, 16, 20, 'extreme', 'legendary', 113, 1);

-- 6. 创建索引优化查询
CREATE INDEX IF NOT EXISTS idx_explore_realm ON explore_loot_config(realm_id);
CREATE INDEX IF NOT EXISTS idx_explore_realm_range ON explore_loot_config(min_realm_id, max_realm_id);
CREATE INDEX IF NOT EXISTS idx_explore_difficulty ON explore_loot_config(difficulty);
CREATE INDEX IF NOT EXISTS idx_explore_category ON explore_loot_config(category);
