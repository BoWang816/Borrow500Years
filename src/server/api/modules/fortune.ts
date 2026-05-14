// 运势模块
import { Hono } from 'hono'
import type { Bindings } from '../../types'
import { authMiddleware } from '../middleware'

const fortune = new Hono<{ Bindings: Bindings }>()

// 应用认证中间件到所有路由
fortune.use('/*', authMiddleware)

// 星座映射（用户可以在个人资料中设置星座）
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

// 运势等级映射（根据综合运势分数）
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
    const result = await response.json()
    
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

// 运势等级配置
const FORTUNE_LEVELS = [
  { level: '大吉', title: '大吉大利', weight: 10 },
  { level: '吉', title: '吉星高照', weight: 30 },
  { level: '平', title: '平安顺遂', weight: 40 },
  { level: '凶', title: '诸事不宜', weight: 20 }
]

// 运势诗句库
const FORTUNE_POEMS = {
  '大吉': [
    '紫气东来三千里，鸿运当头万事兴',
    '天降祥瑞福满门，金榜题名正当时',
    '春风得意马蹄疾，一日看尽长安花',
    '龙腾虎跃展宏图，鹏程万里正此时'
  ],
  '吉': [
    '和风细雨润心田，喜事连连笑开颜',
    '云开雾散见青天，好运相随福绵绵',
    '柳暗花明又一村，贵人相助事事顺',
    '春暖花开好时节，万事如意心欢悦'
  ],
  '平': [
    '平平淡淡才是真，守得云开见月明',
    '静水流深藏玄机，平心静气待时机',
    '不急不躁稳中求，细水长流福自来',
    '平常心态度时光，静待花开自芬芳'
  ],
  '凶': [
    '乌云密布遮天日，谨言慎行莫冒进',
    '风雨欲来山满楼，静心修身待时休',
    '多事之秋需谨慎，韬光养晦保平安',
    '暗礁险滩需小心，退一步海阔天空'
  ]
}

// 运势描述
const FORTUNE_DESCRIPTIONS = {
  '大吉': [
    '今日运势极佳，诸事顺遂，是开展新计划的绝佳时机',
    '天时地利人和，今日行事必有贵人相助，事半功倍',
    '运势如虹，把握机会，今日所为必有所成',
    '吉星高照，今日宜大胆尝试，必有意外之喜'
  ],
  '吉': [
    '今日运势良好，适合处理重要事务，但需保持谨慎',
    '运势平稳向上，今日努力必有收获',
    '吉运相伴，今日宜积极进取，但不可过于冒进',
    '运势不错，今日行事顺利，但需注意细节'
  ],
  '平': [
    '今日运势平稳，宜守不宜攻，保持现状为上',
    '运势平平，今日宜静心修养，不宜大动作',
    '平淡是福，今日宜按部就班，稳扎稳打',
    '运势平和，今日宜低调行事，积蓄力量'
  ],
  '凶': [
    '今日运势欠佳，诸事不宜，宜静不宜动',
    '运势低迷，今日需谨言慎行，避免冲突',
    '今日多有阻碍，宜退守观望，不宜冒进',
    '运势不利，今日宜韬光养晦，静待时机'
  ]
}

// 宜忌建议
const FORTUNE_ADVICE = {
  '大吉': {
    advice: ['开业', '签约', '投资', '求职', '表白', '出行'],
    avoid: ['犹豫不决', '错失良机', '过度谦虚']
  },
  '吉': {
    advice: ['学习', '工作', '社交', '运动', '理财'],
    avoid: ['冲动决策', '过度劳累', '与人争执']
  },
  '平': {
    advice: ['休息', '整理', '复习', '反思', '养生'],
    avoid: ['冒险', '投机', '大额消费', '重大决策']
  },
  '凶': {
    advice: ['静心', '读书', '冥想', '早睡', '低调'],
    avoid: ['出行', '签约', '投资', '争执', '冒险']
  }
}

// 方位时辰
const DIRECTIONS = ['东方', '南方', '西方', '北方', '东南', '西南', '东北', '西北']
const TIMES = ['子时(23-01)', '丑时(01-03)', '寅时(03-05)', '卯时(05-07)', '辰时(07-09)', '巳时(09-11)', '午时(11-13)', '未时(13-15)', '申时(15-17)', '酉时(17-19)', '戌时(19-21)', '亥时(21-23)']
const COLORS = ['红色', '橙色', '黄色', '绿色', '青色', '蓝色', '紫色', '白色', '金色', '银色']

