// 丹药模块 - 丹药列表/购买/使用
import { Hono } from 'hono'
import type { Bindings, ApiVariables, Profile } from '../../types'
import { formatLife, nowSeconds } from '../../lib'
import { authMiddleware, loadProfile, pushEvent } from '../middleware'

// 从数据库加载丹药配置
async function loadPotions(db: any): Promise<any[]> {
  const result = await db.prepare(
    'SELECT * FROM potions_config WHERE is_active = 1 ORDER BY sort_order ASC'
  ).all()
  
  return (result.results || []).map((p: any) => ({
    id: p.id,
    emoji: p.emoji,
    name: p.name,
    desc: p.desc,
    cost: p.cost,
    type: p.type,
    instant: p.instant_life > 0 ? { life: p.instant_life } : undefined,
    mod: p.dur > 0 && p.dur_decay_reduction > 0 ? {
      id: p.id,
      label: `${p.name} · 衰减 -${(p.dur_decay_reduction * 100).toFixed(0)}%`,
      value: -p.dur_decay_reduction
    } : undefined,
    dur: p.dur || 0,
  }))
}

const potions = new Hono<{ Bindings: Bindings; Variables: ApiVariables }>()

// 获取丹药列表
potions.get('/', async (c) => {
  const potions = await loadPotions(c.env.DB)
  return c.json({ potions })
})

// 购买/使用丹药
potions.post('/:id', authMiddleware, loadProfile, async (c) => {
  const userId = c.get('userId') as number
  const profile = c.get('profile') as Profile
  if (profile.dying) return c.json({ error: '弥留期不可炼丹' }, 400)
  const id = c.req.param('id')
  const potions = await loadPotions(c.env.DB)
  const p = potions.find((x: any) => x.id === id)
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
    UPDATE users SET
      merit = merit - ?, coin = coin - ?,
      bonus_sec = bonus_sec + ?, total_gained_sec = total_gained_sec + ?,
      updated_at = ?
    WHERE id = ?
  `).bind(costMerit, costCoin, bonusGain, bonusGain > 0 ? bonusGain : 0, nowSeconds(), userId).run()

  const msg = bonusGain > 0 ? `服下「${p.name}」，寿命 +${formatLife(bonusGain)}` : `服下「${p.name}」，丹药生效中`
  await pushEvent(c.env.DB, userId, msg, 'good')
  return c.json({ ok: true, msg })
})

export default potions
export { loadPotions }
