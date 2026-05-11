-- 创建丹药配置表
CREATE TABLE IF NOT EXISTS potions_config (
  id TEXT PRIMARY KEY,
  emoji TEXT,
  name TEXT NOT NULL,
  desc TEXT,
  cost INTEGER DEFAULT 0,
  type TEXT DEFAULT 'merit',
  instant_life INTEGER DEFAULT 0,
  instant_merit INTEGER DEFAULT 0,
  dur INTEGER DEFAULT 0,
  dur_decay_reduction REAL DEFAULT 0,
  dur_merit_boost REAL DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT 1
);

-- 插入现有丹药配置
INSERT OR IGNORE INTO potions_config (id, emoji, name, desc, cost, type, instant_life, dur, dur_decay_reduction, sort_order) VALUES
('liver', '💊', '护肝片', '抵消熬夜负面系数 24 小时', 30, 'merit', 0, 86400, 0.2, 1),
('melatonin', '🌙', '褪黑素', '修正作息判定范围，作息加成翻倍', 25, 'merit', 0, 86400, 0, 2),
('ginseng', '🌿', '人参', '直接增加寿命 2 小时', 50, 'merit', 7200, 0, 0, 3),
('antioxidant', '🍇', '抗氧化剂', '降低衰减率 10%，持续 48 小时', 40, 'merit', 0, 172800, 0.1, 4),
('multivitamin', '💊', '复合维生素', '增加寿命 30 分钟，降低衰减 5%，持续 24 小时', 20, 'merit', 1800, 86400, 0.05, 5),
('omega3', '🐟', '鱼油', '降低衰减 8%，持续 72 小时', 35, 'merit', 0, 259200, 0.08, 6),
('coq10', '❤️', '辅酶Q10', '增加寿命 1 小时，降低衰减 12%，持续 48 小时', 45, 'merit', 3600, 172800, 0.12, 7),
('probiotics', '🦠', '益生菌', '降低衰减 7%，持续 24 小时', 25, 'merit', 0, 86400, 0.07, 8),
('calcium', '🦴', '钙片', '增加寿命 45 分钟，持续 24 小时', 15, 'merit', 2700, 86400, 0, 9),
('vitaminc', '🍊', '维生素C', '增加寿命 20 分钟，降低衰减 3%，持续 12 小时', 10, 'merit', 1200, 43200, 0.03, 10);
