// 状态模块 - 获取用户完整状态
import { Hono } from 'hono'
import type { Bindings, ApiVariables, Profile, ActivePotion } from '../../types'
import { todayStr, currentDecayRate, currentLifeYears, SEC_PER_YEAR, getRealmByAge, secsToYears } from '../../lib'
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
  let life = currentLifeYears(profile)
  if (life <= 0 && !dying) {
    dying = true
    await c.env.DB.prepare('UPDATE users SET dying = 1, dying_start_at = ? WHERE id = ?')
      .bind(now, userId).run()
    profile.dying = 1
    profile.dying_start_at = now
    await pushEvent(c.env.DB, userId, '⚠️ 寿元已尽，进入弥留期', 'bad')
  }
  
  // 计算总年龄和境界
  const elapsedYears = (now - (profile.start_timestamp || now)) / 1000 / SEC_PER_YEAR
  const bonusYears = secsToYears(profile.bonus_sec || 0)
  const totalAge = (profile.age || 0) + elapsedYears + bonusYears
  
  // 从数据库获取境界
  const realmData = await getRealmByAge(c.env.DB, totalAge)
  const realm = realmData.name
  const realmId = realmData.id
  
  const bmi = (profile.weight && profile.height) ? profile.weight / Math.pow(profile.height / 100, 2) : 0
  
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
      initialLifeYears: secsToYears(profile.initial_life_sec || 0),
      bonusYears: secsToYears(profile.bonus_sec || 0),
      startTimestamp: profile.start_timestamp,
      totalGainedYears: secsToYears(profile.total_gained_sec || 0),
      coin: profile.coin,
      shard: profile.shard,
      merit: profile.merit,
      streak: profile.streak,
      dying: !!profile.dying,
      dyingStartAt: profile.dying_start_at,
      lifeYears: life,
      totalAge,
      realm,
      realmId,
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
