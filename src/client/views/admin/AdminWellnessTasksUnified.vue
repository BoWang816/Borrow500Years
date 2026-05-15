<template>
  <div class="admin-wellness-tasks">
    <div class="card">
      <div class="card-header">
        <h3><i class="fas fa-spa"></i> 养生任务管理</h3>
        <button @click="openCreateModal" class="btn-primary">
          <i class="fas fa-plus"></i> 新建任务
        </button>
      </div>

      <!-- 标签页切换 -->
      <div class="tabs">
        <button 
          :class="['tab-btn', { active: activeTab === 'wellness' }]"
          @click="activeTab = 'wellness'"
        >
          <i class="fas fa-spa"></i> 养生任务配置
        </button>
        <button 
          :class="['tab-btn', { active: activeTab === 'extra' }]"
          @click="activeTab = 'extra'"
        >
          <i class="fas fa-tasks"></i> 扩展养生项目
        </button>
      </div>

      <!-- 养生任务配置 -->
      <div v-show="activeTab === 'wellness'" class="tab-content">
        <!-- 搜索和过滤栏 -->
        <div class="filter-bar">
          <div class="search-box">
            <i class="fas fa-search"></i>
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="搜索任务名称、键名或描述..." 
              class="search-input"
            />
          </div>
          <div class="filter-group">
            <label>境界过滤：</label>
            <select v-model="filterRealmId" class="filter-select">
              <option :value="null">全部境界</option>
              <option v-for="realm in realms" :key="realm.id" :value="realm.id">
                {{ realm.name }}
              </option>
            </select>
          </div>
          <button 
            v-if="searchQuery || filterRealmId !== null" 
            @click="clearFilters" 
            class="btn-clear"
          >
            <i class="fas fa-times"></i> 清除筛选
          </button>
          <div class="filter-stats">
            显示 {{ filteredWellnessTasks.length }} / {{ wellnessTasks.length }} 个任务
          </div>
        </div>

        <div v-if="loadingWellness" class="loading">加载中...</div>
        <div v-else class="admin-list">
          <div v-if="filteredWellnessTasks.length === 0" class="empty">
            {{ searchQuery || filterRealmId !== null ? '没有找到匹配的任务' : '暂无养生任务' }}
          </div>
          <div v-for="task in filteredWellnessTasks" :key="task.id" class="admin-item">
            <span class="item-emoji">{{ task.emoji }}</span>
            <div class="item-content">
              <div class="item-header">
                <span class="item-name">{{ task.name }}</span>
                <span class="item-badge" :class="{ active: task.is_active }">
                  {{ task.is_active ? '启用' : '禁用' }}
                </span>
                <span class="item-id">({{ task.task_key }})</span>
              </div>
              <div class="item-desc">{{ task.description }}</div>
              <div class="item-meta">
                <span v-if="task.life_reward" class="meta-success">
                  <i class="fas fa-hourglass"></i>
                  寿命: {{ formatYears(secsToYears(task.life_reward)) }}
                </span>
                <span v-if="task.merit_reward" class="meta-info">
                  <i class="fas fa-gem"></i>
                  功德: {{ task.merit_reward }}
                </span>
                <span v-if="task.shard_reward" class="meta-warning">
                  <i class="fas fa-star"></i>
                  碎片: {{ task.shard_reward }}
                </span>
                <span v-if="task.coin_reward" class="meta-special">
                  <i class="fas fa-coins"></i>
                  复活币: {{ task.coin_reward }}
                </span>
                <span>类型: {{ rewardTypeLabel(task.reward_type) }}</span>
                <span>境界要求: {{ realmLabel(task.realm_requirement) }}</span>
                <span class="meta-realm">
                  <i class="fas fa-layer-group"></i>
                  {{ getRealmRangeDesc(task.min_realm_id, task.max_realm_id) }}
                </span>
                <span>排序: {{ task.sort_order }}</span>
              </div>
            </div>
            <div class="item-actions">
              <button @click="openEditWellnessModal(task)" class="btn-edit" title="编辑">
                <i class="fas fa-edit"></i>
              </button>
              <button @click="deleteWellnessTask(task.id)" class="btn-delete" title="删除">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 扩展修炼项目 -->
      <div v-show="activeTab === 'extra'" class="tab-content">
        <!-- 搜索和过滤栏 -->
        <div class="filter-bar">
          <div class="search-box">
            <i class="fas fa-search"></i>
            <input 
              v-model="searchQueryExtra" 
              type="text" 
              placeholder="搜索项目名称、键名或描述..." 
              class="search-input"
              @input="currentPage = 1"
            />
          </div>
          <div class="filter-group">
            <label>境界过滤</label>
            <select v-model="filterRealmIdExtra" @change="currentPage = 1" class="filter-select">
              <option :value="null">全部境界</option>
              <option v-for="realm in realms" :key="realm.id" :value="realm.id">
                {{ realm.name }}
              </option>
            </select>
          </div>
          <div class="filter-group">
            <label>难度</label>
            <select v-model="filterDifficultyExtra" @change="currentPage = 1" class="filter-select">
              <option value="">全部</option>
              <option value="easy">简单</option>
              <option value="normal">普通</option>
              <option value="hard">困难</option>
              <option value="extreme">极难</option>
            </select>
          </div>
          <div class="filter-group">
            <label>类别</label>
            <select v-model="filterCategoryExtra" @change="currentPage = 1" class="filter-select">
              <option value="">全部</option>
              <option value="basic">基础</option>
              <option value="advanced">进阶</option>
              <option value="special">特殊</option>
            </select>
          </div>
          <button 
            v-if="searchQueryExtra || filterRealmIdExtra || filterDifficultyExtra || filterCategoryExtra" 
            @click="clearExtraFilters" 
            class="btn-clear"
          >
            <i class="fas fa-times"></i> 清除筛选
          </button>
          <div class="filter-stats">
            显示 {{ filteredExtraTasks.length }} / {{ extraTasks.length }} 个项目
          </div>
        </div>

        <div v-if="loadingExtra" class="loading">加载中...</div>
        <div v-else class="admin-list">
          <div v-if="paginatedExtraTasks.length === 0" class="empty">
            {{ searchQueryExtra || filterRealmIdExtra || filterDifficultyExtra || filterCategoryExtra ? '没有找到匹配的项目' : '暂无扩展修炼项目' }}
          </div>
          <div v-for="task in paginatedExtraTasks" :key="task.id" class="admin-item">
            <span class="item-emoji">{{ task.emoji }}</span>
            <div class="item-content">
              <div class="item-header">
                <span class="item-name">{{ task.name }}</span>
                <div class="item-badges">
                  <span class="item-badge">{{ task.task_key }}</span>
                  <span :class="['difficulty-badge', `difficulty-${task.difficulty}`]">
                    {{ getDifficultyLabel(task.difficulty) }}
                  </span>
                  <span :class="['category-badge-extra', `category-${task.category}`]">
                    {{ getCategoryLabel(task.category) }}
                  </span>
                </div>
              </div>
              <div class="item-desc">{{ task.description }}</div>
              <div class="item-meta">
                <span class="meta-realm">
                  <i class="fas fa-mountain"></i>
                  {{ getRealmRangeDisplay(task) }}
                </span>
                <span class="meta-success">
                  <i class="fas fa-hourglass"></i>
                  寿命: {{ formatYears(secsToYears(task.life_reward)) }}
                </span>
                <span class="meta-info">
                  <i class="fas fa-gem"></i>
                  功德: {{ task.merit_reward }}
                </span>
                <span v-if="task.shard_reward" class="meta-warning">
                  <i class="fas fa-star"></i>
                  碎片: {{ task.shard_reward }}
                </span>
              </div>
            </div>
            <div class="item-actions">
              <button @click="openEditExtraModal(task)" class="btn-edit" title="编辑">
                <i class="fas fa-edit"></i>
              </button>
              <button @click="deleteExtraTask(task.id, task.name)" class="btn-delete" title="删除">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>

        <Pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="filteredExtraTasks.length"
        />
      </div>
    </div>

    <!-- 养生任务模态框 -->
    <Modal v-model="showWellnessModal" :title="editingWellness ? '编辑养生任务' : '新建养生任务'" size="large">
      <div class="modal-form">
        <div class="form-grid">
          <div class="form-item">
            <label>任务键名 *</label>
            <input v-model="wellnessForm.taskKey" placeholder="例如: ziwu" />
          </div>
          <div class="form-item">
            <label>任务名称 *</label>
            <input v-model="wellnessForm.name" placeholder="例如: 子午流注" />
          </div>
          <div class="form-item">
            <label>图标 *</label>
            <input v-model="wellnessForm.emoji" placeholder="例如: 🌙" maxlength="2" />
          </div>
          <div class="form-item">
            <label>境界ID *</label>
            <select v-model.number="wellnessForm.realmId" class="form-select">
              <option v-for="realm in realms" :key="realm.id" :value="realm.id">
                {{ realm.name }}
              </option>
            </select>
          </div>
          <div class="form-item">
            <label>最小境界 *</label>
            <select v-model.number="wellnessForm.minRealmId" class="form-select">
              <option v-for="realm in realms" :key="realm.id" :value="realm.id">
                {{ realm.name }}
              </option>
            </select>
          </div>
          <div class="form-item">
            <label>最大境界 *</label>
            <select v-model.number="wellnessForm.maxRealmId" class="form-select">
              <option v-for="realm in realms" :key="realm.id" :value="realm.id">
                {{ realm.name }}
              </option>
            </select>
          </div>
          <div class="form-item">
            <label>奖励类型 *</label>
            <select v-model="wellnessForm.rewardType">
              <option value="fixed">固定奖励</option>
              <option value="variable">可变奖励</option>
              <option value="input">输入型奖励</option>
            </select>
          </div>
          <div class="form-item">
            <label>寿命奖励（年）</label>
            <input v-model.number="wellnessForm.lifeRewardYears" type="number" min="0" step="0.01" />
          </div>
          <div class="form-item">
            <label>功德奖励</label>
            <input v-model.number="wellnessForm.meritReward" type="number" min="0" />
          </div>
          <div class="form-item">
            <label>碎片奖励</label>
            <input v-model.number="wellnessForm.shardReward" type="number" min="0" />
          </div>
          <div class="form-item">
            <label>复活币奖励</label>
            <input v-model.number="wellnessForm.coinReward" type="number" min="0" />
          </div>
          <div class="form-item">
            <label>修饰值</label>
            <input v-model.number="wellnessForm.modifierValue" type="number" step="0.01" />
          </div>
          <div class="form-item">
            <label>境界要求 *</label>
            <select v-model="wellnessForm.realmRequirement">
              <option value="basic">基础</option>
              <option value="mortal">凡人</option>
              <option value="advanced">进阶</option>
              <option value="challenge">挑战</option>
            </select>
          </div>
          <div class="form-item">
            <label>排序</label>
            <input v-model.number="wellnessForm.sortOrder" type="number" min="0" />
          </div>
          <div class="form-item">
            <label style="display: flex; align-items: center; gap: 8px;">
              <input type="checkbox" v-model="wellnessForm.isActive" />
              <span>启用</span>
            </label>
          </div>
        </div>
        <div class="form-item full-width">
          <label>任务描述 *</label>
          <textarea v-model="wellnessForm.description" placeholder="任务描述" rows="3"></textarea>
        </div>
        <div class="form-item full-width">
          <label>输入配置（JSON）</label>
          <textarea v-model="wellnessForm.inputConfig" placeholder='例如: {"type":"slider","min":1000,"max":50000}' rows="2"></textarea>
        </div>
      </div>
      
      <template #footer>
        <button @click="showWellnessModal = false" class="btn-secondary">
          <i class="fas fa-times"></i> 取消
        </button>
        <button @click="saveWellnessTask" class="btn-success" :disabled="loadingWellness">
          <i class="fas fa-save"></i> {{ editingWellness ? '保存' : '创建' }}
        </button>
      </template>
    </Modal>

    <!-- 扩展任务模态框 -->
    <Modal v-model="showExtraModal" :title="editingExtra ? '编辑扩展修炼项目' : '新建扩展修炼项目'" size="large">
      <div class="modal-form">
        <div class="form-grid">
          <div class="form-item">
            <label>项目Key *</label>
            <input v-model="extraForm.key" placeholder="唯一标识" />
          </div>
          <div class="form-item">
            <label>项目名称 *</label>
            <input v-model="extraForm.name" placeholder="项目名称" />
          </div>
          <div class="form-item">
            <label>图标</label>
            <input v-model="extraForm.emoji" placeholder="emoji" maxlength="2" />
          </div>
          <div class="form-item">
            <label>境界要求</label>
            <select v-model.number="extraForm.realmId">
              <option v-for="realm in realms" :key="realm.id" :value="realm.id">
                {{ realm.name }}
              </option>
            </select>
          </div>
          <div class="form-item">
            <label>最低境界</label>
            <select v-model.number="extraForm.minRealmId">
              <option v-for="realm in realms" :key="realm.id" :value="realm.id">
                {{ realm.name }}
              </option>
            </select>
          </div>
          <div class="form-item">
            <label>最高境界</label>
            <select v-model.number="extraForm.maxRealmId">
              <option v-for="realm in realms" :key="realm.id" :value="realm.id">
                {{ realm.name }}
              </option>
            </select>
          </div>
          <div class="form-item">
            <label>难度</label>
            <select v-model="extraForm.difficulty">
              <option value="easy">简单</option>
              <option value="normal">普通</option>
              <option value="hard">困难</option>
              <option value="extreme">极难</option>
            </select>
          </div>
          <div class="form-item">
            <label>类别</label>
            <select v-model="extraForm.category">
              <option value="basic">基础</option>
              <option value="advanced">进阶</option>
              <option value="special">特殊</option>
            </select>
          </div>
          <div class="form-item">
            <label>寿命奖励(年)</label>
            <input v-model.number="extraForm.lifeRewardYears" type="number" step="0.01" />
          </div>
          <div class="form-item">
            <label>功德奖励</label>
            <input v-model.number="extraForm.meritReward" type="number" />
          </div>
          <div class="form-item">
            <label>碎片奖励</label>
            <input v-model.number="extraForm.shardReward" type="number" />
          </div>
          <div class="form-item">
            <label>排序</label>
            <input v-model.number="extraForm.sortOrder" type="number" />
          </div>
          <div class="form-item">
            <label>状态</label>
            <select v-model="extraForm.isActive">
              <option :value="true">启用</option>
              <option :value="false">禁用</option>
            </select>
          </div>
        </div>
        <div class="form-item full-width">
          <label>项目描述</label>
          <textarea v-model="extraForm.description" placeholder="项目描述" rows="3"></textarea>
        </div>
      </div>
      
      <template #footer>
        <button @click="showExtraModal = false" class="btn-secondary">
          <i class="fas fa-times"></i> 取消
        </button>
        <button @click="saveExtraTask" class="btn-success" :disabled="loadingExtra">
          <i class="fas fa-save"></i> {{ editingExtra ? '保存' : '创建' }}
        </button>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { api, toast } from '../../utils/api'
