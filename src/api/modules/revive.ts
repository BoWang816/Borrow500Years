// 复活/转世模块
import { Hono } from 'hono'
import type { Bindings, ApiVariables, Profile } from '../../types'
import { nowSeconds } from '../../lib'
import { authMiddleware, loadProfile, pushEvent } from '../middleware'

const revive = new Hono<{ Bindings: Bindings; Variables: ApiVariables }>()

revive.post('/', authMiddleware, loadProfile, async (c) => {
  const userId = c.get('userId') as number
  const profile = c.get('profile') as Profile
  if (!profile.dying) return c.json({ error: '尚未弥留' }, 400)
  if (profile.coin < 1) return c.json({ error: '复活币不足' }, 400)
  await c.env.DB.prepare(`
    UPDATE users SET
      coin = coin - 1, dying = 0, dying_start_at = NULL,
      start_timestamp = ?, bonus_sec = initial_life_sec * 0.5,
      updated_at = ?
    WHERE id = ?
  `).bind(Date.now(), nowSeconds(), userId).run()
  await pushEvent(c.env.DB, userId, '💗 起死回生 · 消耗复活币 1 枚', 'good')
  return c.json({ ok: true })
})

export default revive
