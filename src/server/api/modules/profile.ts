// 用户资料模块 - 开启命盘/获取资料/更新资料
import { Hono } from 'hono'
import type { Bindings, ApiVariables } from '../../types'
import { clamp, expectedLifespanYears, yearsToSecs, nowSeconds } from '../../lib'
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
    smoke: clamp(parseInt(body.smoke) || 0, 0, 3),
    alcohol: clamp(parseInt(body.alcohol) || 0, 0, 3),
    stayup: clamp(parseInt(body.stayup) || 0, 0, 3),
    hereditary: clamp(parseInt(body.hereditary) || 0, 0, 3),
    exercise: clamp(parseInt(body.exercise) || 0, 0, 3),
    meditate: clamp(parseInt(body.meditate) || 0, 0, 3),
  }
  
  // 使用前端传来的初始寿命（已经过天命测算，单位：年）
  const initialLifeYears = parseFloat(body.initialLifeYears) || expectedLifespanYears(profileData as any)
  const initialLifeSec = yearsToSecs(initialLifeYears)  // 转换为秒存储
  const initialMerit = parseInt(body.initialMerit) || 0
  const startTimestamp = Date.now()

  // 更新users表（数据库仍使用秒）
  await c.env.DB.prepare(`
    UPDATE users SET
      name=?, gender=?, age=?, height=?, weight=?,
      smoke=?, alcohol=?, stayup=?, hereditary=?, exercise=?, meditate=?,
      initial_life_sec=?, bonus_sec=0, start_timestamp=?, total_gained_sec=0,
      coin=1, shard=0, merit=?, streak=0, dying=0, dying_start_at=NULL, updated_at=?
    WHERE id=?
  `).bind(
    profileData.name, profileData.gender, profileData.age, profileData.height, profileData.weight,
    profileData.smoke, profileData.alcohol, profileData.stayup, profileData.hereditary, profileData.exercise, profileData.meditate,
    initialLifeSec, startTimestamp, initialMerit, nowSeconds(), userId
  ).run()

  // 清空旧记录
  await c.env.DB.prepare('DELETE FROM events WHERE user_id = ?').bind(userId).run()
  await c.env.DB.prepare('DELETE FROM active_potions WHERE user_id = ?').bind(userId).run()
  await c.env.DB.prepare('DELETE FROM daily_tasks WHERE user_id = ?').bind(userId).run()

  const remainYears = initialLifeYears.toFixed(1)
  const message = initialMerit > 0 
    ? `命盘开启 · ${profileData.name} · 一线生机 · 初始功德 ${initialMerit}`
    : `命盘开启 · ${profileData.name} · 预测剩余寿命 ${remainYears} 年`
  
  await pushEvent(c.env.DB, userId, message, 'good')
  return c.json({ ok: true, remainYears: parseFloat(remainYears), initialMerit })
})

export default profile