import Modal from '../../components/Modal.vue'
import Pagination from '../../components/Pagination.vue'

const activeTab = ref<'wellness' | 'extra'>('wellness')

// 养生任务状态
const wellnessTasks = ref<any[]>([])
const loadingWellness = ref(false)
const showWellnessModal = ref(false)
const editingWellness = ref<any | null>(null)
const searchQuery = ref('')
const filterRealmId = ref<number | null>(null)
const realms = ref<any[]>([])

// 转换常量
const SEC_PER_YEAR = 365.25 * 86400

// 转换函数
function secsToYears(secs: number): number {
  return secs / SEC_PER_YEAR
}

function yearsToSecs(years: number): number {
  return years * SEC_PER_YEAR
}

function formatYears(years: number): string {
  if (years >= 1) return `${years.toFixed(2)}年`
  const days = years * 365.25
  if (days >= 1) return `${days.toFixed(1)}天`
  const hours = days * 24
  if (hours >= 1) return `${hours.toFixed(1)}小时`
  const minutes = hours * 60
  return `${minutes.toFixed(0)}分钟`
}

const wellnessForm = ref({
  taskKey: '',
  name: '',
  emoji: '🧘',
  description: '',
  rewardType: 'fixed',
  lifeRewardYears: 0,
  meritReward: 0,
  shardReward: 0,
  coinReward: 0,
  modifierValue: 0,
  realmRequirement: 'basic',
  realmId: 1,
  minRealmId: 1,
  maxRealmId: 5,
  sortOrder: 0,
  inputConfig: '',
  isActive: true
})

