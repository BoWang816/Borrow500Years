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


-- ==================== 游戏配置数据 ====================
-- 以下数据从数据库导出，包含所有游戏配置
-- 包括：境界、修炼项目、丹药、养生任务、历练、全服事件


-- ==================== 配置表数据导出 ====================
-- 此文件包含所有游戏配置数据，用于初始化新服务
-- 生成时间: 自动生成

-- ==================== REALMS ====================
INSERT OR REPLACE INTO realms (id, name, major_realm, sub_realm, major_realm_name, lifespan_max, breakthrough_age_min, breakthrough_age_max, description, core_logic, cultivation_span_min, cultivation_span_max, sort_order) VALUES
  (1, '胎息境', 1, 1, '凡蜕期', 3153600000, NULL, 157680000, '锁住先天灵气', '若5岁前未入此境，先天灵气散尽，沦为凡人', NULL, NULL, 1),
  (2, '定脉境', 1, 2, '凡蜕期', 3784320000, 157680000, 473040000, '疏通经络', '此阶段不修功法，身体发育会压迫经脉，导致终身无法修行', NULL, NULL, 2),
  (3, '洗髓境', 1, 3, '凡蜕期', 4730400000, 473040000, 946080000, '彻底排除凡胎杂质', '30岁是人体巅峰，若不洗髓，肉身开始走下坡路', NULL, NULL, 3),
  (4, '换血境', 1, 4, '凡蜕期', 6307200000, 946080000, 1892160000, '逆转生理衰老', '通过更换灵血，使器官功能重回18岁水平', NULL, NULL, 4),
  (5, '玉骨境', 1, 5, '凡蜕期', 9460800000, 1892160000, 3153600000, '骨骼结晶化', '这是百岁大关的最后屏障，成则增寿两百年', NULL, NULL, 5),
  (6, '聚灵境', 2, 1, '超凡期', 15768000000, NULL, NULL, '丹田形成灵压', '身体不再依赖五谷，需通过养生维持灵气平衡', 3153600000, 6307200000, 6),
  (7, '神识境', 2, 2, '超凡期', 25228800000, NULL, NULL, '脑域开发，诞生神识', '此时若停止修炼，神魂会因肉身老化而崩溃', 6307200000, 12614400000, 7),
  (8, '玄府境', 2, 3, '超凡期', 37843200000, NULL, NULL, '体内开辟亚空间', '对功德消耗开始激增', 12614400000, 22075200000, 8),
  (9, '凝丹境', 2, 4, '超凡期', 63072000000, NULL, NULL, '寿元核心成型', '若无法成丹，千岁之时即是坐化之日', 22075200000, 31536000000, 9),
  (10, '破茧', 3, 1, '化境期', 126144000000, NULL, NULL, '彻底抛弃凡人肉身', '修成法躯', 31536000000, 63072000000, 10),
  (11, '化神', 3, 2, '化境期', 252288000000, NULL, NULL, '元神出窍', '死亡判定不再看肉身，只看元神能量', 63072000000, 126144000000, 11),
  (12, '炼虚', 3, 3, '化境期', 630720000000, NULL, NULL, '领悟空间', '寿元开始出现非线性跳跃', 126144000000, 252288000000, 12),
  (13, '合道', 3, 4, '化境期', 1576800000000, NULL, NULL, '意志与局部天地融合', '与天地共鸣', 252288000000, 630720000000, 13),
  (14, '渡厄', 3, 5, '化境期', 3153600000000, NULL, NULL, '经历第一重"死劫"', '每秒流逝寿元变为2倍，逼迫玩家加快进度', 630720000000, 1576800000000, 14),
  (15, '大乘', 4, 1, '极境期', 9460800000000, NULL, NULL, '法力圆满', '开始斩断现世羁绊', 1576800000000, 4730400000000, 15),
  (16, '斩因', 4, 2, '极境期', 25228800000000, NULL, NULL, '斩断因果', '不会因他人推算或诅咒而减寿', 4730400000000, 12614400000000, 16),
  (17, '溯源', 4, 3, '极境期', 94608000000000, NULL, NULL, '寻找生命最初的编码', '追溯本源', 12614400000000, 31536000000000, 17),
  (18, '轮回', 4, 4, '极境期', 315360000000000, NULL, NULL, '掌控生死律', '可赋予NPC或其他玩家寿元', 31536000000000, 157680000000000, 18),
  (19, '涅槃', 5, 1, '道极期', 3153600000000000, NULL, NULL, '经历九次宇宙毁灭而不死', '每次重生提升200%效率', NULL, NULL, 19),
  (20, '永恒境', 5, 2, '道极期', 10000000000000000, NULL, NULL, '彻底超越时间维度', '不再受系统"寿命扣除"机制限制', NULL, NULL, 20);

