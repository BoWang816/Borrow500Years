-- 养生任务境界系统重构
-- 将养生任务与境界关联，不同境界有不同的养生项目

-- 1. 添加realm_id字段到wellness_tasks_config表
ALTER TABLE wellness_tasks_config ADD COLUMN realm_id INTEGER DEFAULT 1;
ALTER TABLE wellness_tasks_config ADD COLUMN min_realm_id INTEGER DEFAULT 1;
ALTER TABLE wellness_tasks_config ADD COLUMN max_realm_id INTEGER DEFAULT 5;

-- 2. 更新现有任务的境界范围
-- 基础任务：凡蜕期（1-5）
UPDATE wellness_tasks_config SET realm_id = 1, min_realm_id = 1, max_realm_id = 5 WHERE realm_requirement = 'basic';

-- 凡人任务：凡蜕期（1-5）
UPDATE wellness_tasks_config SET realm_id = 1, min_realm_id = 1, max_realm_id = 5 WHERE realm_requirement = 'mortal';

-- 进阶任务：超凡期（6-9）
UPDATE wellness_tasks_config SET realm_id = 6, min_realm_id = 6, max_realm_id = 9 WHERE realm_requirement = 'advanced';

-- 挑战任务：凡蜕期+超凡期（1-9）
UPDATE wellness_tasks_config SET realm_id = 1, min_realm_id = 1, max_realm_id = 9 WHERE realm_requirement = 'challenge';

-- 3. 清空现有养生任务，准备插入新的境界关联任务
DELETE FROM wellness_tasks_config;

-- 4. 插入凡蜕期养生任务（境界1-5）- 贴近生活
INSERT INTO wellness_tasks_config (task_key, name, emoji, description, reward_type, life_reward, merit_reward, shard_reward, coin_reward, modifier_value, realm_requirement, realm_id, min_realm_id, max_realm_id, sort_order, input_config, is_active, created_at, updated_at) VALUES
-- 基础养生（所有凡蜕期可用）
('ziwu', '子午流注', '🌙', '23:00前入睡，顺应天地阴阳，调和气血', 'fixed', 1800, 2, 0, 0, 0, 'basic', 1, 1, 5, 1, NULL, 1, strftime('%s', 'now'), strftime('%s', 'now')),
('meditate', '静坐养神', '🧘', '每日静坐15分钟，凝神聚气', 'fixed', 900, 3, 1, 0, 0, 'basic', 1, 1, 5, 2, NULL, 1, strftime('%s', 'now'), strftime('%s', 'now')),
('steps', '步步为营', '🚶', '行走万步，强健筋骨，疏通经络', 'input', 0, 0, 0, 0, 0, 'basic', 1, 1, 5, 3, '{"type":"slider","min":1000,"max":50000,"step":1000,"unit":"步","baseReward":720,"bonusThreshold":10000,"bonusReward":7200}', 1, strftime('%s', 'now'), strftime('%s', 'now')),
('water', '上善若水', '💧', '每日饮水8杯，滋养身心', 'input', 300, 0, 0, 0, 0, 'basic', 1, 1, 5, 4, '{"type":"counter","max":8,"rewardPerUnit":300,"completionMerit":3}', 1, strftime('%s', 'now'), strftime('%s', 'now')),
('diet', '清淡饮食', '🥗', '三餐清淡，远离油腻，保养脾胃', 'fixed', 1200, 1, 0, 0, 0, 'basic', 1, 1, 5, 5, NULL, 1, strftime('%s', 'now'), strftime('%s', 'now')),
('earlyrise', '晨起修行', '🌅', '连续7天早起，磨练意志', 'input', 1200, 4, 0, 1, 0, 'challenge', 1, 1, 5, 6, '{"type":"streak","target":7,"coinReward":1}', 1, strftime('%s', 'now'), strftime('%s', 'now')),

-- 胎息境（境界1）- 初入修行
('breath_control', '胎息吐纳', '🌬️', '练习胎息呼吸法，初窥修行门径', 'fixed', 1500, 2, 0, 0, 0, 'mortal', 1, 1, 1, 10, NULL, 1, strftime('%s', 'now'), strftime('%s', 'now')),
('body_stretch', '筋骨舒展', '🤸', '拉伸筋骨，为修行打基础', 'fixed', 1000, 1, 0, 0, 0, 'mortal', 1, 1, 1, 11, NULL, 1, strftime('%s', 'now'), strftime('%s', 'now')),

-- 定脉境（境界2）- 疏通经脉
('meridian_massage', '经络按摩', '👐', '按摩穴位，疏通经络', 'fixed', 1800, 2, 0, 0, 0, 'mortal', 2, 2, 2, 20, NULL, 1, strftime('%s', 'now'), strftime('%s', 'now')),
('herbal_tea', '药膳调理', '🍵', '饮用药膳茶，温养经脉', 'fixed', 1500, 2, 0, 0, 0, 'mortal', 2, 2, 2, 21, NULL, 1, strftime('%s', 'now'), strftime('%s', 'now')),