// 扩展任务状态
const extraTasks = ref<any[]>([])
const loadingExtra = ref(false)
const showExtraModal = ref(false)
const editingExtra = ref<number | null>(null)
const currentPage = ref(1)
const pageSize = ref(10)
const searchQueryExtra = ref('')
const filterRealmIdExtra = ref<number | null>(null)
const filterDifficultyExtra = ref('')
const filterCategoryExtra = ref('')

const extraForm = ref({
  key: '',
  name: '',
  emoji: '🧘',
  description: '',
  lifeRewardYears: 0.0016,
  meritReward: 1,
  shardReward: 0,
  realmId: 1,
  minRealmId: 1,
  maxRealmId: 20,
  difficulty: 'normal',
  category: 'basic',
  sortOrder: 0,
  isActive: true
})

// 过滤后的扩展任务
const filteredExtraTasks = computed(() => {
  let filtered = extraTasks.value

  // 搜索过滤
  if (searchQueryExtra.value.trim()) {
    const query = searchQueryExtra.value.toLowerCase()
    filtered = filtered.filter(task => 
      task.name.toLowerCase().includes(query) ||
      task.task_key.toLowerCase().includes(query) ||
      (task.description && task.description.toLowerCase().includes(query))
    )
  }

  // 境界过滤
  if (filterRealmIdExtra.value !== null) {
    filtered = filtered.filter(task => 
      task.min_realm_id <= filterRealmIdExtra.value! && 
      task.max_realm_id >= filterRealmIdExtra.value!
    )
  }

  // 难度过滤
  if (filterDifficultyExtra.value) {
    filtered = filtered.filter(task => task.difficulty === filterDifficultyExtra.value)
  }

  // 类别过滤
  if (filterCategoryExtra.value) {
    filtered = filtered.filter(task => task.category === filterCategoryExtra.value)
  }

  return filtered
})