-- ==================== CULTIVATION_PRACTICES ====================
INSERT OR REPLACE INTO cultivation_practices (id, key, name, emoji, description, realm_id, required_realm_level, practice_type, category, difficulty, practice_time, cooldown_time, cost_merit, cost_life, cost_coin, reward_life, reward_merit, reward_shard, reward_exp, effect_type, effect_value, effect_duration, helps_breakthrough, breakthrough_contribution, max_level, daily_limit, prerequisite_practice, rarity, sort_order, is_active, created_at, updated_at) VALUES
  (1, 'taixin_basic', '胎息入门', '👶', '锁住先天灵气，初窥修炼之门', 1, 1, 'basic', 'breathing', 1, 3600, 86400, 0, 0, 0, 315576, 5, 0, 0, NULL, 0, 0, 0, 0, 10, 3, NULL, 'common', 1, 1, 1778745638, 1778745638),
  (2, 'xiantian_guard', '先天护体', '✨', '保护先天真气不散', 1, 1, 'basic', 'qi', 1, 3600, 86400, 10, 0, 0, 315576, 8, 0, 0, NULL, 0, 0, 0, 0, 10, 2, NULL, 'common', 2, 1, 1778745638, 1778745638),
  (3, 'lingtai_awaken', '灵台初醒', '🧘', '开启灵台，感知天地', 1, 1, 'basic', 'meditation', 2, 3600, 86400, 15, 0, 0, 315576, 10, 0, 0, NULL, 0, 0, 0, 0, 10, 2, NULL, 'common', 3, 1, 1778745638, 1778745638),
  (4, 'yuanqi_gather', '元气聚集', '💫', '聚集周身元气', 1, 1, 'basic', 'qi', 2, 3600, 86400, 20, 0, 0, 315576, 12, 1, 0, NULL, 0, 0, 0, 0, 10, 2, NULL, 'rare', 4, 1, 1778745638, 1778745638),
  (5, 'tiandi_resonate', '天地共鸣', '🌟', '与天地灵气产生共鸣', 1, 1, 'advanced', 'breathing', 3, 3600, 86400, 30, 0, 0, 315576, 15, 1, 0, NULL, 0, 0, 0, 0, 8, 1, NULL, 'rare', 5, 1, 1778745638, 1778745638),
  (6, 'xiantian_refine', '先天炼化', '⚡', '炼化先天之气', 1, 1, 'advanced', 'qi', 3, 3600, 86400, 40, 0, 0, 315576, 20, 2, 0, NULL, 0, 0, 0, 0, 8, 1, NULL, 'epic', 6, 1, 1778745638, 1778745638),
  (7, 'linghun_nourish', '灵魂滋养', '🌸', '滋养初生灵魂', 1, 1, 'basic', 'soul', 2, 3600, 86400, 25, 0, 0, 315576, 15, 1, 0, NULL, 0, 0, 0, 0, 10, 2, NULL, 'rare', 7, 1, 1778745638, 1778745638),
  (8, 'zhenqi_cycle', '真气循环', '🔄', '建立真气循环', 1, 1, 'basic', 'qi', 2, 3600, 86400, 20, 0, 0, 315576, 12, 0, 0, NULL, 0, 0, 0, 0, 10, 3, NULL, 'common', 8, 1, 1778745638, 1778745638),
  (9, 'tianzhen_preserve', '天真守护', '🛡️', '保持天真本性', 1, 1, 'basic', 'meditation', 1, 3600, 86400, 15, 0, 0, 315576, 10, 0, 0, NULL, 0, 0, 0, 0, 10, 3, NULL, 'common', 9, 1, 1778745638, 1778745638),
  (10, 'xiantian_breakthrough', '先天突破', '💥', '为突破定脉境做准备', 1, 1, 'secret', 'breakthrough', 4, 3600, 86400, 50, 0, 0, 315576, 30, 3, 0, NULL, 0, 0, 0, 0, 5, 1, NULL, 'epic', 10, 1, 1778745638, 1778745638),
  (11, 'dingmai_basic', '定脉基础', '🌊', '疏通十二正经', 2, 2, 'basic', 'body', 2, 3600, 86400, 30, 0, 0, 631152, 15, 1, 0, NULL, 0, 0, 0, 0, 10, 3, NULL, 'common', 11, 1, 1778745638, 1778745638),
  (12, 'jingmai_open', '经脉开拓', '🔓', '打开闭塞的经脉', 2, 2, 'basic', 'body', 2, 3600, 86400, 40, 0, 0, 631152, 18, 1, 0, NULL, 0, 0, 0, 0, 10, 2, NULL, 'common', 12, 1, 1778745638, 1778745638),
  (13, 'qixue_activate', '气血激活', '❤️', '激活气血运行', 2, 2, 'basic', 'qi', 3, 3600, 86400, 50, 0, 0, 631152, 20, 2, 0, NULL, 0, 0, 0, 0, 10, 2, NULL, 'rare', 13, 1, 1778745638, 1778745638),
  (14, 'rendu_connect', '任督贯通', '⚡', '贯通任督二脉', 2, 2, 'advanced', 'qi', 4, 3600, 86400, 80, 0, 0, 631152, 30, 3, 0, NULL, 0, 0, 1, 20, 8, 1, NULL, 'epic', 14, 1, 1778745638, 1778745638),
  (15, 'baimai_harmony', '百脉调和', '🎵', '调和全身经脉', 2, 2, 'advanced', 'body', 3, 3600, 86400, 60, 0, 0, 631152, 25, 2, 0, NULL, 0, 0, 0, 0, 10, 2, NULL, 'rare', 15, 1, 1778745638, 1778745638),
  (16, 'zhenqi_strengthen', '真气强化', '💪', '强化真气质量', 2, 2, 'basic', 'qi', 3, 3600, 86400, 45, 0, 0, 631152, 20, 1, 0, NULL, 0, 0, 0, 0, 10, 2, NULL, 'common', 16, 1, 1778745638, 1778745638),
  (17, 'jingmai_expand', '经脉拓宽', '📏', '拓宽经脉容量', 2, 2, 'advanced', 'body', 4, 3600, 86400, 70, 0, 0, 631152, 28, 2, 0, NULL, 0, 0, 1, 15, 8, 1, NULL, 'rare', 17, 1, 1778745638, 1778745638),
  (18, 'qihai_build', '气海筑基', '🌊', '在丹田建立气海', 2, 2, 'advanced', 'qi', 4, 3600, 86400, 90, 0, 0, 631152, 35, 3, 0, NULL, 0, 0, 1, 25, 8, 1, NULL, 'epic', 18, 1, 1778745638, 1778745638),
  (19, 'xuemo_purify', '血脉净化', '💎', '净化血脉杂质', 2, 2, 'basic', 'body', 3, 3600, 86400, 55, 0, 0, 631152, 22, 2, 0, NULL, 0, 0, 0, 0, 10, 2, NULL, 'rare', 19, 1, 1778745638, 1778745638),
  (20, 'dingmai_perfection', '定脉圆满', '✨', '定脉境圆满，准备洗髓', 2, 2, 'secret', 'breakthrough', 5, 3600, 86400, 120, 0, 0, 631152, 50, 5, 0, NULL, 0, 0, 1, 50, 5, 1, NULL, 'legendary', 20, 1, 1778745638, 1778745638),
  (21, 'xisui_initiate', '洗髓启动', '🌀', '开始洗髓伐毛', 3, 3, 'basic', 'body', 3, 3600, 86400, 80, 0, 0, 1577880, 30, 2, 0, NULL, 0, 0, 0, 0, 10, 2, NULL, 'common', 21, 1, 1778745638, 1778745638),
  (22, 'gusui_cleanse', '骨髓清洗', '🦴', '清洗骨髓中的杂质', 3, 3, 'advanced', 'body', 4, 3600, 86400, 120, 0, 0, 1577880, 40, 3, 0, NULL, 0, 0, 1, 20, 8, 2, NULL, 'rare', 22, 1, 1778745638, 1778745638),
  (23, 'zangfu_purify', '脏腑净化', '💚', '净化五脏六腑', 3, 3, 'basic', 'body', 3, 3600, 86400, 90, 0, 0, 1577880, 35, 2, 0, NULL, 0, 0, 0, 0, 10, 2, NULL, 'common', 23, 1, 1778745638, 1778745638),
  (24, 'xuemo_rebirth', '血脉重生', '🔴', '重塑血脉根基', 3, 3, 'advanced', 'body', 5, 3600, 86400, 150, 0, 0, 1577880, 50, 4, 0, NULL, 0, 0, 1, 30, 8, 1, NULL, 'epic', 24, 1, 1778745638, 1778745638),
  (25, 'jingmai_reforge', '经脉重铸', '⚒️', '重铸经脉结构', 3, 3, 'advanced', 'body', 4, 3600, 86400, 110, 0, 0, 1577880, 42, 3, 0, NULL, 0, 0, 1, 25, 8, 2, NULL, 'rare', 25, 1, 1778745638, 1778745638),
  (26, 'tigu_strengthen', '体骨强化', '💪', '强化骨骼密度', 3, 3, 'basic', 'body', 3, 3600, 86400, 85, 0, 0, 1577880, 32, 2, 0, NULL, 0, 0, 0, 0, 10, 2, NULL, 'common', 26, 1, 1778745638, 1778745638),
  (27, 'neishi_expel', '内视排毒', '👁️', '内视身体，排出毒素', 3, 3, 'advanced', 'meditation', 4, 3600, 86400, 130, 0, 0, 1577880, 45, 3, 0, NULL, 0, 0, 0, 0, 8, 1, NULL, 'rare', 27, 1, 1778745638, 1778745638),
  (28, 'xiantian_restore', '先天复原', '🌟', '恢复先天之体', 3, 3, 'secret', 'body', 6, 3600, 86400, 200, 0, 0, 1577880, 70, 6, 0, NULL, 0, 0, 1, 40, 5, 1, NULL, 'epic', 28, 1, 1778745638, 1778745638),
  (29, 'fanti_shed', '凡体蜕变', '🦋', '蜕去凡胎', 3, 3, 'advanced', 'body', 5, 3600, 86400, 160, 0, 0, 1577880, 55, 4, 0, NULL, 0, 0, 1, 35, 8, 1, NULL, 'epic', 29, 1, 1778745638, 1778745638),
  (30, 'xisui_complete', '洗髓大成', '✨', '洗髓圆满，准备换血', 3, 3, 'secret', 'breakthrough', 6, 3600, 86400, 250, 0, 0, 1577880, 100, 8, 0, NULL, 0, 0, 1, 60, 5, 1, NULL, 'legendary', 30, 1, 1778745638, 1778745638),
  (31, 'huanxue_begin', '换血启程', '💉', '开始换血过程', 4, 4, 'basic', 'body', 4, 3600, 86400, 150, 0, 0, 3155760, 50, 3, 0, NULL, 0, 0, 0, 0, 10, 2, NULL, 'rare', 31, 1, 1778745638, 1778745638),
  (32, 'lingxue_refine', '灵血炼制', '🧪', '炼制灵血', 4, 4, 'advanced', 'qi', 5, 3600, 86400, 200, 0, 0, 3155760, 70, 5, 0, NULL, 0, 0, 1, 25, 8, 1, NULL, 'epic', 32, 1, 1778745638, 1778745638),
  (33, 'xuemo_replace', '血脉置换', '🔄', '置换全身血液', 4, 4, 'advanced', 'body', 5, 3600, 86400, 220, 0, 0, 3155760, 80, 6, 0, NULL, 0, 0, 1, 30, 8, 1, NULL, 'epic', 33, 1, 1778745638, 1778745638),
  (34, 'qiguan_rejuvenate', '器官回春', '🌱', '使器官恢复年轻', 4, 4, 'advanced', 'body', 6, 3600, 86400, 280, 0, 0, 3155760, 100, 7, 0, NULL, 0, 0, 1, 40, 8, 1, NULL, 'legendary', 34, 1, 1778745638, 1778745638),
  (35, 'xibao_activate', '细胞激活', '⚡', '激活细胞活性', 4, 4, 'basic', 'body', 4, 3600, 86400, 180, 0, 0, 3155760, 60, 4, 0, NULL, 0, 0, 0, 0, 10, 2, NULL, 'rare', 35, 1, 1778745638, 1778745638),
  (36, 'shengli_reverse', '生理逆转', '⏪', '逆转生理年龄', 4, 4, 'secret', 'body', 7, 3600, 86400, 350, 0, 0, 3155760, 130, 10, 0, NULL, 0, 0, 1, 50, 5, 1, NULL, 'legendary', 36, 1, 1778745638, 1778745638),
  (37, 'jingxue_purify', '精血提纯', '💎', '提纯精血质量', 4, 4, 'advanced', 'body', 5, 3600, 86400, 240, 0, 0, 3155760, 85, 6, 0, NULL, 0, 0, 1, 35, 8, 1, NULL, 'epic', 37, 1, 1778745638, 1778745638),
  (38, 'shengji_enhance', '生机增强', '🌿', '增强生命力', 4, 4, 'basic', 'qi', 4, 3600, 86400, 190, 0, 0, 3155760, 65, 4, 0, NULL, 0, 0, 0, 0, 10, 2, NULL, 'rare', 38, 1, 1778745638, 1778745638),
  (39, 'huanxue_stabilize', '换血稳固', '🛡️', '稳固换血成果', 4, 4, 'advanced', 'body', 5, 3600, 86400, 260, 0, 0, 3155760, 90, 6, 0, NULL, 0, 0, 1, 30, 8, 1, NULL, 'epic', 39, 1, 1778745638, 1778745638),
  (40, 'huanxue_mastery', '换血至境', '👑', '换血境大圆满', 4, 4, 'secret', 'breakthrough', 8, 3600, 86400, 500, 0, 0, 3155760, 200, 15, 0, NULL, 0, 0, 1, 80, 5, 1, NULL, 'mythic', 40, 1, 1778745638, 1778745638),
  (41, 'yugu_foundation', '玉骨筑基', '💎', '开始骨骼结晶化', 5, 5, 'basic', 'body', 5, 3600, 86400, 300, 0, 0, 15778800, 100, 8, 0, NULL, 0, 0, 0, 0, 10, 2, NULL, 'epic', 41, 1, 1778745638, 1778745638),
  (42, 'guge_crystallize', '骨骼晶化', '💠', '骨骼逐渐晶化', 5, 5, 'advanced', 'body', 6, 3600, 86400, 400, 0, 0, 15778800, 140, 10, 0, NULL, 0, 0, 1, 35, 8, 1, NULL, 'legendary', 42, 1, 1778745638, 1778745638),
  (43, 'suigu_jade', '髓骨如玉', '🦴', '骨髓转化为玉质', 5, 5, 'advanced', 'body', 6, 3600, 86400, 450, 0, 0, 15778800, 160, 12, 0, NULL, 0, 0, 1, 40, 8, 1, NULL, 'legendary', 43, 1, 1778745638, 1778745638),
  (44, 'gujie_strengthen', '骨节强化', '⚡', '强化骨节连接', 5, 5, 'basic', 'body', 5, 3600, 86400, 350, 0, 0, 15778800, 120, 9, 0, NULL, 0, 0, 0, 0, 10, 2, NULL, 'epic', 44, 1, 1778745638, 1778745638),
  (45, 'yuti_transform', '玉体转化', '✨', '全身转化为玉体', 5, 5, 'secret', 'body', 8, 3600, 86400, 600, 0, 0, 15778800, 220, 18, 0, NULL, 0, 0, 1, 60, 5, 1, NULL, 'mythic', 45, 1, 1778745638, 1778745638),
  (46, 'jinggu_refine', '精骨炼化', '🔥', '炼化骨骼精华', 5, 5, 'advanced', 'body', 6, 3600, 86400, 480, 0, 0, 15778800, 170, 13, 0, NULL, 0, 0, 1, 45, 8, 1, NULL, 'legendary', 46, 1, 1778745638, 1778745638),
  (47, 'guli_enhance', '骨力增强', '💪', '增强骨骼力量', 5, 5, 'basic', 'body', 5, 3600, 86400, 380, 0, 0, 15778800, 130, 10, 0, NULL, 0, 0, 0, 0, 10, 2, NULL, 'epic', 47, 1, 1778745638, 1778745638),
  (48, 'yugu_defense', '玉骨护体', '🛡️', '玉骨形成防护', 5, 5, 'advanced', 'body', 7, 3600, 86400, 520, 0, 0, 15778800, 190, 14, 0, NULL, 0, 0, 1, 50, 8, 1, NULL, 'legendary', 48, 1, 1778745638, 1778745638),
  (49, 'bainian_barrier', '百年屏障', '🚧', '突破百岁屏障', 5, 5, 'secret', 'breakthrough', 9, 3600, 86400, 800, 0, 0, 15778800, 300, 25, 0, NULL, 0, 0, 1, 100, 5, 1, NULL, 'mythic', 49, 1, 1778745638, 1778745638),
  (50, 'yugu_perfection', '玉骨圆满', '👑', '玉骨境大圆满，准备超凡', 5, 5, 'secret', 'breakthrough', 10, 3600, 86400, 1000, 0, 0, 15778800, 400, 30, 0, NULL, 0, 0, 1, 150, 3, 1, NULL, 'mythic', 50, 1, 1778745638, 1778745638),
  (51, 'juling_initiate', '聚灵启蒙', '🌀', '开始聚集天地灵气', 6, 1, 'basic', 'qi', 5, 3600, 86400, 500, 0, 0, 31557600, 200, 15, 0, NULL, 0, 0, 0, 0, 10, 2, NULL, 'epic', 51, 1, 1778745646, 1778745646),
  (52, 'dantian_expand', '丹田拓展', '⭕', '扩大丹田容量', 6, 1, 'basic', 'qi', 6, 3600, 86400, 600, 0, 0, 31557600, 250, 18, 0, NULL, 0, 0, 0, 0, 10, 2, NULL, 'epic', 52, 1, 1778745646, 1778745646),
  (53, 'lingyali_form', '灵压成型', '💨', '在丹田形成灵压', 6, 1, 'advanced', 'qi', 7, 3600, 86400, 800, 0, 0, 31557600, 320, 22, 0, NULL, 0, 0, 1, 40, 8, 1, NULL, 'legendary', 53, 1, 1778745646, 1778745646),
  (54, 'lingqi_absorb', '灵气吸纳', '🌬️', '高效吸收天地灵气', 6, 1, 'basic', 'breathing', 5, 3600, 86400, 550, 0, 0, 31557600, 220, 16, 0, NULL, 0, 0, 0, 0, 10, 2, NULL, 'epic', 54, 1, 1778745646, 1778745646),
  (55, 'wugu_transcend', '无谷超脱', '🍃', '脱离五谷依赖', 6, 1, 'advanced', 'body', 6, 3600, 86400, 700, 0, 0, 31557600, 280, 20, 0, NULL, 0, 0, 0, 0, 8, 2, NULL, 'epic', 55, 1, 1778745646, 1778745646),
  (56, 'linggen_awaken', '灵根觉醒', '🌱', '觉醒修炼灵根', 6, 1, 'secret', 'qi', 8, 3600, 86400, 1000, 0, 0, 31557600, 400, 28, 0, NULL, 0, 0, 1, 50, 5, 1, NULL, 'legendary', 56, 1, 1778745646, 1778745646),
  (57, 'qihai_stabilize', '气海稳固', '🌊', '稳固气海根基', 6, 1, 'basic', 'qi', 6, 3600, 86400, 650, 0, 0, 31557600, 260, 19, 0, NULL, 0, 0, 0, 0, 10, 2, NULL, 'epic', 57, 1, 1778745646, 1778745646),
  (58, 'lingli_refine', '灵力精炼', '✨', '提纯灵力质量', 6, 1, 'advanced', 'qi', 7, 3600, 86400, 850, 0, 0, 31557600, 340, 24, 0, NULL, 0, 0, 1, 45, 8, 1, NULL, 'legendary', 58, 1, 1778745646, 1778745646),
  (59, 'chaofan_step', '超凡初步', '🚀', '迈入超凡境界', 6, 1, 'secret', 'breakthrough', 9, 3600, 86400, 1200, 0, 0, 31557600, 480, 32, 0, NULL, 0, 0, 1, 80, 5, 1, NULL, 'mythic', 59, 1, 1778745646, 1778745646),
  (60, 'juling_complete', '聚灵圆满', '👑', '聚灵境大圆满', 6, 1, 'secret', 'breakthrough', 10, 3600, 86400, 1500, 0, 0, 31557600, 600, 40, 0, NULL, 0, 0, 1, 120, 3, 1, NULL, 'mythic', 60, 1, 1778745646, 1778745646),
  (61, 'shenshi_awaken', '神识初醒', '🧠', '开启神识之门', 7, 2, 'basic', 'soul', 6, 3600, 86400, 800, 0, 0, 63115200, 350, 25, 0, NULL, 0, 0, 0, 0, 10, 2, NULL, 'legendary', 61, 1, 1778745646, 1778745646),
  (62, 'naoyu_develop', '脑域开发', '💡', '开发大脑潜能', 7, 2, 'advanced', 'soul', 7, 3600, 86400, 1000, 0, 0, 63115200, 420, 30, 0, NULL, 0, 0, 1, 40, 8, 2, NULL, 'legendary', 62, 1, 1778745646, 1778745646),
  (63, 'shenshi_extend', '神识延伸', '📡', '延伸神识范围', 7, 2, 'basic', 'soul', 6, 3600, 86400, 850, 0, 0, 63115200, 370, 26, 0, NULL, 0, 0, 0, 0, 10, 2, NULL, 'legendary', 63, 1, 1778745646, 1778745646),
  (64, 'linghun_strengthen', '灵魂强化', '👻', '强化灵魂本质', 7, 2, 'advanced', 'soul', 8, 3600, 86400, 1200, 0, 0, 63115200, 500, 35, 0, NULL, 0, 0, 1, 50, 8, 1, NULL, 'legendary', 64, 1, 1778745646, 1778745646),
  (65, 'shenshi_attack', '神识攻击', '⚔️', '以神识攻击', 7, 2, 'advanced', 'soul', 7, 3600, 86400, 1100, 0, 0, 63115200, 460, 32, 0, NULL, 0, 0, 0, 0, 8, 2, NULL, 'legendary', 65, 1, 1778745646, 1778745646),
  (66, 'yuanshen_nurture', '元神孕育', '🌟', '孕育元神雏形', 7, 2, 'secret', 'soul', 9, 3600, 86400, 1500, 0, 0, 63115200, 620, 42, 0, NULL, 0, 0, 1, 70, 5, 1, NULL, 'mythic', 66, 1, 1778745646, 1778745646),
  (67, 'shenshi_defense', '神识防御', '🛡️', '构建神识防护', 7, 2, 'basic', 'soul', 6, 3600, 86400, 900, 0, 0, 63115200, 390, 28, 0, NULL, 0, 0, 0, 0, 10, 2, NULL, 'legendary', 67, 1, 1778745646, 1778745646),
  (68, 'lingtai_clear', '灵台清明', '🔮', '保持灵台清明', 7, 2, 'advanced', 'meditation', 7, 3600, 86400, 1150, 0, 0, 63115200, 480, 34, 0, NULL, 0, 0, 1, 45, 8, 2, NULL, 'legendary', 68, 1, 1778745646, 1778745646),
  (69, 'shenshi_fusion', '神识融合', '🔗', '神识与肉身融合', 7, 2, 'secret', 'breakthrough', 10, 3600, 86400, 1800, 0, 0, 63115200, 750, 50, 0, NULL, 0, 0, 1, 100, 5, 1, NULL, 'mythic', 69, 1, 1778745646, 1778745646),
  (70, 'shenshi_mastery', '神识至境', '👑', '神识境大圆满', 7, 2, 'secret', 'breakthrough', 11, 3600, 86400, 2200, 0, 0, 63115200, 900, 60, 0, NULL, 0, 0, 1, 150, 3, 1, NULL, 'mythic', 70, 1, 1778745646, 1778745646),
  (71, 'xuanfu_locate', '玄府定位', '🎯', '定位体内玄府', 8, 3, 'basic', 'body', 7, 3600, 86400, 1200, 0, 0, 94672800, 550, 38, 0, NULL, 0, 0, 0, 0, 10, 2, NULL, 'legendary', 71, 1, 1778745646, 1778745646),
  (72, 'kongji an_sense', '空间感知', '🌌', '感知空间法则', 8, 3, 'advanced', 'meditation', 8, 3600, 86400, 1500, 0, 0, 94672800, 680, 45, 0, NULL, 0, 0, 1, 45, 8, 2, NULL, 'legendary', 72, 1, 1778745646, 1778745646),
  (73, 'xuanfu_open', '玄府开辟', '🔓', '开辟体内玄府', 8, 3, 'advanced', 'body', 9, 3600, 86400, 1800, 0, 0, 94672800, 800, 52, 0, NULL, 0, 0, 1, 60, 8, 1, NULL, 'mythic', 73, 1, 1778745646, 1778745646),
  (74, 'yakongjian_build', '亚空间构建', '🏗️', '构建亚空间结构', 8, 3, 'secret', 'qi', 10, 3600, 86400, 2200, 0, 0, 94672800, 950, 62, 0, NULL, 0, 0, 1, 80, 5, 1, NULL, 'mythic', 74, 1, 1778745646, 1778745646),
  (75, 'xuanfu_stabilize', '玄府稳固', '⚓', '稳固玄府空间', 8, 3, 'basic', 'body', 7, 3600, 86400, 1300, 0, 0, 94672800, 600, 40, 0, NULL, 0, 0, 0, 0, 10, 2, NULL, 'legendary', 75, 1, 1778745646, 1778745646),
  (76, 'kongjian_store', '空间储物', '📦', '在玄府中储物', 8, 3, 'advanced', 'qi', 8, 3600, 86400, 1600, 0, 0, 94672800, 720, 48, 0, NULL, 0, 0, 0, 0, 8, 2, NULL, 'legendary', 76, 1, 1778745646, 1778745646),
  (77, 'xuanfu_expand', '玄府扩展', '📏', '扩大玄府容量', 8, 3, 'advanced', 'body', 9, 3600, 86400, 1900, 0, 0, 94672800, 840, 55, 0, NULL, 0, 0, 1, 65, 8, 1, NULL, 'mythic', 77, 1, 1778745646, 1778745646),
  (78, 'kongjian_teleport', '空间挪移', '🌀', '短距离空间移动', 8, 3, 'secret', 'qi', 11, 3600, 86400, 2500, 0, 0, 94672800, 1100, 70, 0, NULL, 0, 0, 1, 90, 5, 1, NULL, 'mythic', 78, 1, 1778745646, 1778745646),
  (79, 'xuanfu_perfect', '玄府完美', '💎', '玄府达到完美', 8, 3, 'secret', 'breakthrough', 12, 3600, 86400, 3000, 0, 0, 94672800, 1300, 80, 0, NULL, 0, 0, 1, 120, 5, 1, NULL, 'mythic', 79, 1, 1778745646, 1778745646),
  (80, 'xuanfu_transcend', '玄府超越', '👑', '玄府境大圆满', 8, 3, 'secret', 'breakthrough', 13, 3600, 86400, 3500, 0, 0, 94672800, 1500, 95, 0, NULL, 0, 0, 1, 180, 3, 1, NULL, 'mythic', 80, 1, 1778745646, 1778745646),
  (81, 'ningdan_prepare', '凝丹准备', '🔮', '为凝丹做准备', 9, 4, 'basic', 'qi', 8, 3600, 86400, 1800, 0, 0, 157788000, 800, 55, 0, NULL, 0, 0, 0, 0, 10, 2, NULL, 'legendary', 81, 1, 1778745646, 1778745646),
  (82, 'jindan_condense', '金丹凝聚', '⚪', '凝聚金丹雏形', 9, 4, 'advanced', 'qi', 9, 3600, 86400, 2200, 0, 0, 157788000, 980, 65, 0, NULL, 0, 0, 1, 50, 8, 2, NULL, 'mythic', 82, 1, 1778745646, 1778745646),
  (83, 'shouyuan_core', '寿元核心', '💫', '形成寿元核心', 9, 4, 'secret', 'qi', 11, 3600, 86400, 2800, 0, 0, 157788000, 1200, 78, 0, NULL, 0, 0, 1, 80, 5, 1, NULL, 'mythic', 83, 1, 1778745646, 1778745646),
  (84, 'jindan_refine', '金丹炼化', '🔥', '炼化金丹杂质', 9, 4, 'advanced', 'qi', 9, 3600, 86400, 2400, 0, 0, 157788000, 1050, 68, 0, NULL, 0, 0, 1, 55, 8, 2, NULL, 'mythic', 84, 1, 1778745646, 1778745646),
  (85, 'daowen_engrave', '道纹刻印', '📜', '在金丹上刻印道纹', 9, 4, 'secret', 'qi', 12, 3600, 86400, 3200, 0, 0, 157788000, 1400, 88, 0, NULL, 0, 0, 1, 90, 5, 1, NULL, 'mythic', 85, 1, 1778745646, 1778745646),
  (86, 'jindan_nourish', '金丹滋养', '💧', '滋养金丹成长', 9, 4, 'basic', 'qi', 8, 3600, 86400, 2000, 0, 0, 157788000, 880, 60, 0, NULL, 0, 0, 0, 0, 10, 2, NULL, 'legendary', 86, 1, 1778745646, 1778745646),
  (87, 'yuanying_seed', '元婴种子', '🌱', '种下元婴种子', 9, 4, 'secret', 'soul', 11, 3600, 86400, 3000, 0, 0, 157788000, 1300, 82, 0, NULL, 0, 0, 1, 85, 5, 1, NULL, 'mythic', 87, 1, 1778745646, 1778745646),
  (88, 'jindan_perfect', '金丹圆满', '✨', '金丹达到圆满', 9, 4, 'advanced', 'qi', 10, 3600, 86400, 2600, 0, 0, 157788000, 1150, 72, 0, NULL, 0, 0, 1, 70, 8, 1, NULL, 'mythic', 88, 1, 1778745646, 1778745646),
  (89, 'qiansui_barrier', '千岁屏障', '🚧', '突破千岁大关', 9, 4, 'secret', 'breakthrough', 13, 3600, 86400, 4000, 0, 0, 157788000, 1800, 110, 0, NULL, 0, 0, 1, 150, 5, 1, NULL, 'mythic', 89, 1, 1778745646, 1778745646),
  (90, 'ningdan_supreme', '凝丹至尊', '👑', '凝丹境大圆满', 9, 4, 'secret', 'breakthrough', 14, 3600, 86400, 5000, 0, 0, 157788000, 2200, 130, 0, NULL, 0, 0, 1, 200, 3, 1, NULL, 'mythic', 90, 1, 1778745646, 1778745646),
  (91, 'pojian_initiate', '破茧启程', '🦋', '开始破茧重生', 10, 1, 'basic', 'body', 9, 3600, 86400, 2500, 0, 0, 315576000, 1100, 75, 0, NULL, 0, 0, 0, 0, 10, 2, NULL, 'mythic', 91, 1, 1778745646, 1778745646),
  (92, 'routi_shed', '肉体蜕变', '🔄', '蜕去凡人肉体', 10, 1, 'advanced', 'body', 10, 3600, 86400, 3000, 0, 0, 315576000, 1350, 88, 0, NULL, 0, 0, 1, 60, 8, 2, NULL, 'mythic', 92, 1, 1778745646, 1778745646),
  (93, 'faju_form', '法躯成型', '✨', '凝聚法力之躯', 10, 1, 'secret', 'body', 12, 3600, 86400, 3800, 0, 0, 315576000, 1650, 105, 0, NULL, 0, 0, 1, 90, 5, 1, NULL, 'mythic', 93, 1, 1778745646, 1778745646),
  (94, 'fansu_transcend', '凡俗超脱', '🌟', '彻底超脱凡俗', 10, 1, 'advanced', 'soul', 10, 3600, 86400, 3200, 0, 0, 315576000, 1450, 92, 0, NULL, 0, 0, 1, 65, 8, 2, NULL, 'mythic', 94, 1, 1778745646, 1778745646),
  (95, 'faju_strengthen', '法躯强化', '💪', '强化法力之躯', 10, 1, 'basic', 'body', 9, 3600, 86400, 2700, 0, 0, 315576000, 1200, 80, 0, NULL, 0, 0, 0, 0, 10, 2, NULL, 'mythic', 95, 1, 1778745646, 1778745646),
  (96, 'xianli_convert', '仙力转化', '⚡', '灵力转化为仙力', 10, 1, 'secret', 'qi', 13, 3600, 86400, 4500, 0, 0, 315576000, 2000, 120, 0, NULL, 0, 0, 1, 110, 5, 1, NULL, 'mythic', 96, 1, 1778745646, 1778745646),
  (97, 'faju_perfect', '法躯完美', '💎', '法躯达到完美', 10, 1, 'advanced', 'body', 11, 3600, 86400, 3500, 0, 0, 315576000, 1550, 98, 0, NULL, 0, 0, 1, 75, 8, 1, NULL, 'mythic', 97, 1, 1778745646, 1778745646),
  (98, 'huajing_enter', '化境入门', '🚪', '进入化境期', 10, 1, 'secret', 'breakthrough', 14, 3600, 86400, 5000, 0, 0, 315576000, 2300, 135, 0, NULL, 0, 0, 1, 140, 5, 1, NULL, 'mythic', 98, 1, 1778745646, 1778745646),
  (99, 'pojian_rebirth', '破茧重生', '🦅', '完成破茧重生', 10, 1, 'secret', 'breakthrough', 15, 3600, 86400, 6000, 0, 0, 315576000, 2700, 155, 0, NULL, 0, 0, 1, 180, 5, 1, NULL, 'mythic', 99, 1, 1778745646, 1778745646),
  (100, 'pojian_ultimate', '破茧极境', '👑', '破茧境大圆满', 10, 1, 'secret', 'breakthrough', 16, 3600, 86400, 7500, 0, 0, 315576000, 3300, 185, 0, NULL, 0, 0, 1, 250, 3, 1, NULL, 'mythic', 100, 1, 1778745646, 1778745646),
  (101, 'huashen_begin', '化神启程', '👻', '开始元神修炼', 11, 2, 'basic', 'soul', 10, 3600, 86400, 4000, 0, 0, 631152000, 1800, 100, 0, NULL, 0, 0, 0, 0, 10, 2, NULL, 'mythic', 101, 1, 1778745655, 1778745655),
  (102, 'yuanshen_out', '元神出窍', '🌟', '元神脱离肉身', 11, 2, 'advanced', 'soul', 11, 3600, 86400, 5000, 0, 0, 631152000, 2200, 120, 0, NULL, 0, 0, 1, 70, 8, 2, NULL, 'mythic', 102, 1, 1778745655, 1778745655),
  (103, 'yuanshen_travel', '元神游历', '🚀', '元神自由游历', 11, 2, 'advanced', 'soul', 11, 3600, 86400, 5500, 0, 0, 631152000, 2400, 130, 0, NULL, 0, 0, 1, 75, 8, 2, NULL, 'mythic', 103, 1, 1778745655, 1778745655),
  (104, 'yuanshen_fight', '元神战斗', '⚔️', '以元神战斗', 11, 2, 'secret', 'soul', 13, 3600, 86400, 7000, 0, 0, 631152000, 3000, 155, 0, NULL, 0, 0, 1, 95, 5, 1, NULL, 'mythic', 104, 1, 1778745655, 1778745655),
  (105, 'routi_abandon', '肉体舍弃', '💀', '完全舍弃肉体依赖', 11, 2, 'advanced', 'body', 12, 3600, 86400, 6000, 0, 0, 631152000, 2600, 140, 0, NULL, 0, 0, 1, 80, 8, 1, NULL, 'mythic', 105, 1, 1778745655, 1778745655),
  (106, 'yuanshen_strengthen', '元神强化', '💪', '强化元神本质', 11, 2, 'basic', 'soul', 10, 3600, 86400, 4500, 0, 0, 631152000, 2000, 110, 0, NULL, 0, 0, 0, 0, 10, 2, NULL, 'mythic', 106, 1, 1778745655, 1778745655),
  (107, 'siwang_transcend', '死亡超越', '☠️', '超越死亡概念', 11, 2, 'secret', 'soul', 14, 3600, 86400, 8000, 0, 0, 631152000, 3500, 175, 0, NULL, 0, 0, 1, 110, 5, 1, NULL, 'mythic', 107, 1, 1778745655, 1778745655),
  (108, 'yuanshen_perfect', '元神圆满', '✨', '元神达到圆满', 11, 2, 'advanced', 'soul', 12, 3600, 86400, 6500, 0, 0, 631152000, 2800, 150, 0, NULL, 0, 0, 1, 85, 8, 1, NULL, 'mythic', 108, 1, 1778745655, 1778745655),
  (109, 'huashen_breakthrough', '化神突破', '🚪', '化神境突破', 11, 2, 'secret', 'breakthrough', 15, 3600, 86400, 10000, 0, 0, 631152000, 4500, 200, 0, NULL, 0, 0, 1, 160, 5, 1, NULL, 'mythic', 109, 1, 1778745655, 1778745655),
  (110, 'huashen_supreme', '化神至尊', '👑', '化神境大圆满', 11, 2, 'secret', 'breakthrough', 16, 3600, 86400, 12000, 0, 0, 631152000, 5500, 240, 0, NULL, 0, 0, 1, 220, 3, 1, NULL, 'mythic', 110, 1, 1778745655, 1778745655),
  (111, 'lianxu_start', '炼虚入门', '🌌', '开始炼虚修炼', 12, 3, 'basic', 'qi', 11, 3600, 86400, 6000, 0, 0, 946728000, 2700, 145, 0, NULL, 0, 0, 0, 0, 10, 2, NULL, 'mythic', 111, 1, 1778745655, 1778745655),
  (112, 'xukong_comprehend', '虚空领悟', '🕳️', '领悟虚空奥义', 12, 3, 'advanced', 'meditation', 12, 3600, 86400, 7500, 0, 0, 946728000, 3300, 170, 0, NULL, 0, 0, 1, 80, 8, 2, NULL, 'mythic', 112, 1, 1778745655, 1778745655),
  (113, 'kongjian_master', '空间掌控', '🎯', '完全掌控空间', 12, 3, 'secret', 'qi', 14, 3600, 86400, 10000, 0, 0, 946728000, 4500, 210, 0, NULL, 0, 0, 1, 110, 5, 1, NULL, 'mythic', 113, 1, 1778745655, 1778745655),
  (114, 'xukong_walk', '虚空行走', '👣', '在虚空中行走', 12, 3, 'advanced', 'qi', 13, 3600, 86400, 8500, 0, 0, 946728000, 3800, 190, 0, NULL, 0, 0, 1, 95, 8, 2, NULL, 'mythic', 114, 1, 1778745655, 1778745655),
  (115, 'kongjian_tear', '空间撕裂', '✂️', '撕裂空间', 12, 3, 'secret', 'qi', 15, 3600, 86400, 12000, 0, 0, 946728000, 5400, 240, 0, NULL, 0, 0, 1, 130, 5, 1, NULL, 'mythic', 115, 1, 1778745655, 1778745655),
  (116, 'xukong_refine', '虚空炼化', '🔥', '炼化虚空之力', 12, 3, 'advanced', 'qi', 13, 3600, 86400, 9000, 0, 0, 946728000, 4000, 200, 0, NULL, 0, 0, 1, 100, 8, 2, NULL, 'mythic', 116, 1, 1778745655, 1778745655),
  (117, 'kongjian_create', '空间创造', '🏗️', '创造独立空间', 12, 3, 'secret', 'qi', 16, 3600, 86400, 15000, 0, 0, 946728000, 6800, 280, 0, NULL, 0, 0, 1, 150, 5, 1, NULL, 'mythic', 117, 1, 1778745655, 1778745655),
  (118, 'lianxu_perfect', '炼虚完美', '💎', '炼虚达到完美', 12, 3, 'advanced', 'qi', 14, 3600, 86400, 11000, 0, 0, 946728000, 4900, 230, 0, NULL, 0, 0, 1, 120, 8, 1, NULL, 'mythic', 118, 1, 1778745655, 1778745655),
  (119, 'lianxu_transcend', '炼虚超越', '🌟', '超越炼虚极限', 12, 3, 'secret', 'breakthrough', 17, 3600, 86400, 18000, 0, 0, 946728000, 8100, 340, 0, NULL, 0, 0, 1, 180, 5, 1, NULL, 'mythic', 119, 1, 1778745655, 1778745655),
  (120, 'lianxu_ultimate', '炼虚极境', '👑', '炼虚境大圆满', 12, 3, 'secret', 'breakthrough', 18, 3600, 86400, 22000, 0, 0, 946728000, 9900, 400, 0, NULL, 0, 0, 1, 250, 3, 1, NULL, 'mythic', 120, 1, 1778745655, 1778745655),
  (121, 'hedao_initiate', '合道启程', '🌍', '开始与天地合道', 13, 4, 'basic', 'meditation', 12, 3600, 86400, 9000, 0, 0, 1262304000, 4100, 220, 0, NULL, 0, 0, 0, 0, 10, 2, NULL, 'mythic', 121, 1, 1778745655, 1778745655),
  (123, 'dao_comprehend', '道法领悟', '📜', '领悟天地大道', 13, 4, 'secret', 'meditation', 15, 3600, 86400, 15000, 0, 0, 1262304000, 6800, 320, 0, NULL, 0, 0, 1, 130, 5, 1, NULL, 'mythic', 123, 1, 1778745655, 1778745655),
  (124, 'yizhi_merge', '意志融合', '🔗', '意志与天地融合', 13, 4, 'secret', 'soul', 16, 3600, 86400, 18000, 0, 0, 1262304000, 8200, 370, 0, NULL, 0, 0, 1, 150, 5, 1, NULL, 'mythic', 124, 1, 1778745655, 1778745655),
  (125, 'tiandi_borrow', '天地借力', '⚡', '借用天地之力', 13, 4, 'advanced', 'qi', 14, 3600, 86400, 13000, 0, 0, 1262304000, 5900, 290, 0, NULL, 0, 0, 1, 110, 8, 2, NULL, 'mythic', 125, 1, 1778745655, 1778745655),
  (126, 'dao_mark', '道痕刻印', '✍️', '刻印道之痕迹', 13, 4, 'secret', 'soul', 17, 3600, 86400, 20000, 0, 0, 1262304000, 9100, 410, 0, NULL, 0, 0, 1, 170, 5, 1, NULL, 'mythic', 126, 1, 1778745655, 1778745655),
  (127, 'hedao_stabilize', '合道稳固', '⚓', '稳固合道状态', 13, 4, 'basic', 'meditation', 13, 3600, 86400, 10000, 0, 0, 1262304000, 4500, 240, 0, NULL, 0, 0, 0, 0, 10, 2, NULL, 'mythic', 127, 1, 1778745655, 1778745655),
  (128, 'tiandi_control', '天地掌控', '🎮', '部分掌控天地', 13, 4, 'advanced', 'qi', 15, 3600, 86400, 16000, 0, 0, 1262304000, 7300, 350, 0, NULL, 0, 0, 1, 140, 8, 1, NULL, 'mythic', 128, 1, 1778745655, 1778745655),
  (129, 'hedao_perfect', '合道圆满', '✨', '合道达到圆满', 13, 4, 'secret', 'breakthrough', 18, 3600, 86400, 25000, 0, 0, 1262304000, 11400, 480, 0, NULL, 0, 0, 1, 200, 5, 1, NULL, 'mythic', 129, 1, 1778745655, 1778745655),
  (130, 'hedao_supreme', '合道至尊', '👑', '合道境大圆满', 13, 4, 'secret', 'breakthrough', 19, 3600, 86400, 30000, 0, 0, 1262304000, 13700, 560, 0, NULL, 0, 0, 1, 280, 3, 1, NULL, 'mythic', 130, 1, 1778745655, 1778745655),
  (201, 'hedao_breakthrough', '合道突破', '💥', '突破合道境界的关键修炼，大幅提升境界感悟', 13, 0, 'secret', 'breakthrough', 21, 86400, 172800, 60000, 2592000, 0, 1262304000, 60000, 150, 1500, 'breakthrough_boost', 30, 86400, 1, 30, 50, 1, NULL, 'legendary', 10, 1, 1778745709, 1778745709),
  (131, 'duoe_prepare', '渡厄准备', '🛡️', '为渡劫做准备', 14, 5, 'basic', 'body', 14, 3600, 86400, 15000, 0, 0, 1577880000, 6900, 350, 0, NULL, 0, 0, 0, 0, 10, 2, NULL, 'mythic', 131, 1, 1778745655, 1778745655),
  (132, 'sijie_face', '死劫直面', '☠️', '直面死亡之劫', 14, 5, 'advanced', 'soul', 15, 3600, 86400, 18000, 0, 0, 1577880000, 8300, 410, 0, NULL, 0, 0, 1, 100, 8, 2, NULL, 'mythic', 132, 1, 1778745655, 1778745655),
  (133, 'shengsi_transcend', '生死超脱', '♾️', '超脱生死轮回', 14, 5, 'secret', 'soul', 17, 3600, 86400, 25000, 0, 0, 1577880000, 11500, 520, 0, NULL, 0, 0, 1, 150, 5, 1, NULL, 'mythic', 133, 1, 1778745655, 1778745655),
  (134, 'jie_resist', '劫难抵抗', '🛡️', '抵抗劫难侵蚀', 14, 5, 'advanced', 'body', 16, 3600, 86400, 20000, 0, 0, 1577880000, 9200, 450, 0, NULL, 0, 0, 1, 120, 8, 2, NULL, 'mythic', 134, 1, 1778745655, 1778745655),
  (135, 'shouyuan_lock', '寿元锁定', '🔒', '锁定寿元流逝', 14, 5, 'secret', 'qi', 18, 3600, 86400, 28000, 0, 0, 1577880000, 12900, 580, 0, NULL, 0, 0, 1, 170, 5, 1, NULL, 'mythic', 135, 1, 1778745655, 1778745655),
  (136, 'duoe_breakthrough', '渡厄突破', '💥', '突破死劫封锁', 14, 5, 'secret', 'breakthrough', 19, 3600, 86400, 35000, 0, 0, 1577880000, 16100, 680, 0, NULL, 0, 0, 1, 200, 5, 1, NULL, 'mythic', 136, 1, 1778745655, 1778745655),
  (137, 'jienan_adapt', '劫难适应', '🧬', '适应劫难环境', 14, 5, 'basic', 'body', 15, 3600, 86400, 17000, 0, 0, 1577880000, 7800, 390, 0, NULL, 0, 0, 0, 0, 10, 2, NULL, 'mythic', 137, 1, 1778745655, 1778745655),
  (138, 'sijie_overcome', '死劫克服', '✅', '克服死亡之劫', 14, 5, 'advanced', 'soul', 17, 3600, 86400, 23000, 0, 0, 1577880000, 10600, 500, 0, NULL, 0, 0, 1, 160, 8, 1, NULL, 'mythic', 138, 1, 1778745655, 1778745655),
  (139, 'duoe_perfect', '渡厄圆满', '✨', '渡厄达到圆满', 14, 5, 'secret', 'breakthrough', 20, 3600, 86400, 40000, 0, 0, 1577880000, 18400, 780, 0, NULL, 0, 0, 1, 240, 5, 1, NULL, 'mythic', 139, 1, 1778745655, 1778745655),
  (140, 'duoe_ultimate', '渡厄极境', '👑', '渡厄境大圆满', 14, 5, 'secret', 'breakthrough', 21, 3600, 86400, 50000, 0, 0, 1577880000, 23000, 920, 0, NULL, 0, 0, 1, 320, 3, 1, NULL, 'mythic', 140, 1, 1778745655, 1778745655),
  (141, 'dacheng_enter', '大乘入门', '🚪', '进入大乘境界', 15, 1, 'basic', 'qi', 16, 3600, 86400, 25000, 0, 0, 3155760000, 11600, 580, 0, NULL, 0, 0, 0, 0, 10, 2, NULL, 'mythic', 141, 1, 1778745655, 1778745655),
  (142, 'fali_perfect', '法力圆满', '⭕', '法力达到圆满', 15, 1, 'advanced', 'qi', 17, 3600, 86400, 30000, 0, 0, 3155760000, 13900, 680, 0, NULL, 0, 0, 1, 110, 8, 2, NULL, 'mythic', 142, 1, 1778745655, 1778745655),
  (143, 'xianshu_master', '仙术精通', '✨', '精通各种仙术', 15, 1, 'advanced', 'qi', 18, 3600, 86400, 35000, 0, 0, 3155760000, 16200, 780, 0, NULL, 0, 0, 1, 130, 8, 2, NULL, 'mythic', 143, 1, 1778745655, 1778745655),
  (144, 'jiban_cut', '羁绊斩断', '✂️', '斩断现世羁绊', 15, 1, 'secret', 'soul', 19, 3600, 86400, 45000, 0, 0, 3155760000, 20800, 940, 0, NULL, 0, 0, 1, 170, 5, 1, NULL, 'mythic', 144, 1, 1778745655, 1778745655),
  (145, 'fali_transform', '法力蜕变', '🦋', '法力质的飞跃', 15, 1, 'secret', 'qi', 20, 3600, 86400, 50000, 0, 0, 3155760000, 23100, 1050, 0, NULL, 0, 0, 1, 190, 5, 1, NULL, 'mythic', 145, 1, 1778745655, 1778745655),
  (146, 'dacheng_stabilize', '大乘稳固', '⚓', '稳固大乘境界', 15, 1, 'basic', 'qi', 17, 3600, 86400, 28000, 0, 0, 3155760000, 12900, 640, 0, NULL, 0, 0, 0, 0, 10, 2, NULL, 'mythic', 146, 1, 1778745655, 1778745655),
  (147, 'xianli_pure', '仙力纯化', '💎', '纯化仙力本质', 15, 1, 'advanced', 'qi', 19, 3600, 86400, 40000, 0, 0, 3155760000, 18500, 880, 0, NULL, 0, 0, 1, 160, 8, 1, NULL, 'mythic', 147, 1, 1778745655, 1778745655),
  (148, 'dacheng_transcend', '大乘超越', '🚀', '超越大乘极限', 15, 1, 'secret', 'breakthrough', 21, 3600, 86400, 60000, 0, 0, 3155760000, 27700, 1200, 0, NULL, 0, 0, 1, 220, 5, 1, NULL, 'mythic', 148, 1, 1778745655, 1778745655),
  (149, 'dacheng_perfect', '大乘圆满', '✨', '大乘达到圆满', 15, 1, 'secret', 'breakthrough', 22, 3600, 86400, 70000, 0, 0, 3155760000, 32300, 1380, 0, NULL, 0, 0, 1, 270, 5, 1, NULL, 'mythic', 149, 1, 1778745655, 1778745655),
  (150, 'dacheng_supreme', '大乘至尊', '👑', '大乘境大圆满', 15, 1, 'secret', 'breakthrough', 23, 3600, 86400, 85000, 0, 0, 3155760000, 39200, 1600, 0, NULL, 0, 0, 1, 350, 3, 1, NULL, 'mythic', 150, 1, 1778745655, 1778745655),
  (151, 'zhanyin_begin', '斩因启程', '✂️', '开始斩断因果', 16, 2, 'basic', 'soul', 18, 3600, 86400, 40000, 0, 0, 6311520000, 18600, 920, 0, NULL, 0, 0, 0, 0, 10, 2, NULL, 'mythic', 151, 1, 1778745662, 1778745662),
  (152, 'yinguo_see', '因果洞察', '👁️', '洞察因果线', 16, 2, 'advanced', 'meditation', 19, 3600, 86400, 50000, 0, 0, 6311520000, 23200, 1100, 0, NULL, 0, 0, 1, 120, 8, 2, NULL, 'mythic', 152, 1, 1778745662, 1778745662),
  (153, 'yinguo_cut', '因果斩断', '⚔️', '斩断因果联系', 16, 2, 'secret', 'soul', 21, 3600, 86400, 65000, 0, 0, 6311520000, 30100, 1350, 0, NULL, 0, 0, 1, 170, 5, 1, NULL, 'mythic', 153, 1, 1778745662, 1778745662),
  (154, 'zhoujiu_immune', '咒诅免疫', '🛡️', '免疫咒诅攻击', 16, 2, 'advanced', 'soul', 20, 3600, 86400, 55000, 0, 0, 6311520000, 25500, 1200, 0, NULL, 0, 0, 1, 140, 8, 2, NULL, 'mythic', 154, 1, 1778745662, 1778745662),
  (155, 'tuisuan_resist', '推算抵抗', '🔮', '抵抗他人推算', 16, 2, 'advanced', 'soul', 20, 3600, 86400, 58000, 0, 0, 6311520000, 26900, 1250, 0, NULL, 0, 0, 1, 150, 8, 2, NULL, 'mythic', 155, 1, 1778745662, 1778745662),
  (156, 'yinguo_reverse', '因果逆转', '🔄', '逆转因果关系', 16, 2, 'secret', 'soul', 22, 3600, 86400, 75000, 0, 0, 6311520000, 34700, 1550, 0, NULL, 0, 0, 1, 200, 5, 1, NULL, 'mythic', 156, 1, 1778745662, 1778745662),
  (157, 'zhanyin_stabilize', '斩因稳固', '⚓', '稳固斩因成果', 16, 2, 'basic', 'soul', 19, 3600, 86400, 45000, 0, 0, 6311520000, 20800, 1000, 0, NULL, 0, 0, 0, 0, 10, 2, NULL, 'mythic', 157, 1, 1778745662, 1778745662),
  (158, 'yinguo_master', '因果掌控', '🎮', '掌控因果之力', 16, 2, 'secret', 'soul', 23, 3600, 86400, 85000, 0, 0, 6311520000, 39400, 1750, 0, NULL, 0, 0, 1, 230, 5, 1, NULL, 'mythic', 158, 1, 1778745662, 1778745662),
  (159, 'zhanyin_perfect', '斩因圆满', '✨', '斩因达到圆满', 16, 2, 'secret', 'breakthrough', 24, 3600, 86400, 100000, 0, 0, 6311520000, 46300, 2000, 0, NULL, 0, 0, 1, 280, 5, 1, NULL, 'mythic', 159, 1, 1778745662, 1778745662),
  (160, 'zhanyin_ultimate', '斩因极境', '👑', '斩因境大圆满', 16, 2, 'secret', 'breakthrough', 25, 3600, 86400, 120000, 0, 0, 6311520000, 55500, 2350, 0, NULL, 0, 0, 1, 380, 3, 1, NULL, 'mythic', 160, 1, 1778745662, 1778745662),
  (161, 'suyuan_initiate', '溯源启程', '🔍', '开始追溯本源', 17, 3, 'basic', 'soul', 20, 3600, 86400, 60000, 0, 0, 9467280000, 27800, 1380, 0, NULL, 0, 0, 0, 0, 10, 2, NULL, 'mythic', 161, 1, 1778745662, 1778745662),
  (162, 'shengming_trace', '生命追溯', '🧬', '追溯生命起源', 17, 3, 'advanced', 'soul', 21, 3600, 86400, 75000, 0, 0, 9467280000, 34800, 1650, 0, NULL, 0, 0, 1, 140, 8, 2, NULL, 'mythic', 162, 1, 1778745662, 1778745662),
  (163, 'benyuan_find', '本源寻找', '🎯', '寻找本源所在', 17, 3, 'secret', 'soul', 23, 3600, 86400, 95000, 0, 0, 9467280000, 44000, 2000, 0, NULL, 0, 0, 1, 190, 5, 1, NULL, 'mythic', 163, 1, 1778745662, 1778745662),
  (164, 'bianma_decode', '编码解析', '💻', '解析生命编码', 17, 3, 'advanced', 'meditation', 22, 3600, 86400, 80000, 0, 0, 9467280000, 37100, 1750, 0, NULL, 0, 0, 1, 160, 8, 2, NULL, 'mythic', 164, 1, 1778745662, 1778745662),
  (165, 'benyuan_touch', '本源触及', '👆', '触及本源核心', 17, 3, 'secret', 'soul', 24, 3600, 86400, 110000, 0, 0, 9467280000, 51000, 2300, 0, NULL, 0, 0, 1, 220, 5, 1, NULL, 'mythic', 165, 1, 1778745662, 1778745662),
  (166, 'shengming_rewrite', '生命重写', '✍️', '重写生命编码', 17, 3, 'secret', 'soul', 25, 3600, 86400, 130000, 0, 0, 9467280000, 60200, 2650, 0, NULL, 0, 0, 1, 260, 5, 1, NULL, 'mythic', 166, 1, 1778745662, 1778745662),
  (167, 'suyuan_stabilize', '溯源稳固', '⚓', '稳固溯源状态', 17, 3, 'basic', 'soul', 21, 3600, 86400, 70000, 0, 0, 9467280000, 32400, 1550, 0, NULL, 0, 0, 0, 0, 10, 2, NULL, 'mythic', 167, 1, 1778745662, 1778745662),
  (168, 'benyuan_merge', '本源融合', '🔗', '与本源融合', 17, 3, 'secret', 'soul', 26, 3600, 86400, 150000, 0, 0, 9467280000, 69500, 3000, 0, NULL, 0, 0, 1, 300, 5, 1, NULL, 'mythic', 168, 1, 1778745662, 1778745662),
  (169, 'suyuan_perfect', '溯源圆满', '✨', '溯源达到圆满', 17, 3, 'secret', 'breakthrough', 27, 3600, 86400, 180000, 0, 0, 9467280000, 83400, 3500, 0, NULL, 0, 0, 1, 360, 5, 1, NULL, 'mythic', 169, 1, 1778745662, 1778745662),
  (170, 'suyuan_ultimate', '溯源极境', '👑', '溯源境大圆满', 17, 3, 'secret', 'breakthrough', 28, 3600, 86400, 220000, 0, 0, 9467280000, 101900, 4200, 0, NULL, 0, 0, 1, 480, 3, 1, NULL, 'mythic', 170, 1, 1778745662, 1778745662),
  (171, 'lunhui_enter', '轮回入门', '🔄', '进入轮回之道', 18, 4, 'basic', 'soul', 22, 3600, 86400, 100000, 0, 0, 15778800000, 46400, 2300, 0, NULL, 0, 0, 0, 0, 10, 2, NULL, 'mythic', 171, 1, 1778745662, 1778745662),
  (172, 'shengsi_control', '生死掌控', '⚖️', '掌控生死之力', 18, 4, 'advanced', 'soul', 23, 3600, 86400, 125000, 0, 0, 15778800000, 58000, 2750, 0, NULL, 0, 0, 1, 160, 8, 2, NULL, 'mythic', 172, 1, 1778745662, 1778745662),
  (173, 'lunhui_see', '轮回洞察', '👁️', '洞察轮回奥秘', 18, 4, 'advanced', 'meditation', 24, 3600, 86400, 140000, 0, 0, 15778800000, 64900, 3050, 0, NULL, 0, 0, 1, 180, 8, 2, NULL, 'mythic', 173, 1, 1778745662, 1778745662),
  (174, 'shouyuan_grant', '寿元赐予', '🎁', '赐予他人寿元', 18, 4, 'secret', 'qi', 26, 3600, 86400, 180000, 0, 0, 15778800000, 83500, 3800, 0, NULL, 0, 0, 1, 240, 5, 1, NULL, 'mythic', 174, 1, 1778745662, 1778745662),
  (175, 'shengsi_reverse', '生死逆转', '🔄', '逆转生死状态', 18, 4, 'secret', 'soul', 27, 3600, 86400, 200000, 0, 0, 15778800000, 92700, 4200, 0, NULL, 0, 0, 1, 280, 5, 1, NULL, 'mythic', 175, 1, 1778745662, 1778745662),
  (176, 'lunhui_master', '轮回主宰', '👑', '成为轮回主宰', 18, 4, 'secret', 'soul', 28, 3600, 86400, 250000, 0, 0, 15778800000, 115900, 5000, 0, NULL, 0, 0, 1, 340, 5, 1, NULL, 'mythic', 176, 1, 1778745662, 1778745662),
  (178, 'lunhui_stabilize', '轮回稳固', '⚓', '稳固轮回之力', 18, 4, 'basic', 'soul', 23, 3600, 86400, 120000, 0, 0, 15778800000, 55600, 2650, 0, NULL, 0, 0, 0, 0, 10, 2, NULL, 'mythic', 178, 1, 1778745662, 1778745662),
  (179, 'lunhui_perfect', '轮回圆满', '✨', '轮回达到圆满', 18, 4, 'secret', 'breakthrough', 29, 3600, 86400, 300000, 0, 0, 15778800000, 139100, 5800, 0, NULL, 0, 0, 1, 420, 5, 1, NULL, 'mythic', 179, 1, 1778745662, 1778745662),
  (180, 'lunhui_ultimate', '轮回极境', '👑', '轮回境大圆满', 18, 4, 'secret', 'breakthrough', 30, 3600, 86400, 380000, 0, 0, 15778800000, 176100, 7200, 0, NULL, 0, 0, 1, 560, 3, 1, NULL, 'mythic', 180, 1, 1778745662, 1778745662),
  (202, 'lunhui_transcend', '轮回超脱', '🌟', '超越轮回束缚的终极修炼，接近永恒之道', 18, 0, 'forbidden', 'breakthrough', 33, 259200, 518400, 2000000, 10368000, 0, 15778800000, 2000000, 500, 5000, 'transcendence', 50, 259200, 1, 50, 50, 1, NULL, 'mythic', 10, 1, 1778745723, 1778745723),
  (181, 'niepan_begin', '涅槃启程', '🔥', '开始涅槃修炼', 19, 1, 'basic', 'soul', 25, 3600, 86400, 200000, 0, 0, 31557600000, 92800, 4600, 0, NULL, 0, 0, 0, 0, 10, 2, NULL, 'mythic', 181, 1, 1778745662, 1778745662),
  (182, 'huimie_resist', '毁灭抵抗', '🛡️', '抵抗宇宙毁灭', 19, 1, 'advanced', 'body', 26, 3600, 86400, 250000, 0, 0, 31557600000, 116000, 5500, 0, NULL, 0, 0, 1, 180, 8, 2, NULL, 'mythic', 182, 1, 1778745662, 1778745662),
  (183, 'chongsheng_master', '重生掌握', '🦅', '掌握涅槃重生', 19, 1, 'secret', 'soul', 28, 3600, 86400, 320000, 0, 0, 31557600000, 148400, 6800, 0, NULL, 0, 0, 1, 260, 5, 1, NULL, 'mythic', 183, 1, 1778745662, 1778745662),
  (184, 'yuzhou_transcend', '宇宙超越', '🌌', '超越宇宙限制', 19, 1, 'secret', 'soul', 29, 3600, 86400, 380000, 0, 0, 31557600000, 176200, 7900, 0, NULL, 0, 0, 1, 320, 5, 1, NULL, 'mythic', 184, 1, 1778745662, 1778745662),
  (185, 'niepan_fire', '涅槃之火', '🔥', '点燃涅槃之火', 19, 1, 'advanced', 'qi', 27, 3600, 86400, 280000, 0, 0, 31557600000, 129800, 6100, 0, NULL, 0, 0, 1, 220, 8, 2, NULL, 'mythic', 185, 1, 1778745662, 1778745662),
  (186, 'jiuci_survive', '九次不死', '♾️', '经历九次毁灭', 19, 1, 'secret', 'soul', 30, 3600, 86400, 500000, 0, 0, 31557600000, 231800, 10000, 0, NULL, 0, 0, 1, 400, 5, 1, NULL, 'mythic', 186, 1, 1778745662, 1778745662),
  (187, 'xiaolv_boost', '效率提升', '⚡', '每次重生提升效率', 19, 1, 'advanced', 'qi', 28, 3600, 86400, 350000, 0, 0, 31557600000, 162300, 7400, 0, NULL, 0, 0, 1, 280, 8, 1, NULL, 'mythic', 187, 1, 1778745662, 1778745662),
  (188, 'niepan_stabilize', '涅槃稳固', '⚓', '稳固涅槃状态', 19, 1, 'basic', 'soul', 26, 3600, 86400, 240000, 0, 0, 31557600000, 111300, 5300, 0, NULL, 0, 0, 0, 0, 10, 2, NULL, 'mythic', 188, 1, 1778745662, 1778745662),
  (189, 'niepan_perfect', '涅槃圆满', '✨', '涅槃达到圆满', 19, 1, 'secret', 'breakthrough', 31, 3600, 86400, 600000, 0, 0, 31557600000, 278200, 11500, 0, NULL, 0, 0, 1, 500, 5, 1, NULL, 'mythic', 189, 1, 1778745662, 1778745662),
  (190, 'niepan_ultimate', '涅槃极境', '👑', '涅槃境大圆满', 19, 1, 'secret', 'breakthrough', 32, 3600, 86400, 800000, 0, 0, 31557600000, 370800, 15000, 0, NULL, 0, 0, 1, 680, 3, 1, NULL, 'mythic', 190, 1, 1778745662, 1778745662),
  (191, 'yongheng_enter', '永恒入门', '♾️', '踏入永恒之境', 20, 2, 'basic', 'soul', 28, 3600, 86400, 500000, 0, 0, 157788000000, 232000, 11500, 0, NULL, 0, 0, 0, 0, 10, 2, NULL, 'mythic', 191, 1, 1778745662, 1778745662),
  (192, 'shijian_transcend', '时间超越', '⏰', '超越时间限制', 20, 2, 'advanced', 'meditation', 29, 3600, 86400, 650000, 0, 0, 157788000000, 301500, 14000, 0, NULL, 0, 0, 1, 200, 8, 2, NULL, 'mythic', 192, 1, 1778745662, 1778745662),
  (193, 'yongheng_body', '永恒之躯', '💎', '凝聚永恒之躯', 20, 2, 'secret', 'body', 31, 3600, 86400, 850000, 0, 0, 157788000000, 394200, 17500, 0, NULL, 0, 0, 1, 300, 5, 1, NULL, 'mythic', 193, 1, 1778745662, 1778745662),
  (194, 'shouyuan_infinite', '寿元无限', '∞', '寿元趋于无限', 20, 2, 'secret', 'qi', 32, 3600, 86400, 1000000, 0, 0, 157788000000, 463800, 20000, 0, NULL, 0, 0, 1, 380, 5, 1, NULL, 'mythic', 194, 1, 1778745662, 1778745662),
  (195, 'shijian_control', '时间掌控', '🎮', '完全掌控时间', 20, 2, 'secret', 'soul', 33, 3600, 86400, 1200000, 0, 0, 157788000000, 556400, 23500, 0, NULL, 0, 0, 1, 460, 5, 1, NULL, 'mythic', 195, 1, 1778745662, 1778745662),
  (196, 'yongheng_will', '永恒意志', '🧠', '凝聚永恒意志', 20, 2, 'advanced', 'soul', 30, 3600, 86400, 750000, 0, 0, 157788000000, 347800, 16000, 0, NULL, 0, 0, 1, 260, 8, 1, NULL, 'mythic', 196, 1, 1778745662, 1778745662),
  (197, 'weidu_transcend', '维度超越', '🌌', '超越维度限制', 20, 2, 'secret', 'soul', 34, 3600, 86400, 1500000, 0, 0, 157788000000, 695400, 28000, 0, NULL, 0, 0, 1, 560, 5, 1, NULL, 'mythic', 197, 1, 1778745662, 1778745662),
  (198, 'yongheng_stabilize', '永恒稳固', '⚓', '稳固永恒状态', 20, 2, 'basic', 'soul', 29, 3600, 86400, 600000, 0, 0, 157788000000, 278300, 13000, 0, NULL, 0, 0, 0, 0, 10, 2, NULL, 'mythic', 198, 1, 1778745662, 1778745662),
  (199, 'yongheng_perfect', '永恒圆满', '✨', '永恒达到圆满', 20, 2, 'secret', 'breakthrough', 35, 3600, 86400, 2000000, 0, 0, 157788000000, 927000, 35000, 0, NULL, 0, 0, 1, 700, 5, 1, NULL, 'mythic', 199, 1, 1778745662, 1778745662),
  (200, 'yongheng_ultimate', '永恒极境', '👑', '永恒境大圆满，修炼之路终点', 20, 2, 'secret', 'breakthrough', 36, 3600, 86400, 3000000, 0, 0, 157788000000, 1390500, 50000, 0, NULL, 0, 0, 1, 1000, 3, 1, NULL, 'mythic', 200, 1, 1778745662, 1778745662);

