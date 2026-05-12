// 丹药模块 - 丹药列表/购买/使用
import { Hono } from 'hono'
import type { Bindings, ApiVariables, Profile } from '../../types'
import { SEC_PER_DAY, formatLife, nowSeconds } from '../../lib'
import { authMiddleware, loadProfile, pushEvent } from '../middleware'

// 默认丹药配置
const DEFAULT_POTIONS = [
  // 基础丹药（6个）
  { id: 'liver', emoji: '💊', name: '护肝片', cost: 30, type: 'merit', mod: { id: 'liver', label: '护肝片 · 抵消熬夜', value: -0.5 }, dur: 24*3600 },
  { id: 'melatonin', emoji: '🌙', name: '褪黑素', cost: 25, type: 'merit', mod: { id: 'mela', label: '褪黑素 · 作息加倍', value: -0.2 }, dur: 12*3600 },
  { id: 'deep', emoji: '🛌', name: '深睡胶囊', cost: 40, type: 'merit', mod: { id: 'deep', label: '深睡 · 衰减减半', value: -0.5 }, dur: 8*3600 },
  { id: 'ginseng', emoji: '🌿', name: '千年人参', cost: 50, type: 'merit', instant: { life: 6*3600 } },
  { id: 'lingzhi', emoji: '🍄', name: '九叶灵芝', cost: 90, type: 'merit', instant: { life: 12*3600 } },
  { id: 'pill', emoji: '🟡', name: '九转金丹', cost: 1, type: 'coin', instant: { life: 365*SEC_PER_DAY } },
  // ... 更多丹药可从数据库加载
]

// 加载丹药配置（支持覆盖）
async function loadPotions(db: any): Promise<any[]> {
  const row = await db.prepare('SELECT value FROM configs WHERE key = ?').bind('potions').first<{ value: string }>()
  if (!row || !row.value) return DEFAULT_POTIONS
  try {
    const overrides = JSON.parse(row.value)
    return DEFAULT_POTIONS.map(p => ({
      ...p,
      ...(overrides[p.id] || {}),
      mod: p.mod ? { ...(p.mod as any), ...(overrides[p.id]?.mod || {}) } : undefined,
      instant: p.instant ? { ...(p.instant as any), ...(overrides[p.id]?.instant || {}) } : undefined,
    }))
  } catch {
    return DEFAULT_POTIONS
  }
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
export { loadPotions, DEFAULT_POTIONS }