const paginatedExtraTasks = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredExtraTasks.value.slice(start, end)
})

// 过滤后的养生任务
const filteredWellnessTasks = computed(() => {
  let filtered = wellnessTasks.value

  // 搜索过滤
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(task => 
      task.name.toLowerCase().includes(query) ||
      task.task_key.toLowerCase().includes(query) ||
      task.description.toLowerCase().includes(query)
    )
  }

  // 境界过滤
  if (filterRealmId.value !== null) {
    filtered = filtered.filter(task => 
      task.min_realm_id <= filterRealmId.value! && 
      task.max_realm_id >= filterRealmId.value!
    )
  }

  return filtered
})

// 获取境界名称
const getRealmName = (realmId: number): string => {
  const realm = realms.value.find(r => r.id === realmId)
  return realm?.name || `境界${realmId}`
}

// 获取境界范围描述
const getRealmRangeDesc = (minRealmId: number, maxRealmId: number): string => {
  if (minRealmId === maxRealmId) {
    return getRealmName(minRealmId)
  }
  return `${getRealmName(minRealmId)} - ${getRealmName(maxRealmId)}`
}

const formatLife = (sec: number) => {
  return formatYears(secsToYears(sec))
}

const rewardTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    fixed: '固定',
    variable: '可变',
    input: '输入型'
  }
  return labels[type] || type
}

