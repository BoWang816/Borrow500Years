// 状态模块 - 获取用户完整状态
import { Hono } from 'hono'
import type { Bindings, ApiVariables, Profile, ActivePotion } from '../../types'
import { todayStr, currentDecayRate, currentLifeSec, SEC_PER_YEAR, getRealmTitle } from '../../lib'
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
  
  // 计算总年龄和境界
  const elapsed = (now - profile.start_timestamp) / 1000
  const totalAge = profile.age + elapsed / SEC_PER_YEAR + profile.bonus_sec / SEC_PER_YEAR
  const realm = getRealmTitle(totalAge)
  const bmi = profile.weight / Math.pow(profile.height / 100, 2)
  
  return c.json({
    profile: {
      userId: profile.id,
      username: profile.username,
      name: profile.name,
      gender: profile.gender,
      age: profile.age,
      height: profile.height,
      weight: profile.weight,
      smoke: !!profile.smoke,
      alcohol: !!profile.alcohol,
      stayup: !!profile.stayup,
      hereditary: !!profile.hereditary,
      exercise: !!profile.exercise,
      meditate: !!profile.meditate,
      initialLifeSec: profile.initial_life_sec,
      bonusSec: profile.bonus_sec,
      startTimestamp: profile.start_timestamp,
      totalGainedSec: profile.total_gained_sec,
      coin: profile.coin,
      shard: profile.shard,
      merit: profile.merit,
      streak: profile.streak,
      dying: !!profile.dying,
      dyingStartAt: profile.dying_start_at,
      lifeSec: life,
      totalAge,
      realm,
      bmi,
    },
    today,
    todayTasks: {
      ziwu: !!dt.ziwu, steps: !!dt.steps, water: dt.water || 0,
      meditate: !!dt.meditate, earlyrise: !!dt.earlyrise, diet: !!dt.diet,
    },
    potions: potions.results,
    events: events.results.map((e: any) => ({
      msg: e.msg, 
      kind: e.kind,
      created_at: e.created_at, // 返回秒级时间戳
    })),
    decayRate: currentDecayRate(profile, potions.results),
    serverNow: now,
  })
})

export default state
