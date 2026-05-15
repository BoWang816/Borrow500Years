-- ========================================
-- 修炼项目扩展：境界16-20
-- 每个境界10个修炼项目，共50个
-- ========================================

-- 境界16：斩因境（极境期第2境）- 斩断因果
INSERT OR IGNORE INTO cultivation_practices (key, name, emoji, description, realm_id, required_realm_level, practice_type, category, difficulty, cost_merit, reward_life, reward_merit, reward_shard, max_level, daily_limit, rarity, sort_order, helps_breakthrough, breakthrough_contribution) VALUES
('zhanyin_begin', '斩因启程', '✂️', '开始斩断因果', 16, 2, 'basic', 'soul', 18, 40000, 7200000, 18600, 920, 10, 2, 'mythic', 151, 0, 0),
('yinguo_see', '因果洞察', '👁️', '洞察因果线', 16, 2, 'advanced', 'meditation', 19, 50000, 9000000, 23200, 1100, 8, 2, 'mythic', 152, 1, 120),
('yinguo_cut', '因果斩断', '⚔️', '斩断因果联系', 16, 2, 'secret', 'soul', 21, 65000, 11700000, 30100, 1350, 5, 1, 'mythic', 153, 1, 170),
('zhoujiu_immune', '咒诅免疫', '🛡️', '免疫咒诅攻击', 16, 2, 'advanced', 'soul', 20, 55000, 9900000, 25500, 1200, 8, 2, 'mythic', 154, 1, 140),
('tuisuan_resist', '推算抵抗', '🔮', '抵抗他人推算', 16, 2, 'advanced', 'soul', 20, 58000, 10440000, 26900, 1250, 8, 2, 'mythic', 155, 1, 150),
('yinguo_reverse', '因果逆转', '🔄', '逆转因果关系', 16, 2, 'secret', 'soul', 22, 75000, 13500000, 34700, 1550, 5, 1, 'mythic', 156, 1, 200),
('zhanyin_stabilize', '斩因稳固', '⚓', '稳固斩因成果', 16, 2, 'basic', 'soul', 19, 45000, 8100000, 20800, 1000, 10, 2, 'mythic', 157, 0, 0),
('yinguo_master', '因果掌控', '🎮', '掌控因果之力', 16, 2, 'secret', 'soul', 23, 85000, 15300000, 39400, 1750, 5, 1, 'mythic', 158, 1, 230),
('zhanyin_perfect', '斩因圆满', '✨', '斩因达到圆满', 16, 2, 'secret', 'breakthrough', 24, 100000, 18000000, 46300, 2000, 5, 1, 'mythic', 159, 1, 280),
('zhanyin_ultimate', '斩因极境', '👑', '斩因境大圆满', 16, 2, 'secret', 'breakthrough', 25, 120000, 21600000, 55500, 2350, 3, 1, 'mythic', 160, 1, 380);

-- 境界17：溯源境（极境期第3境）- 寻找生命最初的编码
INSERT OR IGNORE INTO cultivation_practices (key, name, emoji, description, realm_id, required_realm_level, practice_type, category, difficulty, cost_merit, reward_life, reward_merit, reward_shard, max_level, daily_limit, rarity, sort_order, helps_breakthrough, breakthrough_contribution) VALUES
('suyuan_initiate', '溯源启程', '🔍', '开始追溯本源', 17, 3, 'basic', 'soul', 20, 60000, 10800000, 27800, 1380, 10, 2, 'mythic', 161, 0, 0),
('shengming_trace', '生命追溯', '🧬', '追溯生命起源', 17, 3, 'advanced', 'soul', 21, 75000, 13500000, 34800, 1650, 8, 2, 'mythic', 162, 1, 140),
('benyuan_find', '本源寻找', '🎯', '寻找本源所在', 17, 3, 'secret', 'soul', 23, 95000, 17100000, 44000, 2000, 5, 1, 'mythic', 163, 1, 190),
('bianma_decode', '编码解析', '💻', '解析生命编码', 17, 3, 'advanced', 'meditation', 22, 80000, 14400000, 37100, 1750, 8, 2, 'mythic', 164, 1, 160),
('benyuan_touch', '本源触及', '👆', '触及本源核心', 17, 3, 'secret', 'soul', 24, 110000, 19800000, 51000, 2300, 5, 1, 'mythic', 165, 1, 220),
('shengming_rewrite', '生命重写', '✍️', '重写生命编码', 17, 3, 'secret', 'soul', 25, 130000, 23400000, 60200, 2650, 5, 1, 'mythic', 166, 1, 260),
('suyuan_stabilize', '溯源稳固', '⚓', '稳固溯源状态', 17, 3, 'basic', 'soul', 21, 70000, 12600000, 32400, 1550, 10, 2, 'mythic', 167, 0, 0),
('benyuan_merge', '本源融合', '🔗', '与本源融合', 17, 3, 'secret', 'soul', 26, 150000, 27000000, 69500, 3000, 5, 1, 'mythic', 168, 1, 300),
('suyuan_perfect', '溯源圆满', '✨', '溯源达到圆满', 17, 3, 'secret', 'breakthrough', 27, 180000, 32400000, 83400, 3500, 5, 1, 'mythic', 169, 1, 360),
('suyuan_ultimate', '溯源极境', '👑', '溯源境大圆满', 17, 3, 'secret', 'breakthrough', 28, 220000, 39600000, 101900, 4200, 3, 1, 'mythic', 170, 1, 480);

