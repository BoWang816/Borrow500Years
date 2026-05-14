-- 种子数据：60+ 名 NPC 用于排行榜
-- 覆盖所有20个境界，每个境界至少3个用户
-- 数据根据境界自动适配：寿命、功德、资源等

-- ==================== 系统管理员账号 ====================
-- 默认管理员账号，密码：admin123
-- 密码哈希算法：SHA-256('borrow500years_salt_v1::admin123')

INSERT OR IGNORE INTO users (id, username, password_hash, created_at, name, gender, age, height, weight, smoke, alcohol, stayup, hereditary, exercise, meditate, initial_life_sec, bonus_sec, start_timestamp, total_gained_sec, coin, shard, merit) VALUES
  (1, 'admin', 'd98cd541b88b0f34a23bf748de2287abcf62ba22da8904afe11180f70e9b87a0', unixepoch(), '系统管理员', 'male', 30, 175, 70, 0, 0, 0, 0, 1, 1, 2524608000, 0, unixepoch() * 1000, 0, 999999, 999999, 999999);

-- 为管理员初始化境界（胎息境）
INSERT OR IGNORE INTO user_realms (user_id, current_realm_id, breakthrough_count, created_at, updated_at) VALUES
  (1, 1, 0, unixepoch(), unixepoch());

-- 辅助计算说明：
-- SEC_PER_YEAR = 31536000 (365.25天)
-- 功德计算：境界越高，功德越多（基础公式：境界ID * 50 + 随机波动）
-- 寿命计算：根据境界的 lifespan_max 和修炼进度计算
-- 资源计算：金币、碎片随境界递增

-- ==================== 凡蜕期：百岁之劫 (1-5境) ====================

-- 一境：胎息（寿命上限100岁）
INSERT OR IGNORE INTO users (id, username, password_hash, created_at, name, gender, age, height, weight, smoke, alcohol, stayup, exercise, meditate, initial_life_sec, bonus_sec, start_timestamp, total_gained_sec, coin, shard, merit) VALUES
  (1001, 'npc_chunyang',   'NPC', unixepoch(), '纯阳童子', 'male',   5,  110, 20, 0, 0, 0, 1, 1, 3153600000,  157680000,  unixepoch() * 1000 - 86400000 * 30,  157680000,  2, 1, 80),
  (1002, 'npc_lingxi',     'NPC', unixepoch(), '灵犀仙童', 'female', 4,  105, 18, 0, 0, 0, 1, 1, 3153600000,  126144000,  unixepoch() * 1000 - 86400000 * 25,  126144000,  2, 0, 70),
  (1003, 'npc_qingfeng',   'NPC', unixepoch(), '清风道童', 'male',   3,  100, 16, 0, 0, 0, 1, 1, 3153600000,  94608000,   unixepoch() * 1000 - 86400000 * 20,  94608000,   1, 1, 60);

-- 二境：定脉（寿命上限120岁）
INSERT OR IGNORE INTO users (id, username, password_hash, created_at, name, gender, age, height, weight, smoke, alcohol, stayup, exercise, meditate, initial_life_sec, bonus_sec, start_timestamp, total_gained_sec, coin, shard, merit) VALUES
  (1004, 'npc_mingyue',    'NPC', unixepoch(), '明月少侠', 'male',   12, 155, 45, 0, 0, 0, 1, 1, 3784320000,  315360000,  unixepoch() * 1000 - 86400000 * 50,  315360000,  3, 1, 150),
  (1005, 'npc_zixuan',     'NPC', unixepoch(), '紫萱仙子', 'female', 10, 150, 40, 0, 0, 0, 1, 1, 3784320000,  252288000,  unixepoch() * 1000 - 86400000 * 45,  252288000,  3, 2, 130),
  (1006, 'npc_yunhe',      'NPC', unixepoch(), '云鹤道人', 'male',   8,  145, 38, 0, 0, 0, 1, 1, 3784320000,  189216000,  unixepoch() * 1000 - 86400000 * 40,  189216000,  2, 1, 110);