-- 洗髓境（境界3）- 洗涤骨髓
('bone_training', '锻骨炼体', '💪', '特殊锻炼法，强化骨骼', 'fixed', 2400, 3, 1, 0, 0, 'mortal', 3, 3, 3, 30, NULL, 1, strftime('%s', 'now'), strftime('%s', 'now')),
('medicinal_bath', '药浴洗髓', '🛁', '药浴浸泡，洗涤骨髓杂质', 'fixed', 3000, 4, 1, 0, 0, 'mortal', 3, 3, 3, 31, NULL, 1, strftime('%s', 'now'), strftime('%s', 'now')),

-- 换血境（境界4）- 更换血液
('blood_refine', '炼血换元', '🩸', '运功炼化血液，去除杂质', 'fixed', 3600, 5, 2, 0, 0, 'mortal', 4, 4, 4, 40, NULL, 1, strftime('%s', 'now'), strftime('%s', 'now')),
('qi_circulation', '气血运行', '🔄', '引导气血循环，加速换血', 'fixed', 3000, 4, 1, 0, 0, 'mortal', 4, 4, 4, 41, NULL, 1, strftime('%s', 'now'), strftime('%s', 'now')),

-- 玉骨境（境界5）- 骨骼如玉
('jade_bone', '玉骨淬炼', '💎', '淬炼骨骼，使其坚如玉石', 'fixed', 4800, 6, 2, 0, 0, 'mortal', 5, 5, 5, 50, NULL, 1, strftime('%s', 'now'), strftime('%s', 'now')),
('marrow_nourish', '髓海滋养', '🌊', '滋养髓海，巩固根基', 'fixed', 4200, 5, 2, 0, 0, 'mortal', 5, 5, 5, 51, NULL, 1, strftime('%s', 'now'), strftime('%s', 'now')),

-- 5. 插入超凡期养生任务（境界6-9）- 修仙体系
-- 聚灵境（境界6）- 聚集灵气
('spirit_gather', '聚灵纳气', '✨', '吸纳天地灵气，充盈丹田', 'fixed', 5400, 8, 3, 0, 0, 'advanced', 6, 6, 6, 60, NULL, 1, strftime('%s', 'now'), strftime('%s', 'now')),
('aura_sense', '灵气感知', '👁️', '感知周围灵气波动，提升灵敏度', 'fixed', 4800, 7, 2, 0, 0, 'advanced', 6, 6, 6, 61, NULL, 1, strftime('%s', 'now'), strftime('%s', 'now')),

-- 神识境（境界7）- 凝练神识
('soul_refine', '神识凝练', '🧠', '凝练神识，增强灵魂力量', 'fixed', 6000, 10, 4, 0, 0, 'advanced', 7, 7, 7, 70, NULL, 1, strftime('%s', 'now'), strftime('%s', 'now')),
('mind_palace', '识海构建', '🏛️', '在识海中构建神识宫殿', 'fixed', 5400, 9, 3, 0, 0, 'advanced', 7, 7, 7, 71, NULL, 1, strftime('%s', 'now'), strftime('%s', 'now')),

-- 玄府境（境界8）- 开辟玄府
('mystic_open', '玄府开辟', '🚪', '开辟体内玄府，储存灵力', 'fixed', 7200, 12, 5, 0, 0, 'advanced', 8, 8, 8, 80, NULL, 1, strftime('%s', 'now'), strftime('%s', 'now')),
('energy_store', '灵力储存', '⚡', '将灵力储存于玄府之中', 'fixed', 6600, 11, 4, 0, 0, 'advanced', 8, 8, 8, 81, NULL, 1, strftime('%s', 'now'), strftime('%s', 'now')),

-- 凝丹境（境界9）- 凝聚金丹
('pill_condense', '金丹凝聚', '🔮', '凝聚体内灵力，结成金丹', 'fixed', 8400, 15, 6, 0, 0, 'advanced', 9, 9, 9, 90, NULL, 1, strftime('%s', 'now'), strftime('%s', 'now')),
('dan_nourish', '丹田温养', '🌡️', '温养丹田，稳固金丹', 'fixed', 7800, 14, 5, 0, 0, 'advanced', 9, 9, 9, 91, NULL, 1, strftime('%s', 'now'), strftime('%s', 'now'));

-- 6. 创建索引优化查询
CREATE INDEX IF NOT EXISTS idx_wellness_realm ON wellness_tasks_config(realm_id);
CREATE INDEX IF NOT EXISTS idx_wellness_realm_range ON wellness_tasks_config(min_realm_id, max_realm_id);