-- ==================== POTIONS_CONFIG ====================
INSERT OR REPLACE INTO potions_config (id, emoji, name, desc, cost, type, instant_life, instant_merit, dur, dur_decay_reduction, dur_merit_boost, sort_order, is_active, realm_id, min_realm_id, max_realm_id, rarity, category) VALUES
  ('foundation_pill_1', '🔮', '筑基丹', '稳固修为根基，降低衰减5%，持续12小时', 15, 'merit', 0, 0, 43200, 0.05, 0, 2, 1, 1, 1, 5, 'common', 'buff'),
  ('healing_pill_1', '🌿', '疗伤丹', '治疗轻伤，增加寿命30分钟', 8, 'merit', 315576, 0, 0, 0, 0, 3, 1, 1, 1, 5, 'common', 'recovery'),
  ('qi_gathering_pill_1', '💊', '聚气丹', '凝聚天地灵气，增加寿命1小时', 10, 'merit', 315576, 0, 0, 0, 0, 1, 1, 1, 1, 5, 'common', 'recovery'),
  ('spirit_pill_1', '✨', '灵气丹', '补充灵力，降低衰减3%，持续6小时', 12, 'merit', 0, 0, 21600, 0.03, 0, 4, 1, 1, 1, 5, 'common', 'buff'),
  ('vitality_pill_1', '❤️', '活力丹', '恢复体力，增加寿命45分钟', 10, 'merit', 315576, 0, 0, 0, 0, 5, 1, 1, 1, 5, 'common', 'recovery'),
  ('clarity_pill_1', '🧠', '清心丹', '清除杂念，降低衰减4%，持续8小时', 13, 'merit', 0, 0, 28800, 0.04, 0, 6, 1, 1, 1, 5, 'rare', 'buff'),
  ('blood_pill_2', '🩸', '补血丹', '补充气血，降低衰减6%，持续12小时', 20, 'merit', 0, 0, 43200, 0.06, 0, 11, 1, 2, 2, 5, 'common', 'buff'),
  ('bone_pill_2', '🦴', '强骨丹', '强化骨骼，增加寿命1小时', 16, 'merit', 315576, 0, 0, 0, 0, 12, 1, 2, 2, 5, 'common', 'recovery'),
  ('meridian_pill_2', '🌊', '通脉丹', '疏通经脉，增加寿命1.5小时', 18, 'merit', 315576, 0, 0, 0, 0, 10, 1, 2, 2, 5, 'common', 'recovery'),
  ('essence_pill_2', '💫', '凝元丹', '凝聚元气，降低衰减7%，持续10小时', 22, 'merit', 0, 0, 36000, 0.07, 0, 13, 1, 2, 2, 5, 'rare', 'buff'),
  ('recovery_pill_2', '🌸', '回春丹', '快速恢复，增加寿命2小时', 25, 'merit', 1577880, 0, 0, 0, 0, 14, 1, 2, 2, 5, 'rare', 'recovery'),
  ('marrow_pill_3', '🏔️', '洗髓丹', '洗涤骨髓，增加寿命2.5小时', 30, 'merit', 315576, 0, 0, 0, 0, 20, 1, 3, 3, 5, 'common', 'recovery'),
  ('purify_pill_3', '🌟', '净化丹', '净化杂质，降低衰减8%，持续14小时', 35, 'merit', 0, 0, 50400, 0.08, 0, 21, 1, 3, 3, 5, 'common', 'buff'),
  ('strength_pill_3', '💪', '力量丹', '增强体质，增加寿命2小时', 28, 'merit', 315576, 0, 0, 0, 0, 22, 1, 3, 3, 5, 'common', 'recovery'),
  ('divine_pill_3', '⚡', '神力丹', '激发潜能，降低衰减10%，持续16小时', 45, 'merit', 0, 0, 57600, 0.1, 0, 25, 1, 3, 3, 5, 'epic', 'buff'),
  ('longevity_pill_3', '🕉️', '延寿丹', '延长寿命，增加寿命3小时', 40, 'merit', 1577880, 0, 0, 0, 0, 24, 1, 3, 3, 5, 'rare', 'recovery'),
  ('wisdom_pill_3', '📚', '悟道丹', '提升悟性，降低衰减9%，持续12小时', 38, 'merit', 0, 0, 43200, 0.09, 0, 23, 1, 3, 3, 5, 'rare', 'buff'),
  ('blood_refine_pill_4', '🔴', '炼血丹', '炼化血液，增加寿命3小时', 50, 'merit', 315576, 0, 0, 0, 0, 30, 1, 4, 4, 5, 'common', 'recovery'),
  ('circulation_pill_4', '🔄', '循环丹', '加速循环，降低衰减10%，持续16小时', 55, 'merit', 0, 0, 57600, 0.1, 0, 31, 1, 4, 4, 5, 'common', 'buff'),
  ('immortal_pill_4', '🌈', '仙元丹', '仙气灌体，增加寿命4小时', 65, 'merit', 7889400, 0, 0, 0, 0, 34, 1, 4, 4, 5, 'epic', 'recovery'),
  ('phoenix_pill_4', '🔥', '凤血丹', '涅槃重生，降低衰减12%，持续18小时', 60, 'merit', 0, 0, 64800, 0.12, 0, 33, 1, 4, 4, 5, 'rare', 'buff'),
  ('vitality_boost_4', '💖', '生机丹', '激发生机，增加寿命3.5小时', 52, 'merit', 1577880, 0, 0, 0, 0, 32, 1, 4, 4, 5, 'rare', 'recovery'),
  ('crystal_pill_5', '💠', '晶体丹', '晶莹剔透，降低衰减13%，持续20小时', 75, 'merit', 0, 0, 72000, 0.13, 0, 41, 1, 5, 5, 5, 'common', 'buff'),
  ('jade_bone_pill_5', '💎', '玉骨丹', '骨骼如玉，增加寿命4小时', 70, 'merit', 315576, 0, 0, 0, 0, 40, 1, 5, 5, 5, 'common', 'recovery'),
  ('heaven_pill_5', '☁️', '天元丹', '天地精华，增加寿命5小时', 85, 'merit', 7889400, 0, 0, 0, 0, 44, 1, 5, 5, 5, 'epic', 'recovery'),
  ('legend_pill_5', '🌠', '传说丹', '传说之力，降低衰减15%，持续24小时', 90, 'merit', 0, 0, 86400, 0.15, 0, 45, 1, 5, 5, 5, 'legendary', 'buff'),
  ('supreme_pill_5', '👑', '至尊丹', '至高无上，降低衰减14%，持续22小时', 80, 'merit', 0, 0, 79200, 0.14, 0, 43, 1, 5, 5, 5, 'rare', 'buff'),
  ('treasure_pill_5', '🏺', '宝体丹', '宝体初成，增加寿命4.5小时', 72, 'merit', 1577880, 0, 0, 0, 0, 42, 1, 5, 5, 5, 'rare', 'recovery'),
  ('aura_pill_6', '🌟', '灵韵丹', '灵气环绕，降低衰减16%，持续24小时', 110, 'merit', 0, 0, 86400, 0.16, 0, 51, 1, 6, 6, 9, 'common', 'buff'),
  ('spirit_gather_pill_6', '✨', '聚灵丹', '聚集灵气，增加寿命5小时', 100, 'merit', 31557600, 0, 0, 0, 0, 50, 1, 6, 6, 9, 'common', 'recovery'),
  ('celestial_pill_6', '☄️', '天灵丹', '天降灵气，增加寿命7小时', 130, 'merit', 157788000, 0, 0, 0, 0, 54, 1, 6, 6, 9, 'epic', 'recovery'),
  ('spirit_sea_pill_6', '🌊', '灵海丹', '灵海无边，增加寿命6小时', 105, 'merit', 63115200, 0, 0, 0, 0, 52, 1, 6, 6, 9, 'rare', 'recovery'),
  ('transcend_pill_6', '🦅', '超凡丹', '超凡入圣，降低衰减17%，持续26小时', 120, 'merit', 0, 0, 93600, 0.17, 0, 53, 1, 6, 6, 9, 'rare', 'buff'),
  ('mind_pill_7', '💭', '心神丹', '心神合一，降低衰减18%，持续28小时', 150, 'merit', 0, 0, 100800, 0.18, 0, 61, 1, 7, 7, 9, 'common', 'buff'),
  ('soul_pill_7', '🧠', '神识丹', '凝练神识，增加寿命7小时', 140, 'merit', 31557600, 0, 0, 0, 0, 60, 1, 7, 7, 9, 'common', 'recovery'),
  ('soul_master_pill_7', '👻', '御魂丹', '御使魂魄，增加寿命9小时', 170, 'merit', 157788000, 0, 0, 0, 0, 64, 1, 7, 7, 9, 'epic', 'recovery'),
  ('spirit_king_pill_7', '👑', '灵王丹', '灵界之王，降低衰减20%，持续32小时', 180, 'merit', 0, 0, 115200, 0.2, 0, 65, 1, 7, 7, 9, 'legendary', 'buff'),
  ('consciousness_pill_7', '👁️', '识海丹', '识海扩张，增加寿命8小时', 145, 'merit', 63115200, 0, 0, 0, 0, 62, 1, 7, 7, 9, 'rare', 'recovery'),
  ('divine_sense_pill_7', '🔮', '神念丹', '神念通达，降低衰减19%，持续30小时', 160, 'merit', 0, 0, 108000, 0.19, 0, 63, 1, 7, 7, 9, 'rare', 'buff'),
  ('mystic_pill_8', '🚪', '玄府丹', '开辟玄府，增加寿命9小时', 190, 'merit', 31557600, 0, 0, 0, 0, 70, 1, 8, 8, 9, 'common', 'recovery'),
  ('void_pill_8', '🌌', '虚空丹', '虚空之力，降低衰减21%，持续34小时', 200, 'merit', 0, 0, 122400, 0.21, 0, 71, 1, 8, 8, 9, 'common', 'buff'),
  ('universe_pill_8', '🌌', '宇宙丹', '宇宙之力，增加寿命11小时', 220, 'merit', 157788000, 0, 0, 0, 0, 74, 1, 8, 8, 9, 'epic', 'recovery'),
  ('dimension_pill_8', '🔷', '次元丹', '次元之门，增加寿命10小时', 195, 'merit', 63115200, 0, 0, 0, 0, 72, 1, 8, 8, 9, 'rare', 'recovery'),
  ('space_pill_8', '🌠', '空间丹', '空间掌控，降低衰减22%，持续36小时', 210, 'merit', 0, 0, 129600, 0.22, 0, 73, 1, 8, 8, 9, 'rare', 'buff'),
  ('core_pill_9', '⚛️', '丹核丹', '丹核凝实，降低衰减23%，持续38小时', 240, 'merit', 0, 0, 136800, 0.23, 0, 81, 1, 9, 9, 9, 'common', 'buff'),
  ('golden_pill_9', '🔮', '金丹', '凝聚金丹，增加寿命11小时', 230, 'merit', 31557600, 0, 0, 0, 0, 80, 1, 9, 9, 9, 'common', 'recovery'),
  ('immortal_core_pill_9', '✨', '仙丹', '仙人之丹，增加寿命13小时', 260, 'merit', 157788000, 0, 0, 0, 0, 84, 1, 9, 9, 9, 'epic', 'recovery'),
  ('heaven_core_pill_9', '☁️', '天丹', '天道之丹，降低衰减25%，持续42小时', 270, 'merit', 0, 0, 151200, 0.25, 0, 85, 1, 9, 9, 9, 'legendary', 'buff'),
  ('perfect_pill_9', '💫', '圆满丹', '丹成圆满，增加寿命12小时', 235, 'merit', 63115200, 0, 0, 0, 0, 82, 1, 9, 9, 9, 'rare', 'recovery'),
  ('supreme_core_pill_9', '🌟', '至尊金丹', '至尊之丹，降低衰减24%，持续40小时', 250, 'merit', 0, 0, 144000, 0.24, 0, 83, 1, 9, 9, 9, 'rare', 'buff'),
  ('phoenix_rebirth_pill_10', '🦅', '凤凰丹', '凤凰涅槃，降低衰减27%，持续46小时', 310, 'merit', 0, 0, 165600, 0.27, 0, 93, 1, 10, 10, 20, 'epic', 'buff'),
  ('rebirth_pill_10', '🔥', '重生丹', '涅槃重生，增加寿命15小时', 300, 'merit', 1577880000, 0, 0, 0, 0, 92, 1, 10, 10, 20, 'epic', 'recovery'),
  ('eternal_pill_10', '♾️', '永恒丹', '永恒之力，增加寿命16小时', 320, 'merit', 3155760000, 0, 0, 0, 0, 94, 1, 10, 10, 20, 'legendary', 'recovery'),
  ('cocoon_pill_10', '🦋', '破茧丹', '破茧成蝶，增加寿命14小时', 280, 'merit', 631152000, 0, 0, 0, 0, 90, 1, 10, 10, 20, 'rare', 'recovery'),
  ('transform_pill_10', '🌈', '化形丹', '脱胎换骨，降低衰减26%，持续44小时', 290, 'merit', 0, 0, 158400, 0.26, 0, 91, 1, 10, 10, 20, 'rare', 'buff'),
  ('cloud_pill_11', '🌥️', '云游丹', '云游四海，增加寿命18小时', 370, 'merit', 1577880000, 0, 0, 0, 0, 102, 1, 11, 11, 15, 'epic', 'recovery'),
  ('sky_pill_11', '🌌', '天穹丹', '天穹之力，降低衰减29%，持续50小时', 380, 'merit', 0, 0, 180000, 0.29, 0, 103, 1, 11, 11, 15, 'epic', 'buff'),
  ('immortal_feather_pill_11', '✨', '仙羽丹', '仙人羽翼，增加寿命19小时', 390, 'merit', 3155760000, 0, 0, 0, 0, 104, 1, 11, 11, 15, 'legendary', 'recovery'),
  ('ascend_pill_11', '☁️', '飞升丹', '飞升九天，降低衰减28%，持续48小时', 360, 'merit', 0, 0, 172800, 0.28, 0.03, 101, 1, 11, 11, 15, 'rare', 'buff'),
  ('feather_pill_11', '🪶', '羽化丹', '羽化飞升，增加寿命17小时', 350, 'merit', 631152000, 0, 0, 0, 0, 100, 1, 11, 11, 15, 'rare', 'recovery'),
  ('dao_pill_16', '☯️', '悟道丹', '道法自然，降低衰减30%，持续52小时', 460, 'merit', 0, 0, 187200, 0.3, 0, 111, 1, 16, 16, 20, 'epic', 'buff'),
  ('true_immortal_pill_16', '🌟', '真仙丹', '真仙之力，增加寿命20小时', 450, 'merit', 15778800000, 0, 0, 0, 0, 110, 1, 16, 16, 20, 'epic', 'recovery'),
  ('chaos_pill_16', '🌀', '混沌丹', '混沌初开，增加寿命24小时', 500, 'merit', 31557600000, 0, 0, 0, 0, 114, 1, 16, 16, 20, 'legendary', 'recovery'),
  ('heaven_dao_pill_16', '⚡', '天道丹', '天道之力，增加寿命22小时', 470, 'merit', 31557600000, 0, 0, 0, 0, 112, 1, 16, 16, 20, 'legendary', 'recovery'),
  ('supreme_dao_pill_16', '👑', '至道丹', '至高大道，降低衰减32%，持续54小时', 480, 'merit', 0, 0, 194400, 0.32, 0, 113, 1, 16, 16, 20, 'legendary', 'buff');

