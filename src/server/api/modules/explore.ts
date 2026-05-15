// 秘境探险模块
import { Hono } from 'hono'
import type { Bindings, ApiVariables, Profile } from '../../types'
import { formatLife, nowSeconds } from '../../lib'
import { authMiddleware, loadProfile, pushEvent } from '../middleware'

// 从数据库加载探索掉落配置
async function loadExploreLoot(db: any) {
  const result = await db.prepare(
    'SELECT * FROM explore_loot_config ORDER BY sort_order ASC'
  ).all()
  return result.results || []
}

function rollExplore(lootTable: any[]) {
  const total = lootTable.reduce((s: number, l: any) => s + l.weight, 0)
  let r = Math.random() * total
  for (const l of lootTable) {
    r -= l.weight
    if (r <= 0) return l
  }
  return lootTable[0]
}

const explore = new Hono<{ Bindings: Bindings; Variables: ApiVariables }>()

// 获取探索配置（供前端展示）
explore.get('/config', async (c) => {
  const lootTable = await loadExploreLoot(c.env.DB)
  return c.json({ lootTable })
})

explore.post('/', authMiddleware, loadProfile, async (c) => {
  const userId = c.get('userId') as number
  const profile = c.get('profile') as Profile
  if (profile.dying) return c.json({ error: '弥留期不可探险' }, 400)
  const cost = 20
  if (profile.merit < cost) return c.json({ error: '功德不足（需 20）' }, 400)

  const lootTable = await loadExploreLoot(c.env.DB)
  if (lootTable.length === 0) {
    return c.json({ error: '暂无探索配置' }, 500)
  }

  const loot = rollExplore(lootTable)
  let newShard = profile.shard + loot.shard
  let newCoin = profile.coin
  if (newShard >= 5) {
    newCoin += Math.floor(newShard / 5)
    newShard = newShard % 5
  }

  await c.env.DB.prepare(`
    UPDATE users SET merit = merit - ?, bonus_years = bonus_years + ?,
      total_gained_years = total_gained_years + ?,
      coin = ?, shard = ?, updated_at = ?
    WHERE id = ?
  `).bind(cost, loot.life, Math.max(0, loot.life), newCoin, newShard, nowSeconds(), userId).run()

  const msg = `秘境探险 · ${loot.name} · ${loot.msg} · 寿命 ${loot.life > 0 ? '+' + formatLife(loot.life) : '无变化'} · 功德 ${loot.merit > 0 ? '+' + loot.merit : '-20'}`
  await pushEvent(c.env.DB, userId, msg, loot.life >= 0.5 ? 'gold' : loot.life > 0 ? 'good' : 'normal')

  return c.json({ 
    ok: true, 
    msg,
    loot: { 
      name: loot.name, 
      msg: loot.msg, 
      life: loot.life, 
      merit: loot.merit, 
      shard: loot.shard 
    } 
  })
})

export default explore