-- 境界18：轮回境（极境期第4境）- 掌控生死律
INSERT OR IGNORE INTO cultivation_practices (key, name, emoji, description, realm_id, required_realm_level, practice_type, category, difficulty, cost_merit, reward_life, reward_merit, reward_shard, max_level, daily_limit, rarity, sort_order, helps_breakthrough, breakthrough_contribution) VALUES
('lunhui_enter', '轮回入门', '🔄', '进入轮回之道', 18, 4, 'basic', 'soul', 22, 100000, 18000000, 46400, 2300, 10, 2, 'mythic', 171, 0, 0),
('shengsi_control', '生死掌控', '⚖️', '掌控生死之力', 18, 4, 'advanced', 'soul', 23, 125000, 22500000, 58000, 2750, 8, 2, 'mythic', 172, 1, 160),
('lunhui_see', '轮回洞察', '👁️', '洞察轮回奥秘', 18, 4, 'advanced', 'meditation', 24, 140000, 25200000, 64900, 3050, 8, 2, 'mythic', 173, 1, 180),
('shouyuan_grant', '寿元赐予', '🎁', '赐予他人寿元', 18, 4, 'secret', 'qi', 26, 180000, 32400000, 83500, 3800, 5, 1, 'mythic', 174, 1, 240),
('shengsi_reverse', '生死逆转', '🔄', '逆转生死状态', 18, 4, 'secret', 'soul', 27, 200000, 36000000, 92700, 4200, 5, 1, 'mythic', 175, 1, 280),
('lunhui_master', '轮回主宰', '👑', '成为轮回主宰', 18, 4, 'secret', 'soul', 28, 250000, 45000000, 115900, 5000, 5, 1, 'mythic', 176, 1, 340),
('shengsi_transcend', '生死超脱', '♾️', '彻底超脱生死', 18, 4, 'advanced', 'soul', 25, 160000, 28800000, 74200, 3400, 8, 1, 'mythic', 177, 1, 220),
('lunhui_stabilize', '轮回稳固', '⚓', '稳固轮回之力', 18, 4, 'basic', 'soul', 23, 120000, 21600000, 55600, 2650, 10, 2, 'mythic', 178, 0, 0),
('lunhui_perfect', '轮回圆满', '✨', '轮回达到圆满', 18, 4, 'secret', 'breakthrough', 29, 300000, 54000000, 139100, 5800, 5, 1, 'mythic', 179, 1, 420),
('lunhui_ultimate', '轮回极境', '👑', '轮回境大圆满', 18, 4, 'secret', 'breakthrough', 30, 380000, 68400000, 176100, 7200, 3, 1, 'mythic', 180, 1, 560);

