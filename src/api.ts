// API 路由：注册/登录/状态/任务/道具/事件/排行
import { Hono } from 'hono'
import type { Bindings, Profile, ActivePotion } from './types'
import {
  SEC_PER_DAY, SEC_PER_YEAR,
  hashPassword, genToken, clamp, todayStr,
  expectedLifespanYears, baseDecayMultiplier, currentDecayRate, currentLifeSec,
  getRealmTitle, formatLife,
} from './lib'

const api = new Hono<{ Bindings: Bindings; Variables: { userId: number; profile: Profile } }>()

// ============ 中间件：根据 token 解析用户 ============
async function authMiddleware(c: any, next: any) {
  const auth = c.req.header('Authorization') || ''
  const token = auth.replace(/^Bearer\s+/i, '').trim()
  if (!token) return c.json({ error: '未登录' }, 401)
  const row = await c.env.DB.prepare(
    'SELECT id FROM users WHERE token = ? AND (token_expire_at IS NULL OR token_expire_at > ?)'
  ).bind(token, Math.floor(Date.now() / 1000)).first<{ id: number }>()
  if (!row) return c.json({ error: 'token 失效' }, 401)
  c.set('userId', row.id)
  await next()
}

async function loadProfile(c: any, next: any) {
  const userId = c.get('userId') as number
  const profile = await c.env.DB.prepare('SELECT * FROM profiles WHERE user_id = ?').bind(userId).first<Profile>()
  if (!profile) return c.json({ error: '尚未开启命盘' }, 404)
  c.set('profile', profile)
  await next()
}

// ============ 注册 ============
api.post('/auth/register', async (c) => {
  const body = await c.req.json().catch(() => ({})) as any
  const username = String(body.username || '').trim().slice(0, 24)
  const password = String(body.password || '')
  if (!username || username.length < 2) return c.json({ error: '道号至少 2 个字符' }, 400)
  if (!password || password.length < 4) return c.json({ error: '密码至少 4 位' }, 400)

  const exist = await c.env.DB.prepare('SELECT id FROM users WHERE username = ?').bind(username).first()
  if (exist) return c.json({ error: '此道号已被占用' }, 409)

  const hash = await hashPassword(password)
  const token = genToken()
  const expire = Math.floor(Date.now() / 1000) + 30 * 86400 // 30天
  const ins = await c.env.DB.prepare(
    'INSERT INTO users (username, password_hash, token, token_expire_at) VALUES (?, ?, ?, ?)'
  ).bind(username, hash, token, expire).run()
  return c.json({ token, userId: ins.meta.last_row_id, username })
})

// ============ 登录 ============
api.post('/auth/login', async (c) => {
  const body = await c.req.json().catch(() => ({})) as any
  const username = String(body.username || '').trim()
  const password = String(body.password || '')
  if (!username || !password) return c.json({ error: '请输入道号与密码' }, 400)

  const hash = await hashPassword(password)
  const row = await c.env.DB.prepare(
    'SELECT id FROM users WHERE username = ? AND password_hash = ?'
  ).bind(username, hash).first<{ id: number }>()
  if (!row) return c.json({ error: '道号或密码错误' }, 401)

  const token = genToken()
  const expire = Math.floor(Date.now() / 1000) + 30 * 86400
  await c.env.DB.prepare('UPDATE users SET token = ?, token_expire_at = ? WHERE id = ?')
    .bind(token, expire, row.id).run()

  // 是否已开命盘
  const hasProfile = await c.env.DB.prepare('SELECT user_id FROM profiles WHERE user_id = ?').bind(row.id).first()
  return c.json({ token, userId: row.id, username, hasProfile: !!hasProfile })
})

api.post('/auth/logout', authMiddleware, async (c) => {
  const userId = c.get('userId') as number
  await c.env.DB.prepare('UPDATE users SET token = NULL, token_expire_at = NULL WHERE id = ?').bind(userId).run()
  return c.json({ ok: true })
})

