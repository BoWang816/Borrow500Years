-- 运势签到表
CREATE TABLE IF NOT EXISTS fortune_checkins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  date TEXT NOT NULL,  -- 签到日期 YYYY-MM-DD
  fortune TEXT NOT NULL,  -- 运势等级：大吉、吉、平、凶
  fortune_title TEXT NOT NULL,  -- 运势标题
  streak INTEGER DEFAULT 1,  -- 连签天数
  checkin_at INTEGER NOT NULL,  -- 签到时间戳（秒）
  UNIQUE(user_id, date),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_fortune_checkins_user_date ON fortune_checkins(user_id, date);
CREATE INDEX IF NOT EXISTS idx_fortune_checkins_date ON fortune_checkins(date);
CREATE INDEX IF NOT EXISTS idx_fortune_checkins_streak ON fortune_checkins(streak);
