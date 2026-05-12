// 认证模块 - 注册/登录/登出
import { Hono } from 'hono'
import type { Bindings, ApiVariables } from '../../types'
import { hashPassword, genToken, nowSeconds } from '../../lib'
import { authMiddleware } from '../middleware'

const auth = new Hono<{ Bindings: Bindings; Variables: ApiVariables }>()

// 注册
auth.post('/register', async (c) => {
  const body = await c.req.json().catch(() => ({})) as any
  const username = String(body.username || '').trim().slice(0, 24)
  const password = String(body.password || '')
  if (!username || username.length < 2) return c.json({ error: '道号至少 2 个字符' }, 400)
  if (!password || password.length < 4) return c.json({ error: '密码至少 4 位' }, 400)

  const exist = await c.env.DB.prepare('SELECT id FROM users WHERE username = ?').bind(username).first()
  if (exist) return c.json({ error: '此道号已被占用' }, 409)

  const hash = await hashPassword(password)
  const token = genToken()
  const expire = nowSeconds() + 30 * 86400 // 30天
  const ins = await c.env.DB.prepare(
    'INSERT INTO users (username, password_hash, token, token_expire_at) VALUES (?, ?, ?, ?)'
  ).bind(username, hash, token, expire).run()
  return c.json({ token, userId: ins.meta.last_row_id, username, needsOnboarding: true })
})

// 登录
auth.post('/login', async (c) => {
  const body = await c.req.json().catch(() => ({})) as any
  const username = String(body.username || '').trim()
  const password = String(body.password || '')
  if (!username || !password) return c.json({ error: '请输入道号与密码' }, 400)

  const hash = await hashPassword(password)
  const row = await c.env.DB.prepare(
    'SELECT id FROM users WHERE username = ? AND password_hash = ?'
  ).bind(username, hash).first<{ id: number }>()
  if (!row) return c.json({ error: '道号或密码错误' }, 401)

  const token = genToken()
  const expire = nowSeconds() + 30 * 86400
  await c.env.DB.prepare('UPDATE users SET token = ?, token_expire_at = ? WHERE id = ?')
    .bind(token, expire, row.id).run()

  // 是否已开命盘
  const hasProfile = await c.env.DB.prepare('SELECT name FROM users WHERE id = ? AND name IS NOT NULL').bind(row.id).first()
  return c.json({ token, userId: row.id, username, needsOnboarding: !hasProfile })
})

// 登出
auth.post('/logout', authMiddleware, async (c) => {
  const userId = c.get('userId') as number
  await c.env.DB.prepare('UPDATE users SET token = NULL, token_expire_at = NULL WHERE id = ?').bind(userId).run()
  return c.json({ ok: true })
})

export default auth
