// 排行榜模块
import { Hono } from 'hono'
import type { Bindings } from '../../types'
import { baseDecayMultiplier, SEC_PER_YEAR, getRealmByAge } from '../../lib'

const board = new Hono<{ Bindings: Bindings }>()

board.get('/:type', async (c) => {
  const type = c.req.param('type') // longevity | merit
  const all = await c.env.DB.prepare(`
    SELECT u.id, u.username, u.name, u.gender, u.age, u.height, u.weight,
           u.smoke, u.alcohol, u.stayup, u.exercise, u.meditate,
           u.initial_life_sec, u.bonus_sec, u.start_timestamp, u.total_gained_sec, u.merit,
           ur.current_realm_id, r.name as realm_name, r.major_realm
    FROM users u
    LEFT JOIN user_realms ur ON u.id = ur.user_id
    LEFT JOIN realms r ON ur.current_realm_id = r.id
    WHERE u.name IS NOT NULL
  `).all<any>()

  const now = Date.now()
  const rows = await Promise.all(all.results.map(async (r: any) => {
    const elapsed = (now - r.start_timestamp) / 1000
    const base = baseDecayMultiplier(r)
    const lifeSec = Math.max(0, r.initial_life_sec + r.bonus_sec - elapsed * base)
    const totalAge = r.age + elapsed / SEC_PER_YEAR + r.bonus_sec / SEC_PER_YEAR
    
    // 从数据库获取境界
    let realm = r.realm_name
    let realmId = r.current_realm_id || 1
    if (!realm) {
      const realmData = await getRealmByAge(c.env.DB, totalAge)
      realm = realmData.name
      realmId = realmData.id
    }
    
    return {
      userId: r.id,
      name: r.name,
      age: totalAge,
      lifeSec,
      meritGained: r.merit || 0,
      realm,
      realmId,
      majorRealm: r.major_realm || 1,
    }
  }))

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
    rows: rows.map((r: any) => ({ ...r, isMe: r.userId === myUserId })),
    myRank: myUserId ? rows.findIndex((r: any) => r.userId === myUserId) + 1 : 0,
    total: rows.length,
  })
})

export default board
