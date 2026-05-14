// 境界修炼系统模块
import { Hono } from 'hono'
import type { Bindings, ApiVariables, Profile } from '../../types'
import { formatLife, nowSeconds, getRealmByAge, SEC_PER_YEAR } from '../../lib'
import { authMiddleware, loadProfile, pushEvent } from '../middleware'

const cultivation = new Hono<{ Bindings: Bindings; Variables: ApiVariables }>()

// 获取当前境界可用的修炼项目
cultivation.get('/practices', authMiddleware, loadProfile, async (c) => {
  const userId = c.get('userId') as number
  const profile = c.get('profile') as Profile
  
  try {
    // 计算用户当前境界
    const now = Date.now()
    const elapsed = (now - (profile.start_timestamp || 0)) / 1000
    const totalAge = (profile.age || 0) + elapsed / SEC_PER_YEAR + (profile.bonus_sec || 0) / SEC_PER_YEAR
    const realmData = await getRealmByAge(c.env.DB, totalAge)
    const currentRealmId = realmData.id
    
    // 检查表是否存在
    const tableCheck = await c.env.DB.prepare(`
      SELECT name FROM sqlite_master WHERE type='table' AND name='cultivation_practices'
    `).first()
    
    if (!tableCheck) {
      return c.json({ 
        error: '修炼项目表不存在，请先运行数据库迁移脚本',
        practices: [],
        currentRealmId,
        currentRealmName: realmData.name
      })
    }
    
    // 获取当前境界及之前境界的所有修炼项目
    const practices = await c.env.DB.prepare(`
      SELECT * FROM cultivation_practices 
      WHERE realm_id <= ? AND is_active = 1
      ORDER BY realm_id ASC, sort_order ASC
    `).bind(currentRealmId).all<any>()
    
    // 获取用户的修炼进度
    const userProgress = await c.env.DB.prepare(`
      SELECT * FROM user_cultivation_progress WHERE user_id = ?
  `).bind(userId).all<any>()
  
  const progressMap = new Map(
    (userProgress.results || []).map((p: any) => [p.practice_key, p])
  )
  
  // 检查今日修炼次数（重置逻辑）
  const today = new Date().toISOString().split('T')[0]
  
  const result = (practices.results || []).map((p: any) => {
    const progress = progressMap.get(p.key)
    const todayCount = progress?.today_date === today ? progress.today_practice_count : 0
    
    return {
      key: p.key,
      name: p.name,
      emoji: p.emoji,
      description: p.description,
      realmId: p.realm_id,
      requiredRealmLevel: p.required_realm_level,
      practiceType: p.practice_type,
      category: p.category,
      difficulty: p.difficulty,
      practiceTime: p.practice_time,
      cooldownTime: p.cooldown_time,
      costMerit: p.cost_merit,
      costLife: p.cost_life,
      costCoin: p.cost_coin,
      rewardLife: p.reward_life,
      rewardMerit: p.reward_merit,
      rewardShard: p.reward_shard,
      rewardExp: p.reward_exp,
      effectType: p.effect_type,
      effectValue: p.effect_value,
      effectDuration: p.effect_duration,
      helpsBreakthrough: !!p.helps_breakthrough,
      breakthroughContribution: p.breakthrough_contribution,
      maxLevel: p.max_level,
      dailyLimit: p.daily_limit,
      rarity: p.rarity,
      
      // 用户进度
      userLevel: progress?.level || 0,
      userExp: progress?.experience || 0,
      totalPracticeCount: progress?.total_practice_count || 0,
      successCount: progress?.success_count || 0,
      failureCount: progress?.failure_count || 0,
      isActive: !!progress?.is_active,
      isMastered: !!progress?.is_mastered,
      lastPracticeAt: progress?.last_practice_at,
      todayPracticeCount: todayCount,
      
      // 可用性判断
      canPractice: todayCount < p.daily_limit || p.daily_limit === 0,
      isUnlocked: currentRealmId >= p.realm_id,
      isAffordable: (profile.merit || 0) >= p.cost_merit && 
                    (profile.coin || 0) >= p.cost_coin
      // 寿命检查在修炼时进行
    }
  })
  
  return c.json({ 
    practices: result,
    currentRealmId,
    currentRealmName: realmData.name
  })
  } catch (error: any) {
    console.error('Error fetching cultivation practices:', error)
    return c.json({ 
      error: error.message || '获取修炼项目失败',
      practices: [],
      currentRealmId: 1,
      currentRealmName: '未知'
    }, 500)
  }
})

