// 管理后台 - 运势管理模块
import { Hono } from 'hono'
import type { Bindings } from '../../types'
import { adminMiddleware } from '../middleware'

const adminFortune = new Hono<{ Bindings: Bindings }>()

// 应用管理员中间件到所有路由
adminFortune.use('/*', adminMiddleware)

// 星座映射
const ZODIAC_SIGNS = {
  '白羊座': 'aries',
  '金牛座': 'taurus',
  '双子座': 'gemini',
  '巨蟹座': 'cancer',
  '狮子座': 'leo',
  '处女座': 'virgo',
  '天秤座': 'libra',
  '天蝎座': 'scorpio',
  '射手座': 'sagittarius',
  '摩羯座': 'capricorn',
  '水瓶座': 'aquarius',
  '双鱼座': 'pisces'
}

// 运势等级映射
function getFortuneLevel(score: number): { level: string; title: string } {
  if (score >= 80) return { level: '大吉', title: '大吉大利' }
  if (score >= 60) return { level: '吉', title: '吉星高照' }
  if (score >= 40) return { level: '平', title: '平安顺遂' }
  return { level: '凶', title: '诸事不宜' }
}

// 从外部 API 获取运势
async function fetchFortuneFromAPI(zodiacType: string): Promise<any> {
  try {
    const response = await fetch(`https://v2.xxapi.cn/api/horoscope?type=${zodiacType}&time=today`)
    const result: any = await response.json()
    
    if (result.code === 200 && result.data) {
      const data = result.data
      const allScore = parseInt(data.index.all) || 50
      const fortuneLevel = getFortuneLevel(allScore)
      
      return {
        source: 'api',
        date: new Date().toISOString().split('T')[0],
        fortune: fortuneLevel.level,
        title: fortuneLevel.title,
        zodiac: data.title || data.name,
        poem: data.shortcomment || '今日运势',
        description: data.fortunetext.all || '运势平稳',
        advice: data.todo.yi || '宜静心修养',
        avoid: data.todo.ji || '忌冲动行事',
        luckyDirection: '东方',
        luckyTime: '辰时(07-09)',
        luckyColor: data.luckycolor || '红色',
        luckyNumber: data.luckynumber || '8',
        luckyConstellation: data.luckyconstellation || '金牛座',
        scores: {
          all: data.fortune.all || 3,
          health: data.fortune.health || 3,
          love: data.fortune.love || 3,
          money: data.fortune.money || 3,
          work: data.fortune.work || 3
        },
        indexes: {
          all: data.index.all || '50%',
          health: data.index.health || '50%',
          love: data.index.love || '50%',
          money: data.index.money || '50%',
          work: data.index.work || '50%'
        },
        details: {
          health: data.fortunetext.health || '注意身体健康',
          love: data.fortunetext.love || '感情运势平稳',
          money: data.fortunetext.money || '财运平稳',
          work: data.fortunetext.work || '工作顺利'
        }
      }
    }
    
    throw new Error('API 返回数据格式错误')
  } catch (err) {
    console.error('Failed to fetch fortune from API:', err)
    return null
  }
}

// 获取今日运势（支持指定星座）
adminFortune.get('/today', async (c) => {
  try {
    const zodiacParam = c.req.query('zodiac') || '白羊座'
    const zodiacType = ZODIAC_SIGNS[zodiacParam as keyof typeof ZODIAC_SIGNS] || 'aries'
    
    // 尝试从 API 获取运势
    const fortuneData = await fetchFortuneFromAPI(zodiacType)
    
    if (!fortuneData) {
      return c.json({
        error: 'API 获取失败',
        fortune: null
      })
    }
    
    return c.json({
      fortune: fortuneData
    })
  } catch (err: any) {
    console.error('Admin fortune error:', err)
    return c.json({ error: err.message }, 500)
  }
})

