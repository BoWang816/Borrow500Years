// 后台管理模块
import { Hono } from 'hono'
import type { Bindings, ApiVariables } from '../../types'
import { currentLifeSec, SEC_PER_YEAR, todayStr, getRealmTitle, formatLife, nowSeconds } from '../../lib'
import { adminMiddleware, pushEvent } from '../middleware'
import { loadPotions } from './potions'

const admin = new Hono<{ Bindings: Bindings; Variables: ApiVariables }>()

// 用户列表
admin.get('/users', adminMiddleware, async (c) => {
  const all = await c.env.DB.prepare(`
    SELECT id, username, created_at, name, gender, age, height, weight,
           smoke, alcohol, stayup, exercise, meditate,
           initial_life_sec, bonus_sec, start_timestamp, total_gained_sec,
           coin, shard, merit, streak, dying, dying_start_at
    FROM users
    ORDER BY id DESC
  `).all<any>()

  const now = Date.now()
  const users = (all.results || []).map((r: any) => {
    const hasProfile = !!r.start_timestamp
    const lifeSec = hasProfile ? currentLifeSec(r) : 0
    const totalAge = hasProfile ? r.age + (now - r.start_timestamp) / 1000 / SEC_PER_YEAR + r.bonus_sec / SEC_PER_YEAR : 0
    return {
      userId: r.id,
      username: r.username,
      createdAt: r.created_at,
      hasProfile,
      name: r.name,
      gender: r.gender,
      age: r.age,
      bmi: r.weight ? (r.weight / Math.pow(r.height / 100, 2)).toFixed(1) : null,
      lifeSec,
      totalAge,
      realm: hasProfile ? getRealmTitle(totalAge) : null,
      coin: r.coin || 0,
      shard: r.shard || 0,
      merit: r.merit || 0,
      streak: r.streak || 0,
      dying: !!r.dying,
      bonusSec: r.bonus_sec || 0,
      totalGained: r.total_gained_sec || 0,
    }
  })

  const total = users.length
  const active = users.filter((u: any) => u.hasProfile).length
  const avgLife = active > 0 ? users.filter((u: any) => u.hasProfile).reduce((s: number, u: any) => s + u.lifeSec, 0) / active : 0
  const totalMerit = users.reduce((s: number, u: any) => s + u.merit, 0)
  const dyingCount = users.filter((u: any) => u.dying).length

  return c.json({ users, stats: { total, active, avgLifeYears: avgLife / SEC_PER_YEAR, totalMerit, dyingCount } })
})

// 平台概览（兼容前端字段命名）
admin.get('/overview', adminMiddleware, async (c) => {
  try {
    const totalUsers = await c.env.DB.prepare('SELECT COUNT(*) as n FROM users').first<{ n: number }>()
    const activeUsers = await c.env.DB.prepare('SELECT COUNT(*) as n FROM users WHERE name IS NOT NULL').first<{ n: number }>()
    const totalEvents = await c.env.DB.prepare('SELECT COUNT(*) as n FROM events').first<{ n: number }>()
    const totalPotionsUsed = await c.env.DB.prepare('SELECT COUNT(*) as n FROM active_potions').first<{ n: number }>()

    // 最近活跃用户
    const recent = await c.env.DB.prepare(`
      SELECT name, initial_life_sec + bonus_sec as life, start_timestamp
      FROM users
      WHERE name IS NOT NULL
      ORDER BY id DESC
      LIMIT 10
    `).all<any>()

    return c.json({
      userCount: totalUsers?.n || 0,
      activeUsers: activeUsers?.n || 0,
      eventCount: totalEvents?.n || 0,
      totalPotionsUsed: totalPotionsUsed?.n || 0,
      recentUsers: (recent.results || []).map((r: any) => ({
        name: r.name,
        life: r.life,
        lastActive: new Date(r.start_timestamp).toLocaleDateString('zh-CN')
      }))
    })
  } catch (err: any) {
    return c.json({ error: err.message || '查询失败', stack: err.stack }, 500)
  }
})