-- 三境：洗髓（寿命上限150岁）
INSERT OR IGNORE INTO users (id, username, password_hash, created_at, name, gender, age, height, weight, smoke, alcohol, stayup, exercise, meditate, initial_life_sec, bonus_sec, start_timestamp, total_gained_sec, coin, shard, merit) VALUES
  (1007, 'npc_xuanji',     'NPC', unixepoch(), '玄机真人', 'male',   25, 175, 68, 0, 0, 0, 1, 1, 4730400000,  630720000,  unixepoch() * 1000 - 86400000 * 80,  630720000,  5, 2, 280),
  (1008, 'npc_biyao',      'NPC', unixepoch(), '碧瑶仙子', 'female', 22, 165, 52, 0, 0, 0, 1, 1, 4730400000,  567648000,  unixepoch() * 1000 - 86400000 * 75,  567648000,  4, 3, 250),
  (1009, 'npc_tianshu',    'NPC', unixepoch(), '天枢道长', 'male',   20, 178, 70, 0, 0, 0, 1, 1, 4730400000,  504576000,  unixepoch() * 1000 - 86400000 * 70,  504576000,  4, 2, 220);

-- 四境：换血（寿命上限200岁）
INSERT OR IGNORE INTO users (id, username, password_hash, created_at, name, gender, age, height, weight, smoke, alcohol, stayup, exercise, meditate, initial_life_sec, bonus_sec, start_timestamp, total_gained_sec, coin, shard, merit) VALUES
  (1010, 'npc_chongyang',  'NPC', unixepoch(), '王重阳',   'male',   50, 180, 75, 0, 0, 0, 1, 0, 6307200000,  1576800000, unixepoch() * 1000 - 86400000 * 120, 1576800000, 8, 4, 520),
  (1011, 'npc_xiaoyao',    'NPC', unixepoch(), '逍遥散人', 'male',   45, 176, 72, 0, 0, 0, 1, 1, 6307200000,  1419120000, unixepoch() * 1000 - 86400000 * 110, 1419120000, 7, 3, 480),
  (1012, 'npc_qiushui',    'NPC', unixepoch(), '秋水伊人', 'female', 40, 168, 55, 0, 0, 0, 1, 1, 6307200000,  1261440000, unixepoch() * 1000 - 86400000 * 100, 1261440000, 6, 4, 440);

-- 五境：玉骨（寿命上限300岁）
INSERT OR IGNORE INTO users (id, username, password_hash, created_at, name, gender, age, height, weight, smoke, alcohol, stayup, exercise, meditate, initial_life_sec, bonus_sec, start_timestamp, total_gained_sec, coin, shard, merit) VALUES
  (1013, 'npc_pengzu',     'NPC', unixepoch(), '彭祖再世', 'male',   80, 170, 65, 0, 0, 0, 1, 1, 9460800000,  2522880000, unixepoch() * 1000 - 86400000 * 180, 2522880000, 12, 6, 780),
  (1014, 'npc_xiwangmu',   'NPC', unixepoch(), '西王母',   'female', 75, 165, 58, 0, 0, 0, 1, 1, 9460800000,  2365200000, unixepoch() * 1000 - 86400000 * 170, 2365200000, 11, 5, 720),
  (1015, 'npc_donghua',    'NPC', unixepoch(), '东华帝君', 'male',   70, 178, 70, 0, 0, 0, 1, 1, 9460800000,  2207520000, unixepoch() * 1000 - 86400000 * 160, 2207520000, 10, 6, 680);


-- ==================== 超凡期：脱胎换骨 (6-9境) ====================

