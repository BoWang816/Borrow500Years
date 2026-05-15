// 任务模块 - 完成日常修炼任务
import { Hono } from 'hono'
import type { Bindings, ApiVariables, Profile } from '../../types'
import { clamp, todayStr, formatLife, nowSeconds, SEC_PER_YEAR, getRealmByAge, secsToYears, yearsToSecs } from '../../lib'
import { authMiddleware, loadProfile, pushEvent } from '../middleware'

const tasks = new Hono<{ Bindings: Bindings; Variables: ApiVariables }>()

// 获取养生任务配置（根据用户境界）
tasks.get('/wellness/config', authMiddleware, loadProfile, async (c) => {
  const profile = c.get('profile') as Profile
  
  // 计算用户当前境界ID
  const elapsedYears = (Date.now() - (profile.start_timestamp || 0)) / 1000 / SEC_PER_YEAR
  const bonusYears = secsToYears(profile.bonus_sec || 0)
  const totalAge = (profile.age || 0) + elapsedYears + bonusYears
  const realmData = await getRealmByAge(c.env.DB, totalAge)
  const realmId = realmData.id
  
  // 查询适合当前境界的养生任务
  // 包括：基础任务(realm_id=1且min<=realmId<=max) + 当前境界特定任务(realm_id=realmId)
  const tasks = await c.env.DB.prepare(`
    SELECT task_key, name, emoji, description, reward_type, life_reward, merit_reward, 
           shard_reward, coin_reward, modifier_value, realm_requirement, realm_id,
           min_realm_id, max_realm_id, sort_order, input_config 
    FROM wellness_tasks_config 
    WHERE is_active = 1 
      AND ? >= min_realm_id 
      AND ? <= max_realm_id
    ORDER BY sort_order
  `).bind(realmId, realmId).all()
  
  return c.json({ 
    tasks: tasks.results || [],
    currentRealmId: realmId
  })
})

