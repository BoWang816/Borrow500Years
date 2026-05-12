// 境界管理模块
import { Hono } from 'hono'
import type { Bindings, ApiVariables, Profile } from '../../types'
import { nowSeconds } from '../../lib'
import { authMiddleware, loadProfile, pushEvent } from '../middleware'

const realms = new Hono<{ Bindings: Bindings; Variables: ApiVariables }>()

// 获取所有境界列表
realms.get('/list', async (c) => {
  const list = await c.env.DB.prepare(`
    SELECT * FROM realms ORDER BY sort_order ASC
  `).all()
  
  return c.json({ realms: list.results || [] })
})

// 获取用户当前境界信息
realms.get('/current', authMiddleware, async (c) => {
  const userId = c.get('userId') as number
  
  const result = await c.env.DB.prepare(`
    SELECT 
      ur.*,
      r.name as realm_name,
      r.major_realm,
      r.sub_realm,
      r.major_realm_name,
      r.lifespan_max,
      r.description,
      r.core_logic,
      r.breakthrough_age_min,
      r.breakthrough_age_max
    FROM user_realms ur
    JOIN realms r ON ur.current_realm_id = r.id
    WHERE ur.user_id = ?
  `).bind(userId).first<any>()
  
  if (!result) {
    // 如果用户没有境界记录，初始化为胎息境
    const now = nowSeconds()
    await c.env.DB.prepare(`
      INSERT INTO user_realms (user_id, current_realm_id, breakthrough_count, created_at, updated_at)
      VALUES (?, 1, 0, ?, ?)
    `).bind(userId, now, now).run()
    
    const newResult = await c.env.DB.prepare(`
      SELECT 
        ur.*,
        r.name as realm_name,
        r.major_realm,
        r.sub_realm,
        r.major_realm_name,
        r.lifespan_max,
        r.description,
        r.core_logic
      FROM user_realms ur
      JOIN realms r ON ur.current_realm_id = r.id
      WHERE ur.user_id = ?
    `).bind(userId).first<any>()
    
    return c.json(newResult)
  }
  
  return c.json(result)
})

// 获取下一个境界信息
realms.get('/next', authMiddleware, async (c) => {
  const userId = c.get('userId') as number
  
  const current = await c.env.DB.prepare(`
    SELECT current_realm_id FROM user_realms WHERE user_id = ?
  `).bind(userId).first<any>()
  
  if (!current) {
    return c.json({ error: '未找到境界信息' }, 404)
  }
  
  const nextRealm = await c.env.DB.prepare(`
    SELECT * FROM realms WHERE id = ?
  `).bind(current.current_realm_id + 1).first<any>()
  
  if (!nextRealm) {
    return c.json({ message: '已达最高境界' })
  }
  
  return c.json(nextRealm)
})

// 境界突破
realms.post('/breakthrough', authMiddleware, loadProfile, async (c) => {
  try {
    const userId = c.get('userId') as number
    const profile = c.get('profile') as Profile
    
    if (profile.dying) {
      return c.json({ error: '弥留期无法突破境界' }, 400)
    }
    
    // 获取当前境界
    const userRealm = await c.env.DB.prepare(`
      SELECT * FROM user_realms WHERE user_id = ?
    `).bind(userId).first<any>()
    
    if (!userRealm) {
      return c.json({ error: '未找到境界信息' }, 404)
    }
    
    const currentRealm = await c.env.DB.prepare(`
      SELECT * FROM realms WHERE id = ?
    `).bind(userRealm.current_realm_id).first<any>()
    
    const nextRealm = await c.env.DB.prepare(`
      SELECT * FROM realms WHERE id = ?
    `).bind(userRealm.current_realm_id + 1).first<any>()
    
    if (!nextRealm) {
      return c.json({ error: '已达最高境界' }, 400)
    }
    
    // 计算突破所需功德（基础公式：境界ID * 100）
    const meritCost = nextRealm.id * 100
    
    if (profile.merit < meritCost) {
      return c.json({ error: `功德不足，需要 ${meritCost} 功德` }, 400)
    }
    
    // 计算当前年龄（使用 total_gained_sec 作为总年龄）
    const currentAge = profile.total_gained_sec
    
    const now = nowSeconds()
    
    // 扣除功德
    await c.env.DB.prepare(`
      UPDATE profiles SET merit = merit - ?, updated_at = ? WHERE user_id = ?
    `).bind(meritCost, now, userId).run()
    
    // 更新境界
    await c.env.DB.prepare(`
      UPDATE user_realms 
      SET current_realm_id = ?, 
          breakthrough_count = breakthrough_count + 1,
          last_breakthrough_at = ?,
          updated_at = ?
      WHERE user_id = ?
    `).bind(nextRealm.id, now, now, userId).run()
    
    // 记录突破日志
    await c.env.DB.prepare(`
      INSERT INTO realm_breakthrough_logs 
      (user_id, from_realm_id, to_realm_id, breakthrough_at, age_at_breakthrough, merit_cost, success)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `).bind(userId, currentRealm.id, nextRealm.id, now, currentAge, meritCost).run()
    
    // 推送事件
    await pushEvent(
      c.env.DB, 
      userId, 
      `🌟 境界突破 · ${currentRealm.name} → ${nextRealm.name} · 消耗功德 ${meritCost}`, 
      'gold'
    )
    
    return c.json({ 
      ok: true, 
      msg: `成功突破至 ${nextRealm.name}`,
      fromRealm: currentRealm.name,
      toRealm: nextRealm.name,
      meritCost,
      newRealmId: nextRealm.id
    })
  } catch (error: any) {
    console.error('Breakthrough error:', error)
    return c.json({ error: '境界突破失败: ' + error.message }, 500)
  }
})

// 获取突破历史
realms.get('/history', authMiddleware, async (c) => {
  const userId = c.get('userId') as number
  
  const history = await c.env.DB.prepare(`
    SELECT 
      rbl.*,
      r1.name as from_realm_name,
      r2.name as to_realm_name
    FROM realm_breakthrough_logs rbl
    JOIN realms r1 ON rbl.from_realm_id = r1.id
    JOIN realms r2 ON rbl.to_realm_id = r2.id
    WHERE rbl.user_id = ?
    ORDER BY rbl.breakthrough_at DESC
    LIMIT 50
  `).bind(userId).all()
  
  return c.json({ history: history.results || [] })
})

export default realms