// ============ 开启命盘 ============
api.post('/profile/onboard', authMiddleware, async (c) => {
  const userId = c.get('userId') as number
  const body = await c.req.json().catch(() => ({})) as any
  const profile = {
    name: String(body.name || '无名道友').slice(0, 12),
    gender: body.gender === 'female' ? 'female' : 'male',
    age: clamp(parseInt(body.age) || 25, 1, 120),
    height: clamp(parseInt(body.height) || 170, 50, 250),
    weight: clamp(parseInt(body.weight) || 65, 20, 300),
    smoke: body.smoke ? 1 : 0,
    alcohol: body.alcohol ? 1 : 0,
    stayup: body.stayup ? 1 : 0,
    hereditary: body.hereditary ? 1 : 0,
    exercise: body.exercise ? 1 : 0,
    meditate: body.meditate ? 1 : 0,
  }
  const expected = expectedLifespanYears(profile as any)
  const remainYears = Math.max(1, expected - profile.age)
  const initialLifeSec = remainYears * SEC_PER_YEAR
  const startTimestamp = Date.now()

  // upsert
  await c.env.DB.prepare(`
    INSERT INTO profiles (user_id, name, gender, age, height, weight, smoke, alcohol, stayup, hereditary, exercise, meditate,
      initial_life_sec, bonus_sec, start_timestamp, total_gained_sec, coin, shard, merit, streak, dying, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, 0, 1, 0, 0, 0, 0, ?)
    ON CONFLICT(user_id) DO UPDATE SET
      name=excluded.name, gender=excluded.gender, age=excluded.age, height=excluded.height, weight=excluded.weight,
      smoke=excluded.smoke, alcohol=excluded.alcohol, stayup=excluded.stayup, hereditary=excluded.hereditary,
      exercise=excluded.exercise, meditate=excluded.meditate,
      initial_life_sec=excluded.initial_life_sec, bonus_sec=0, start_timestamp=excluded.start_timestamp,
      total_gained_sec=0, coin=1, shard=0, merit=0, streak=0, dying=0, dying_start_at=NULL, updated_at=excluded.updated_at
  `).bind(
    userId, profile.name, profile.gender, profile.age, profile.height, profile.weight,
    profile.smoke, profile.alcohol, profile.stayup, profile.hereditary, profile.exercise, profile.meditate,
    initialLifeSec, startTimestamp, Math.floor(Date.now() / 1000)
  ).run()

  // 清空旧记录
  await c.env.DB.prepare('DELETE FROM events WHERE user_id = ?').bind(userId).run()
  await c.env.DB.prepare('DELETE FROM active_potions WHERE user_id = ?').bind(userId).run()
  await c.env.DB.prepare('DELETE FROM daily_tasks WHERE user_id = ?').bind(userId).run()

  await pushEvent(c.env.DB, userId, `命盘开启 · ${profile.name} · 预测剩余寿命 ${remainYears.toFixed(1)} 年`, 'good')
  return c.json({ ok: true, remainYears, expected })
})