// 获取所有星座的今日运势
adminFortune.get('/all-zodiacs', async (c) => {
  try {
    const zodiacs = Object.keys(ZODIAC_SIGNS)
    const fortunes = []
    
    for (const zodiac of zodiacs) {
      const zodiacType = ZODIAC_SIGNS[zodiac as keyof typeof ZODIAC_SIGNS]
      const fortuneData = await fetchFortuneFromAPI(zodiacType)
      
      if (fortuneData) {
        fortunes.push({
          zodiac,
          ...fortuneData
        })
      }
      
      // 避免请求过快，延迟100ms
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    return c.json({
      fortunes
    })
  } catch (err: any) {
    console.error('All zodiacs error:', err)
    return c.json({ error: err.message }, 500)
  }
})

// 获取运势统计
adminFortune.get('/stats', async (c) => {
  try {
    const today = new Date().toISOString().split('T')[0]
    
    // 今日签到人数
    const checkins = await c.env.DB.prepare(`
      SELECT COUNT(*) as count FROM fortune_checkins WHERE date = ?
    `).bind(today).first<{ count: number }>()
    
    // 总用户数
    const users = await c.env.DB.prepare(`
      SELECT COUNT(*) as count FROM users WHERE name IS NOT NULL
    `).first<{ count: number }>()
    
    // 最高连签
    const maxStreak = await c.env.DB.prepare(`
      SELECT MAX(streak) as max FROM fortune_checkins
    `).first<{ max: number }>()
    
    // 各星座用户分布
    const zodiacDist = await c.env.DB.prepare(`
      SELECT zodiac, COUNT(*) as count 
      FROM users 
      WHERE name IS NOT NULL 
      GROUP BY zodiac 
      ORDER BY count DESC
    `).all()
    
    // 今日各运势等级签到分布
    const fortuneDist = await c.env.DB.prepare(`
      SELECT fortune, COUNT(*) as count 
      FROM fortune_checkins 
      WHERE date = ? 
      GROUP BY fortune
    `).bind(today).all()
    
    const totalCheckins = checkins?.count || 0
    const totalUsers = users?.count || 0
    const checkinRate = totalUsers > 0 ? Math.round((totalCheckins / totalUsers) * 100) : 0
    
    return c.json({
      stats: {
        totalCheckins,
        totalUsers,
        checkinRate,
        maxStreak: maxStreak?.max || 0,
        zodiacDistribution: zodiacDist.results || [],
        fortuneDistribution: fortuneDist.results || []
      }
    })
  } catch (err: any) {
    console.error('Stats error:', err)
    return c.json({ error: err.message }, 500)
  }
})

// 获取今日签到记录
adminFortune.get('/checkins', async (c) => {
  try {
    const today = new Date().toISOString().split('T')[0]
    const page = parseInt(c.req.query('page') || '1')
    const pageSize = parseInt(c.req.query('pageSize') || '20')
    const offset = (page - 1) * pageSize
    
    // 获取总数
    const total = await c.env.DB.prepare(`
      SELECT COUNT(*) as count FROM fortune_checkins WHERE date = ?
    `).bind(today).first<{ count: number }>()
    
    // 获取分页数据
    const records = await c.env.DB.prepare(`
      SELECT 
        fc.id,
        fc.user_id as userId,
        u.username,
        u.zodiac,
        fc.fortune,
        fc.fortune_title as fortuneTitle,
        fc.streak,
        fc.checkin_at as checkinAt
      FROM fortune_checkins fc
      LEFT JOIN users u ON fc.user_id = u.id
      WHERE fc.date = ?
      ORDER BY fc.checkin_at DESC
      LIMIT ? OFFSET ?
    `).bind(today, pageSize, offset).all()
    
    return c.json({
      records: records.results || [],
      total: total?.count || 0,
      page,
      pageSize
    })
  } catch (err: any) {
    console.error('Checkins error:', err)
    return c.json({ error: err.message }, 500)
  }
})

// 刷新运势（重新从 API 获取）
adminFortune.post('/refresh', async (c) => {
  try {
    const body: any = await c.req.json()
    const zodiac = body.zodiac || '白羊座'
    const zodiacType = ZODIAC_SIGNS[zodiac as keyof typeof ZODIAC_SIGNS] || 'aries'
    
    const fortuneData = await fetchFortuneFromAPI(zodiacType)
    
    if (!fortuneData) {
      return c.json({ error: 'API 获取失败' }, 500)
    }
    
    return c.json({
      msg: '运势已刷新',
      fortune: fortuneData
    })
  } catch (err: any) {
    console.error('Refresh error:', err)
    return c.json({ error: err.message }, 500)
  }
})

// 测试 API 连接
adminFortune.get('/test-api', async (c) => {
  try {
    const fortuneData = await fetchFortuneFromAPI('aries')
    
    return c.json({
      success: !!fortuneData,
      data: fortuneData,
      msg: fortuneData ? 'API 连接正常' : 'API 连接失败'
    })
  } catch (err: any) {
    return c.json({
      success: false,
      error: err.message,
      msg: 'API 连接失败'
    })
  }
})

export default adminFortune