-- 境界19：涅槃境（道极期第1境）- 经历九次宇宙毁灭而不死
INSERT OR IGNORE INTO cultivation_practices (key, name, emoji, description, realm_id, required_realm_level, practice_type, category, difficulty, cost_merit, reward_life, reward_merit, reward_shard, max_level, daily_limit, rarity, sort_order, helps_breakthrough, breakthrough_contribution) VALUES
('niepan_begin', '涅槃启程', '🔥', '开始涅槃修炼', 19, 1, 'basic', 'soul', 25, 200000, 36000000, 92800, 4600, 10, 2, 'mythic', 181, 0, 0),
('huimie_resist', '毁灭抵抗', '🛡️', '抵抗宇宙毁灭', 19, 1, 'advanced', 'body', 26, 250000, 45000000, 116000, 5500, 8, 2, 'mythic', 182, 1, 180),
('chongsheng_master', '重生掌握', '🦅', '掌握涅槃重生', 19, 1, 'secret', 'soul', 28, 320000, 57600000, 148400, 6800, 5, 1, 'mythic', 183, 1, 260),
('yuzhou_transcend', '宇宙超越', '🌌', '超越宇宙限制', 19, 1, 'secret', 'soul', 29, 380000, 68400000, 176200, 7900, 5, 1, 'mythic', 184, 1, 320),
('niepan_fire', '涅槃之火', '🔥', '点燃涅槃之火', 19, 1, 'advanced', 'qi', 27, 280000, 50400000, 129800, 6100, 8, 2, 'mythic', 185, 1, 220),
('jiuci_survive', '九次不死', '♾️', '经历九次毁灭', 19, 1, 'secret', 'soul', 30, 500000, 90000000, 231800, 10000, 5, 1, 'mythic', 186, 1, 400),
('xiaolv_boost', '效率提升', '⚡', '每次重生提升效率', 19, 1, 'advanced', 'qi', 28, 350000, 63000000, 162300, 7400, 8, 1, 'mythic', 187, 1, 280),
('niepan_stabilize', '涅槃稳固', '⚓', '稳固涅槃状态', 19, 1, 'basic', 'soul', 26, 240000, 43200000, 111300, 5300, 10, 2, 'mythic', 188, 0, 0),
('niepan_perfect', '涅槃圆满', '✨', '涅槃达到圆满', 19, 1, 'secret', 'breakthrough', 31, 600000, 108000000, 278200, 11500, 5, 1, 'mythic', 189, 1, 500),
('niepan_ultimate', '涅槃极境', '👑', '涅槃境大圆满', 19, 1, 'secret', 'breakthrough', 32, 800000, 144000000, 370800, 15000, 3, 1, 'mythic', 190, 1, 680);

-- 境界20：永恒境（道极期第2境）- 彻底超越时间维度
INSERT OR IGNORE INTO cultivation_practices (key, name, emoji, description, realm_id, required_realm_level, practice_type, category, difficulty, cost_merit, reward_life, reward_merit, reward_shard, max_level, daily_limit, rarity, sort_order, helps_breakthrough, breakthrough_contribution) VALUES
('yongheng_enter', '永恒入门', '♾️', '踏入永恒之境', 20, 2, 'basic', 'soul', 28, 500000, 90000000, 232000, 11500, 10, 2, 'mythic', 191, 0, 0),
('shijian_transcend', '时间超越', '⏰', '超越时间限制', 20, 2, 'advanced', 'meditation', 29, 650000, 117000000, 301500, 14000, 8, 2, 'mythic', 192, 1, 200),
('yongheng_body', '永恒之躯', '💎', '凝聚永恒之躯', 20, 2, 'secret', 'body', 31, 850000, 153000000, 394200, 17500, 5, 1, 'mythic', 193, 1, 300),
('shouyuan_infinite', '寿元无限', '∞', '寿元趋于无限', 20, 2, 'secret', 'qi', 32, 1000000, 180000000, 463800, 20000, 5, 1, 'mythic', 194, 1, 380),
('shijian_control', '时间掌控', '🎮', '完全掌控时间', 20, 2, 'secret', 'soul', 33, 1200000, 216000000, 556400, 23500, 5, 1, 'mythic', 195, 1, 460),
('yongheng_will', '永恒意志', '🧠', '凝聚永恒意志', 20, 2, 'advanced', 'soul', 30, 750000, 135000000, 347800, 16000, 8, 1, 'mythic', 196, 1, 260),
('weidu_transcend', '维度超越', '🌌', '超越维度限制', 20, 2, 'secret', 'soul', 34, 1500000, 270000000, 695400, 28000, 5, 1, 'mythic', 197, 1, 560),
('yongheng_stabilize', '永恒稳固', '⚓', '稳固永恒状态', 20, 2, 'basic', 'soul', 29, 600000, 108000000, 278300, 13000, 10, 2, 'mythic', 198, 0, 0),
('yongheng_perfect', '永恒圆满', '✨', '永恒达到圆满', 20, 2, 'secret', 'breakthrough', 35, 2000000, 360000000, 927000, 35000, 5, 1, 'mythic', 199, 1, 700),
('yongheng_ultimate', '永恒极境', '👑', '永恒境大圆满，修炼之路终点', 20, 2, 'secret', 'breakthrough', 36, 3000000, 540000000, 1390500, 50000, 3, 1, 'mythic', 200, 1, 1000);

-- 注：至此，所有20个境界的修炼项目已全部添加完成
-- 总计200个修炼项目（20个境界 × 10个修炼项目）