-- 六境：聚灵（寿命上限500岁）
INSERT OR IGNORE INTO users (id, username, password_hash, created_at, name, gender, age, height, weight, smoke, alcohol, stayup, exercise, meditate, initial_life_sec, bonus_sec, start_timestamp, total_gained_sec, coin, shard, merit) VALUES
  (1016, 'npc_qingsong',   'NPC', unixepoch(), '青松道人', 'male',   120, 175, 60, 0, 0, 0, 1, 1, 15768000000, 3784320000, unixepoch() * 1000 - 86400000 * 250, 3784320000, 18, 8, 1200),
  (1017, 'npc_bailian',    'NPC', unixepoch(), '白莲仙姑', 'female', 110, 168, 54, 0, 0, 0, 1, 1, 15768000000, 3468960000, unixepoch() * 1000 - 86400000 * 230, 3468960000, 16, 7, 1100),
  (1018, 'npc_xuanming',   'NPC', unixepoch(), '玄冥老祖', 'male',   100, 172, 62, 0, 0, 0, 1, 1, 15768000000, 3153600000, unixepoch() * 1000 - 86400000 * 210, 3153600000, 15, 9, 1000);

-- 七境：神识（寿命上限800岁）
INSERT OR IGNORE INTO users (id, username, password_hash, created_at, name, gender, age, height, weight, smoke, alcohol, stayup, exercise, meditate, initial_life_sec, bonus_sec, start_timestamp, total_gained_sec, coin, shard, merit) VALUES
  (1019, 'npc_zixia',      'NPC', unixepoch(), '紫霞仙子', 'female', 220, 165, 50, 0, 0, 0, 1, 1, 25228800000, 6937920000, unixepoch() * 1000 - 86400000 * 400, 6937920000, 28, 12, 1850),
  (1020, 'npc_chisong',    'NPC', unixepoch(), '赤松子',   'male',   200, 176, 68, 0, 0, 0, 1, 1, 25228800000, 6307200000, unixepoch() * 1000 - 86400000 * 380, 6307200000, 25, 11, 1700),
  (1021, 'npc_guangcheng', 'NPC', unixepoch(), '广成子',   'male',   180, 180, 72, 0, 0, 0, 1, 1, 25228800000, 5676480000, unixepoch() * 1000 - 86400000 * 360, 5676480000, 23, 10, 1550);

-- 八境：玄府（寿命上限1200岁）
INSERT OR IGNORE INTO users (id, username, password_hash, created_at, name, gender, age, height, weight, smoke, alcohol, stayup, exercise, meditate, initial_life_sec, bonus_sec, start_timestamp, total_gained_sec, coin, shard, merit) VALUES
  (1022, 'npc_taiyi',      'NPC', unixepoch(), '太乙真人', 'male',   350, 178, 70, 0, 0, 0, 1, 1, 37843200000, 11037600000, unixepoch() * 1000 - 86400000 * 600, 11037600000, 42, 18, 2800),
  (1023, 'npc_yuding',     'NPC', unixepoch(), '玉鼎真人', 'male',   320, 175, 68, 0, 0, 0, 1, 1, 37843200000, 10091520000, unixepoch() * 1000 - 86400000 * 570, 10091520000, 38, 16, 2600),
  (1024, 'npc_lingbao',    'NPC', unixepoch(), '灵宝天尊', 'male',   300, 180, 75, 0, 0, 0, 1, 1, 37843200000, 9460800000,  unixepoch() * 1000 - 86400000 * 550, 9460800000,  35, 15, 2400);

-- 九境：凝丹（寿命上限2000岁）
INSERT OR IGNORE INTO users (id, username, password_hash, created_at, name, gender, age, height, weight, smoke, alcohol, stayup, exercise, meditate, initial_life_sec, bonus_sec, start_timestamp, total_gained_sec, coin, shard, merit) VALUES
  (1025, 'npc_yuanshi',    'NPC', unixepoch(), '元始天尊', 'male',   600, 182, 78, 0, 0, 0, 1, 1, 63072000000, 18921600000, unixepoch() * 1000 - 86400000 * 1000, 18921600000, 68, 28, 4500),
  (1026, 'npc_tongtian',   'NPC', unixepoch(), '通天教主', 'male',   550, 180, 75, 0, 0, 0, 1, 1, 63072000000, 17344800000, unixepoch() * 1000 - 86400000 * 950,  17344800000, 62, 25, 4200),
  (1027, 'npc_nuwa',       'NPC', unixepoch(), '女娲娘娘', 'female', 500, 170, 55, 0, 0, 0, 1, 1, 63072000000, 15768000000, unixepoch() * 1000 - 86400000 * 900,  15768000000, 58, 23, 3900);