const realmLabel = (realm: string) => {
  const labels: Record<string, string> = {
    basic: '基础',
    mortal: '凡人',
    advanced: '进阶',
    challenge: '挑战'
  }
  return labels[realm] || realm
}

// 养生任务方法
function resetWellnessForm() {
  wellnessForm.value = {
    taskKey: '',
    name: '',
    emoji: '🧘',
    description: '',
    rewardType: 'fixed',
    lifeRewardYears: 0,
    meritReward: 0,
    shardReward: 0,
    coinReward: 0,
    modifierValue: 0,
    realmRequirement: 'basic',
    realmId: 1,
    minRealmId: 1,
    maxRealmId: 5,
    sortOrder: 0,
    inputConfig: '',
    isActive: true
  }
  editingWellness.value = null
}

function openCreateModal() {
  if (activeTab.value === 'wellness') {
    resetWellnessForm()
    showWellnessModal.value = true
  } else {
    resetExtraForm()
    showExtraModal.value = true
  }
}

function openEditWellnessModal(task: any) {
  wellnessForm.value = {
    taskKey: task.task_key,
    name: task.name,
    emoji: task.emoji,
    description: task.description,
    rewardType: task.reward_type,
    lifeRewardYears: secsToYears(task.life_reward || 0),
    meritReward: task.merit_reward,
    shardReward: task.shard_reward,
    coinReward: task.coin_reward,
    modifierValue: task.modifier_value,
    realmRequirement: task.realm_requirement,
    realmId: task.realm_id || 1,
    minRealmId: task.min_realm_id || 1,
    maxRealmId: task.max_realm_id || 5,
    sortOrder: task.sort_order,
    inputConfig: task.input_config || '',
    isActive: task.is_active === 1
  }
  editingWellness.value = task
  showWellnessModal.value = true
}