-- ==================== WELLNESS_TASKS_CONFIG ====================
INSERT OR REPLACE INTO wellness_tasks_config (id, task_key, name, emoji, description, reward_type, life_reward, merit_reward, shard_reward, coin_reward, modifier_value, realm_requirement, is_active, sort_order, input_config, created_at, updated_at, realm_id, min_realm_id, max_realm_id) VALUES
  (72, 'aura_sense', '灵气感知', '👁️', '感知周围灵气波动，提升灵敏度', 'fixed', 4800, 7, 2, 0, 0, 'advanced', 1, 61, NULL, 1778748357, 1778748357, 6, 6, 6),
  (67, 'blood_refine', '炼血换元', '🩸', '运功炼化血液，去除杂质', 'fixed', 3600, 5, 2, 0, 0, 'mortal', 1, 40, NULL, 1778748357, 1778748357, 4, 4, 4),
  (62, 'body_stretch', '筋骨舒展', '🤸', '拉伸筋骨，为修行打基础', 'fixed', 1000, 1, 0, 0, 0, 'mortal', 1, 11, NULL, 1778748357, 1778748357, 1, 1, 1),
  (65, 'bone_training', '锻骨炼体', '💪', '特殊锻炼法，强化骨骼', 'fixed', 2400, 3, 1, 0, 0, 'mortal', 1, 30, NULL, 1778748357, 1778748357, 3, 3, 3),
  (61, 'breath_control', '胎息吐纳', '🌬️', '练习胎息呼吸法，初窥修行门径', 'fixed', 1500, 2, 0, 0, 0, 'mortal', 1, 10, NULL, 1778748357, 1778748357, 1, 1, 1),
  (78, 'dan_nourish', '丹田温养', '🌡️', '温养丹田，稳固金丹', 'fixed', 7800, 14, 5, 0, 0, 'advanced', 1, 91, NULL, 1778748357, 1778748357, 9, 9, 9),
  (59, 'diet', '清淡饮食', '🥗', '三餐清淡，远离油腻，保养脾胃', 'fixed', 220403, 1, 0, 0, 0, 'basic', 1, 5, NULL, 1778748357, 1778748357, 1, 1, 5),
  (60, 'earlyrise', '晨起修行', '🌅', '连续7天早起，磨练意志', 'input', 252461, 4, 0, 1, 0, 'challenge', 1, 6, '{"type":"streak","target":7,"coinReward":1}', 1778748357, 1778748357, 1, 1, 5),
  (76, 'energy_store', '灵力储存', '⚡', '将灵力储存于玄府之中', 'fixed', 6600, 11, 4, 0, 0, 'advanced', 1, 81, NULL, 1778748357, 1778748357, 8, 8, 8),
  (64, 'herbal_tea', '药膳调理', '🍵', '饮用药膳茶，温养经脉', 'fixed', 1500, 2, 0, 0, 0, 'mortal', 1, 21, NULL, 1778748357, 1778748357, 2, 2, 2),
  (69, 'jade_bone', '玉骨淬炼', '💎', '淬炼骨骼，使其坚如玉石', 'fixed', 4800, 6, 2, 0, 0, 'mortal', 1, 50, NULL, 1778748357, 1778748357, 5, 5, 5),
  (70, 'marrow_nourish', '髓海滋养', '🌊', '滋养髓海，巩固根基', 'fixed', 4200, 5, 2, 0, 0, 'mortal', 1, 51, NULL, 1778748357, 1778748357, 5, 5, 5),
  (66, 'medicinal_bath', '药浴洗髓', '🛁', '药浴浸泡，洗涤骨髓杂质', 'fixed', 3000, 4, 1, 0, 0, 'mortal', 1, 31, NULL, 1778748357, 1778748357, 3, 3, 3),
  (56, 'meditate', '静坐养神', '🧘', '每日静坐15分钟，凝神聚气', 'fixed', 189346, 3, 1, 0, 0, 'basic', 1, 2, NULL, 1778748357, 1778748357, 1, 1, 5),
  (63, 'meridian_massage', '经络按摩', '👐', '按摩穴位，疏通经络', 'fixed', 1800, 2, 0, 0, 0, 'mortal', 1, 20, NULL, 1778748357, 1778748357, 2, 2, 2),
  (74, 'mind_palace', '识海构建', '🏛️', '在识海中构建神识宫殿', 'fixed', 5400, 9, 3, 0, 0, 'advanced', 1, 71, NULL, 1778748357, 1778748357, 7, 7, 7),
  (75, 'mystic_open', '玄府开辟', '🚪', '开辟体内玄府，储存灵力', 'fixed', 7200, 12, 5, 0, 0, 'advanced', 1, 80, NULL, 1778748357, 1778748357, 8, 8, 8),
  (77, 'pill_condense', '金丹凝聚', '🔮', '凝聚体内灵力，结成金丹', 'fixed', 8400, 15, 6, 0, 0, 'advanced', 1, 90, NULL, 1778748357, 1778748357, 9, 9, 9),
  (68, 'qi_circulation', '气血运行', '🔄', '引导气血循环，加速换血', 'fixed', 3000, 4, 1, 0, 0, 'mortal', 1, 41, NULL, 1778748357, 1778748357, 4, 4, 4),
  (73, 'soul_refine', '神识凝练', '🧠', '凝练神识，增强灵魂力量', 'fixed', 6000, 10, 4, 0, 0, 'advanced', 1, 70, NULL, 1778748357, 1778748357, 7, 7, 7),
  (71, 'spirit_gather', '聚灵纳气', '✨', '吸纳天地灵气，充盈丹田', 'fixed', 5400, 8, 3, 0, 0, 'advanced', 1, 60, NULL, 1778748357, 1778748357, 6, 6, 6),
  (57, 'steps', '步步为营', '🚶', '行走万步，强健筋骨，疏通经络', 'input', 0, 0, 0, 0, 0, 'basic', 1, 3, '{"type":"slider","min":1000,"max":50000,"step":1000,"unit":"步","baseReward":720,"bonusThreshold":10000,"bonusReward":7200}', 1778748357, 1778748357, 1, 1, 5),
  (58, 'water', '上善若水', '💧', '每日饮水8杯，滋养身心', 'input', 126230, 0, 0, 0, 0, 'basic', 1, 4, '{"type":"counter","max":8,"rewardPerUnit":300,"completionMerit":3}', 1778748357, 1778748357, 1, 1, 5),
  (55, 'ziwu', '子午流注', '🌙', '23:00前入睡，顺应天地阴阳，调和气血', 'fixed', 315576, 2, 0, 0, 0, 'basic', 1, 1, NULL, 1778748357, 1778748357, 1, 1, 5);