-- ==================== 化境期：因果纠缠 (10-14境) ====================

-- 十境：破茧（寿命上限4000岁）
INSERT OR IGNORE INTO users (id, username, password_hash, created_at, name, gender, age, height, weight, smoke, alcohol, stayup, exercise, meditate, initial_life_sec, bonus_sec, start_timestamp, total_gained_sec, coin, shard, merit) VALUES
  (1028, 'npc_fuxi',       'NPC', unixepoch(), '伏羲大帝', 'male',   1200, 185, 80, 0, 0, 0, 1, 1, 126144000000, 37843200000, unixepoch() * 1000 - 86400000 * 2000, 37843200000, 125, 45, 8000),
  (1029, 'npc_shennong',   'NPC', unixepoch(), '神农氏',   'male',   1100, 180, 75, 0, 0, 0, 1, 1, 126144000000, 34689600000, unixepoch() * 1000 - 86400000 * 1900, 34689600000, 115, 42, 7500),
  (1030, 'npc_xuanyuan',   'NPC', unixepoch(), '轩辕黄帝', 'male',   1000, 182, 78, 0, 0, 0, 1, 1, 126144000000, 31536000000, unixepoch() * 1000 - 86400000 * 1800, 31536000000, 105, 38, 7000);

-- 十一境：化神（寿命上限8000岁）
INSERT OR IGNORE INTO users (id, username, password_hash, created_at, name, gender, age, height, weight, smoke, alcohol, stayup, exercise, meditate, initial_life_sec, bonus_sec, start_timestamp, total_gained_sec, coin, shard, merit) VALUES
  (1031, 'npc_taishang',   'NPC', unixepoch(), '太上老君', 'male',   2500, 178, 70, 0, 0, 0, 1, 1, 252288000000, 78840000000, unixepoch() * 1000 - 86400000 * 4000, 78840000000, 280, 85, 16000),
  (1032, 'npc_hongjun',    'NPC', unixepoch(), '鸿钧道祖', 'male',   2300, 180, 72, 0, 0, 0, 1, 1, 252288000000, 72532800000, unixepoch() * 1000 - 86400000 * 3800, 72532800000, 260, 80, 15000),
  (1033, 'npc_xiwangmu2',  'NPC', unixepoch(), '瑶池金母', 'female', 2100, 168, 56, 0, 0, 0, 1, 1, 252288000000, 66225600000, unixepoch() * 1000 - 86400000 * 3600, 66225600000, 240, 75, 14000);

-- 十二境：炼虚（寿命上限2万岁）
INSERT OR IGNORE INTO users (id, username, password_hash, created_at, name, gender, age, height, weight, smoke, alcohol, stayup, exercise, meditate, initial_life_sec, bonus_sec, start_timestamp, total_gained_sec, coin, shard, merit) VALUES
  (1034, 'npc_pangu',      'NPC', unixepoch(), '盘古大神', 'male',   6000, 190, 85, 0, 0, 0, 1, 1, 630720000000, 189216000000, unixepoch() * 1000 - 86400000 * 10000, 189216000000, 680, 180, 35000),
  (1035, 'npc_zhulong',    'NPC', unixepoch(), '烛龙',     'male',   5500, 185, 82, 0, 0, 0, 1, 1, 630720000000, 173448000000, unixepoch() * 1000 - 86400000 * 9500,  173448000000, 620, 165, 32000),
  (1036, 'npc_kunpeng',    'NPC', unixepoch(), '鲲鹏',     'male',   5000, 180, 78, 0, 0, 0, 1, 1, 630720000000, 157680000000, unixepoch() * 1000 - 86400000 * 9000,  157680000000, 580, 150, 29000);


