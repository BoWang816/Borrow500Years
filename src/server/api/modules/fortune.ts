// 运势模块 - 每日运势/签到
import { Hono } from 'hono'
import type { Bindings, ApiVariables, Profile } from '../../types'
import { todayStr, formatLife, nowSeconds } from '../../lib'
import { authMiddleware, loadProfile, pushEvent } from '../middleware'

const FORTUNE_TYPES = [
  { type: '大吉', multiplier: 1.5, prob: 0.05 },
  { type: '吉', multiplier: 1.2, prob: 0.25 },
  { type: '平', multiplier: 1.0, prob: 0.50 },
  { type: '凶', multiplier: 0.8, prob: 0.15 },
  { type: '大凶', multiplier: 0.5, prob: 0.05 },
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

  return c.json({
    fortune: fortuneData.fortune_type,
    lifeMultiplier: fortuneData.life_multiplier,
    meritMultiplier: fortuneData.merit_multiplier,
    checkedIn: !!fortuneData.checked_in,
    hint: fortuneData.fortune_type === '大吉' ? '今日气运昌隆，诸事皆宜！' :
          fortuneData.fortune_type === '吉' ? '今日运势顺遂，适合修炼。' :
          fortuneData.fortune_type === '平' ? '今日运势平稳，平常心即可。' :
          fortuneData.fortune_type === '凶' ? '今日运势低迷，宜守不宜攻。' : '今日大凶，建议静修避祸。'
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
  return c.json({ ok: true, reward, fortune: fortuneData.fortune_type })
})

export default fortune
