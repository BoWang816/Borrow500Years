// 排行榜模块
import { Hono } from 'hono'
import type { Bindings } from '../../types'
import { baseDecayMultiplier, SEC_PER_YEAR, getRealmTitle } from '../../lib'

const board = new Hono<{ Bindings: Bindings }>()

board.get('/:type', async (c) => {
  const type = c.req.param('type') // longevity | merit
  const all = await c.env.DB.prepare(`
    SELECT id, username, name, gender, age, height, weight,
           smoke, alcohol, stayup, exercise, meditate,
           initial_life_sec, bonus_sec, start_timestamp, total_gained_sec
    FROM users
    WHERE name IS NOT NULL
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

export default board