-- 十三境：合道（寿命上限5万岁）
INSERT OR IGNORE INTO users (id, username, password_hash, created_at, name, gender, age, height, weight, smoke, alcohol, stayup, exercise, meditate, initial_life_sec, bonus_sec, start_timestamp, total_gained_sec, coin, shard, merit) VALUES
  (1037, 'npc_tiandao',    'NPC', unixepoch(), '天道化身', 'male',   15000, 185, 80, 0, 0, 0, 1, 1, 1576800000000, 472392000000, unixepoch() * 1000 - 86400000 * 25000, 472392000000, 1680, 420, 75000),
  (1038, 'npc_didao',      'NPC', unixepoch(), '地道化身', 'male',   14000, 182, 78, 0, 0, 0, 1, 1, 1576800000000, 441504000000, unixepoch() * 1000 - 86400000 * 24000, 441504000000, 1580, 390, 70000),
  (1039, 'npc_rendao',     'NPC', unixepoch(), '人道化身', 'female', 13000, 175, 60, 0, 0, 0, 1, 1, 1576800000000, 409968000000, unixepoch() * 1000 - 86400000 * 23000, 409968000000, 1480, 360, 65000);

-- 十四境：渡厄（寿命上限10万岁）
INSERT OR IGNORE INTO users (id, username, password_hash, created_at, name, gender, age, height, weight, smoke, alcohol, stayup, exercise, meditate, initial_life_sec, bonus_sec, start_timestamp, total_gained_sec, coin, shard, merit) VALUES
  (1040, 'npc_hundu',      'NPC', unixepoch(), '混沌魔神', 'male',   30000, 195, 90, 0, 0, 0, 1, 1, 3153600000000, 945720000000, unixepoch() * 1000 - 86400000 * 50000, 945720000000, 3500, 850, 150000),
  (1041, 'npc_shikong',    'NPC', unixepoch(), '时空之主', 'male',   28000, 190, 85, 0, 0, 0, 1, 1, 3153600000000, 882576000000, unixepoch() * 1000 - 86400000 * 48000, 882576000000, 3300, 800, 140000),
  (1042, 'npc_yinyang',    'NPC', unixepoch(), '阴阳至尊', 'female', 26000, 178, 62, 0, 0, 0, 1, 1, 3153600000000, 819504000000, unixepoch() * 1000 - 86400000 * 46000, 819504000000, 3100, 750, 130000);

-- ==================== 极境期：法则剥离 (15-18境) ====================

-- 十五境：大乘（寿命上限30万岁）
INSERT OR IGNORE INTO users (id, username, password_hash, created_at, name, gender, age, height, weight, smoke, alcohol, stayup, exercise, meditate, initial_life_sec, bonus_sec, start_timestamp, total_gained_sec, coin, shard, merit) VALUES
  (1043, 'npc_wuliang',    'NPC', unixepoch(), '无量天尊', 'male',   90000, 188, 82, 0, 0, 0, 1, 1, 9460800000000, 2838240000000, unixepoch() * 1000 - 86400000 * 150000, 2838240000000, 10500, 2400, 400000),
  (1044, 'npc_wuji',       'NPC', unixepoch(), '无极圣人', 'male',   85000, 185, 80, 0, 0, 0, 1, 1, 9460800000000, 2680680000000, unixepoch() * 1000 - 86400000 * 145000, 2680680000000, 9800,  2250, 380000),
  (1045, 'npc_taiji',      'NPC', unixepoch(), '太极仙尊', 'female', 80000, 175, 58, 0, 0, 0, 1, 1, 9460800000000, 2522880000000, unixepoch() * 1000 - 86400000 * 140000, 2522880000000, 9200,  2100, 360000);

-- 十六境：斩因（寿命上限80万岁）
INSERT OR IGNORE INTO users (id, username, password_hash, created_at, name, gender, age, height, weight, smoke, alcohol, stayup, exercise, meditate, initial_life_sec, bonus_sec, start_timestamp, total_gained_sec, coin, shard, merit) VALUES
  (1046, 'npc_duanyuan',   'NPC', unixepoch(), '断缘道君', 'male',   250000, 190, 85, 0, 0, 0, 1, 1, 25228800000000, 7884000000000, unixepoch() * 1000 - 86400000 * 400000, 7884000000000, 28000, 6500, 950000),
  (1047, 'npc_wuyin',      'NPC', unixepoch(), '无因圣者', 'male',   230000, 185, 82, 0, 0, 0, 1, 1, 25228800000000, 7253280000000, unixepoch() * 1000 - 86400000 * 380000, 7253280000000, 26000, 6000, 900000),
  (1048, 'npc_jueguo',     'NPC', unixepoch(), '绝果仙帝', 'female', 210000, 178, 60, 0, 0, 0, 1, 1, 25228800000000, 6622560000000, unixepoch() * 1000 - 86400000 * 360000, 6622560000000, 24000, 5500, 850000);

