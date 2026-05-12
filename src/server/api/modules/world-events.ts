// 全服事件模块
import { Hono } from 'hono'
import type { Bindings, ApiVariables } from '../../types'
import { nowSeconds } from '../../lib'
import { authMiddleware } from '../middleware'

const worldEvents = new Hono<{ Bindings: Bindings; Variables: ApiVariables }>()

// 获取当前活跃的全服事件
worldEvents.get('/', authMiddleware, async (c) => {
  const now = nowSeconds()

  const events = await c.env.DB.prepare(`
    SELECT * FROM world_events WHERE is_active = 1 AND start_at <= ? AND end_at >= ?
    ORDER BY start_at DESC
  `).bind(now, now).all<any>()

  const userId = c.get('userId') as number
  const joined = await c.env.DB.prepare(`
    SELECT event_id FROM user_world_events WHERE user_id = ?
  `).bind(userId).all<{ event_id: number }>()
  const joinedSet = new Set((joined.results || []).map(j => j.event_id))

  return c.json({
    events: (events.results || []).map((e: any) => ({
      id: e.id,
      key: e.event_key,
      name: e.name,
      emoji: e.emoji,
      description: e.description,
      effectType: e.effect_type,
      effectValue: e.effect_value,
      endAt: e.end_at * 1000,
      hasJoined: joinedSet.has(e.id),
    }))
  })
})

// 参与全服事件
worldEvents.post('/:id/join', authMiddleware, async (c) => {
  const userId = c.get('userId') as number
  const eventId = parseInt(c.req.param('id'))

  const event = await c.env.DB.prepare(
    'SELECT * FROM world_events WHERE id = ? AND is_active = 1'
  ).bind(eventId).first<any>()
  if (!event) return c.json({ error: '事件不存在或已结束' }, 404)

  try {
    await c.env.DB.prepare(
      'INSERT INTO user_world_events (user_id, event_id) VALUES (?, ?)'
    ).bind(userId, eventId).run()
  } catch {
    // already joined
  }

  return c.json({ ok: true, message: `已参与${event.name}` })
})

// 触发随机全服事件（管理员功能）
worldEvents.post('/trigger', authMiddleware, async (c) => {
  const userId = c.get('userId') as number
  
  // 检查是否为管理员
  const user = await c.env.DB.prepare('SELECT username FROM users WHERE id = ?').bind(userId).first<{ username: string }>()
  if (!user) return c.json({ error: '用户不存在' }, 404)
  
  const admins = (c.env.ADMIN_USERS || '').split(',').map((s: string) => s.trim()).filter(Boolean)
  if (!admins.includes(user.username)) {
    return c.json({ error: '权限不足' }, 403)
  }

  const now = nowSeconds()
  
  // 获取所有可用的事件模板
  const templates = await c.env.DB.prepare(`
    SELECT * FROM world_events WHERE is_active = 0
  `).all<any>()
  
  if (!templates.results || templates.results.length === 0) {
    return c.json({ error: '没有可用的事件模板' }, 400)
  }
  
  // 随机选择一个事件
  const template = templates.results[Math.floor(Math.random() * templates.results.length)]
  
  // 创建新的活跃事件（持续24小时）
  const duration = 24 * 3600 // 24小时
  const endAt = now + duration
  
  await c.env.DB.prepare(`
    INSERT INTO world_events (event_key, name, emoji, description, effect_type, effect_value, start_at, end_at, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
  `).bind(
    template.event_key,
    template.name,
    template.emoji,
    template.description,
    template.effect_type,
    template.effect_value,
    now,
    endAt
  ).run()
  
  // 记录管理日志
  await c.env.DB.prepare(`
    INSERT INTO admin_logs (admin_username, action, target_type, target_id, details)
    VALUES (?, 'trigger', 'world_event', ?, ?)
  `).bind(user.username, template.id, `触发全服事件: ${template.name}`).run()
  
  return c.json({ 
    ok: true, 
    msg: `已触发全服事件：${template.name}`,
    event: {
      name: template.name,
      emoji: template.emoji,
      description: template.description,
      endAt: endAt * 1000
    }
  })
})

export default worldEvents
