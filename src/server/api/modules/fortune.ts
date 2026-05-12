// 运势模块 - 每日运势/签到
import { Hono } from 'hono'
import type { Bindings, ApiVariables, Profile } from '../../types'
import { todayStr, formatLife, nowSeconds } from '../../lib'
import { authMiddleware, loadProfile, pushEvent } from '../middleware'

const FORTUNE_TYPES = [
  { 
    type: '大吉', 
    multiplier: 1.5, 
    prob: 0.05,
    title: '紫气东来·大吉',
    description: '今日气运昌隆，天地灵气汇聚，修炼事半功倍！',
    advice: '宜：修炼、炼丹、探险、突破境界',
    avoid: '忌：懈怠、贪睡、暴饮暴食',
    luckyDirection: '东方',
    luckyTime: '卯时（5-7点）',
    luckyColor: '紫金色',
    poem: '紫气东来三万里，仙人抚我顶，结发受长生。'
  },
  { 
    type: '吉', 
    multiplier: 1.2, 
    prob: 0.25,
    title: '吉星高照',
    description: '今日运势顺遂，适合稳步修炼，小有所成。',
    advice: '宜：打坐、读经、养生、交友',
    avoid: '忌：冒进、争斗、熬夜',
    luckyDirection: '南方',
    luckyTime: '午时（11-13点）',
    luckyColor: '赤金色',
    poem: '春风得意马蹄疾，一日看尽长安花。'
  },
  { 
    type: '平', 
    multiplier: 1.0, 
    prob: 0.50,
    title: '平淡如水',
    description: '今日运势平稳，保持平常心，按部就班即可。',
    advice: '宜：日常修炼、整理功法、温故知新',
    avoid: '忌：急功近利、心浮气躁',
    luckyDirection: '中央',
    luckyTime: '辰时（7-9点）',
    luckyColor: '素白色',
    poem: '行到水穷处，坐看云起时。'
  },
  { 
    type: '凶', 
    multiplier: 0.8, 
    prob: 0.15,
    title: '煞气临身',
    description: '今日运势低迷，诸事不顺，宜守不宜攻。',
    advice: '宜：静修、闭关、反思、养精蓄锐',
    avoid: '忌：冒险、争斗、强行突破',
    luckyDirection: '西方',
    luckyTime: '酉时（17-19点）',
    luckyColor: '玄黑色',
    poem: '山重水复疑无路，柳暗花明又一村。'
  },
  { 
    type: '大凶', 
    multiplier: 0.5, 
    prob: 0.05,
    title: '劫数降临·大凶',
    description: '今日凶星当头，劫数临身，万事小心！',
    advice: '宜：闭关、避世、诵经、祈福',
    avoid: '忌：外出、冒险、修炼、渡劫',
    luckyDirection: '北方',
    luckyTime: '子时（23-1点）',
    luckyColor: '血红色',
    poem: '天有不测风云，人有旦夕祸福。'
  },
]

function seededRandom(seed: string) {
  let s = 0
  for (let i = 0; i < seed.length; i++) s = (s + seed.charCodeAt(i) * (i + 1)) % 2147483647
  return function() {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

function getDailyFortune(userId: number, date: string) {
  const seed = `${userId}-${date}-fortune`
  const rand = seededRandom(seed)
  const r = rand()
  let cum = 0
  for (const f of FORTUNE_TYPES) {
    cum += f.prob
    if (r <= cum) return f
  }
  return FORTUNE_TYPES[2]
}

const fortune = new Hono<{ Bindings: Bindings; Variables: ApiVariables }>()

// 获取今日运势
fortune.get('/', authMiddleware, async (c) => {
  const userId = c.get('userId') as number
  const today = todayStr()

  let fortuneData = await c.env.DB.prepare(
    'SELECT * FROM daily_fortune WHERE user_id = ? AND fortune_date = ?'
  ).bind(userId, today).first<any>()

  if (!fortuneData) {
    const f = getDailyFortune(userId, today)
    await c.env.DB.prepare(`
      INSERT INTO daily_fortune (user_id, fortune_date, fortune_type, life_multiplier, merit_multiplier)
      VALUES (?, ?, ?, ?, ?)
    `).bind(userId, today, f.type, f.multiplier, f.multiplier).run()
    fortuneData = { fortune_type: f.type, life_multiplier: f.multiplier, merit_multiplier: f.multiplier, checked_in: 0 }
  }

  // 找到对应的运势详情
  const fortuneDetail = FORTUNE_TYPES.find(f => f.type === fortuneData.fortune_type) || FORTUNE_TYPES[2]

  return c.json({
    fortune: fortuneData.fortune_type,
    lifeMultiplier: fortuneData.life_multiplier,
    meritMultiplier: fortuneData.merit_multiplier,
    checkedIn: !!fortuneData.checked_in,
    title: fortuneDetail.title,
    description: fortuneDetail.description,
    advice: fortuneDetail.advice,
    avoid: fortuneDetail.avoid,
    luckyDirection: fortuneDetail.luckyDirection,
    luckyTime: fortuneDetail.luckyTime,
    luckyColor: fortuneDetail.luckyColor,
    poem: fortuneDetail.poem,
  })
})

// 签到领取运势奖励
fortune.post('/checkin', authMiddleware, loadProfile, async (c) => {
  const userId = c.get('userId') as number
  const today = todayStr()

  const fortuneData = await c.env.DB.prepare(
    'SELECT * FROM daily_fortune WHERE user_id = ? AND fortune_date = ?'
  ).bind(userId, today).first<any>()

  if (!fortuneData) return c.json({ error: '请先查看今日运势' }, 400)
  if (fortuneData.checked_in) return c.json({ error: '今日已签到' }, 400)

  const baseReward = 300
  const reward = Math.floor(baseReward * fortuneData.life_multiplier)

  await c.env.DB.prepare('UPDATE daily_fortune SET checked_in = 1 WHERE id = ?').bind(fortuneData.id).run()
  await c.env.DB.prepare(`
    UPDATE users SET bonus_sec = bonus_sec + ?, total_gained_sec = total_gained_sec + ?, merit = merit + 5, updated_at = ?
    WHERE id = ?
  `).bind(reward, reward, nowSeconds(), userId).run()

  const msg = `【每日签到·${fortuneData.fortune_type}】寿命 +${formatLife(reward)}，功德 +5`
  await pushEvent(c.env.DB, userId, msg, 'good')
  return c.json({ ok: true, reward, fortune: fortuneData.fortune_type, msg })
})

// 获取修仙日志
fortune.get('/logs', authMiddleware, async (c) => {
  const userId = c.get('userId') as number
  const logs = await c.env.DB.prepare(`
    SELECT id, content, mood, type, created_at 
    FROM cultivation_logs 
    WHERE user_id = ? 
    ORDER BY created_at DESC 
    LIMIT 50
  `).bind(userId).all<any>()
  
  return c.json({ logs: logs.results || [] })
})

// 添加修仙日志
fortune.post('/logs', authMiddleware, async (c) => {
  const userId = c.get('userId') as number
  const body = await c.req.json<{ content: string; mood: string; type: string }>()
  
  if (!body.content || body.content.trim().length === 0) {
    return c.json({ error: '日志内容不能为空' }, 400)
  }
  
  await c.env.DB.prepare(`
    INSERT INTO cultivation_logs (user_id, content, mood, type, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).bind(userId, body.content.trim(), body.mood || '平静', body.type || 'note', nowSeconds()).run()
  
  return c.json({ ok: true, msg: '日志已记录' })
})

export default fortune