// 修炼功法
cultivation.post('/practice/:key', authMiddleware, loadProfile, async (c) => {
  const userId = c.get('userId') as number
  const profile = c.get('profile') as Profile
  const practiceKey = c.req.param('key')
  
  // 获取修炼项目信息
  const practice = await c.env.DB.prepare(`
    SELECT * FROM cultivation_practices WHERE key = ? AND is_active = 1
  `).bind(practiceKey).first<any>()
  
  if (!practice) {
    return c.json({ error: '修炼项目不存在' }, 404)
  }
  
  // 检查境界要求
  const now = Date.now()
  const elapsed = (now - (profile.start_timestamp || 0)) / 1000
  const totalAge = (profile.age || 0) + elapsed / SEC_PER_YEAR + (profile.bonus_sec || 0) / SEC_PER_YEAR
  const realmData = await getRealmByAge(c.env.DB, totalAge)
  
  if (realmData.id < practice.realm_id) {
    return c.json({ error: `需要达到更高境界才能修炼此功法` }, 400)
  }
  
  // 检查消耗
  if ((profile.merit || 0) < practice.cost_merit) {
    return c.json({ error: `功德不足，需要 ${practice.cost_merit}` }, 400)
  }
  if ((profile.coin || 0) < practice.cost_coin) {
    return c.json({ error: `复活币不足，需要 ${practice.cost_coin}` }, 400)
  }
  // 寿命检查：计算当前剩余寿命
  if (practice.cost_life > 0) {
    const elapsed = (now - (profile.start_timestamp || 0)) / 1000
    const baseDecay = 1.0 // 简化计算，实际应该从 lib.ts 获取
    const currentLife = (profile.initial_life_sec || 0) + (profile.bonus_sec || 0) - elapsed * baseDecay
    if (currentLife < practice.cost_life) {
      return c.json({ error: `寿命不足，需要 ${formatLife(practice.cost_life)}` }, 400)
    }
  }
  
  // 获取用户进度
  let progress = await c.env.DB.prepare(`
    SELECT * FROM user_cultivation_progress 
    WHERE user_id = ? AND practice_key = ?
  `).bind(userId, practiceKey).first<any>()
  
  const today = new Date().toISOString().split('T')[0]
  const todayCount = progress?.today_date === today ? progress.today_practice_count : 0
  
  // 检查每日限制
  if (practice.daily_limit > 0 && todayCount >= practice.daily_limit) {
    return c.json({ error: `今日修炼次数已达上限（${practice.daily_limit}次）` }, 400)
  }
  
  // 检查等级上限
  const currentLevel = progress?.level || 0
  if (currentLevel >= practice.max_level) {
    return c.json({ error: '此功法已达满级' }, 400)
  }
  
  // 计算修炼成功率（基于难度和用户等级）
  const baseSuccessRate = 0.7 // 基础成功率70%
  const difficultyPenalty = practice.difficulty * 0.03 // 难度每级降低3%
  const levelBonus = currentLevel * 0.02 // 等级每级增加2%
  const successRate = Math.max(0.3, Math.min(0.95, baseSuccessRate - difficultyPenalty + levelBonus))
  
  const isSuccess = Math.random() < successRate
  const isCritical = isSuccess && Math.random() < 0.1 // 10%暴击率
  
  const nowSec = nowSeconds()
  
  // 计算奖励（暴击双倍）
  const multiplier = isCritical ? 2 : (isSuccess ? 1 : 0.3)
  const actualRewardLife = Math.floor(practice.reward_life * multiplier)
  const actualRewardMerit = Math.floor(practice.reward_merit * multiplier)
  const actualRewardShard = Math.floor(practice.reward_shard * multiplier)
  const actualRewardExp = Math.floor(practice.reward_exp * multiplier)
  
  // 扣除消耗
  await c.env.DB.prepare(`
    UPDATE users 
    SET merit = merit - ?, 
        coin = coin - ?,
        bonus_sec = bonus_sec - ?,
        updated_at = ?
    WHERE id = ?
  `).bind(
    practice.cost_merit,
    practice.cost_coin,
    practice.cost_life,
    nowSec,
    userId
  ).run()
  
  // 增加奖励
  await c.env.DB.prepare(`
    UPDATE users 
    SET bonus_sec = bonus_sec + ?,
        merit = merit + ?,
        shard = shard + ?,
        total_gained_sec = total_gained_sec + ?,
        updated_at = ?
    WHERE id = ?
  `).bind(
    actualRewardLife,
    actualRewardMerit,
    actualRewardShard,
    actualRewardLife,
    nowSec,
    userId
  ).run()
  
  // 更新或创建进度记录
  if (!progress) {
    await c.env.DB.prepare(`
      INSERT INTO user_cultivation_progress (
        user_id, practice_key, level, experience, 
        total_practice_count, success_count, failure_count,
        first_practice_at, last_practice_at, last_success_at,
        today_practice_count, today_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      userId, practiceKey, 0, actualRewardExp,
      1, isSuccess ? 1 : 0, isSuccess ? 0 : 1,
      nowSec, nowSec, isSuccess ? nowSec : null,
      1, today
    ).run()
  } else {
    const newTodayCount = progress.today_date === today ? todayCount + 1 : 1
    const newExp = (progress.experience || 0) + actualRewardExp
    const expNeeded = (currentLevel + 1) * 100 // 每级需要100经验
    const newLevel = newExp >= expNeeded ? currentLevel + 1 : currentLevel
    const isMastered = newLevel >= practice.max_level ? 1 : 0
    
    await c.env.DB.prepare(`
      UPDATE user_cultivation_progress 
      SET level = ?,
          experience = ?,
          total_practice_count = total_practice_count + 1,
          success_count = success_count + ?,
          failure_count = failure_count + ?,
          last_practice_at = ?,
          last_success_at = ?,
          today_practice_count = ?,
          today_date = ?,
          is_mastered = ?
      WHERE id = ?
    `).bind(
      newLevel,
      newExp >= expNeeded ? newExp - expNeeded : newExp,
      isSuccess ? 1 : 0,
      isSuccess ? 0 : 1,
      nowSec,
      isSuccess ? nowSec : progress.last_success_at,
      newTodayCount,
      today,
      isMastered,
      progress.id
    ).run()
  }
  
  // 记录修炼日志
  await c.env.DB.prepare(`
    INSERT INTO cultivation_records (
      user_id, practice_key, practice_level, result,
      cost_merit, cost_life, 
      reward_life, reward_merit, reward_shard, reward_exp
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    userId, practiceKey, currentLevel,
    isCritical ? 'critical' : (isSuccess ? 'success' : 'failure'),
    practice.cost_merit, practice.cost_life,
    actualRewardLife, actualRewardMerit, actualRewardShard, actualRewardExp
  ).run()
  
  // 推送事件
  let eventMsg = ''
  if (isCritical) {
    eventMsg = `💥 【暴击修炼】${practice.emoji} ${practice.name} 修炼大成！获得双倍奖励`
  } else if (isSuccess) {
    eventMsg = `✨ 【修炼成功】${practice.emoji} ${practice.name} 修炼有成`
  } else {
    eventMsg = `😔 【修炼失败】${practice.emoji} ${practice.name} 修炼遇到瓶颈`
  }
  
  await pushEvent(c.env.DB, userId, eventMsg, isCritical ? 'gold' : (isSuccess ? 'good' : 'bad'))
  
  return c.json({
    ok: true,
    result: isCritical ? 'critical' : (isSuccess ? 'success' : 'failure'),
    rewards: {
      life: actualRewardLife,
      merit: actualRewardMerit,
      shard: actualRewardShard,
      exp: actualRewardExp
    },
    msg: eventMsg
  })
})

// 激活/停用功法
cultivation.post('/toggle/:key', authMiddleware, async (c) => {
  const userId = c.get('userId') as number
  const practiceKey = c.req.param('key')
  
  const progress = await c.env.DB.prepare(`
    SELECT * FROM user_cultivation_progress 
    WHERE user_id = ? AND practice_key = ?
  `).bind(userId, practiceKey).first<any>()
  
  if (!progress || progress.level === 0) {
    return c.json({ error: '尚未修炼此功法' }, 400)
  }
  
  // 检查激活数量限制（最多同时激活5个）
  if (!progress.is_active) {
    const activeCount = await c.env.DB.prepare(`
      SELECT COUNT(*) as count FROM user_cultivation_progress 
      WHERE user_id = ? AND is_active = 1
    `).bind(userId).first<{ count: number }>()
    
    if (activeCount && activeCount.count >= 5) {
      return c.json({ error: '最多同时激活5个功法' }, 400)
    }
  }
  
  const newState = progress.is_active ? 0 : 1
  await c.env.DB.prepare(`
    UPDATE user_cultivation_progress SET is_active = ? WHERE id = ?
  `).bind(newState, progress.id).run()
  
  return c.json({ ok: true, isActive: !!newState })
})

// 获取修炼记录
cultivation.get('/records', authMiddleware, async (c) => {
  const userId = c.get('userId') as number
  const page = parseInt(c.req.query('page') || '1')
  const pageSize = parseInt(c.req.query('pageSize') || '20')
  const offset = (page - 1) * pageSize
  
  const records = await c.env.DB.prepare(`
    SELECT cr.*, cp.name, cp.emoji 
    FROM cultivation_records cr
    LEFT JOIN cultivation_practices cp ON cp.key = cr.practice_key
    WHERE cr.user_id = ?
    ORDER BY cr.created_at DESC
    LIMIT ? OFFSET ?
  `).bind(userId, pageSize, offset).all<any>()
  
  const total = await c.env.DB.prepare(`
    SELECT COUNT(*) as count FROM cultivation_records WHERE user_id = ?
  `).bind(userId).first<{ count: number }>()
  
  return c.json({
    records: records.results || [],
    total: total?.count || 0,
    page,
    pageSize
  })
})

// 获取修炼统计
cultivation.get('/stats', authMiddleware, loadProfile, async (c) => {
  const userId = c.get('userId') as number
  const profile = c.get('profile') as Profile
  
  // 总修炼次数
  const totalPractice = await c.env.DB.prepare(`
    SELECT SUM(total_practice_count) as total FROM user_cultivation_progress WHERE user_id = ?
  `).bind(userId).first<{ total: number }>()
  
  // 成功率
  const successRate = await c.env.DB.prepare(`
    SELECT 
      SUM(success_count) as success,
      SUM(failure_count) as failure
    FROM user_cultivation_progress WHERE user_id = ?
  `).bind(userId).first<{ success: number; failure: number }>()
  
  // 精通功法数
  const masteredCount = await c.env.DB.prepare(`
    SELECT COUNT(*) as count FROM user_cultivation_progress 
    WHERE user_id = ? AND is_mastered = 1
  `).bind(userId).first<{ count: number }>()
  
  // 当前激活功法
  const activeCount = await c.env.DB.prepare(`
    SELECT COUNT(*) as count FROM user_cultivation_progress 
    WHERE user_id = ? AND is_active = 1
  `).bind(userId).first<{ count: number }>()
  
  const success = successRate?.success || 0
  const failure = successRate?.failure || 0
  const rate = success + failure > 0 ? (success / (success + failure) * 100).toFixed(1) : '0.0'
  
  return c.json({
    totalPracticeCount: totalPractice?.total || 0,
    successRate: rate + '%',
    masteredCount: masteredCount?.count || 0,
    activeCount: activeCount?.count || 0
  })
})

export default cultivation
