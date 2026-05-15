<template>
  <section id="leaderboard" class="tab-pane active">
    <h2 class="page-title">
      <span class="cn">天榜</span>
      <span class="en">Leaderboard</span>
    </h2>
    
    <div class="board-tabs">
      <button 
        :class="['board-tab', { active: currentBoard === 'longevity' }]" 
        @click="switchBoard('longevity')"
      >
        长生榜（剩余寿命）
      </button>
      <button 
        :class="['board-tab', { active: currentBoard === 'merit' }]" 
        @click="switchBoard('merit')"
      >
        功德榜（养生延寿）
      </button>
    </div>

    <!-- 大境界筛选 -->
    <div class="realm-filter">
      <h3 class="filter-title">— 境界筛选 —</h3>
      <div class="realm-tabs">
        <button 
          :class="['realm-tab', { active: currentRealm === 'all' }]" 
          @click="switchRealm('all')"
        >
          <span class="realm-emoji">🌟</span>
          <span class="realm-name">全部</span>
        </button>
        <button 
          v-for="realm in majorRealms"
          :key="realm.id"
          :class="['realm-tab', { active: currentRealm === realm.id }]" 
          @click="switchRealm(realm.id)"
        >
          <span class="realm-emoji">{{ realm.emoji }}</span>
          <span class="realm-name">{{ realm.name }}</span>
          <span class="realm-desc">{{ realm.description }}</span>
        </button>
      </div>

      <!-- 境界说明 -->
      <div class="realm-info-inner" v-if="currentRealm !== 'all' && getCurrentRealmInfo()">
        <h4 class="realm-info-title">{{ getCurrentRealmInfo()!.name }}</h4>
        <div class="realm-detail">
          <div class="realm-detail-item">
            <span class="detail-label">境界范围</span>
            <span class="detail-value">{{ getCurrentRealmInfo()!.range }}</span>
          </div>
          <div class="realm-detail-item">
            <span class="detail-label">寿命上限</span>
            <span class="detail-value">{{ getCurrentRealmInfo()!.lifespan }}</span>
          </div>
          <div class="realm-detail-item">
            <span class="detail-label">核心特征</span>
            <span class="detail-value">{{ getCurrentRealmInfo()!.feature }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="board-list">
      <div v-if="users.length === 0" class="empty">
        <i class="fas fa-ghost"></i>
        <p>此境界暂无修士</p>
      </div>
      <div v-for="(user, index) in users" :key="user.userId" :class="['board-row', getRankClass(index), { me: user.isMe }]">
        <div class="rank">{{ getGlobalRank(index) }}</div>
        <div class="info">
          <div class="name">
            {{ user.name }}
            <span v-if="user.isMe" class="you">你</span>
          </div>
          <div class="title">{{ stateStore.getRealmName(user.realmId) }}</div>
        </div>
        <div class="val">
          <span v-if="currentBoard === 'longevity'">{{ formatLife(user.lifeYears) }}</span>
          <span v-else>{{ user.meritGained }} 功德</span>
        </div>
      </div>
    </div>

    <!-- 分页控件 -->
    <div class="pagination" v-if="totalPages > 1">
      <div class="page-info">
        显示 {{ pageInfo.start }}-{{ pageInfo.end }} / 共 {{ pageInfo.total }} 位修士
      </div>
      <div class="page-controls">
        <button 
          class="page-btn" 
          @click="prevPage" 
          :disabled="currentPage === 1"
        >
          <i class="fas fa-chevron-left"></i>
          上一页
        </button>
        
        <div class="page-numbers">
          <button 
            v-if="currentPage > 2"
            class="page-num" 
            @click="goToPage(1)"
          >
            1
          </button>
          <span v-if="currentPage > 3" class="page-ellipsis">...</span>
          
          <button 
            v-for="page in visiblePages" 
            :key="page"
            :class="['page-num', { active: page === currentPage }]"
            @click="goToPage(page)"
          >
            {{ page }}
          </button>
          
          <span v-if="currentPage < totalPages - 2" class="page-ellipsis">...</span>
          <button 
            v-if="currentPage < totalPages - 1"
            class="page-num" 
            @click="goToPage(totalPages)"
          >
            {{ totalPages }}
          </button>
        </div>
        
        <button 
          class="page-btn" 
          @click="nextPage" 
          :disabled="currentPage === totalPages"
        >
          下一页
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>

    <!-- 境界说明已移到 realm-filter 内部 -->
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { api, formatLife, toast } from '../utils/api'
import { useStateStore } from '../stores/state'

const stateStore = useStateStore()
const currentBoard = ref<'longevity' | 'merit'>('longevity')
const currentRealm = ref<'all' | number>('all')
const allUsers = ref<any[]>([])
const currentPage = ref(1)
const pageSize = 20
const majorRealms = ref<any[]>([])

interface MajorRealmInfo {
  id: number
  name: string
  emoji: string
  description: string
  minRealmId: number
  maxRealmId: number
  lifespanRange: string
  feature: string
}

// 根据境界筛选用户
const filteredUsers = computed(() => {
  if (currentRealm.value === 'all') {
    return allUsers.value
  }
  
  // 根据大境界筛选
  return allUsers.value.filter(user => {
    return user.majorRealm === currentRealm.value
  })
})

// 分页后的用户列表
const users = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredUsers.value.slice(start, end)
})

