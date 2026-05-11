-- 批量添加内容：功法+20，丹药+100，秘境+50

-- 功法扩展 (+20个，总共24个)
INSERT OR IGNORE INTO manuals (key, name, emoji, description, effect_type, effect_value, max_level, cost_merit) VALUES
('bagua', '八卦游身掌', '☯️', '身法灵动，降低寿命衰减', 'decay_reduction', 0.03, 10, 80),
('taiji', '太极拳', '☯️', '以柔克刚，延年益寿', 'decay_reduction', 0.04, 10, 90),
('qigong', '气功养生', '🌬️', '调息养气，增加寿命', 'life_boost', 1800, 10, 120),
('meditation', '禅定心法', '🧘', '静心冥想，功德倍增', 'merit_boost', 0.08, 10, 140),
('wudang', '武当内功', '⛰️', '武当派秘传，降低衰减', 'decay_reduction', 0.06, 10, 160),
('shaolin', '少林易筋经', '🏯', '少林绝学，增加寿命', 'life_boost', 2400, 10, 180),
('emei', '峨眉心法', '🗻', '峨眉派传承，功德加成', 'merit_boost', 0.12, 10, 170),
('kunlun', '昆仑神功', '❄️', '昆仑派秘技，任务加成', 'task_bonus', 0.15, 8, 250),
('kongtong', '崆峒心法', '⛰️', '崆峒派传承，降低衰减', 'decay_reduction', 0.04, 10, 110),
('quanzhen', '全真教心法', '☯️', '重阳真人所创，功德倍增', 'merit_boost', 0.15, 10, 200),
('huashan', '华山剑气', '⚔️', '华山派剑气，寿命加成', 'life_boost', 3000, 10, 220),
('songshan', '嵩山心法', '🏔️', '嵩山派传承，降低衰减', 'decay_reduction', 0.05, 10, 130),
('henshan', '衡山心法', '🌫️', '衡山派秘传，功德加成', 'merit_boost', 0.10, 10, 150),
('taishan', '泰山心法', '🌄', '泰山派传承，任务加成', 'task_bonus', 0.18, 8, 280),
('xingyi', '形意拳', '👊', '形随意动，增加寿命', 'life_boost', 2000, 10, 140),
('baguazhang', '八卦掌', '🌀', '八卦连环，降低衰减', 'decay_reduction', 0.04, 10, 100),
('bajiquan', '八极拳', '💥', '八极震脚，功德加成', 'merit_boost', 0.09, 10, 130),
('changquan', '长拳', '🥋', '基础长拳，任务加成', 'task_bonus', 0.12, 6, 90),
('drunken', '醉拳', '🍶', '醉中取巧，寿命加成', 'life_boost', 1500, 8, 110),
('yingzhua', '鹰爪功', '🦅', '鹰爪擒拿，降低衰减', 'decay_reduction', 0.03, 10, 85);

-- 创建扩展任务配置表（存储额外20个修炼任务的配置）
CREATE TABLE IF NOT EXISTS extra_tasks_config (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  emoji TEXT,
  description TEXT,
  life_reward INTEGER DEFAULT 0,
  merit_reward INTEGER DEFAULT 0,
  shard_reward INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT 1
);

-- 插入20个扩展修炼任务配置
INSERT OR IGNORE INTO extra_tasks_config (task_key, name, emoji, description, life_reward, merit_reward, sort_order) VALUES
('reading', '📖 晨读经典', '📖', '晨起诵读经典，开启智慧', 600, 2, 1),
('stretching', '🧘 舒展筋骨', '🧘', '晨起拉伸，唤醒身体', 900, 1, 2),
('breakfast', '🥣 营养早餐', '🥣', '享用营养早餐，补充能量', 600, 1, 3),
('tea', '🍵 品茗静心', '🍵', '品一杯清茶，静心养性', 300, 2, 4),
('walk', '🚶 散步消食', '🚶', '饭后百步走，活到九十九', 1200, 1, 5),
('sun', '☀️ 晒太阳', '☀️', '吸收阳光精华，补充阳气', 900, 1, 6),
('nap', '😴 午休养神', '😴', '小憩片刻，恢复精力', 1800, 2, 7),
('eyes', '👁️ 眼保健操', '👁️', '保护视力，远离近视', 600, 1, 8),
('neck', '🦒 颈椎操', '🦒', '舒缓颈椎，预防职业病', 900, 1, 9),
('breathing', '🌬️ 深呼吸', '🌬️', '调息吐纳，净化身心', 300, 2, 10),
('gratitude', '🙏 感恩冥想', '🙏', '感恩一切，心怀善念', 600, 3, 11),
('journal', '📝 写日记', '📝', '记录今日，反思成长', 600, 1, 12),
('bath', '🛁 热水泡脚', '🛁', '睡前泡脚，暖身助眠', 1200, 2, 13),
('massage', '💆 自我按摩', '💆', '按摩穴位，疏通经络', 900, 1, 14),
('music', '🎵 聆听雅乐', '🎵', '听一首古典音乐，陶冶情操', 300, 2, 15),
('calligraphy', '✍️ 书法临帖', '✍️', '挥毫泼墨，修身养性', 600, 3, 16),
('gardening', '🌱 园艺种植', '🌱', '亲近自然，种植花草', 1200, 2, 17),
('cleaning', '🧹 整理房间', '🧹', '打扫房间，清理心绪', 900, 1, 18),
('learning', '🎓 学习新知', '🎓', '学习新知识，充实自我', 600, 3, 19),
('kindness', '💝 行善积德', '💝', '做一件善事，积累功德', 1800, 5, 20);

-- 创建用户扩展任务表（存储用户完成状态）
CREATE TABLE IF NOT EXISTS user_extra_tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  task_date TEXT NOT NULL,
  reading INTEGER DEFAULT 0,
  stretching INTEGER DEFAULT 0,
  breakfast INTEGER DEFAULT 0,
  tea INTEGER DEFAULT 0,
  walk INTEGER DEFAULT 0,
  sun INTEGER DEFAULT 0,
  nap INTEGER DEFAULT 0,
  eyes INTEGER DEFAULT 0,
  neck INTEGER DEFAULT 0,
  breathing INTEGER DEFAULT 0,
  gratitude INTEGER DEFAULT 0,
  journal INTEGER DEFAULT 0,
  bath INTEGER DEFAULT 0,
  massage INTEGER DEFAULT 0,
  music INTEGER DEFAULT 0,
  calligraphy INTEGER DEFAULT 0,
  gardening INTEGER DEFAULT 0,
  cleaning INTEGER DEFAULT 0,
  learning INTEGER DEFAULT 0,
  kindness INTEGER DEFAULT 0,
  created_at INTEGER,
  updated_at INTEGER,
  UNIQUE(user_id, task_date)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_user_extra_tasks_user_date ON user_extra_tasks(user_id, task_date);