-- 十七境：溯源（寿命上限300万岁）
INSERT OR IGNORE INTO users (id, username, password_hash, created_at, name, gender, age, height, weight, smoke, alcohol, stayup, exercise, meditate, initial_life_sec, bonus_sec, start_timestamp, total_gained_sec, coin, shard, merit) VALUES
  (1049, 'npc_yuanchu',    'NPC', unixepoch(), '原初之灵', 'male',   900000, 195, 88, 0, 0, 0, 1, 1, 94608000000000, 28382400000000, unixepoch() * 1000 - 86400000 * 1500000, 28382400000000, 98000, 22000, 3200000),
  (1050, 'npc_shiyuan',    'NPC', unixepoch(), '始源道祖', 'male',   850000, 192, 86, 0, 0, 0, 1, 1, 94608000000000, 26806800000000, unixepoch() * 1000 - 86400000 * 1450000, 26806800000000, 92000, 20500, 3000000),
  (1051, 'npc_benyuan',    'NPC', unixepoch(), '本源天君', 'female', 800000, 180, 62, 0, 0, 0, 1, 1, 94608000000000, 25228800000000, unixepoch() * 1000 - 86400000 * 1400000, 25228800000000, 86000, 19000, 2800000);

-- 十八境：轮回（寿命上限1000万岁）
INSERT OR IGNORE INTO users (id, username, password_hash, created_at, name, gender, age, height, weight, smoke, alcohol, stayup, exercise, meditate, initial_life_sec, bonus_sec, start_timestamp, total_gained_sec, coin, shard, merit) VALUES
  (1052, 'npc_liudao',     'NPC', unixepoch(), '六道轮回', 'male',   3000000, 198, 90, 0, 0, 0, 1, 1, 315360000000000, 94608000000000, unixepoch() * 1000 - 86400000 * 5000000, 94608000000000, 320000, 72000, 9500000),
  (1053, 'npc_shengsiwang','NPC', unixepoch(), '生死主宰', 'male',   2800000, 195, 88, 0, 0, 0, 1, 1, 315360000000000, 88300800000000, unixepoch() * 1000 - 86400000 * 4800000, 88300800000000, 300000, 68000, 9000000),
  (1054, 'npc_lunhuizhu',  'NPC', unixepoch(), '轮回之主', 'female', 2600000, 182, 64, 0, 0, 0, 1, 1, 315360000000000, 81993600000000, unixepoch() * 1000 - 86400000 * 4600000, 81993600000000, 280000, 64000, 8500000);

-- ==================== 道极期：永恒观者 (19-20境) ====================

-- 十九境：涅槃（寿命上限1亿岁）
INSERT OR IGNORE INTO users (id, username, password_hash, created_at, name, gender, age, height, weight, smoke, alcohol, stayup, exercise, meditate, initial_life_sec, bonus_sec, start_timestamp, total_gained_sec, coin, shard, merit) VALUES
  (1055, 'npc_jiuzhuan',   'NPC', unixepoch(), '九转涅槃', 'male',   30000000, 200, 92, 0, 0, 0, 1, 1, 3153600000000000, 946080000000000, unixepoch() * 1000 - 86400000 * 50000000, 946080000000000, 3200000, 720000, 95000000),
  (1056, 'npc_buxiu',      'NPC', unixepoch(), '不朽圣尊', 'male',   28000000, 198, 90, 0, 0, 0, 1, 1, 3153600000000000, 882576000000000, unixepoch() * 1000 - 86400000 * 48000000, 882576000000000, 3000000, 680000, 90000000),
  (1057, 'npc_wangu',      'NPC', unixepoch(), '万古长存', 'female', 26000000, 185, 65, 0, 0, 0, 1, 1, 3153600000000000, 819504000000000, unixepoch() * 1000 - 86400000 * 46000000, 819504000000000, 2800000, 640000, 85000000);