// 完成任务
tasks.post('/:name', authMiddleware, loadProfile, async (c) => {
  const userId = c.get('userId') as number
  const profile = c.get('profile') as Profile
  if (profile.dying) return c.json({ error: '弥留期不可修炼' }, 400)
  const name = c.req.param('name')
  const body = await c.req.json().catch(() => ({})) as any
  const today = todayStr()

  // 确保当日任务行存在
  await c.env.DB.prepare('INSERT OR IGNORE INTO daily_tasks (user_id, task_date) VALUES (?, ?)').bind(userId, today).run()
  const dt = await c.env.DB.prepare('SELECT * FROM daily_tasks WHERE user_id = ? AND task_date = ?')
    .bind(userId, today).first<any>()

  let gained = 0
  let merit = 0
  let coinDelta = 0
  let shardDelta = 0
  let streakNew = profile.streak
  let msg = ''

  // 处理基础任务（保持向后兼容）
  // 注意：这些硬编码的值现在以年为单位
  const MINUTES_TO_YEARS = 1 / (365.25 * 24 * 60)
  const HOURS_TO_YEARS = 1 / (365.25 * 24)
  
  if (name === 'ziwu') {
    if (dt.ziwu) return c.json({ error: '今日已打卡' }, 400)
    await c.env.DB.prepare('UPDATE daily_tasks SET ziwu = 1 WHERE user_id = ? AND task_date = ?').bind(userId, today).run()
    gained = 30 * MINUTES_TO_YEARS; merit = 2
    msg = '【子午流注】 早睡入梦，寿命 +30 分钟，功德 +2'
  } else if (name === 'steps') {
    if (dt.steps) return c.json({ error: '今日已提交' }, 400)
    const s = clamp(parseInt(body.steps) || 0, 0, 50000)
    if (s < 1000) return c.json({ error: '至少需要 1000 步' }, 400)
    let yearsGain = Math.floor(s / 1000) * 12 * MINUTES_TO_YEARS
    if (s >= 10000) yearsGain += 2 * HOURS_TO_YEARS
    await c.env.DB.prepare('UPDATE daily_tasks SET steps = ? WHERE user_id = ? AND task_date = ?').bind(s, userId, today).run()
    gained = yearsGain
    merit = Math.min(5, Math.floor(s / 2000))
    msg = `【步步为营】 行走 ${s.toLocaleString()} 步，寿命 +${formatLife(yearsGain)}`
  } else if (name === 'water') {
    if (dt.water >= 8) return c.json({ error: '今日已饮满' }, 400)
    const newW = dt.water + 1
    await c.env.DB.prepare('UPDATE daily_tasks SET water = ? WHERE user_id = ? AND task_date = ?').bind(newW, userId, today).run()
    gained = 5 * MINUTES_TO_YEARS
    if (newW === 8) merit = 3
    msg = `【上善若水】 第 ${newW} 杯水，寿命 +5 分钟${newW === 8 ? '，圆满 · 功德 +3' : ''}`
  } else if (name === 'meditate') {
    if (dt.meditate) return c.json({ error: '今日已入定' }, 400)
    await c.env.DB.prepare('UPDATE daily_tasks SET meditate = 1 WHERE user_id = ? AND task_date = ?').bind(userId, today).run()
    gained = 15 * MINUTES_TO_YEARS; merit = 3; shardDelta = 1
    msg = '【静坐养神】 心境清明，寿命 +15 分钟，复活币碎片 +1'
  } else if (name === 'earlyrise') {
    if (dt.earlyrise) return c.json({ error: '今日已早起' }, 400)
    await c.env.DB.prepare('UPDATE daily_tasks SET earlyrise = 1 WHERE user_id = ? AND task_date = ?').bind(userId, today).run()
    streakNew = Math.min(7, profile.streak + 1)
    gained = 20 * MINUTES_TO_YEARS; merit = 4
    msg = `【晨起修行】 连续 ${streakNew}/7 天，寿命 +20 分钟`
    if (streakNew >= 7) {
      coinDelta = 1; streakNew = 0
      msg += ' · 七日劫数功成 · 复活币 +1'
    }
  } else if (name === 'diet') {
    if (dt.diet) return c.json({ error: '今日已记录' }, 400)
    await c.env.DB.prepare('UPDATE daily_tasks SET diet = 1 WHERE user_id = ? AND task_date = ?').bind(userId, today).run()
    gained = 20 * MINUTES_TO_YEARS; merit = 1
    msg = '【清淡饮食】 三餐有节，寿命 +20 分钟'
  } else {
    // 处理境界特定任务（从数据库读取配置）
    const taskConfig = await c.env.DB.prepare(`
      SELECT * FROM wellness_tasks_config 
      WHERE task_key = ? AND is_active = 1
    `).bind(name).first<any>()
    
    if (!taskConfig) {
      return c.json({ error: '未知任务' }, 400)
    }
    
    // 检查是否已完成（使用通用字段）
    const completionKey = `wellness_${name}`
    const completedTasks = JSON.parse(dt.completed_wellness_tasks || '{}')
    if (completedTasks[name]) {
      return c.json({ error: '今日已完成此任务' }, 400)
    }
    
    // 标记为已完成
    completedTasks[name] = true
    await c.env.DB.prepare(`
      UPDATE daily_tasks SET completed_wellness_tasks = ? 
      WHERE user_id = ? AND task_date = ?
    `).bind(JSON.stringify(completedTasks), userId, today).run()
    
    // 应用奖励
    gained = taskConfig.life_reward || 0
    merit = taskConfig.merit_reward || 0
    shardDelta = taskConfig.shard_reward || 0
    coinDelta = taskConfig.coin_reward || 0
    
    msg = `【${taskConfig.name}】 ${taskConfig.description.substring(0, 20)}...，寿命 +${formatLife(gained)}`
    if (merit > 0) msg += `，功德 +${merit}`
    if (shardDelta > 0) msg += `，碎片 +${shardDelta}`
    if (coinDelta > 0) msg += `，复活币 +${coinDelta}`
  }

  // 碎片合成复活币
  let newShard = profile.shard + shardDelta
  let newCoin = profile.coin + coinDelta
  if (newShard >= 5) {
    newCoin += Math.floor(newShard / 5)
    newShard = newShard % 5
    msg += ' · 碎片合成 复活币'
  }

  await c.env.DB.prepare(`
    UPDATE users SET
      bonus_sec = bonus_sec + ?,
      total_gained_sec = total_gained_sec + ?,
      merit = merit + ?,
      coin = ?, shard = ?, streak = ?,
      updated_at = ?
    WHERE id = ?
  `).bind(yearsToSecs(gained), yearsToSecs(gained), merit, newCoin, newShard, streakNew, nowSeconds(), userId).run()

  await pushEvent(c.env.DB, userId, msg, 'good')
  return c.json({ ok: true, gainedYears: gained, msg })
})

export default tasks
