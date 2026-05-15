// 天劫挑战模块
import { Hono } from 'hono'
import type { Bindings, ApiVariables, Profile } from '../../types'
import { SEC_PER_DAY, formatLife, nowSeconds, todayStr, yearsToSecs } from '../../lib'
import { authMiddleware, loadProfile, pushEvent } from '../middleware'

const TRIBULATION_TASK_POOL = ['ziwu', 'steps', 'water', 'meditate', 'diet']

function currentWeekId(): string {
  const d = new Date()
  const start = new Date(d.getFullYear(), 0, 1)
  const diff = d.getTime() - start.getTime()
  const oneWeek = 7 * 24 * 3600 * 1000
  const weekNum = Math.floor(diff / oneWeek) + 1
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`
}

const tribulation = new Hono<{ Bindings: Bindings; Variables: ApiVariables }>()

tribulation.get('/', authMiddleware, loadProfile, async (c) => {
  const userId = c.get('userId') as number
  const profile = c.get('profile') as Profile
  const weekId = currentWeekId()

  let trib = await c.env.DB.prepare('SELECT * FROM tribulations WHERE user_id = ? AND week_id = ?')
    .bind(userId, weekId).first<any>()

  if (!trib) {
    const shuffled = [...TRIBULATION_TASK_POOL].sort(() => Math.random() - 0.5)
    const tasks = shuffled.slice(0, 3)
    await c.env.DB.prepare(`
      INSERT INTO tribulations (user_id, week_id, status, tasks) VALUES (?, ?, 'pending', ?)
    `).bind(userId, weekId, JSON.stringify(tasks)).run()
    trib = { status: 'pending', tasks: JSON.stringify(tasks), week_id: weekId }
  }

  const tasks = JSON.parse(trib.tasks || '[]')
  const today = todayStr()

  const dt = await c.env.DB.prepare('SELECT ziwu, steps, water, meditate, earlyrise, diet FROM daily_tasks WHERE user_id = ? AND task_date = ?')
    .bind(userId, today).first<any>()

  const taskStatus = tasks.map((t: string) => {
    let done = false
    if (!dt) return { task: t, done: false }
    if (t === 'ziwu') done = !!dt.ziwu
    else if (t === 'steps') done = dt.steps >= 10000
    else if (t === 'water') done = dt.water >= 8
    else if (t === 'meditate') done = !!dt.meditate
    else if (t === 'diet') done = !!dt.diet
    return { task: t, done }
  })

  const allDone = taskStatus.every((s: any) => s.done)
  const isPending = trib.status === 'pending'
  const isAccepted = trib.status === 'accepted'
  const isCompleted = trib.status === 'completed'
  const isFailed = trib.status === 'failed'

  return c.json({
    weekId,
    status: trib.status,
    tasks: taskStatus,
    allDone,
    canAccept: isPending,
    canComplete: isAccepted && allDone,
    isCompleted,
    isFailed,
  })
})

tribulation.post('/accept', authMiddleware, loadProfile, async (c) => {
  try {
    const userId = c.get('userId') as number
    const profile = c.get('profile') as Profile
    if (profile.dying) return c.json({ error: '弥留期不可渡劫' }, 400)
    const weekId = currentWeekId()
    const trib = await c.env.DB.prepare('SELECT * FROM tribulations WHERE user_id = ? AND week_id = ?')
      .bind(userId, weekId).first<any>()
    if (!trib || trib.status !== 'pending') return c.json({ error: '当前无可接天劫' }, 400)

    await c.env.DB.prepare('UPDATE tribulations SET status = "accepted", accepted_at = ? WHERE id = ?')
      .bind(nowSeconds(), trib.id).run()
    await pushEvent(c.env.DB, userId, '⚡ 接下天劫 · 本周内需完成指定修炼', 'normal')
    return c.json({ ok: true, msg: '已接受天劫挑战' })
  } catch (error: any) {
    console.error('Accept tribulation error:', error)
    return c.json({ error: '接受天劫失败: ' + error.message }, 500)
  }
})

tribulation.post('/complete', authMiddleware, loadProfile, async (c) => {
  try {
    const userId = c.get('userId') as number
    const weekId = currentWeekId()
    const trib = await c.env.DB.prepare('SELECT * FROM tribulations WHERE user_id = ? AND week_id = ?')
      .bind(userId, weekId).first<any>()
    if (!trib || trib.status !== 'accepted') return c.json({ error: '未接受或已完成' }, 400)

    const tasks = JSON.parse(trib.tasks || '[]')
    const today = todayStr()
    const dt = await c.env.DB.prepare('SELECT ziwu, steps, water, meditate, earlyrise, diet FROM daily_tasks WHERE user_id = ? AND task_date = ?')
      .bind(userId, today).first<any>()

    const allDone = tasks.every((t: string) => {
      if (!dt) return false
      if (t === 'ziwu') return !!dt.ziwu
      if (t === 'steps') return dt.steps >= 10000
      if (t === 'water') return dt.water >= 8
      if (t === 'meditate') return !!dt.meditate
      if (t === 'diet') return !!dt.diet
      return false
    })

    if (!allDone) return c.json({ error: '尚未完成全部天劫任务' }, 400)

    const rewardYears = 7 / 365.25  // 7天转换为年
    const now = nowSeconds()
    
    await c.env.DB.prepare('UPDATE tribulations SET status = "completed", completed_at = ?, reward_sec = ? WHERE id = ?')
      .bind(now, yearsToSecs(rewardYears), trib.id).run()
    await c.env.DB.prepare(`
      UPDATE users SET bonus_sec = bonus_sec + ?, total_gained_sec = total_gained_sec + ?, merit = merit + ?, updated_at = ? WHERE user_id = ?
    `).bind(yearsToSecs(rewardYears), yearsToSecs(rewardYears), 50, now, userId).run()

    await pushEvent(c.env.DB, userId, `🌩️ 渡劫成功 · 天劫已过 · 寿命 +7 天 · 功德 +50`, 'gold')
    return c.json({ ok: true, rewardYears, merit: 50, msg: '渡劫成功！寿命 +7 天，功德 +50' })
  } catch (error: any) {
    console.error('Complete tribulation error:', error)
    return c.json({ error: '渡劫完成失败: ' + error.message }, 500)
  }
})

tribulation.post('/fail', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId') as number
    const weekId = currentWeekId()
    const trib = await c.env.DB.prepare('SELECT * FROM tribulations WHERE user_id = ? AND week_id = ?')
      .bind(userId, weekId).first<any>()
    if (!trib || trib.status !== 'accepted') return c.json({ error: '无可放弃的天劫' }, 400)

    const penaltyYears = 3 / (365.25 * 24)  // 3小时转换为年
    await c.env.DB.prepare('UPDATE tribulations SET status = "failed" WHERE id = ?').bind(trib.id).run()
    await c.env.DB.prepare('UPDATE users SET bonus_sec = MAX(0, bonus_sec - ?), updated_at = ? WHERE user_id = ?')
      .bind(yearsToSecs(penaltyYears), nowSeconds(), userId).run()
    await pushEvent(c.env.DB, userId, '💀 天劫失败 · 修为受损 · 寿命 -3 小时', 'bad')
    return c.json({ ok: true, penaltyYears, msg: '天劫失败，寿命 -3 小时' })
  } catch (error: any) {
    console.error('Fail tribulation error:', error)
    return c.json({ error: '天劫失败处理错误: ' + error.message }, 500)
  }
})

export default tribulation