async function loadWellnessTasks() {
  loadingWellness.value = true
  try {
    const res = await api('/admin/wellness-tasks') as { tasks: any[] }
    wellnessTasks.value = res.tasks || []
  } catch (err: any) {
    toast(err.message || '加载失败', 'bad')
  } finally {
    loadingWellness.value = false
  }
}

async function loadRealms() {
  try {
    const res = await api('/realms/list') as { realms: any[] }
    realms.value = res.realms || []
  } catch (err: any) {
    console.error('Failed to load realms:', err)
  }
}

function clearFilters() {
  searchQuery.value = ''
  filterRealmId.value = null
}

function clearExtraFilters() {
  searchQueryExtra.value = ''
  filterRealmIdExtra.value = null
  filterDifficultyExtra.value = ''
  filterCategoryExtra.value = ''
  currentPage.value = 1
}

function getDifficultyLabel(difficulty: string): string {
  const labels: Record<string, string> = {
    easy: '简单',
    normal: '普通',
    hard: '困难',
    extreme: '极难'
  }
  return labels[difficulty] || difficulty
}

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    basic: '基础',
    advanced: '进阶',
    special: '特殊'
  }
  return labels[category] || category
}

function getRealmRangeDisplay(task: any): string {
  const minRealm = realms.value.find(r => r.id === task.min_realm_id)
  const maxRealm = realms.value.find(r => r.id === task.max_realm_id)
  
  if (minRealm && maxRealm) {
    if (minRealm.id === maxRealm.id) {
      return minRealm.name
    }
    return `${minRealm.name} - ${maxRealm.name}`
  }
  return `境界${task.min_realm_id}-${task.max_realm_id}`
}

