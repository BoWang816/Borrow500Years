// 成就系统模块
import { Hono } from 'hono'
import type { Bindings, ApiVariables, Profile } from '../../types'
import { SEC_PER_YEAR } from '../../lib'
import { authMiddleware, loadProfile, pushEvent } from '../middleware'

const ACHIEVEMENTS = [
  { id: 'first_ziwu', name: '初窥子午', desc: '首次完成子午流注打卡', merit: 10, coin: 0 },
  { id: 'first_meditate', name: '入定初阶', desc: '首次完成静坐冥想', merit: 10, coin: 0 },
  { id: 'water_7', name: '上善圆满', desc: '单日饮水 8 杯', merit: 15, coin: 0 },
  { id: 'steps_10k', name: '日行万里', desc: '单日步数达到 10000', merit: 20, coin: 0 },
  { id: 'streak_7', name: '七日劫渡', desc: '完成一次早起 7 天挑战', merit: 30, coin: 1 },
  { id: 'streak_30', name: '月华凝聚', desc: '累计 30 天完成至少一项修炼', merit: 50, coin: 1 },
  { id: 'event_10', name: '命运多舛', desc: '触发 10 次随机事件', merit: 20, coin: 0 },
  { id: 'revive_1', name: '起死回生', desc: '首次使用复活币续命', merit: 10, coin: 0 },
  { id: 'potion_5', name: '丹道入门', desc: '累计服用 5 次丹药', merit: 15, coin: 0 },
  { id: 'elder_100', name: '期颐之寿', desc: '总寿命达到 100 岁', merit: 50, coin: 1 },
  { id: 'elder_200', name: '地仙临世', desc: '总寿命达到 200 岁', merit: 100, coin: 2 },
  { id: 'explorer_10', name: '秘境行者', desc: '进行 10 次秘境探险', merit: 30, coin: 0 },
  { id: 'tribulation_1', name: '渡劫初成', desc: '首次成功渡过天劫', merit: 50, coin: 1 },
] as const

async function getUnlockedIds(db: D1Database, userId: number): Promise<string[]> {
  const rows = await db.prepare('SELECT ach_id FROM achievements WHERE user_id = ?').bind(userId).all<{ ach_id: string }>()
  return (rows.results || []).map((r: { ach_id: string }) => r.ach_id)
}

async function unlockAchievement(db: D1Database, userId: number, achId: string, profile: Profile) {
  const ach = ACHIEVEMENTS.find(a => a.id === achId)
  if (!ach) return null
  try {
    await db.prepare('INSERT INTO achievements (user_id, ach_id) VALUES (?, ?)').bind(userId, achId).run()
    await db.prepare('UPDATE profiles SET merit = merit + ?, coin = coin + ? WHERE user_id = ?')
      .bind(ach.merit, ach.coin, userId).run()
    await pushEvent(db, userId, `🏆 解锁成就「${ach.name}」· ${ach.desc} · 功德 +${ach.merit}${ach.coin > 0 ? ' · 复活币 +' + ach.coin : ''}`, 'gold')
    return ach
  } catch (e: any) {
    if (e.message && e.message.includes('UNIQUE constraint failed')) return null
    throw e
  }
}

const achievements = new Hono<{ Bindings: Bindings; Variables: ApiVariables }>()

achievements.get('/', authMiddleware, loadProfile, async (c) => {
  const userId = c.get('userId') as number
  const unlocked = await getUnlockedIds(c.env.DB, userId)
  const all = ACHIEVEMENTS.map(a => ({ ...a, unlocked: unlocked.includes(a.id) }))
  return c.json({ achievements: all, unlockedCount: unlocked.length })
})

achievements.post('/check', authMiddleware, loadProfile, async (c) => {
  const userId = c.get('userId') as number
  const profile = c.get('profile') as Profile
  const unlocked = await getUnlockedIds(c.env.DB, userId)
  const newly: typeof ACHIEVEMENTS[number][] = []

  const ziwuCount = await c.env.DB.prepare('SELECT COUNT(*) as n FROM daily_tasks WHERE user_id = ? AND ziwu = 1').bind(userId).first<{ n: number }>()
  const meditateCount = await c.env.DB.prepare('SELECT COUNT(*) as n FROM daily_tasks WHERE user_id = ? AND meditate = 1').bind(userId).first<{ n: number }>()
  const eventCount = await c.env.DB.prepare('SELECT COUNT(*) as n FROM events WHERE user_id = ?').bind(userId).first<{ n: number }>()
  const potionCount = await c.env.DB.prepare('SELECT COUNT(*) as n FROM active_potions WHERE user_id = ?').bind(userId).first<{ n: number }>()
  const exploreCount = await c.env.DB.prepare('SELECT COUNT(*) as n FROM events WHERE user_id = ? AND msg LIKE "%秘境探险%"').bind(userId).first<{ n: number }>()
  const tribCount = await c.env.DB.prepare('SELECT COUNT(*) as n FROM tribulations WHERE user_id = ? AND status = "completed"').bind(userId).first<{ n: number }>()
  const activeDays = await c.env.DB.prepare('SELECT COUNT(DISTINCT task_date) as n FROM daily_tasks WHERE user_id = ? AND (ziwu+steps+water+meditate+earlyrise+diet) > 0').bind(userId).first<{ n: number }>()

  const totalAge = profile.age + (Date.now() - profile.start_timestamp) / 1000 / SEC_PER_YEAR + profile.bonus_sec / SEC_PER_YEAR

  const checks: Record<string, boolean> = {
    first_ziwu: !!(ziwuCount && ziwuCount.n > 0),
    first_meditate: !!(meditateCount && meditateCount.n > 0),
    streak_7: profile.streak >= 7,
    streak_30: !!(activeDays && activeDays.n >= 30),
    event_10: !!(eventCount && eventCount.n >= 10),
    revive_1: profile.coin < (profile.coin + 1),
    potion_5: !!(potionCount && potionCount.n >= 5),
    elder_100: totalAge >= 100,
    elder_200: totalAge >= 200,
    explorer_10: !!(exploreCount && exploreCount.n >= 10),
    tribulation_1: !!(tribCount && tribCount.n >= 1),
  }

  for (const [achId, cond] of Object.entries(checks)) {
    if (cond && !unlocked.includes(achId)) {
      const a = await unlockAchievement(c.env.DB, userId, achId, profile)
      if (a) newly.push(a as any)
    }
  }

  return c.json({ newly })
})

export default achievements