-- 二十境：永恒（寿命无尽）
INSERT OR IGNORE INTO users (id, username, password_hash, created_at, name, gender, age, height, weight, smoke, alcohol, stayup, exercise, meditate, initial_life_sec, bonus_sec, start_timestamp, total_gained_sec, coin, shard, merit) VALUES
  (1058, 'npc_yongheng',   'NPC', unixepoch(), '永恒至尊', 'male',   100000000, 205, 95, 0, 0, 0, 1, 1, 9999999999999999, 3153600000000000, unixepoch() * 1000 - 86400000 * 150000000, 3153600000000000, 9999999, 999999, 999999999),
  (1059, 'npc_wuqiong',    'NPC', unixepoch(), '无穷道主', 'male',   95000000,  203, 93, 0, 0, 0, 1, 1, 9999999999999999, 2996640000000000, unixepoch() * 1000 - 86400000 * 145000000, 2996640000000000, 9500000, 950000, 950000000),
  (1060, 'npc_chaoyue',    'NPC', unixepoch(), '超越天道', 'female', 90000000,  190, 68, 0, 0, 0, 1, 1, 9999999999999999, 2838240000000000, unixepoch() * 1000 - 86400000 * 140000000, 2838240000000000, 9000000, 900000, 900000000);

-- ==================== 为种子用户初始化境界 ====================
-- 根据用户的总年龄（age + bonus_sec）自动分配境界

