// 功法模块 - 功法列表/修炼/激活
import { Hono } from 'hono'
import type { Bindings, ApiVariables, Profile } from '../../types'
import { formatLife, nowSeconds } from '../../lib'
import { authMiddleware, loadProfile, pushEvent } from '../middleware'

const manuals = new Hono<{ Bindings: Bindings; Variables: ApiVariables }>()

// 获取所有功法
manuals.get('/', authMiddleware, async (c) => {
  const userId = c.get('userId') as number

  const allManuals = await c.env.DB.prepare(
    'SELECT * FROM manuals ORDER BY cost_merit ASC'
  ).all<any>()

  const userProgress = await c.env.DB.prepare(
    'SELECT * FROM user_manuals WHERE user_id = ?'
  ).bind(userId).all<{ manual_key: string; level: number; is_active: number; total_practice_count: number }>()

  const progressMap = new Map((userProgress.results || []).map((p: { manual_key: string; level: number; is_active: number; total_practice_count: number }) => [p.manual_key, p]))

  return c.json({
    manuals: (allManuals.results || []).map((m: any) => {
      const p = progressMap.get(m.key) as { manual_key: string; level: number; is_active: number; total_practice_count: number } | undefined
      return {
        key: m.key,
        name: m.name,
        emoji: m.emoji,
        description: m.description,
        effectType: m.effect_type,
        effectValue: m.effect_value,
        maxLevel: m.max_level,
        costMerit: Math.floor(m.cost_merit * (1 + (p?.level ?? 0) * 0.2)),
        myLevel: p?.level ?? 0,
        isActive: !!p?.is_active,
        totalPractice: p?.total_practice_count ?? 0,
        canUnlock: !p || p.level === 0,
      }
    })
  })
})

// 修炼功法（升级）
manuals.post('/:key/practice', authMiddleware, loadProfile, async (c) => {
  const userId = c.get('userId') as number
  const profile = c.get('profile') as Profile
  const key = c.req.param('key')

  const manual = await c.env.DB.prepare('SELECT * FROM manuals WHERE key = ?').bind(key).first<any>()
  if (!manual) return c.json({ error: '无此功法' }, 404)

  let userMan = await c.env.DB.prepare(
    'SELECT * FROM user_manuals WHERE user_id = ? AND manual_key = ?'
  ).bind(userId, key).first<any>()

  const currentLevel = userMan?.level || 0
  if (currentLevel >= manual.max_level) return c.json({ error: '功法已达满级' }, 400)

  const cost = Math.floor(manual.cost_merit * (1 + currentLevel * 0.2))
  if (profile.merit < cost) return c.json({ error: `功德不足，需要 ${cost}` }, 400)

  const now = nowSeconds()

  if (!userMan) {
    await c.env.DB.prepare(`
      INSERT INTO user_manuals (user_id, manual_key, level, is_active, last_practice_at, total_practice_count)
      VALUES (?, ?, 1, 1, ?, 1)
    `).bind(userId, key, now).run()
  } else {
    await c.env.DB.prepare(`
      UPDATE user_manuals SET level = level + 1, is_active = 1, last_practice_at = ?, total_practice_count = total_practice_count + 1
      WHERE id = ?
    `).bind(now, userMan.id).run()
  }

  await c.env.DB.prepare('UPDATE users SET merit = merit - ?, updated_at = ? WHERE id = ?')
    .bind(cost, now, userId).run()

  const msg = `【功法突破】${manual.name} 升至 ${currentLevel + 1} 级！`
  await pushEvent(c.env.DB, userId, msg, 'good')
  return c.json({ ok: true, newLevel: currentLevel + 1 })
})

// 切换功法激活状态
manuals.post('/:key/toggle', authMiddleware, async (c) => {
  const userId = c.get('userId') as number
  const key = c.req.param('key')

  const userMan = await c.env.DB.prepare(
    'SELECT * FROM user_manuals WHERE user_id = ? AND manual_key = ?'
  ).bind(userId, key).first<any>()

  if (!userMan || userMan.level === 0) return c.json({ error: '未修炼此功法' }, 400)

  const newState = userMan.is_active ? 0 : 1
  await c.env.DB.prepare('UPDATE user_manuals SET is_active = ? WHERE id = ?').bind(newState, userMan.id).run()

  return c.json({ ok: true, isActive: !!newState })
})

// 获取用户已激活的功法效果
manuals.get('/active', authMiddleware, async (c) => {
  const userId = c.get('userId') as number

  const rows = await c.env.DB.prepare(`
    SELECT m.*, um.level, um.is_active
    FROM user_manuals um
    JOIN manuals m ON m.key = um.manual_key
    WHERE um.user_id = ? AND um.is_active = 1 AND um.level > 0
  `).bind(userId).all<any>()

  const effects = { decayReduction: 0, meritBoost: 0, lifeBoost: 0, taskBonus: 0 }
  for (const r of (rows.results || [])) {
    const val = r.effect_value * r.level
    if (r.effect_type === 'decay_reduction') effects.decayReduction += val
    if (r.effect_type === 'merit_boost') effects.meritBoost += val
    if (r.effect_type === 'life_boost') effects.lifeBoost += val
    if (r.effect_type === 'task_bonus') effects.taskBonus += val
  }

  return c.json({ effects })
})

export default manuals
