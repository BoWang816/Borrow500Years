-- 为用户表添加星座字段
ALTER TABLE users ADD COLUMN zodiac TEXT DEFAULT '白羊座';

-- 为现有用户随机分配星座（可选）
UPDATE users SET zodiac = (
  CASE (id % 12)
    WHEN 0 THEN '白羊座'
    WHEN 1 THEN '金牛座'
    WHEN 2 THEN '双子座'
    WHEN 3 THEN '巨蟹座'
    WHEN 4 THEN '狮子座'
    WHEN 5 THEN '处女座'
    WHEN 6 THEN '天秤座'
    WHEN 7 THEN '天蝎座'
    WHEN 8 THEN '射手座'
    WHEN 9 THEN '摩羯座'
    WHEN 10 THEN '水瓶座'
    ELSE '双鱼座'
  END
) WHERE zodiac IS NULL OR zodiac = '白羊座';