-- ==================== EXTRA_TASKS_CONFIG ====================
INSERT OR REPLACE INTO extra_tasks_config (id, task_key, name, emoji, description, life_reward, merit_reward, shard_reward, sort_order, is_active, realm_id, min_realm_id, max_realm_id, difficulty, category) VALUES
  (1, 'morning_breath', '晨起吐纳', '🌅', '清晨吐故纳新，调理气息', 157788, 1, 0, 1, 1, 1, 1, 5, 'easy', 'basic'),
  (2, 'reading', '晨读经典', '📖', '晨起诵读经典，开启智慧', 157788, 2, 0, 2, 1, 1, 1, 5, 'easy', 'basic'),
  (3, 'stretching', '舒展筋骨', '🧘', '晨起拉伸，唤醒身体', 157788, 1, 0, 3, 1, 1, 1, 5, 'easy', 'basic'),
  (4, 'breakfast', '营养早餐', '🥣', '享用营养早餐，补充能量', 157788, 1, 0, 4, 1, 1, 1, 5, 'easy', 'basic'),
  (5, 'tea', '品茗静心', '🍵', '品一杯清茶，静心养性', 157788, 2, 0, 5, 1, 1, 1, 5, 'easy', 'basic'),
  (6, 'walk', '散步消食', '🚶', '饭后百步走，活到九十九', 157788, 1, 0, 10, 1, 2, 2, 5, 'easy', 'basic'),
  (7, 'sun', '晒太阳', '☀️', '吸收阳光精华，补充阳气', 157788, 1, 0, 11, 1, 2, 2, 5, 'easy', 'basic'),
  (9, 'eyes', '眼保健操', '👁️', '保护视力，远离近视', 157788, 1, 0, 13, 1, 2, 2, 5, 'easy', 'basic'),
  (8, 'nap', '午休养神', '😴', '小憩片刻，恢复精力', 315576, 2, 0, 12, 1, 2, 2, 5, 'normal', 'basic'),
  (10, 'neck', '颈椎操', '🦒', '舒缓颈椎，预防职业病', 157788, 1, 0, 20, 1, 3, 3, 5, 'easy', 'basic'),
  (11, 'posture', '站桩练气', '🧍', '站桩养气，强健体魄', 315576, 3, 0, 21, 1, 3, 3, 5, 'normal', 'advanced'),
  (12, 'herbs', '药膳调理', '🍲', '食用药膳，滋补身体', 315576, 2, 0, 22, 1, 3, 3, 5, 'normal', 'basic'),
  (13, 'acupoint', '穴位按摩', '👆', '按摩穴位，疏通经络', 315576, 2, 0, 23, 1, 3, 3, 5, 'normal', 'advanced'),
  (14, 'qigong', '气功导引', '🌀', '练习气功，导引真气', 315576, 4, 1, 30, 1, 4, 4, 5, 'normal', 'advanced'),
  (15, 'meridian', '经络疏通', '💫', '疏通经络，畅通气血', 315576, 3, 0, 31, 1, 4, 4, 5, 'normal', 'advanced'),
  (16, 'bath', '药浴养生', '🛁', '药浴浸泡，排毒养颜', 315576, 3, 0, 32, 1, 4, 4, 5, 'normal', 'basic'),
  (17, 'incense', '香道养心', '🕯️', '品香静心，陶冶性情', 315576, 4, 0, 33, 1, 4, 4, 5, 'normal', 'special'),
  (18, 'taichi', '太极拳法', '☯️', '练习太极，阴阳调和', 631152, 5, 1, 40, 1, 5, 5, 5, 'hard', 'advanced'),
  (19, 'calligraphy', '书法养性', '✍️', '挥毫泼墨，修身养性', 315576, 4, 1, 41, 1, 5, 5, 5, 'normal', 'special'),
  (20, 'music', '琴音养神', '🎵', '抚琴奏乐，陶冶心神', 315576, 5, 1, 42, 1, 5, 5, 5, 'normal', 'special'),
  (21, 'inner_vision', '内视观想', '🔮', '内视脏腑，观想丹田', 31557600, 6, 1, 50, 1, 6, 6, 10, 'hard', 'advanced'),
  (22, 'breath_control', '吐纳控息', '💨', '控制呼吸，调理真气', 31557600, 6, 1, 51, 1, 6, 6, 10, 'hard', 'advanced'),
  (23, 'energy_gather', '聚气凝神', '⚡', '聚集灵气，凝练神识', 31557600, 7, 2, 52, 1, 6, 6, 10, 'hard', 'advanced'),
  (26, 'dao_comprehend', '参悟道法', '📜', '参悟天地大道', 63115200, 9, 2, 62, 1, 7, 7, 10, 'extreme', 'special'),
  (24, 'spirit_refine', '炼神还虚', '✨', '炼化神识，返璞归真', 31557600, 8, 2, 60, 1, 7, 7, 10, 'hard', 'advanced'),
  (25, 'soul_cleanse', '洗涤心灵', '🌟', '净化心灵，提升境界', 31557600, 8, 2, 61, 1, 7, 7, 10, 'hard', 'special'),
  (27, 'aperture_open', '开启玄府', '🌌', '开启玄府，沟通天地', 63115200, 10, 3, 70, 1, 8, 8, 10, 'extreme', 'advanced'),
  (28, 'star_absorb', '吸纳星辰', '⭐', '吸收星辰之力', 63115200, 10, 3, 71, 1, 8, 8, 10, 'extreme', 'advanced'),
  (29, 'pill_condense', '凝聚金丹', '💊', '凝聚体内金丹', 63115200, 12, 3, 80, 1, 9, 9, 10, 'extreme', 'advanced'),
  (30, 'essence_refine', '炼精化气', '🔥', '炼化精气，提升修为', 63115200, 12, 3, 81, 1, 9, 9, 10, 'extreme', 'advanced'),
  (31, 'cocoon_break', '破茧重生', '🦋', '破茧而出，脱胎换骨', 631152000, 15, 4, 90, 1, 10, 10, 15, 'extreme', 'special'),
  (32, 'nirvana', '涅槃重生', '🔆', '经历涅槃，获得新生', 631152000, 15, 4, 91, 1, 10, 10, 15, 'extreme', 'special'),
  (33, 'feather_transform', '羽化登仙', '🕊️', '羽化飞升，超凡入圣', 631152000, 18, 5, 100, 1, 11, 11, 15, 'extreme', 'special'),
  (34, 'heaven_dao', '天道感悟', '☁️', '感悟天道，领悟真谛', 631152000, 20, 6, 101, 1, 11, 11, 15, 'extreme', 'special'),
  (35, 'immortal_qi', '仙气灌体', '🌈', '吸收仙气，洗涤凡身', 631152000, 22, 6, 102, 1, 11, 11, 15, 'extreme', 'advanced'),
  (36, 'chaos_comprehend', '混沌悟道', '🌀', '参悟混沌，洞察本源', 6311520000, 25, 8, 110, 1, 16, 16, 20, 'extreme', 'special'),
  (37, 'law_master', '掌控法则', '⚖️', '掌控天地法则', 6311520000, 30, 10, 111, 1, 16, 16, 20, 'extreme', 'special'),
  (38, 'universe_merge', '天人合一', '🌍', '与天地融为一体', 6311520000, 35, 12, 112, 1, 16, 16, 20, 'extreme', 'special'),
  (39, 'eternal_life', '长生不老', '♾️', '获得永恒生命', 6311520000, 40, 15, 113, 1, 16, 16, 20, 'extreme', 'special'),
  (40, 'transcend', '超脱轮回', '🎭', '超脱生死轮回', 6311520000, 50, 20, 114, 1, 16, 16, 20, 'extreme', 'special');

