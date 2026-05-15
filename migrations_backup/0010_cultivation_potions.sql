-- 添加修仙丹药体系
-- 逆转造化类（对应原物理类）和禁忌玄理类（对应原逻辑类）

-- 清理旧的现代丹药，替换为修仙丹药
DELETE FROM potions_config WHERE id IN ('liver', 'melatonin', 'ginseng', 'antioxidant', 'multivitamin', 'omega3', 'coq10', 'probiotics', 'calcium', 'vitaminc');

-- 逆转造化类丹药
INSERT OR IGNORE INTO potions_config (id, emoji, name, desc, cost, type, instant_life, dur, dur_decay_reduction, dur_merit_boost, sort_order, is_active) VALUES
('wuju_sand', '⚡', '无距砂', '吞服后周身三尺无视距离之限，以此物抹在剑上，剑出即中，无视虚空。持续6小时', 100, 'merit', 0, 21600, 0.15, 0, 1, 1),
('zhengyu_mercury', '🏔️', '镇狱沉汞', '极沉之水，入腹后身体重如山岳根基，足踏大地则万法不动。持续8小时', 120, 'merit', 0, 28800, 0.25, 0, 2, 1),
('fanshuo_powder', '🔄', '反朔散', '受击瞬间，伤势反向转嫁于出招者，称之为"因果倒悬"。持续4小时', 150, 'merit', 0, 14400, 0.20, 0, 3, 1),
('xijie_ash', '🌫️', '息劫灰', '采自寂灭星辰的余灰，服下后周身气机彻底静止，连时间也无法在其身上留下痕迹。持续12小时', 200, 'merit', 0, 43200, 0.35, 0, 4, 1);

-- 禁忌玄理类丹药
INSERT OR IGNORE INTO potions_config (id, emoji, name, desc, cost, type, instant_life, dur, dur_decay_reduction, dur_merit_boost, sort_order, is_active) VALUES
('liangyi_pill', '☯️', '两仪错位丹', '使服用者处于"似在非在"之间，肉眼可见，神识却空无一物。持续6小时', 180, 'merit', 0, 21600, 0.30, 0, 5, 1),
('yishi_water', '🌊', '遗世忘川水', '洗去天道对自身的"注视"，服下后短时间内不沾因果，可躲避任何天劫探测。持续3小时', 250, 'merit', 0, 10800, 0.40, 0, 6, 1),
('suyuan_liquid', '✨', '溯源金液', '强行将身体状态拨回至全盛之时，如同枯木逢春，逆转寿元。直接增加24小时寿命', 300, 'merit', 86400, 0, 0, 0, 7, 1),
('kuitian_tablet', '👁️', '窥天盲片', '借得一丝天道视角，虽只有一瞬，却能看破世间万物运行的脉络。增加功德获取效率，持续24小时', 220, 'merit', 0, 86400, 0.10, 1.5, 8, 1);

-- 添加一些基础修仙丹药作为补充
INSERT OR IGNORE INTO potions_config (id, emoji, name, desc, cost, type, instant_life, dur, dur_decay_reduction, dur_merit_boost, sort_order, is_active) VALUES
('qi_pill', '💊', '聚气丹', '凝聚天地灵气，增加寿命2小时', 50, 'merit', 7200, 0, 0, 0, 9, 1),
('foundation_pill', '🔮', '筑基丹', '稳固修为根基，降低衰减10%，持续24小时', 80, 'merit', 0, 86400, 0.10, 0, 10, 1),
('longevity_pill', '🌿', '延寿丹', '延年益寿，增加寿命6小时，降低衰减5%，持续12小时', 120, 'merit', 21600, 43200, 0.05, 0, 11, 1),
('merit_pill', '🏆', '功德丹', '积累功德，提升功德获取效率50%，持续8小时', 100, 'merit', 0, 28800, 0, 0.5, 12, 1);