// 生成今日运势
function generateDailyFortune(date: string): any {
  // 使用日期作为随机种子，确保同一天生成相同的运势
  const seed = date.split('-').reduce((acc, val) => acc + parseInt(val), 0)
  
  // 伪随机函数
  const seededRandom = (index: number) => {
    const x = Math.sin(seed + index) * 10000
    return x - Math.floor(x)
  }
  
  // 根据权重选择运势等级
  let random = seededRandom(1) * 100
  let selectedLevel = FORTUNE_LEVELS[0]
  
  for (const level of FORTUNE_LEVELS) {
    if (random <= level.weight) {
      selectedLevel = level
      break
    }
    random -= level.weight
  }
  
  const fortuneLevel = selectedLevel.level
  const poems = FORTUNE_POEMS[fortuneLevel]
  const descriptions = FORTUNE_DESCRIPTIONS[fortuneLevel]
  const adviceData = FORTUNE_ADVICE[fortuneLevel]
  
  return {
    date,
    fortune: fortuneLevel,
    title: selectedLevel.title,
    poem: poems[Math.floor(seededRandom(2) * poems.length)],
    description: descriptions[Math.floor(seededRandom(3) * descriptions.length)],
    advice: adviceData.advice[Math.floor(seededRandom(4) * adviceData.advice.length)],
    avoid: adviceData.avoid[Math.floor(seededRandom(5) * adviceData.avoid.length)],
    luckyDirection: DIRECTIONS[Math.floor(seededRandom(6) * DIRECTIONS.length)],
    luckyTime: TIMES[Math.floor(seededRandom(7) * TIMES.length)],
    luckyColor: COLORS[Math.floor(seededRandom(8) * COLORS.length)]
  }
}

// 获取今日运势
fortune.get('/', async (c) => {
  try {
    const userId = c.get('userId') as number
    const today = new Date().toISOString().split('T')[0]
    
    // 获取用户星座（从用户资料中，如果没有则默认使用白羊座）
    const user = await c.env.DB.prepare(`
      SELECT zodiac FROM users WHERE id = ?
    `).bind(userId).first<{ zodiac?: string }>()
    
    const userZodiac = user?.zodiac || '白羊座'
    const zodiacType = ZODIAC_SIGNS[userZodiac as keyof typeof ZODIAC_SIGNS] || 'aries'
    
    // 尝试从 API 获取运势
    let fortuneData = await fetchFortuneFromAPI(zodiacType)
    
    // 如果 API 失败，使用本地生成的运势
    if (!fortuneData) {
      fortuneData = generateDailyFortune(today)
      fortuneData.source = 'local'
      fortuneData.zodiac = userZodiac
    }
    
    // 检查用户今日是否已签到
    const checkin = await c.env.DB.prepare(`
      SELECT * FROM fortune_checkins 
      WHERE user_id = ? AND date = ?
    `).bind(userId, today).first()
    
    return c.json({
      ...fortuneData,
      checkedIn: !!checkin
    })
  } catch (err: any) {
    console.error('Fortune error:', err)
    return c.json({ error: err.message }, 500)
  }
})

// 签到领取运势加成
fortune.post('/checkin', async (c) => {
  try {
    const userId = c.get('userId') as number
    const today = new Date().toISOString().split('T')[0]
    
    // 检查是否已签到
    const existing = await c.env.DB.prepare(`
      SELECT * FROM fortune_checkins 
      WHERE user_id = ? AND date = ?
    `).bind(userId, today).first()
    
    if (existing) {
      return c.json({ error: '今日已签到' }, 400)
    }
    
    // 获取今日运势
    const fortuneData = generateDailyFortune(today)
    
    // 计算连签天数
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    const yesterdayCheckin = await c.env.DB.prepare(`
      SELECT streak FROM fortune_checkins 
      WHERE user_id = ? AND date = ?
    `).bind(userId, yesterday).first<{ streak: number }>()
    
    const streak = yesterdayCheckin ? yesterdayCheckin.streak + 1 : 1
    
    // 记录签到
    await c.env.DB.prepare(`
      INSERT INTO fortune_checkins (user_id, date, fortune, fortune_title, streak, checkin_at)
      VALUES (?, ?, ?, ?, ?, unixepoch())
    `).bind(userId, today, fortuneData.fortune, fortuneData.title, streak).run()
    
    // 根据运势等级给予奖励
    let meritBonus = 0
    let coinBonus = 0
    
    switch (fortuneData.fortune) {
      case '大吉':
        meritBonus = 100
        coinBonus = 10
        break
      case '吉':
        meritBonus = 50
        coinBonus = 5
        break
      case '平':
        meritBonus = 20
        coinBonus = 2
        break
      case '凶':
        meritBonus = 10
        coinBonus = 1
        break
    }
    
    // 连签奖励
    if (streak >= 7) {
      meritBonus += 50
      coinBonus += 5
    }
    
    // 更新用户资源
    await c.env.DB.prepare(`
      UPDATE users 
      SET merit = merit + ?, coin = coin + ?
      WHERE id = ?
    `).bind(meritBonus, coinBonus, userId).run()
    
    return c.json({
      msg: `签到成功！获得 ${meritBonus} 功德、${coinBonus} 金币`,
      streak,
      meritBonus,
      coinBonus
    })
  } catch (err: any) {
    console.error('Checkin error:', err)
    return c.json({ error: err.message }, 500)
  }
})

export default fortune