// 总页数
const totalPages = computed(() => {
  return Math.ceil(filteredUsers.value.length / pageSize)
})

// 分页信息
const pageInfo = computed(() => {
  const start = (currentPage.value - 1) * pageSize + 1
  const end = Math.min(currentPage.value * pageSize, filteredUsers.value.length)
  return {
    start,
    end,
    total: filteredUsers.value.length
  }
})

// 可见的页码
const visiblePages = computed(() => {
  const pages: number[] = []
  const start = Math.max(1, currentPage.value - 1)
  const end = Math.min(totalPages.value, currentPage.value + 1)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

// 加载大境界信息
async function loadMajorRealms() {
  try {
    await stateStore.fetchRealms()
    
    // 从数据库境界数据中提取大境界信息
    const realmsByMajor: Record<number, any[]> = {}
    stateStore.realms.forEach(realm => {
      if (!realmsByMajor[realm.major_realm]) {
        realmsByMajor[realm.major_realm] = []
      }
      realmsByMajor[realm.major_realm].push(realm)
    })
    
    // 大境界emoji和描述映射
    const majorRealmMeta: Record<number, { emoji: string, desc: string }> = {
      1: { emoji: '🌱', desc: '百岁之劫' },
      2: { emoji: '⚡', desc: '脱胎换骨' },
      3: { emoji: '🔥', desc: '因果纠缠' },
      4: { emoji: '💫', desc: '法则剥离' },
      5: { emoji: '♾️', desc: '永恒观者' }
    }
    
    majorRealms.value = Object.keys(realmsByMajor).map(majorId => {
      const id = parseInt(majorId)
      const realms = realmsByMajor[id].sort((a, b) => a.sub_realm - b.sub_realm)
      const meta = majorRealmMeta[id] || { emoji: '⭐', desc: '' }
      
      return {
        id,
        name: realms[0].major_realm_name,
        emoji: meta.emoji,
        description: meta.desc,
        minRealmId: realms[0].id,
        maxRealmId: realms[realms.length - 1].id,
        minRealmName: realms[0].name,
        maxRealmName: realms[realms.length - 1].name,
        minLifespan: realms[0].lifespan_max,
        maxLifespan: realms[realms.length - 1].lifespan_max,
        feature: realms[0].core_logic || realms[0].description || ''
      }
    }).sort((a, b) => a.id - b.id)
  } catch (err) {
    console.error('Failed to load major realms:', err)
  }
}

// 获取当前选中大境界的详细信息
function getCurrentRealmInfo() {
  const realm = majorRealms.value.find(r => r.id === currentRealm.value)
  if (!realm) return null
  
  // 格式化寿命范围
  const formatLifespan = (seconds: number) => {
    const years = Math.floor(seconds / 31536000)
    if (years >= 100000000) return `${(years / 100000000).toFixed(0)}亿岁`
    if (years >= 10000) return `${(years / 10000).toFixed(0)}万岁`
    return `${years}岁`
  }
  
  return {
    name: `${realm.name}：${realm.description}`,
    range: `${realm.minRealmName}至${realm.maxRealmName}`,
    lifespan: `${formatLifespan(realm.minLifespan)} - ${formatLifespan(realm.maxLifespan)}`,
    feature: realm.feature
  }
}

function getRankClass(index: number): string {
  const globalIndex = (currentPage.value - 1) * pageSize + index
  if (globalIndex === 0) return 'top1'
  if (globalIndex === 1) return 'top2'
  if (globalIndex === 2) return 'top3'
  return ''
}

function getGlobalRank(index: number): number {
  return (currentPage.value - 1) * pageSize + index + 1
}

async function loadBoard() {
  try {
    const endpoint = currentBoard.value === 'longevity' ? '/board/longevity' : '/board/merit'
    const res = await api(endpoint) as any
    allUsers.value = res.rows || []
    console.log('Board data loaded:', {
      total: res.total || res.rows?.length,
      loaded: allUsers.value.length
    })
  } catch (err: any) {
    console.error('Failed to load board:', err)
    toast(err.message, 'bad')
  }
}

function switchBoard(board: 'longevity' | 'merit') {
  currentBoard.value = board
  currentPage.value = 1
  loadBoard()
}

function switchRealm(realm: 'all' | number) {
  currentRealm.value = realm
  currentPage.value = 1
}

function goToPage(page: number) {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  // 滚动到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function prevPage() {
  if (currentPage.value > 1) {
    goToPage(currentPage.value - 1)
  }
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    goToPage(currentPage.value + 1)
  }
}

onMounted(() => {
  loadMajorRealms()
  loadBoard()
})
</script>