// 平台统计
admin.get('/stats', adminMiddleware, async (c) => {
  const totalUsers = await c.env.DB.prepare('SELECT COUNT(*) as n FROM users').first<{ n: number }>()
  const activeUsers = await c.env.DB.prepare('SELECT COUNT(*) as n FROM users WHERE name IS NOT NULL').first<{ n: number }>()
  const today = todayStr()
  const todayTasks = await c.env.DB.prepare('SELECT COUNT(*) as n FROM daily_tasks WHERE task_date = ?').bind(today).first<{ n: number }>()
  const totalEvents = await c.env.DB.prepare('SELECT COUNT(*) as n FROM events').first<{ n: number }>()
  const totalPotions = await c.env.DB.prepare('SELECT COUNT(*) as n FROM active_potions').first<{ n: number }>()
  const totalAch = await c.env.DB.prepare('SELECT COUNT(*) as n FROM achievements').first<{ n: number }>()

  return c.json({
    totalUsers: totalUsers?.n || 0,
    activeUsers: activeUsers?.n || 0,
    todayTasks: todayTasks?.n || 0,
    totalEvents: totalEvents?.n || 0,
    totalPotions: totalPotions?.n || 0,
    totalAchievements: totalAch?.n || 0,
  })
})

// 丹药使用记录
admin.get('/potions-records', adminMiddleware, async (c) => {
  const records = await c.env.DB.prepare(`
    SELECT id, user_id, potion_id, potion_name, potion_emoji, mod_id, mod_label, mod_value, expire_at
    FROM active_potions
    ORDER BY id DESC LIMIT 100
  `).all<any>()
  
  return c.json({ 
    potions: (records.results || []).map((r: any) => ({
      id: r.id,
      userId: r.user_id,
      potionId: r.potion_id,
      potionName: r.potion_name,
      potionEmoji: r.potion_emoji,
      modId: r.mod_id,
      modLabel: r.mod_label,
      modValue: r.mod_value,
      expireAt: r.expire_at
    }))
  })
})

// 丹药配置
admin.get('/potions', adminMiddleware, async (c) => {
  const potions = await loadPotions(c.env.DB)
  const overrides = await c.env.DB.prepare('SELECT value FROM configs WHERE key = ?').bind('potions').first<{ value: string }>()
  return c.json({ potions, overrides: overrides?.value || null })
})

admin.post('/potions', adminMiddleware, async (c) => {
  const adminUserId = c.get('adminUserId') as number
  const body = await c.req.json().catch(() => ({})) as any
  const overrides = body.overrides
  if (typeof overrides !== 'object') return c.json({ error: 'overrides 必须是对象' }, 400)

  await c.env.DB.prepare(`
    INSERT INTO configs (key, value, updated_at) VALUES (?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
  `).bind('potions', JSON.stringify(overrides), nowSeconds()).run()

  await c.env.DB.prepare('INSERT INTO admin_logs (admin_user_id, action, detail) VALUES (?, ?, ?)')
    .bind(adminUserId, '修改丹药配置', JSON.stringify(overrides)).run()

  return c.json({ ok: true })
})

// 操作日志
admin.get('/logs', adminMiddleware, async (c) => {
  const logs = await c.env.DB.prepare(`
    SELECT l.id, l.action, l.detail, l.created_at, u.username
    FROM admin_logs l
    JOIN users u ON u.id = l.admin_user_id
    ORDER BY l.id DESC LIMIT 100
  `).all<any>()
  return c.json({ logs: (logs.results || []).map((r: any) => ({
    id: r.id,
    admin: r.username,
    action: r.action,
    detail: r.detail,
    time: new Date(r.created_at * 1000).toLocaleString('zh-CN'),
  })) })
})

// 功法管理
admin.get('/manuals', adminMiddleware, async (c) => {
  const manuals = await c.env.DB.prepare('SELECT * FROM manuals ORDER BY id ASC').all()
  return c.json({ manuals: manuals.results })
})

// 修炼项目管理
admin.get('/extra-tasks', adminMiddleware, async (c) => {
  const tasks = await c.env.DB.prepare('SELECT * FROM extra_tasks_config ORDER BY sort_order ASC').all()
  return c.json({ tasks: tasks.results })
})

// 历练项目管理
admin.get('/explore-loot', adminMiddleware, async (c) => {
  const loots = await c.env.DB.prepare('SELECT * FROM explore_loot_config ORDER BY sort_order ASC').all()
  return c.json({ loots: loots.results })
})

// 丹药基础配置管理
admin.get('/potions-config', adminMiddleware, async (c) => {
  const potions = await c.env.DB.prepare('SELECT * FROM potions_config ORDER BY id ASC').all()
  return c.json({ potions: potions.results })
})

// 全服事件列表
admin.get('/events', adminMiddleware, async (c) => {
  const events = await c.env.DB.prepare('SELECT * FROM world_events ORDER BY id DESC LIMIT 50').all()
  return c.json({ events: events.results || [] })
})

