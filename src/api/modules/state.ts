// 状态模块 - 获取用户完整状态
import { Hono } from 'hono'
import type { Bindings, ApiVariables, Profile, ActivePotion } from '../../types'
import { todayStr, currentDecayRate, currentLifeSec } from '../../lib'
import { authMiddleware, loadProfile, pushEvent } from '../middleware'

const state = new Hono<{ Bindings: Bindings; Variables: ApiVariables }>()

// 获取完整状态
state.get('/', authMiddleware, loadProfile, async (c) => {
  const userId = c.get('userId') as number
  const profile = c.get('profile') as Profile

  // 清理过期道具
  const now = Date.now()
  await c.env.DB.prepare('DELETE FROM active_potions WHERE user_id = ? AND expire_at <= ?').bind(userId, now).run()

  const today = todayStr()
  // 当日任务
  let dt = await c.env.DB.prepare('SELECT * FROM daily_tasks WHERE user_id = ? AND task_date = ?').bind(userId, today).first<any>()
  if (!dt) {
    await c.env.DB.prepare(
      'INSERT INTO daily_tasks (user_id, task_date) VALUES (?, ?)'
    ).bind(userId, today).run()
    dt = { ziwu: 0, steps: 0, water: 0, meditate: 0, earlyrise: 0, diet: 0 }
    await pushEvent(c.env.DB, userId, '新的一天，气运重置', 'good')
  }

  // 活跃道具
  const potions = await c.env.DB.prepare(
    'SELECT * FROM active_potions WHERE user_id = ? AND expire_at > ? ORDER BY expire_at ASC'
  ).bind(userId, now).all<ActivePotion>()

  // 事件日志（最近 30 条）
  const events = await c.env.DB.prepare(
    'SELECT msg, kind, created_at FROM events WHERE user_id = ? ORDER BY id DESC LIMIT 30'
  ).bind(userId).all<{ msg: string; kind: string; created_at: number }>()

  // 弥留判定
  let dying = profile.dying === 1
  let life = currentLifeSec(profile)
  if (life <= 0 && !dying) {
    dying = true
    await c.env.DB.prepare('UPDATE users SET dying = 1, dying_start_at = ? WHERE id = ?')
      .bind(now, userId).run()
    profile.dying = 1
    profile.dying_start_at = now
    await pushEvent(c.env.DB, userId, '⚠️ 寿元已尽，进入弥留期', 'bad')
  }
  return c.json({
    profile: {
      ...profile,
      smoke: !!profile.smoke, alcohol: !!profile.alcohol, stayup: !!profile.stayup,
      hereditary: !!profile.hereditary, exercise: !!profile.exercise, meditate: !!profile.meditate,
    },
    today,
    todayTasks: {
      ziwu: !!dt.ziwu, steps: !!dt.steps, water: dt.water || 0,
      meditate: !!dt.meditate, earlyrise: !!dt.earlyrise, diet: !!dt.diet,
    },
    potions: potions.results,
    events: events.results.reverse().map((e: any) => ({
      msg: e.msg, kind: e.kind,
      time: new Date(e.created_at * 1000).toTimeString().slice(0, 8),
    })),
    decayRate: currentDecayRate(profile, potions.results),
    serverNow: now,
  })
})

export default state