INSERT OR IGNORE INTO user_realms (user_id, current_realm_id, breakthrough_count, created_at, updated_at) VALUES
  -- 一境：胎息 (0-100岁)
  (1001, 1, 0, unixepoch(), unixepoch()),
  (1002, 1, 0, unixepoch(), unixepoch()),
  (1003, 1, 0, unixepoch(), unixepoch()),
  -- 二境：定脉 (100-120岁)
  (1004, 2, 1, unixepoch(), unixepoch()),
  (1005, 2, 1, unixepoch(), unixepoch()),
  (1006, 2, 1, unixepoch(), unixepoch()),
  -- 三境：洗髓 (120-150岁)
  (1007, 3, 2, unixepoch(), unixepoch()),
  (1008, 3, 2, unixepoch(), unixepoch()),
  (1009, 3, 2, unixepoch(), unixepoch()),
  -- 四境：换血 (150-200岁)
  (1010, 4, 3, unixepoch(), unixepoch()),
  (1011, 4, 3, unixepoch(), unixepoch()),
  (1012, 4, 3, unixepoch(), unixepoch()),
  -- 五境：玉骨 (200-300岁)
  (1013, 5, 4, unixepoch(), unixepoch()),
  (1014, 5, 4, unixepoch(), unixepoch()),
  (1015, 5, 4, unixepoch(), unixepoch()),
  -- 六境：聚灵 (300-500岁)
  (1016, 6, 5, unixepoch(), unixepoch()),
  (1017, 6, 5, unixepoch(), unixepoch()),
  (1018, 6, 5, unixepoch(), unixepoch()),
  -- 七境：神识 (500-800岁)
  (1019, 7, 6, unixepoch(), unixepoch()),
  (1020, 7, 6, unixepoch(), unixepoch()),
  (1021, 7, 6, unixepoch(), unixepoch()),
  -- 八境：玄府 (800-1200岁)
  (1022, 8, 7, unixepoch(), unixepoch()),
  (1023, 8, 7, unixepoch(), unixepoch()),
  (1024, 8, 7, unixepoch(), unixepoch()),
  -- 九境：凝丹 (1200-2000岁)
  (1025, 9, 8, unixepoch(), unixepoch()),
  (1026, 9, 8, unixepoch(), unixepoch()),
  (1027, 9, 8, unixepoch(), unixepoch()),
  -- 十境：破茧 (2000-4000岁)
  (1028, 10, 9, unixepoch(), unixepoch()),
  (1029, 10, 9, unixepoch(), unixepoch()),
  (1030, 10, 9, unixepoch(), unixepoch()),
  -- 十一境：化神 (4000-8000岁)
  (1031, 11, 10, unixepoch(), unixepoch()),
  (1032, 11, 10, unixepoch(), unixepoch()),
  (1033, 11, 10, unixepoch(), unixepoch()),
  -- 十二境：炼虚 (8000-20000岁)
  (1034, 12, 11, unixepoch(), unixepoch()),
  (1035, 12, 11, unixepoch(), unixepoch()),
  (1036, 12, 11, unixepoch(), unixepoch()),
  -- 十三境：合道 (20000-50000岁)
  (1037, 13, 12, unixepoch(), unixepoch()),
  (1038, 13, 12, unixepoch(), unixepoch()),
  (1039, 13, 12, unixepoch(), unixepoch()),
  -- 十四境：渡厄 (50000-100000岁)
  (1040, 14, 13, unixepoch(), unixepoch()),
  (1041, 14, 13, unixepoch(), unixepoch()),
  (1042, 14, 13, unixepoch(), unixepoch()),
  -- 十五境：大乘 (100000-300000岁)
  (1043, 15, 14, unixepoch(), unixepoch()),
  (1044, 15, 14, unixepoch(), unixepoch()),
  (1045, 15, 14, unixepoch(), unixepoch()),
  -- 十六境：斩因 (300000-800000岁)
  (1046, 16, 15, unixepoch(), unixepoch()),
  (1047, 16, 15, unixepoch(), unixepoch()),
  (1048, 16, 15, unixepoch(), unixepoch()),
  -- 十七境：溯源 (800000-3000000岁)
  (1049, 17, 16, unixepoch(), unixepoch()),
  (1050, 17, 16, unixepoch(), unixepoch()),
  (1051, 17, 16, unixepoch(), unixepoch()),
  -- 十八境：轮回 (3000000-10000000岁)
  (1052, 18, 17, unixepoch(), unixepoch()),
  (1053, 18, 17, unixepoch(), unixepoch()),
  (1054, 18, 17, unixepoch(), unixepoch()),
  -- 十九境：涅槃 (10000000-100000000岁)
  (1055, 19, 18, unixepoch(), unixepoch()),
  (1056, 19, 18, unixepoch(), unixepoch()),
  (1057, 19, 18, unixepoch(), unixepoch()),
  -- 二十境：永恒 (100000000+岁)
  (1058, 20, 19, unixepoch(), unixepoch()),
  (1059, 20, 19, unixepoch(), unixepoch()),
  (1060, 20, 19, unixepoch(), unixepoch());


-- ==================== 全服事件种子数据 ====================
-- 添加一些示例全服事件

INSERT OR IGNORE INTO world_events (event_key, name, description, emoji, start_at, end_at, effect_type, effect_value, is_active) VALUES
  ('spring_festival_2026', '春节庆典', '新春佳节，天地灵气汇聚，修炼效率提升50%', '🎊', unixepoch() - 86400 * 30, unixepoch() + 86400 * 30, 'task_double', 0.5, 1),
  ('dragon_boat_2026', '端午龙舟', '端午时节，驱邪避凶，寿命衰减降低30%', '🐉', unixepoch() - 86400 * 15, unixepoch() + 86400 * 45, 'global_decay', -0.3, 1),
  ('mid_autumn_2026', '中秋赏月', '月圆之夜，功德收益增加40%', '🌕', unixepoch() - 86400 * 10, unixepoch() + 86400 * 50, 'global_merit', 0.4, 1),
  ('winter_solstice_2026', '冬至养生', '冬至进补，生命值额外增加20%', '❄️', unixepoch() - 86400 * 5, unixepoch() + 86400 * 55, 'global_life', 0.2, 1),
  ('heavenly_tribulation', '天劫降临', '天地异象，寿命衰减加速50%，但功德收益翻倍', '⚡', unixepoch() + 86400 * 60, unixepoch() + 86400 * 90, 'global_decay', 0.5, 0);