-- ==================== EXPLORE_LOOT_CONFIG ====================
INSERT OR REPLACE INTO explore_loot_config (id, name, msg, weight, life, merit, shard, sort_order, is_active, realm_id, min_realm_id, max_realm_id, difficulty, category) VALUES
  (1, '灵气稀薄', '此地灵气稀薄，一无所获，十分遗憾啊，再接再厉！！！', 20, 31558, 110, 0, 1, 1, 1, 1, 5, 'easy', 'common'),
  (2, '拾得灵草', '在路边发现一株灵草', 25, 31558, 5, 0, 2, 1, 1, 1, 5, 'easy', 'common'),
  (3, '灵气灌体', '吸收周围灵气，略有所得', 20, 31558, 8, 0, 3, 1, 1, 1, 5, 'normal', 'common'),
  (4, '野果奇珍', '采集到一些野果，略有灵气', 15, 31558, 6, 0, 4, 1, 1, 1, 5, 'easy', 'common'),
  (5, '山泉精华', '饮用山泉，精神一振', 10, 157788, 10, 0, 5, 1, 1, 1, 5, 'normal', 'rare'),
  (6, '枯木逢春', '发现一株枯木重生，感悟生机', 18, 31558, 12, 0, 10, 1, 2, 2, 5, 'normal', 'common'),
  (9, '鸟巢遗珠', '在鸟巢中发现灵珠', 10, 631152, 20, 1, 13, 1, 2, 2, 5, 'hard', 'epic'),
  (7, '石中玉髓', '从石缝中提取玉髓', 15, 157788, 15, 0, 11, 1, 2, 2, 5, 'normal', 'rare'),
  (8, '古藤露珠', '收集古藤上的露珠', 12, 157788, 18, 1, 12, 1, 2, 2, 5, 'hard', 'rare'),
  (10, '地脉微流', '感应到地脉流动，获得灵气', 15, 31558, 22, 1, 20, 1, 3, 3, 5, 'normal', 'common'),
  (13, '蚁穴灵砂', '从蚁穴中挖掘灵砂', 8, 631152, 30, 2, 23, 1, 3, 3, 5, 'hard', 'epic'),
  (11, '苔藓灵华', '采集苔藓中的灵华', 12, 157788, 25, 1, 21, 1, 3, 3, 5, 'normal', 'rare'),
  (12, '萤火微光', '捕捉萤火虫的灵光', 10, 157788, 28, 1, 22, 1, 3, 3, 5, 'hard', 'rare'),
  (16, '蝉蜕金衣', '收集蝉蜕，提炼金衣', 8, 631152, 38, 2, 32, 1, 4, 4, 5, 'hard', 'epic'),
  (17, '蛇蜕宝鳞', '获得蛇蜕宝鳞', 6, 631152, 40, 3, 33, 1, 4, 4, 5, 'extreme', 'epic'),
  (14, '蛛网晶丝', '收集蜘蛛网上的晶丝', 12, 157788, 32, 2, 30, 1, 4, 4, 5, 'normal', 'rare'),
  (15, '蛙鸣灵波', '聆听蛙鸣，感悟灵波', 10, 157788, 35, 2, 31, 1, 4, 4, 5, 'hard', 'rare'),
  (19, '古树心材', '从古树中提取心材', 8, 631152, 50, 3, 41, 1, 5, 5, 10, 'hard', 'epic'),
  (20, '寒潭玄冰', '从寒潭中取得玄冰', 6, 631152, 55, 4, 42, 1, 5, 5, 10, 'hard', 'epic'),
  (21, '洞天福地', '发现洞天福地，修为大进', 4, 15778800, 60, 4, 43, 1, 5, 5, 10, 'extreme', 'legendary'),
  (18, '灵泉之眼', '发现灵泉之眼，获得大量灵气', 10, 157788, 45, 3, 40, 1, 5, 5, 10, 'normal', 'rare'),
  (23, '云雾灵核', '从云雾中凝聚灵核', 8, 63115200, 70, 5, 51, 1, 6, 6, 10, 'hard', 'epic'),
  (24, '火山余烬', '收集火山余烬', 6, 63115200, 75, 5, 52, 1, 6, 6, 10, 'hard', 'epic'),
  (25, '遗迹碎片', '在古代遗迹中发现碎片', 5, 157788000, 80, 6, 53, 1, 6, 6, 10, 'extreme', 'legendary'),
  (22, '月华结晶', '收集月华结晶', 10, 31557600, 65, 4, 50, 1, 6, 6, 10, 'normal', 'rare'),
  (26, '日精石髓', '提炼日精石髓', 8, 63115200, 85, 6, 60, 1, 7, 7, 10, 'normal', 'epic'),
  (27, '地火结晶', '收集地火结晶', 6, 63115200, 90, 7, 61, 1, 7, 7, 10, 'hard', 'epic'),
  (28, '雷击木心', '获得雷击木心', 5, 157788000, 95, 7, 62, 1, 7, 7, 10, 'hard', 'legendary'),
  (29, '星沙聚核', '聚集星沙成核', 4, 157788000, 100, 8, 63, 1, 7, 7, 10, 'extreme', 'legendary'),
  (30, '少阳晶', '凝聚少阳之气成晶', 6, 63115200, 105, 8, 70, 1, 8, 8, 10, 'normal', 'epic'),
  (31, '玄阴珠', '凝聚玄阴之气成珠', 5, 157788000, 110, 9, 71, 1, 8, 8, 10, 'hard', 'legendary'),
  (32, '五行灵珠', '收集五行灵珠', 4, 157788000, 115, 9, 72, 1, 8, 8, 10, 'extreme', 'legendary'),
  (33, '八卦阵盘', '发现八卦阵盘', 5, 157788000, 120, 10, 80, 1, 9, 9, 10, 'hard', 'legendary'),
  (34, '九宫飞星', '领悟九宫飞星之法', 4, 157788000, 125, 10, 81, 1, 9, 9, 10, 'extreme', 'legendary'),
  (35, '河图拓片', '获得河图拓片', 4, 1577880000, 130, 11, 90, 1, 10, 10, 15, 'extreme', 'legendary'),
  (36, '洛书残页', '发现洛书残页', 3, 1577880000, 135, 11, 91, 1, 10, 10, 15, 'extreme', 'legendary'),
  (37, '仙缘天降', '遇到仙缘，修为大增', 3, 1577880000, 150, 12, 100, 1, 11, 11, 15, 'extreme', 'legendary'),
  (38, '悟道机缘', '顿悟大道，境界提升', 2, 1577880000, 180, 15, 101, 1, 11, 11, 15, 'extreme', 'legendary'),
  (39, '天材地宝', '发现天材地宝', 2.5, 1577880000, 200, 18, 102, 1, 11, 11, 15, 'extreme', 'legendary'),
  (40, '上古传承', '获得上古传承，实力暴涨', 1.5, 15778800000, 250, 20, 110, 1, 16, 16, 20, 'extreme', 'legendary'),
  (41, '混沌灵宝', '发现混沌灵宝', 1, 15778800000, 300, 25, 111, 1, 16, 16, 20, 'extreme', 'legendary'),
  (42, '先天道韵', '领悟先天道韵', 0.8, 15778800000, 350, 30, 112, 1, 16, 16, 20, 'extreme', 'legendary'),
  (43, '天道碎片', '获得天道碎片', 0.5, 15778800000, 400, 35, 113, 1, 16, 16, 20, 'extreme', 'legendary');