// ============ 获取完整状态 ============
api.get('/state', authMiddleware, loadProfile, async (c) => {
  const userId = c.get('userId') as number
  const profile = c.get('profile') as Profile

  // 清理过期道具
  const now = Date.now()
  await c.env.DB.prepare('DELETE FROM active_potions WHERE user_id = ? AND expire_at <= ?').bind(userId, now).run()

  const today = todayStr()
  // 当日任务
  let dt = await c.env.DB.prepare('SELECT * FROM daily_tasks WHERE user_id = ? AND task_date = ?').bind(userId, today).first<any>()
  if (!dt) {
    await c.env.DB.prepare(
      'INSERT INTO daily_tasks (user_id, task_date) VALUES (?, ?)'
    ).bind(userId, today).run()
    dt = { ziwu: 0, steps: 0, water: 0, meditate: 0, earlyrise: 0, diet: 0 }
    await pushEvent(c.env.DB, userId, '新的一天，气运重置', 'good')
  }

  // 活跃道具
  const potions = await c.env.DB.prepare(
    'SELECT * FROM active_potions WHERE user_id = ? AND expire_at > ? ORDER BY expire_at ASC'
  ).bind(userId, now).all<ActivePotion>()

  // 事件日志（最近 30 条）
  const events = await c.env.DB.prepare(
    'SELECT msg, kind, created_at FROM events WHERE user_id = ? ORDER BY id DESC LIMIT 30'
  ).bind(userId).all<{ msg: string; kind: string; created_at: number }>()

  // 弥留判定
  let dying = profile.dying === 1
  let life = currentLifeSec(profile)
  if (life <= 0 && !dying) {
    dying = true
    await c.env.DB.prepare('UPDATE profiles SET dying = 1, dying_start_at = ? WHERE user_id = ?')
      .bind(now, userId).run()
    profile.dying = 1
    profile.dying_start_at = now
    await pushEvent(c.env.DB, userId, '⚠️ 寿元已尽，进入弥留期', 'bad')
  }
  // 弥留期满则强制清档
  if (dying && profile.dying_start_at && now - profile.dying_start_at > 24 * 3600 * 1000) {
    await pushEvent(c.env.DB, userId, '弥留期已过，转世重修', 'bad')
    await c.env.DB.prepare('DELETE FROM profiles WHERE user_id = ?').bind(userId).run()
    await c.env.DB.prepare('DELETE FROM events WHERE user_id = ?').bind(userId).run()
    await c.env.DB.prepare('DELETE FROM active_potions WHERE user_id = ?').bind(userId).run()
    await c.env.DB.prepare('DELETE FROM daily_tasks WHERE user_id = ?').bind(userId).run()
    return c.json({ reborn: true })
  }

  return c.json({
    profile: {
      ...profile,
      smoke: !!profile.smoke, alcohol: !!profile.alcohol, stayup: !!profile.stayup,
      hereditary: !!profile.hereditary, exercise: !!profile.exercise, meditate: !!profile.meditate,
    },
    today,
    todayTasks: {
      ziwu: !!dt.ziwu, steps: !!dt.steps, water: dt.water || 0,
      meditate: !!dt.meditate, earlyrise: !!dt.earlyrise, diet: !!dt.diet,
    },
    potions: potions.results,
    events: events.results.reverse().map(e => ({
      msg: e.msg, kind: e.kind,
      time: new Date(e.created_at * 1000).toTimeString().slice(0, 8),
    })),
    decayRate: currentDecayRate(profile, potions.results),
    serverNow: now,
  })
})

