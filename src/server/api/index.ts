// API 路由主入口 - 整合所有模块
import { Hono } from 'hono'
import type { Bindings, ApiVariables } from '../types'

// 导入各个模块
import auth from './modules/auth'
import profile from './modules/profile'
import state from './modules/state'
import tasks from './modules/tasks'
import potions from './modules/potions'
import board from './modules/board'
import achievements from './modules/achievements'
import explore from './modules/explore'
import tribulation from './modules/tribulation'
import revive from './modules/revive'
import fortune from './modules/fortune'
import manuals from './modules/manuals'
import extraTasks from './modules/extra-tasks'
import worldEvents from './modules/world-events'
import admin from './modules/admin'
import realms from './modules/realms'
import adminFortune from './modules/admin-fortune'

const api = new Hono<{ Bindings: Bindings; Variables: ApiVariables }>()

// 挂载各模块路由
api.route('/auth', auth)
api.route('/profile', profile)
api.route('/state', state)
api.route('/tasks', tasks)
api.route('/potions', potions)
api.route('/board', board)
api.route('/achievements', achievements)
api.route('/explore', explore)
api.route('/tribulation', tribulation)
api.route('/revive', revive)
api.route('/fortune', fortune)
api.route('/manuals', manuals)
api.route('/extra-tasks', extraTasks)
api.route('/world-events', worldEvents)
api.route('/admin', admin)
api.route('/realms', realms)
api.route('/admin/fortune', adminFortune)

// 管理员检查接口
api.get('/admin/me', async (c) => {
  const authHeader = c.req.header('Authorization') || ''
  const token = authHeader.replace(/^Bearer\s+/i, '').trim()
  if (!token) return c.json({ admin: false })
  const row = await c.env.DB.prepare('SELECT username FROM users WHERE token = ?').bind(token).first<{ username: string }>()
  if (!row) return c.json({ admin: false })
  const admins = (c.env.ADMIN_USERS || '').split(',').map((s: string) => s.trim()).filter(Boolean)
  return c.json({ admin: admins.includes(row.username) })
})

export default api
