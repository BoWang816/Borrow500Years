// 秘境探险模块
import { Hono } from 'hono'
import type { Bindings, ApiVariables, Profile } from '../../types'
import { formatLife, nowSeconds } from '../../lib'
import { authMiddleware, loadProfile, pushEvent } from '../middleware'

// 探索掉落配置（简化版）
const EXPLORE_LOOT = [
  { name: '灵气稀薄', msg: '秘境空荡，一无所获', weight: 15, life: 0, merit: 0, shard: 0 },
  { name: '拾得灵草', msg: '墙角发现一株无名灵草', weight: 25, life: 15*60, merit: 5, shard: 0 },
  { name: '灵气灌体', msg: '偶遇灵气漩涡，寿命微增', weight: 25, life: 30*60, merit: 10, shard: 0 },
  { name: '洞天福地', msg: '闯入洞天福地，寿命大增', weight: 12, life: 12*3600, merit: 20, shard: 1 },
  { name: '仙缘天降', msg: '天赐仙缘，获神秘馈赠', weight: 5, life: 24*3600, merit: 30, shard: 2 },
  { name: '遗迹碎片', msg: '发现上古遗迹，获得碎片', weight: 8, life: 6*3600, merit: 15, shard: 3 },
  { name: '悟道机缘', msg: '顿悟天地至理，功德无量', weight: 4, life: 48*3600, merit: 50, shard: 1 },
  { name: '上古传承', msg: '获得上古大能传承，脱胎换骨', weight: 0.5, life: 365*86400, merit: 100, shard: 5 },
] as const

function rollExplore() {
  const total = EXPLORE_LOOT.reduce((s, l) => s + l.weight, 0)
  let r = Math.random() * total
  for (const l of EXPLORE_LOOT) {
    r -= l.weight
    if (r <= 0) return l
  }
  return EXPLORE_LOOT[0]
}

const explore = new Hono<{ Bindings: Bindings; Variables: ApiVariables }>()

explore.post('/', authMiddleware, loadProfile, async (c) => {
  const userId = c.get('userId') as number
  const profile = c.get('profile') as Profile
  if (profile.dying) return c.json({ error: '弥留期不可探险' }, 400)
  const cost = 20
  if (profile.merit < cost) return c.json({ error: '功德不足（需 20）' }, 400)

  const loot = rollExplore()
  let newShard = profile.shard + loot.shard
  let newCoin = profile.coin
  if (newShard >= 5) {
    newCoin += Math.floor(newShard / 5)
    newShard = newShard % 5
  }

  await c.env.DB.prepare(`
    UPDATE users SET merit = merit - ?, bonus_sec = bonus_sec + ?,
      total_gained_sec = total_gained_sec + ?,
      coin = ?, shard = ?, updated_at = ?
    WHERE id = ?
  `).bind(cost, loot.life, Math.max(0, loot.life), newCoin, newShard, nowSeconds(), userId).run()

  const msg = `秘境探险 · ${loot.name} · ${loot.msg} · 寿命 ${loot.life > 0 ? '+' + formatLife(loot.life) : '无变化'} · 功德 ${loot.merit > 0 ? '+' + loot.merit : '-20'}`
  await pushEvent(c.env.DB, userId, msg, loot.life >= 6*3600 ? 'gold' : loot.life > 0 ? 'good' : 'normal')

  return c.json({ ok: true, loot: { name: loot.name, msg: loot.msg, life: loot.life, merit: loot.merit, shard: loot.shard } })
})

export default explore