// ============ 完成任务 ============
api.post('/task/:name', authMiddleware, loadProfile, async (c) => {
  const userId = c.get('userId') as number
  const profile = c.get('profile') as Profile
  if (profile.dying) return c.json({ error: '弥留期不可修炼' }, 400)
  const name = c.req.param('name')
  const body = await c.req.json().catch(() => ({})) as any
  const today = todayStr()

  // 确保当日任务行存在
  await c.env.DB.prepare('INSERT OR IGNORE INTO daily_tasks (user_id, task_date) VALUES (?, ?)').bind(userId, today).run()
  const dt = await c.env.DB.prepare('SELECT * FROM daily_tasks WHERE user_id = ? AND task_date = ?')
    .bind(userId, today).first<any>()

  let gained = 0
  let merit = 0
  let coinDelta = 0
  let shardDelta = 0
  let streakNew = profile.streak
  let msg = ''

  if (name === 'ziwu') {
    if (dt.ziwu) return c.json({ error: '今日已打卡' }, 400)
    await c.env.DB.prepare('UPDATE daily_tasks SET ziwu = 1 WHERE user_id = ? AND task_date = ?').bind(userId, today).run()
    gained = 30 * 60; merit = 2
    msg = '【子午流注】 早睡入梦，寿命 +30 分钟，功德 +2'
  } else if (name === 'steps') {
    if (dt.steps) return c.json({ error: '今日已提交' }, 400)
    const s = clamp(parseInt(body.steps) || 0, 0, 50000)
    if (s < 1000) return c.json({ error: '至少需要 1000 步' }, 400)
    let secGain = Math.floor(s / 1000) * 12 * 60
    if (s >= 10000) secGain += 2 * 3600
    await c.env.DB.prepare('UPDATE daily_tasks SET steps = ? WHERE user_id = ? AND task_date = ?').bind(s, userId, today).run()
    gained = secGain
    merit = Math.min(5, Math.floor(s / 2000))
    msg = `【步步为营】 行走 ${s.toLocaleString()} 步，寿命 +${formatLife(secGain)}`
  } else if (name === 'water') {
    if (dt.water >= 8) return c.json({ error: '今日已饮满' }, 400)
    const newW = dt.water + 1
    await c.env.DB.prepare('UPDATE daily_tasks SET water = ? WHERE user_id = ? AND task_date = ?').bind(newW, userId, today).run()
    gained = 5 * 60
    if (newW === 8) merit = 3
    msg = `【上善若水】 第 ${newW} 杯水，寿命 +5 分钟${newW === 8 ? '，圆满 · 功德 +3' : ''}`
  } else if (name === 'meditate') {
    if (dt.meditate) return c.json({ error: '今日已入定' }, 400)
    await c.env.DB.prepare('UPDATE daily_tasks SET meditate = 1 WHERE user_id = ? AND task_date = ?').bind(userId, today).run()
    gained = 15 * 60; merit = 3; shardDelta = 1
    msg = '【静坐冥想】 心境清明，寿命 +15 分钟，复活币碎片 +1'
  } else if (name === 'earlyrise') {
    if (dt.earlyrise) return c.json({ error: '今日已早起' }, 400)
    await c.env.DB.prepare('UPDATE daily_tasks SET earlyrise = 1 WHERE user_id = ? AND task_date = ?').bind(userId, today).run()
    streakNew = Math.min(7, profile.streak + 1)
    gained = 20 * 60; merit = 4
    msg = `【早起挑战】 连续 ${streakNew}/7 天，寿命 +20 分钟`
    if (streakNew >= 7) {
      coinDelta = 1; streakNew = 0
      msg += ' · 七日劫数功成 · 复活币 +1'
    }
  } else if (name === 'diet') {
    if (dt.diet) return c.json({ error: '今日已记录' }, 400)
    await c.env.DB.prepare('UPDATE daily_tasks SET diet = 1 WHERE user_id = ? AND task_date = ?').bind(userId, today).run()
    gained = 20 * 60; merit = 1
    msg = '【清淡饮食】 三餐有节，寿命 +20 分钟'
  } else {
    return c.json({ error: '未知任务' }, 400)
  }

  // 碎片合成复活币
  let newShard = profile.shard + shardDelta
  let newCoin = profile.coin + coinDelta
  if (newShard >= 5) {
    newCoin += Math.floor(newShard / 5)
    newShard = newShard % 5
    msg += ' · 碎片合成 复活币'
  }

  await c.env.DB.prepare(`
    UPDATE profiles SET
      bonus_sec = bonus_sec + ?,
      total_gained_sec = total_gained_sec + ?,
      merit = merit + ?,
      coin = ?, shard = ?, streak = ?,
      updated_at = ?
    WHERE user_id = ?
  `).bind(gained, gained, merit, newCoin, newShard, streakNew, Math.floor(Date.now() / 1000), userId).run()

  await pushEvent(c.env.DB, userId, msg, 'good')
  return c.json({ ok: true, gainedSec: gained, msg })
})

// ============ 道具商城 ============
const POTIONS = [
  { id: 'liver',     emoji: '💊', name: '护肝片',   cost: 30, type: 'merit', mod: { id: 'liver',  label: '护肝片 · 抵消熬夜', value: -0.5 }, dur: 24*3600 },
  { id: 'melatonin', emoji: '🌙', name: '褪黑素',   cost: 25, type: 'merit', mod: { id: 'mela',   label: '褪黑素 · 作息加倍', value: -0.2 }, dur: 12*3600 },
  { id: 'deep',      emoji: '🛌', name: '深睡胶囊', cost: 40, type: 'merit', mod: { id: 'deep',   label: '深睡 · 衰减减半',   value: -0.5 }, dur: 8*3600 },
  { id: 'ginseng',   emoji: '🌿', name: '千年人参', cost: 50, type: 'merit', instant: { life: 6*3600 } },
  { id: 'lingzhi',   emoji: '🍄', name: '九叶灵芝', cost: 90, type: 'merit', instant: { life: 12*3600 } },
  { id: 'pill',      emoji: '🟡', name: '九转金丹', cost: 1,  type: 'coin',  instant: { life: 365*SEC_PER_DAY } },
] as const

