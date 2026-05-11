// API 中间件模块
import type { D1Database } from '@cloudflare/workers-types'
import type { Profile } from '../types'

// 写事件工具函数
export async function pushEvent(db: D1Database, userId: number, msg: string, kind: string): Promise<void> {
  await db.prepare('INSERT INTO events (user_id, msg, kind) VALUES (?, ?, ?)').bind(userId, msg, kind).run()
  // 仅保留最近 100 条
  await db.prepare(`
    DELETE FROM events WHERE id IN (
      SELECT id FROM events WHERE user_id = ? ORDER BY id DESC LIMIT -1 OFFSET 100
    )
  `).bind(userId).run()
}

// 加载丹药配置
export async function loadPotions(db: D1Database) {
  const potions = await db.prepare('SELECT * FROM potions_config WHERE is_active = 1 ORDER BY sort_order').all()
  return (potions.results || []).map((p: any) => ({
    id: p.id,
    emoji: p.emoji,
    name: p.name,
    desc: p.desc,
    cost: p.cost,
    type: p.type,
    instant: p.instant_life > 0 ? { life: p.instant_life } : null,
    dur: p.dur || 0,
    dur_decay_reduction: p.dur_decay_reduction || 0,
    dur_merit_boost: p.dur_merit_boost || 0,
  }))
}

// 根据 token 解析用户
export async function authMiddleware(c: any, next: any) {
  const auth = c.req.header('Authorization') || ''
  const token = auth.replace(/^Bearer\s+/i, '').trim()
  if (!token) return c.json({ error: '未登录' }, 401)
  const row = await c.env.DB.prepare(
    'SELECT id, username FROM users WHERE token = ? AND (token_expire_at IS NULL OR token_expire_at > ?)'
  ).bind(token, Math.floor(Date.now() / 1000)).first() as { id: number; username: string } | null
  if (!row) return c.json({ error: 'token 失效' }, 401)
  c.set('userId', row.id)
  c.set('username', row.username)
  await next()
}

// 加载用户档案
export async function loadProfile(c: any, next: any) {
  const userId = c.get('userId') as number
  const profile = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first() as Profile | null
  if (!profile || !profile.name) return c.json({ error: '尚未开启命盘' }, 404)
  c.set('profile', profile)
  await next()
}

// 检查是否为管理员
function isAdmin(env: any, username: string): boolean {
  const admins = (env.ADMIN_USERS || '').split(',').map((s: string) => s.trim()).filter(Boolean)
  return admins.includes(username)
}

// 管理员中间件
export async function adminMiddleware(c: any, next: any) {
  // 先执行 authMiddleware 验证 token 并设置 userId 和 username
  await authMiddleware(c, async () => {})
  const username = c.get('username') as string
  if (!isAdmin(c.env, username)) return c.json({ error: '无权访问' }, 403)
  c.set('adminUserId', c.get('userId'))
  c.set('adminUsername', username)
  await next()
}
