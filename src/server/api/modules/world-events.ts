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

export default worldEvents