async function saveWellnessTask() {
  if (!wellnessForm.value.taskKey || !wellnessForm.value.name || !wellnessForm.value.description) {
    toast('请填写必填字段', 'bad')
    return
  }

  loadingWellness.value = true
  try {
    const payload = {
      taskKey: wellnessForm.value.taskKey,
      name: wellnessForm.value.name,
      emoji: wellnessForm.value.emoji,
      description: wellnessForm.value.description,
      rewardType: wellnessForm.value.rewardType,
      lifeReward: yearsToSecs(wellnessForm.value.lifeRewardYears),
      meritReward: wellnessForm.value.meritReward,
      shardReward: wellnessForm.value.shardReward,
      coinReward: wellnessForm.value.coinReward,
      modifierValue: wellnessForm.value.modifierValue,
      realmRequirement: wellnessForm.value.realmRequirement,
      realmId: wellnessForm.value.realmId,
      minRealmId: wellnessForm.value.minRealmId,
      maxRealmId: wellnessForm.value.maxRealmId,
      sortOrder: wellnessForm.value.sortOrder,
      inputConfig: wellnessForm.value.inputConfig ? JSON.parse(wellnessForm.value.inputConfig) : null,
      isActive: wellnessForm.value.isActive
    }

    if (editingWellness.value) {
      await api(`/admin/wellness-tasks/${editingWellness.value.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      })
      toast('养生任务更新成功', 'good')
    } else {
      await api('/admin/wellness-tasks', {
        method: 'POST',
        body: JSON.stringify(payload)
      })
      toast('养生任务创建成功', 'good')
    }

    showWellnessModal.value = false
    resetWellnessForm()
    await loadWellnessTasks()
  } catch (err: any) {
    toast(err.message || '操作失败', 'bad')
  } finally {
    loadingWellness.value = false
  }
}

async function deleteWellnessTask(id: number) {
  if (!confirm('确定删除此任务？')) return
  
  loadingWellness.value = true
  try {
    await api(`/admin/wellness-tasks/${id}`, { method: 'DELETE' })
    toast('养生任务删除成功', 'good')
    await loadWellnessTasks()
  } catch (err: any) {
    toast(err.message || '删除失败', 'bad')
  } finally {
    loadingWellness.value = false
  }
}

// 扩展任务方法
function resetExtraForm() {
  extraForm.value = {
    key: '',
    name: '',
    emoji: '🧘',
    description: '',
    lifeRewardYears: 0.0016,
    meritReward: 1,
    shardReward: 0,
    realmId: 1,
    minRealmId: 1,
    maxRealmId: 20,
    difficulty: 'normal',
    category: 'basic',
    sortOrder: 0,
    isActive: true
  }
  editingExtra.value = null
}

function openEditExtraModal(task: any) {
  extraForm.value = {
    key: task.task_key,
    name: task.name,
    emoji: task.emoji,
    description: task.description,
    lifeRewardYears: secsToYears(task.life_reward || 0),
    meritReward: task.merit_reward,
    shardReward: task.shard_reward,
    realmId: task.realm_id || 1,
    minRealmId: task.min_realm_id || 1,
    maxRealmId: task.max_realm_id || 20,
    difficulty: task.difficulty || 'normal',
    category: task.category || 'basic',
    sortOrder: task.sort_order,
    isActive: task.is_active !== 0
  }
  editingExtra.value = task.id
  showExtraModal.value = true
}

async function loadExtraTasks() {
  loadingExtra.value = true
  try {
    const res = await api('/admin/extra-tasks') as any
    extraTasks.value = res.tasks || []
  } catch (err: any) {
    toast(err.message, 'bad')
  } finally {
    loadingExtra.value = false
  }
}

async function saveExtraTask() {
  if (!extraForm.value.key || !extraForm.value.name) {
    toast('请填写项目Key和名称', 'bad')
    return
  }

  loadingExtra.value = true
  try {
    // 转换年为秒
    const payload = {
      ...extraForm.value,
      lifeReward: yearsToSecs(extraForm.value.lifeRewardYears)
    }
    // 删除前端专用字段
    delete (payload as any).lifeRewardYears

    if (editingExtra.value) {
      await api(`/admin/extra-tasks/${editingExtra.value}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      })
      toast('扩展修炼项目更新成功', 'good')
    } else {
      await api('/admin/extra-tasks', {
        method: 'POST',
        body: JSON.stringify(payload)
      })
      toast('扩展修炼项目创建成功', 'good')
    }
    showExtraModal.value = false
    resetExtraForm()
    await loadExtraTasks()
  } catch (err: any) {
    toast(err.message, 'bad')
  } finally {
    loadingExtra.value = false
  }
}

async function deleteExtraTask(id: number, name: string) {
  if (!confirm(`确定要删除扩展修炼项目"${name}"吗？`)) return

  loadingExtra.value = true
  try {
    await api(`/admin/extra-tasks/${id}`, { method: 'DELETE' })
    toast('扩展修炼项目删除成功', 'good')
    await loadExtraTasks()
  } catch (err: any) {
    toast(err.message, 'bad')
  } finally {
    loadingExtra.value = false
  }
}

onMounted(() => {
  loadRealms()
  loadWellnessTasks()
  loadExtraTasks()
})
</script>

<style scoped src="./admin-form-styles.css"></style>
<style scoped>
.tabs {
  display: flex;
  gap: 8px;
  padding: 16px;
  background: rgba(0,0,0,0.2);
  border-radius: 8px 8px 0 0;
  border-bottom: 1px solid var(--line);
}

.tab-btn {
  padding: 10px 20px;
  background: rgba(0,0,0,0.3);
  border: 1px solid rgba(212,175,55,0.3);
  border-radius: 6px;
  color: var(--ink);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.tab-btn:hover {
  background: rgba(212,175,55,0.1);
  border-color: var(--gold);
}

.tab-btn.active {
  background: linear-gradient(135deg, rgba(212,175,55,0.2), rgba(54,255,208,0.1));
  border-color: var(--gold);
  color: var(--gold-soft);
  font-weight: 600;
}

.tab-content {
  padding-top: 16px;
}

.loading {
  text-align: center;
  padding: 40px;
  color: var(--ink-dim);
}

/* 搜索和过滤栏 */
.filter-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: rgba(0,0,0,0.2);
  border-radius: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 250px;
  position: relative;
  display: flex;
  align-items: center;
}