api.get('/potions', async (c) => c.json({ potions: POTIONS }))

api.post('/potion/:id', authMiddleware, loadProfile, async (c) => {
  const userId = c.get('userId') as number
  const profile = c.get('profile') as Profile
  if (profile.dying) return c.json({ error: '弥留期不可炼丹' }, 400)
  const id = c.req.param('id')
  const p = POTIONS.find(x => x.id === id)
  if (!p) return c.json({ error: '无此丹药' }, 404)

  if (p.type === 'merit' && profile.merit < p.cost) return c.json({ error: '功德不足' }, 400)
  if (p.type === 'coin' && profile.coin < p.cost) return c.json({ error: '复活币不足' }, 400)

  let costMerit = p.type === 'merit' ? p.cost : 0
  let costCoin = p.type === 'coin' ? p.cost : 0
  let bonusGain = 0
  if ('instant' in p && p.instant) {
    bonusGain = p.instant.life
  }
  if ('mod' in p && p.mod && p.dur) {
    const expireAt = Date.now() + p.dur * 1000
    await c.env.DB.prepare(`
      INSERT INTO active_potions (user_id, potion_id, potion_name, potion_emoji, mod_id, mod_label, mod_value, expire_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(userId, p.id, p.name, p.emoji, p.mod.id, p.mod.label, p.mod.value, expireAt).run()
  }

  await c.env.DB.prepare(`
    UPDATE profiles SET
      merit = merit - ?, coin = coin - ?,
      bonus_sec = bonus_sec + ?, total_gained_sec = total_gained_sec + ?,
      updated_at = ?
    WHERE user_id = ?
  `).bind(costMerit, costCoin, bonusGain, bonusGain > 0 ? bonusGain : 0, Math.floor(Date.now() / 1000), userId).run()

  const msg = bonusGain > 0 ? `服下「${p.name}」，寿命 +${formatLife(bonusGain)}` : `服下「${p.name}」，丹药生效中`
  await pushEvent(c.env.DB, userId, msg, 'good')
  return c.json({ ok: true, msg })
})

// ============ 随机事件 ============
const RANDOM_EVENTS = [
  { good: false, msg: '熬夜看球 — 寿命 -2 小时',         delta: -2*3600 },
  { good: false, msg: '路怒发作 — 寿命 -30 分钟',        delta: -30*60 },
  { good: false, msg: '吃了顿宵夜 — 寿命 -45 分钟',      delta: -45*60 },
  { good: false, msg: '加班到深夜 — 寿命 -1 小时',       delta: -3600 },
  { good: true,  msg: '路边捡到垃圾 · 功德圆满 +10 分钟', delta: 10*60 },
  { good: true,  msg: '帮老奶奶过马路 +30 分钟',         delta: 30*60 },
  { good: true,  msg: '清晨遇到打太极的老者，受其点拨 +1 小时', delta: 3600 },
  { good: true,  msg: '梦中得仙人传法 +2 小时',           delta: 2*3600 },
  { good: true,  msg: '偶得野生灵芝一支 +3 小时',         delta: 3*3600 },
  { good: false, msg: '风寒入体 -20 分钟',               delta: -20*60 },
]

api.post('/event/random', authMiddleware, loadProfile, async (c) => {
  const userId = c.get('userId') as number
  const profile = c.get('profile') as Profile
  if (profile.dying) return c.json({ error: '弥留期不可掷骰' }, 400)
  const ev = RANDOM_EVENTS[Math.floor(Math.random() * RANDOM_EVENTS.length)]
  await c.env.DB.prepare(`
    UPDATE profiles SET bonus_sec = bonus_sec + ?, total_gained_sec = total_gained_sec + ?, updated_at = ?
    WHERE user_id = ?
  `).bind(ev.delta, ev.delta > 0 ? ev.delta : 0, Math.floor(Date.now() / 1000), userId).run()
  await pushEvent(c.env.DB, userId, ev.msg, ev.good ? 'good' : 'bad')
  return c.json({ ok: true, msg: ev.msg, good: ev.good })
})

// ============ 复活 / 转世 ============
api.post('/revive', authMiddleware, loadProfile, async (c) => {
  const userId = c.get('userId') as number
  const profile = c.get('profile') as Profile
  if (!profile.dying) return c.json({ error: '尚未弥留' }, 400)
  if (profile.coin < 1) return c.json({ error: '复活币不足' }, 400)
  await c.env.DB.prepare(`
    UPDATE profiles SET
      coin = coin - 1, dying = 0, dying_start_at = NULL,
      start_timestamp = ?, bonus_sec = initial_life_sec * 0.5,
      updated_at = ?
    WHERE user_id = ?
  `).bind(Date.now(), Math.floor(Date.now() / 1000), userId).run()
  await pushEvent(c.env.DB, userId, '💗 起死回生 · 消耗复活币 1 枚', 'good')
  return c.json({ ok: true })
})

api.post('/reborn', authMiddleware, async (c) => {
  const userId = c.get('userId') as number
  await c.env.DB.prepare('DELETE FROM profiles WHERE user_id = ?').bind(userId).run()
  await c.env.DB.prepare('DELETE FROM events WHERE user_id = ?').bind(userId).run()
  await c.env.DB.prepare('DELETE FROM active_potions WHERE user_id = ?').bind(userId).run()
  await c.env.DB.prepare('DELETE FROM daily_tasks WHERE user_id = ?').bind(userId).run()
  return c.json({ ok: true })
})

// ============ 排行榜 ============
api.get('/board/:type', async (c) => {
  const type = c.req.param('type') // longevity | merit
  // 取所有有命盘的用户
  const all = await c.env.DB.prepare(`
    SELECT u.id, u.username, p.name, p.gender, p.age, p.height, p.weight,
           p.smoke, p.alcohol, p.stayup, p.exercise, p.meditate,
           p.initial_life_sec, p.bonus_sec, p.start_timestamp, p.total_gained_sec
    FROM profiles p
    JOIN users u ON u.id = p.user_id
  `).all<any>()

  const now = Date.now()
  const rows = all.results.map((r: any) => {
    const elapsed = (now - r.start_timestamp) / 1000
    const base = baseDecayMultiplier(r)
    const lifeSec = Math.max(0, r.initial_life_sec + r.bonus_sec - elapsed * base)
    const totalAge = r.age + elapsed / SEC_PER_YEAR + r.bonus_sec / SEC_PER_YEAR
    return {
      userId: r.id,
      name: r.name,
      age: totalAge,
      lifeSec,
      meritGained: r.total_gained_sec || 0,
      realm: getRealmTitle(totalAge),
    }
  })

  const key = type === 'merit' ? 'meritGained' : 'lifeSec'
  rows.sort((a: any, b: any) => b[key] - a[key])

  // 标记当前用户
  let myUserId: number | null = null
  const auth = c.req.header('Authorization') || ''
  const token = auth.replace(/^Bearer\s+/i, '').trim()
  if (token) {
    const u = await c.env.DB.prepare('SELECT id FROM users WHERE token = ?').bind(token).first<{ id: number }>()
    if (u) myUserId = u.id
  }
  return c.json({
    rows: rows.slice(0, 20).map((r: any) => ({ ...r, isMe: r.userId === myUserId })),
    myRank: myUserId ? rows.findIndex((r: any) => r.userId === myUserId) + 1 : 0,
  })
})

// ============ 工具：写事件 ============
async function pushEvent(db: D1Database, userId: number, msg: string, kind: string) {
  await db.prepare('INSERT INTO events (user_id, msg, kind) VALUES (?, ?, ?)').bind(userId, msg, kind).run()
  // 仅保留最近 100 条
  await db.prepare(`
    DELETE FROM events WHERE user_id = ? AND id NOT IN (
      SELECT id FROM events WHERE user_id = ? ORDER BY id DESC LIMIT 100
    )
  `).bind(userId, userId).run()
}

export default api
