// 用户资料模块 - 开启命盘/获取资料/更新资料
import { Hono } from 'hono'
import type { Bindings, ApiVariables } from '../../types'
import { clamp, expectedLifespanYears, SEC_PER_YEAR, nowSeconds } from '../../lib'
import { authMiddleware, pushEvent } from '../middleware'

const profile = new Hono<{ Bindings: Bindings; Variables: ApiVariables }>()

// 开启命盘
profile.post('/onboard', authMiddleware, async (c) => {
  const userId = c.get('userId') as number
  const body = await c.req.json().catch(() => ({})) as any
  const profileData = {
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
  const expected = expectedLifespanYears(profileData as any)
  const remainYears = Math.max(1, expected - profileData.age)
  const initialLifeSec = remainYears * SEC_PER_YEAR
  const startTimestamp = Date.now()

  // 更新users表
  await c.env.DB.prepare(`
    UPDATE users SET
      name=?, gender=?, age=?, height=?, weight=?,
      smoke=?, alcohol=?, stayup=?, hereditary=?, exercise=?, meditate=?,
      initial_life_sec=?, bonus_sec=0, start_timestamp=?, total_gained_sec=0,
      coin=1, shard=0, merit=0, streak=0, dying=0, dying_start_at=NULL, updated_at=?
    WHERE id=?
  `).bind(
    profileData.name, profileData.gender, profileData.age, profileData.height, profileData.weight,
    profileData.smoke, profileData.alcohol, profileData.stayup, profileData.hereditary, profileData.exercise, profileData.meditate,
    initialLifeSec, startTimestamp, nowSeconds(), userId
  ).run()

  // 清空旧记录
  await c.env.DB.prepare('DELETE FROM events WHERE user_id = ?').bind(userId).run()
  await c.env.DB.prepare('DELETE FROM active_potions WHERE user_id = ?').bind(userId).run()
  await c.env.DB.prepare('DELETE FROM daily_tasks WHERE user_id = ?').bind(userId).run()

  await pushEvent(c.env.DB, userId, `命盘开启 · ${profileData.name} · 预测剩余寿命 ${remainYears.toFixed(1)} 年`, 'good')
  return c.json({ ok: true, remainYears, expected })
})

export default profile