.search-box i {
  position: absolute;
  left: 12px;
  color: var(--ink-dim);
}

.search-input {
  width: 100%;
  padding: 10px 12px 10px 36px;
  background: rgba(0,0,0,0.3);
  border: 1px solid rgba(212,175,55,0.3);
  border-radius: 6px;
  color: var(--ink);
  font-size: 14px;
  transition: all 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: var(--gold);
  background: rgba(0,0,0,0.4);
}

.search-input::placeholder {
  color: var(--ink-dim);
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-group label {
  color: var(--ink-dim);
  font-size: 14px;
  white-space: nowrap;
}

.filter-select {
  padding: 8px 12px;
  background: rgba(0,0,0,0.3);
  border: 1px solid rgba(212,175,55,0.3);
  border-radius: 6px;
  color: var(--ink);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  min-width: 150px;
}

.filter-select:hover {
  border-color: var(--gold);
}

.filter-select:focus {
  outline: none;
  border-color: var(--gold);
  background: rgba(0,0,0,0.4);
}

.btn-clear {
  padding: 8px 16px;
  background: rgba(255,0,0,0.1);
  border: 1px solid rgba(255,0,0,0.3);
  border-radius: 6px;
  color: #ff6b6b;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.btn-clear:hover {
  background: rgba(255,0,0,0.2);
  border-color: #ff6b6b;
}

.filter-stats {
  color: var(--jade);
  font-size: 14px;
  font-weight: 600;
  margin-left: auto;
  white-space: nowrap;
}

.form-select {
  width: 100%;
  padding: 8px 12px;
  background: rgba(0,0,0,0.3);
  border: 1px solid rgba(212,175,55,0.3);
  border-radius: 6px;
  color: var(--ink);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.form-select:hover {
  border-color: var(--gold);
}

.form-select:focus {
  outline: none;
  border-color: var(--gold);
  background: rgba(0,0,0,0.4);
}

.empty {
  text-align: center;
  padding: 40px;
  color: var(--ink-dim);
  font-size: 16px;
}

/* 扩展养生项目特定样式 */
.item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.item-name {
  font-weight: 600;
  color: var(--gold-soft);
  font-size: 15px;
  font-family: 'ZCOOL XiaoWei', serif;
}

.item-badges {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.item-badge {
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 4px;
  background: rgba(128, 128, 128, 0.2);
  color: #999;
  border: 1px solid rgba(128, 128, 128, 0.3);
  font-family: 'Orbitron', sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.item-desc {
  color: var(--ink-dim);
  font-size: 13px;
  line-height: 1.5;
  margin-bottom: 8px;
}

.meta-realm {
  color: var(--jade);
  font-weight: 600;
  background: rgba(54, 255, 208, 0.1);
  padding: 4px 10px;
  border-radius: 4px;
  border: 1px solid rgba(54, 255, 208, 0.3);
  font-size: 11px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.meta-realm i {
  font-size: 10px;
}

/* 类别徽章（扩展养生项目） */
.category-badge-extra {
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  border: 1px solid;
  display: inline-block;
  font-family: 'ZCOOL XiaoWei', serif;
}

.category-badge-extra.category-basic {
  background: rgba(128, 128, 128, 0.1);
  color: #808080;
  border-color: #808080;
}

.category-badge-extra.category-advanced {
  background: rgba(54, 255, 208, 0.1);
  color: #36ffd0;
  border-color: #36ffd0;
}

.category-badge-extra.category-special {
  background: rgba(212, 175, 55, 0.1);
  color: #d4af37;
  border-color: #d4af37;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .filter-bar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-box {
    min-width: 100%;
  }
  
  .filter-group {
    width: 100%;
  }
  
  .filter-select {
    flex: 1;
  }
  
  .filter-stats {
    margin-left: 0;
    text-align: center;
  }
  
  .item-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .item-badges {
    width: 100%;
  }
}
</style>