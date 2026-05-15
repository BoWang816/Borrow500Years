// 修炼项目模块 - 扩展养生任务
import { Hono } from 'hono'
import type { Bindings, ApiVariables, Profile } from '../../types'
import { formatLife, nowSeconds, secsToYears, yearsToSecs } from '../../lib'
import { authMiddleware, pushEvent } from '../middleware'

const extraTasks = new Hono<{ Bindings: Bindings; Variables: ApiVariables }>()

// 获取扩展任务配置
extraTasks.get('/config', async (c) => {
  const tasks = await c.env.DB.prepare(
    'SELECT task_key, name, emoji, description, life_reward, merit_reward, shard_reward, sort_order FROM extra_tasks_config WHERE is_active = 1 ORDER BY sort_order'
  ).all()
  return c.json({ tasks: tasks.results })
})

// 获取用户扩展任务完成状态
extraTasks.get('/status', authMiddleware, async (c) => {
  const userId = c.get('userId') as number
  const today = new Date().toISOString().slice(0, 10)
  const userTask = await c.env.DB.prepare(
    'SELECT * FROM user_extra_tasks WHERE user_id = ? AND task_date = ?'
  ).bind(userId, today).first()
  return c.json({ status: userTask || {} })
})

// 完成扩展任务
extraTasks.post('/:taskKey', authMiddleware, async (c) => {
  const userId = c.get('userId') as number
  const taskKey = c.req.param('taskKey')
  const today = new Date().toISOString().slice(0, 10)
  const now = nowSeconds()

  // 获取任务配置
  const config = await c.env.DB.prepare(
    'SELECT life_reward, merit_reward, shard_reward FROM extra_tasks_config WHERE task_key = ? AND is_active = 1'
  ).bind(taskKey).first<{ life_reward: number; merit_reward: number; shard_reward: number }>()

  if (!config) return c.json({ error: '任务不存在' }, 404)

  // 检查今日是否已完成
  let userTask = await c.env.DB.prepare(
    'SELECT * FROM user_extra_tasks WHERE user_id = ? AND task_date = ?'
  ).bind(userId, today).first()

  if (!userTask) {
    const columns = ['user_id', 'task_date', 'created_at', 'updated_at']
    const values = [userId, today, now, now]
    const placeholders = columns.map(() => '?').join(', ')
    await c.env.DB.prepare(
      `INSERT INTO user_extra_tasks (${columns.join(', ')}) VALUES (${placeholders})`
    ).bind(...values).run()
    userTask = await c.env.DB.prepare(
      'SELECT * FROM user_extra_tasks WHERE user_id = ? AND task_date = ?'
    ).bind(userId, today).first()
  }

  // 检查是否已完成
  const taskStatus = userTask[taskKey as keyof typeof userTask] as number
  if (taskStatus >= 1) return c.json({ error: '今日已完成' }, 400)

  // 更新任务状态
  await c.env.DB.prepare(
    `UPDATE user_extra_tasks SET ${taskKey} = 1, updated_at = ? WHERE user_id = ? AND task_date = ?`
  ).bind(now, userId, today).run()

  // 获取用户档案并奖励
  const profile = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first<Profile>()
  if (profile) {
    const lifeRewardYears = secsToYears(config.life_reward)  // 从数据库读取秒，转换为年
    const merit = config.merit_reward
    const shard = config.shard_reward || 0

    // 转换年为秒存储到数据库
    await c.env.DB.prepare(
      'UPDATE users SET bonus_sec = bonus_sec + ?, merit = merit + ?, shard = shard + ? WHERE id = ?'
    ).bind(yearsToSecs(lifeRewardYears), merit, shard, userId).run()

    const taskConfig = await c.env.DB.prepare(
      'SELECT name FROM extra_tasks_config WHERE task_key = ?'
    ).bind(taskKey).first<{ name: string }>()
    await pushEvent(c.env.DB, userId, `完成养生任务：${taskConfig?.name || taskKey}，奖励 +${formatLife(lifeRewardYears)}、${merit}功德`, 'good')
  }

  return c.json({ success: true })
})

export default extraTasks