-- ==================== WORLD_EVENTS ====================
INSERT OR REPLACE INTO world_events (id, event_key, name, description, emoji, start_at, end_at, effect_type, effect_value, is_active) VALUES
  (1, 'spring_festival_2026', '春节庆典', '新春佳节，天地灵气汇聚，修炼效率提升50%', '🎊', 1776131803, 1781315803, 'task_double', 0.5, 1),
  (2, 'dragon_boat_2026', '端午龙舟', '端午时节，驱邪避凶，寿命衰减降低30%', '🐉', 1777427803, 1782611803, 'global_decay', -0.3, 1),
  (3, 'mid_autumn_2026', '中秋赏月', '月圆之夜，功德收益增加40%', '🌕', 1777859803, 1783043803, 'global_merit', 0.4, 1),
  (4, 'winter_solstice_2026', '冬至养生', '冬至进补，生命值额外增加20%', '❄️', 1778291803, 1783475803, 'global_life', 0.2, 1),
  (6, 'heavenly_tribulation_1778725403', '天劫降临', '天地异象，寿命衰减加速50%，但功德收益翻倍', '⚡', 1778725403, 1778768603, 'global_decay', 0.5, 0),
  (7, 'heavenly_tribulation_1778727112', '天劫降临', '天地异象，寿命衰减加速50%，但功德收益翻倍', '⚡', 1778727112, 1778770312, 'global_decay', 0.5, 0),
  (8, 'heavenly_tribulation_1778739566', '天劫降临', '天地异象，寿命衰减加速50%，但功德收益翻倍', '⚡', 1778739566, 1778782766, 'global_decay', 0.5, 0),
  (9, 'heavenly_tribulation_1778742221', '天劫降临', '天地异象，寿命衰减加速50%，但功德收益翻倍', '⚡', 1778742221, 1778785421, 'global_decay', 0.5, 0),
  (10, 'heavenly_tribulation_1778742229', '天劫降临', '天地异象，寿命衰减加速50%，但功德收益翻倍', '⚡', 1778742229, 1778785429, 'global_decay', 0.5, 0),
  (11, 'heavenly_tribulation_1778743243', '天劫降临', '天地异象，寿命衰减加速50%，但功德收益翻倍', '⚡', 1778743243, 1778786443, 'global_decay', 0.5, 0),
  (12, 'heavenly_tribulation_1778807772', '天劫降临', '天地异象，寿命衰减加速50%，但功德收益翻倍', '⚡', 1778807772, 1778850972, 'global_decay', 0.5, 1),
  (13, 'heavenly_tribulation_1778743243_1778807776', '天劫降临', '天地异象，寿命衰减加速50%，但功德收益翻倍', '⚡', 1778807776, 1778850976, 'global_decay', 0.5, 1),
  (14, 'heavenly_tribulation_1778742229_1778807779', '天劫降临', '天地异象，寿命衰减加速50%，但功德收益翻倍', '⚡', 1778807779, 1778850979, 'global_decay', 0.5, 1),
  (15, 'heavenly_tribulation_1778807780', '天劫降临', '天地异象，寿命衰减加速50%，但功德收益翻倍', '⚡', 1778807780, 1778850980, 'global_decay', 0.5, 1),
  (16, 'heavenly_tribulation_1778739566_1778807781', '天劫降临', '天地异象，寿命衰减加速50%，但功德收益翻倍', '⚡', 1778807781, 1778850981, 'global_decay', 0.5, 1),
  (17, 'heavenly_tribulation_1778727112_1778807782', '天劫降临', '天地异象，寿命衰减加速50%，但功德收益翻倍', '⚡', 1778807782, 1778850982, 'global_decay', 0.5, 1),
  (5, 'heavenly_tribulation', '天劫降临', '天地异象，寿命衰减加速50%，但功德收益翻倍', '⚡', 1783907803, 1786499803, 'global_decay', 0.5, 0);