// 创建全服事件
admin.post('/world-events', adminMiddleware, async (c) => {
  const adminUserId = c.get('adminUserId') as number
  const body = await c.req.json().catch(() => ({})) as any
  const name = body.name || ''
  const description = body.description || ''
  const duration = body.duration || 86400000
  const effectType = body.effectType || 'global_merit'
  const effectValue = body.effectValue || 0

  const now = nowSeconds()
  const endAt = now + Math.floor(duration / 1000)

  await c.env.DB.prepare(`
    INSERT INTO world_events (event_key, name, description, emoji, effect_type, effect_value, start_at, end_at, is_active)
    VALUES (?, ?, ?, '📢', ?, ?, ?, ?, 1)
  `).bind(name.toLowerCase().replace(/\s+/g, '_'), name, description, effectType, effectValue, now, endAt).run()

  await c.env.DB.prepare('INSERT INTO admin_logs (admin_user_id, action, detail) VALUES (?, ?, ?)')
    .bind(adminUserId, '创建全服事件', name).run()

  return c.json({ ok: true })
})

// 创建功法
admin.post('/manuals', adminMiddleware, async (c) => {
  const adminUserId = c.get('adminUserId') as number
  const body = await c.req.json().catch(() => ({})) as any

  await c.env.DB.prepare(`
    INSERT INTO manuals (key, name, emoji, description, effect_type, effect_value, max_level, cost_merit)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(body.key, body.name, body.emoji || '📿', body.description, body.effectType, body.effectValue, body.maxLevel || 10, body.costMerit || 100).run()

  await c.env.DB.prepare('INSERT INTO admin_logs (admin_user_id, action, detail) VALUES (?, ?, ?)')
    .bind(adminUserId, '创建功法', body.name).run()

  return c.json({ ok: true })
})

// 更新功法
admin.put('/manuals/:id', adminMiddleware, async (c) => {
  const adminUserId = c.get('adminUserId') as number
  const id = c.req.param('id')
  const body = await c.req.json().catch(() => ({})) as any

  await c.env.DB.prepare(`
    UPDATE manuals SET key = ?, name = ?, emoji = ?, description = ?, effect_type = ?, effect_value = ?, max_level = ?, cost_merit = ?
    WHERE id = ?
  `).bind(body.key, body.name, body.emoji, body.description, body.effectType, body.effectValue, body.maxLevel, body.costMerit, id).run()

  await c.env.DB.prepare('INSERT INTO admin_logs (admin_user_id, action, detail) VALUES (?, ?, ?)')
    .bind(adminUserId, '更新功法', `${body.name} (ID: ${id})`).run()

  return c.json({ ok: true })
})

// 删除功法
admin.delete('/manuals/:id', adminMiddleware, async (c) => {
  const adminUserId = c.get('adminUserId') as number
  const id = c.req.param('id')
  
  const manual = await c.env.DB.prepare('SELECT name FROM manuals WHERE id = ?').bind(id).first<{ name: string }>()
  await c.env.DB.prepare('DELETE FROM manuals WHERE id = ?').bind(id).run()

  await c.env.DB.prepare('INSERT INTO admin_logs (admin_user_id, action, detail) VALUES (?, ?, ?)')
    .bind(adminUserId, '删除功法', `${manual?.name || 'Unknown'} (ID: ${id})`).run()

  return c.json({ ok: true })
})

// 创建修炼项目
admin.post('/extra-tasks', adminMiddleware, async (c) => {
  const adminUserId = c.get('adminUserId') as number
  const body = await c.req.json().catch(() => ({})) as any

  await c.env.DB.prepare(`
    INSERT INTO extra_tasks_config (task_key, name, emoji, description, life_reward, merit_reward, shard_reward, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(body.key, body.name, body.emoji || '🧘', body.description, body.lifeReward || 600, body.meritReward || 1, body.shardReward || 0, body.sortOrder || 0).run()

  await c.env.DB.prepare('INSERT INTO admin_logs (admin_user_id, action, detail) VALUES (?, ?, ?)')
    .bind(adminUserId, '创建修炼项目', body.name).run()

  return c.json({ ok: true })
})

// 更新修炼项目
admin.put('/extra-tasks/:id', adminMiddleware, async (c) => {
  const adminUserId = c.get('adminUserId') as number
  const id = c.req.param('id')
  const body = await c.req.json().catch(() => ({})) as any

  await c.env.DB.prepare(`
    UPDATE extra_tasks_config SET task_key = ?, name = ?, emoji = ?, description = ?, life_reward = ?, merit_reward = ?, shard_reward = ?, sort_order = ?
    WHERE id = ?
  `).bind(body.key, body.name, body.emoji, body.description, body.lifeReward, body.meritReward, body.shardReward, body.sortOrder, id).run()

  await c.env.DB.prepare('INSERT INTO admin_logs (admin_user_id, action, detail) VALUES (?, ?, ?)')
    .bind(adminUserId, '更新修炼项目', `${body.name} (ID: ${id})`).run()

  return c.json({ ok: true })
})

// 删除修炼项目
admin.delete('/extra-tasks/:id', adminMiddleware, async (c) => {
  const adminUserId = c.get('adminUserId') as number
  const id = c.req.param('id')
  
  const task = await c.env.DB.prepare('SELECT name FROM extra_tasks_config WHERE id = ?').bind(id).first<{ name: string }>()
  await c.env.DB.prepare('DELETE FROM extra_tasks_config WHERE id = ?').bind(id).run()

  await c.env.DB.prepare('INSERT INTO admin_logs (admin_user_id, action, detail) VALUES (?, ?, ?)')
    .bind(adminUserId, '删除修炼项目', `${task?.name || 'Unknown'} (ID: ${id})`).run()

  return c.json({ ok: true })
})

// 创建历练项目
admin.post('/explore-loot', adminMiddleware, async (c) => {
  const adminUserId = c.get('adminUserId') as number
  const body = await c.req.json().catch(() => ({})) as any

  await c.env.DB.prepare(`
    INSERT INTO explore_loot_config (name, weight, sort_order, msg, life, merit, shard)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(body.name, body.weight || 10, body.sortOrder || 0, body.msg || '', body.life || 0, body.merit || 0, body.shard || 0).run()

  await c.env.DB.prepare('INSERT INTO admin_logs (admin_user_id, action, detail) VALUES (?, ?, ?)')
    .bind(adminUserId, '创建历练项目', body.name).run()

  return c.json({ ok: true })
})

// 更新历练项目
admin.put('/explore-loot/:id', adminMiddleware, async (c) => {
  const adminUserId = c.get('adminUserId') as number
  const id = c.req.param('id')
  const body = await c.req.json().catch(() => ({})) as any

  await c.env.DB.prepare(`
    UPDATE explore_loot_config SET name = ?, weight = ?, sort_order = ?, msg = ?, life = ?, merit = ?, shard = ?
    WHERE id = ?
  `).bind(body.name, body.weight, body.sortOrder, body.msg, body.life, body.merit, body.shard, id).run()

  await c.env.DB.prepare('INSERT INTO admin_logs (admin_user_id, action, detail) VALUES (?, ?, ?)')
    .bind(adminUserId, '更新历练项目', `${body.name} (ID: ${id})`).run()

  return c.json({ ok: true })
})

// 删除历练项目
admin.delete('/explore-loot/:id', adminMiddleware, async (c) => {
  const adminUserId = c.get('adminUserId') as number
  const id = c.req.param('id')
  
  const loot = await c.env.DB.prepare('SELECT name FROM explore_loot_config WHERE id = ?').bind(id).first<{ name: string }>()
  await c.env.DB.prepare('DELETE FROM explore_loot_config WHERE id = ?').bind(id).run()

  await c.env.DB.prepare('INSERT INTO admin_logs (admin_user_id, action, detail) VALUES (?, ?, ?)')
    .bind(adminUserId, '删除历练项目', `${loot?.name || 'Unknown'} (ID: ${id})`).run()

  return c.json({ ok: true })
})

// 创建丹药配置
admin.post('/potions-config', adminMiddleware, async (c) => {
  const adminUserId = c.get('adminUserId') as number
  const body = await c.req.json().catch(() => ({})) as any

  await c.env.DB.prepare(`
    INSERT INTO potions_config (id, name, emoji, desc, cost, type, instant_life, dur, dur_decay_reduction, dur_merit_boost, sort_order, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
  `).bind(body.id, body.name, body.emoji || '💊', body.description, body.cost || 30, body.costType || 'merit', body.instantLife || 0, body.dur || 86400, body.durDecayReduction || 0, body.durMeritBoost || 0, body.sortOrder || 0).run()

  await c.env.DB.prepare('INSERT INTO admin_logs (admin_user_id, action, detail) VALUES (?, ?, ?)')
    .bind(adminUserId, '创建丹药配置', body.name).run()

  return c.json({ ok: true })
})

// 更新丹药配置
admin.put('/potions-config/:id', adminMiddleware, async (c) => {
  const adminUserId = c.get('adminUserId') as number
  const id = c.req.param('id')
  const body = await c.req.json().catch(() => ({})) as any

  await c.env.DB.prepare(`
    UPDATE potions_config SET name = ?, emoji = ?, desc = ?, cost = ?, type = ?, instant_life = ?, dur = ?, dur_decay_reduction = ?, dur_merit_boost = ?, sort_order = ?, is_active = ?
    WHERE id = ?
  `).bind(body.name, body.emoji, body.description, body.cost, body.costType, body.instantLife, body.dur, body.durDecayReduction, body.durMeritBoost, body.sortOrder, body.isActive ? 1 : 0, id).run()

  await c.env.DB.prepare('INSERT INTO admin_logs (admin_user_id, action, detail) VALUES (?, ?, ?)')
    .bind(adminUserId, '更新丹药配置', `${body.name} (ID: ${id})`).run()

  return c.json({ ok: true })
})

// 删除丹药配置
admin.delete('/potions-config/:id', adminMiddleware, async (c) => {
  const adminUserId = c.get('adminUserId') as number
  const id = c.req.param('id')
  
  const potion = await c.env.DB.prepare('SELECT name FROM potions_config WHERE id = ?').bind(id).first<{ name: string }>()
  await c.env.DB.prepare('DELETE FROM potions_config WHERE id = ?').bind(id).run()

  await c.env.DB.prepare('INSERT INTO admin_logs (admin_user_id, action, detail) VALUES (?, ?, ?)')
    .bind(adminUserId, '删除丹药配置', `${potion?.name || 'Unknown'} (ID: ${id})`).run()

  return c.json({ ok: true })
})

// 删除丹药使用记录
admin.delete('/potions-records/:id', adminMiddleware, async (c) => {
  const adminUserId = c.get('adminUserId') as number
  const id = c.req.param('id')
  
  const record = await c.env.DB.prepare('SELECT potion_name FROM active_potions WHERE id = ?').bind(id).first<{ potion_name: string }>()
  await c.env.DB.prepare('DELETE FROM active_potions WHERE id = ?').bind(id).run()

  await c.env.DB.prepare('INSERT INTO admin_logs (admin_user_id, action, detail) VALUES (?, ?, ?)')
    .bind(adminUserId, '删除丹药记录', `${record?.potion_name || 'Unknown'} (ID: ${id})`).run()

  return c.json({ ok: true })
})

// 结束全服事件
admin.post('/world-events/:id/end', adminMiddleware, async (c) => {
  const adminUserId = c.get('adminUserId') as number
  const id = c.req.param('id')
  await c.env.DB.prepare('UPDATE world_events SET is_active = 0, end_at = ? WHERE id = ?')
    .bind(nowSeconds(), id).run()
  
  await c.env.DB.prepare('INSERT INTO admin_logs (admin_user_id, action, detail) VALUES (?, ?, ?)')
    .bind(adminUserId, '结束全服事件', `事件ID: ${id}`).run()
    
  return c.json({ ok: true })
})

// 更新全服事件
admin.put('/world-events/:id', adminMiddleware, async (c) => {
  const adminUserId = c.get('adminUserId') as number
  const id = c.req.param('id')
  const body = await c.req.json().catch(() => ({})) as any

  await c.env.DB.prepare(`
    UPDATE world_events SET name = ?, description = ?, effect_type = ?, effect_value = ?
    WHERE id = ?
  `).bind(body.name, body.description, body.effectType, body.effectValue, id).run()

  await c.env.DB.prepare('INSERT INTO admin_logs (admin_user_id, action, detail) VALUES (?, ?, ?)')
    .bind(adminUserId, '更新全服事件', `${body.name} (ID: ${id})`).run()

  return c.json({ ok: true })
})

// 删除全服事件
admin.delete('/world-events/:id', adminMiddleware, async (c) => {
  const adminUserId = c.get('adminUserId') as number
  const id = c.req.param('id')
  
  const event = await c.env.DB.prepare('SELECT name FROM world_events WHERE id = ?').bind(id).first<{ name: string }>()
  await c.env.DB.prepare('DELETE FROM world_events WHERE id = ?').bind(id).run()

  await c.env.DB.prepare('INSERT INTO admin_logs (admin_user_id, action, detail) VALUES (?, ?, ?)')
    .bind(adminUserId, '删除全服事件', `${event?.name || 'Unknown'} (ID: ${id})`).run()

  return c.json({ ok: true })
})

export default admin
