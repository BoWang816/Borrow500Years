<template>
  <div class="admin-cultivation-practices">
    <div class="card">
      <div class="card-header">
        <h3><i class="fas fa-fire"></i> 修炼项目管理</h3>
        <button @click="openCreateModal" class="btn-primary">
          <i class="fas fa-plus"></i> 新建修炼项目
        </button>
      </div>

      <!-- 搜索和过滤栏 -->
      <div class="filter-bar">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="搜索项目名称、Key或描述..." 
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
        <div class="filter-group">
          <label>稀有度：</label>
          <select v-model="filterRarity" class="filter-select">
            <option :value="null">全部</option>
            <option value="common">普通</option>
            <option value="rare">稀有</option>
            <option value="epic">史诗</option>
            <option value="legendary">传说</option>
            <option value="mythic">神话</option>
          </select>
        </div>
        <div class="filter-group">
          <label>类型：</label>
          <select v-model="filterType" class="filter-select">
            <option :value="null">全部</option>
            <option value="basic">基础</option>
            <option value="advanced">高级</option>
            <option value="secret">秘法</option>
            <option value="forbidden">禁术</option>
          </select>
        </div>
        <button 
          v-if="hasFilters" 
          @click="clearFilters" 
          class="btn-clear"
        >
          <i class="fas fa-times"></i> 清除筛选
        </button>
        <div class="filter-stats">
          显示 {{ filteredPractices.length }} / {{ practices.length }} 个项目
        </div>
      </div>

      <div class="admin-list">
        <div v-if="filteredPractices.length === 0" class="empty">
          {{ hasFilters ? '没有找到匹配的修炼项目' : '暂无修炼项目' }}
        </div>
        <div v-for="practice in paginatedPractices" :key="practice.id" class="admin-item">
          <span class="item-emoji">{{ practice.emoji }}</span>
          <div class="item-content">
            <div class="item-header">
              <span class="item-name">{{ practice.name }}</span>
              <span :class="['rarity-badge', practice.rarity]">{{ getRarityLabel(practice.rarity) }}</span>
              <span :class="['type-badge', practice.practice_type]">{{ getTypeLabel(practice.practice_type) }}</span>
              <span class="item-badge" :class="{ active: practice.is_active }">
                {{ practice.is_active ? '启用' : '禁用' }}
              </span>
              <span class="item-id">#{{ practice.id }}</span>
            </div>
            <div class="item-desc">{{ practice.description }}</div>
            <div class="item-meta">
              <span class="meta-realm">
                <i class="fas fa-mountain"></i>
                {{ getRealmName(practice.realm_id) }}
              </span>
              <span class="meta-warning">
                <i class="fas fa-star"></i>
                难度{{ practice.difficulty }}
              </span>
              <span v-if="practice.cost_merit > 0" class="meta-highlight">
                <i class="fas fa-gem"></i>
                消耗{{ practice.cost_merit }}功德
              </span>
              <span v-if="practice.reward_life > 0" class="meta-success">
                <i class="fas fa-clock"></i>
                奖励{{ formatYears(secsToYears(practice.reward_life)) }}
              </span>
              <span v-if="practice.reward_merit > 0" class="meta-special">
                <i class="fas fa-gem"></i>
                +{{ practice.reward_merit }}功德
              </span>
              <span v-if="practice.daily_limit > 0" class="meta-info">
                <i class="fas fa-redo"></i>
                每日{{ practice.daily_limit }}次
              </span>
            </div>
          </div>
          <div class="item-actions">
            <button @click="openEditModal(practice)" class="btn-edit" title="编辑">
              <i class="fas fa-edit"></i>
            </button>
            <button @click="deletePractice(practice.id, practice.name)" class="btn-delete" title="删除">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>

      <Pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="filteredPractices.length"
      />
    </div>

    <Modal v-model="showModal" :title="editingId ? '编辑修炼项目' : '新建修炼项目'" size="large">
      <div class="modal-form">
        <div class="form-grid">
          <div class="form-item">
            <label>项目Key *</label>
            <input v-model="formData.key" placeholder="唯一标识" :disabled="!!editingId" />
          </div>
          <div class="form-item">
            <label>项目名称 *</label>
            <input v-model="formData.name" placeholder="修炼项目名称" />
          </div>
          <div class="form-item">
            <label>图标</label>
            <input v-model="formData.emoji" placeholder="emoji" maxlength="2" />
          </div>
          <div class="form-item">
            <label>境界要求</label>
            <input v-model.number="formData.realmId" type="number" min="1" max="20" />
          </div>
          <div class="form-item">
            <label>修炼类型</label>
            <select v-model="formData.practiceType">
              <option value="basic">基础</option>
              <option value="advanced">高级</option>
              <option value="secret">秘法</option>
              <option value="forbidden">禁术</option>
            </select>
          </div>
          <div class="form-item">
            <label>稀有度</label>
            <select v-model="formData.rarity">
              <option value="common">普通</option>
              <option value="rare">稀有</option>
              <option value="epic">史诗</option>
              <option value="legendary">传说</option>
              <option value="mythic">神话</option>
            </select>
          </div>
          <div class="form-item">
            <label>难度等级</label>
            <input v-model.number="formData.difficulty" type="number" min="1" />
          </div>
          <div class="form-item">
            <label>消耗功德</label>
            <input v-model.number="formData.costMerit" type="number" min="0" />
          </div>
          <div class="form-item">
            <label>消耗寿命(年)</label>
            <input v-model.number="formData.costLifeYears" type="number" min="0" step="0.01" />
          </div>
          <div class="form-item">
            <label>奖励寿命(年)</label>
            <input v-model.number="formData.rewardLifeYears" type="number" min="0" step="0.01" />
          </div>
          <div class="form-item">
            <label>奖励功德</label>
            <input v-model.number="formData.rewardMerit" type="number" min="0" />
          </div>
          <div class="form-item">
            <label>奖励碎片</label>
            <input v-model.number="formData.rewardShard" type="number" min="0" />
          </div>
          <div class="form-item">
            <label>奖励经验</label>
            <input v-model.number="formData.rewardExp" type="number" min="0" />
          </div>
          <div class="form-item">
            <label>最大等级</label>
            <input v-model.number="formData.maxLevel" type="number" min="1" />
          </div>
          <div class="form-item">
            <label>每日限制</label>
            <input v-model.number="formData.dailyLimit" type="number" min="0" placeholder="0=无限制" />
          </div>
          <div class="form-item">
            <label>排序</label>
            <input v-model.number="formData.sortOrder" type="number" />
          </div>
          <div class="form-item">
            <label style="display: flex; align-items: center; gap: 8px;">
              <input type="checkbox" v-model="formData.helpsBreakthrough" />
              <span>助力突破</span>
            </label>
          </div>
          <div class="form-item">
            <label style="display: flex; align-items: center; gap: 8px;">
              <input type="checkbox" v-model="formData.isActive" />
              <span>启用</span>
            </label>
          </div>
        </div>
        <div class="form-item full-width">
          <label>项目描述</label>
          <textarea v-model="formData.description" placeholder="修炼项目描述" rows="3"></textarea>
        </div>
      </div>
      
      <template #footer>
        <button @click="showModal = false" class="btn-secondary">
          <i class="fas fa-times"></i> 取消
        </button>
        <button @click="savePractice" class="btn-success" :disabled="loading">
          <i class="fas fa-save"></i> {{ editingId ? '保存' : '创建' }}
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

const loading = ref(false)
const showModal = ref(false)
const editingId = ref<number | null>(null)
const practices = ref<any[]>([])
const realms = ref<any[]>([])
const currentPage = ref(1)
const pageSize = ref(20)

// 搜索和过滤
const searchQuery = ref('')
const filterRealmId = ref<number | null>(null)
const filterRarity = ref<string | null>(null)
const filterType = ref<string | null>(null)

// 转换常量
const SEC_PER_YEAR = 365.25 * 86400

// 转换函数
function secsToYears(secs: number): number {
  return secs / SEC_PER_YEAR
}

function yearsToSecs(years: number): number {
  return years * SEC_PER_YEAR
}

const formData = ref({
  key: '',
  name: '',
  emoji: '🔥',
  description: '',
  realmId: 1,
  requiredRealmLevel: 0,
  practiceType: 'basic',
  category: 'cultivation',
  difficulty: 1,
  practiceTime: 3600,
  cooldownTime: 0,
  costMerit: 0,
  costLifeYears: 0,
  costCoin: 0,
  rewardLifeYears: 0,
  rewardMerit: 0,
  rewardShard: 0,
  rewardExp: 100,
  effectType: null,
  effectValue: 0,
  effectDuration: 0,
  helpsBreakthrough: false,
  breakthroughContribution: 0,
  maxLevel: 10,
  dailyLimit: 0,
  rarity: 'common',
  sortOrder: 0,
  isActive: true
})

// 是否有筛选条件
const hasFilters = computed(() => 
  searchQuery.value.trim() !== '' || 
  filterRealmId.value !== null || 
  filterRarity.value !== null ||
  filterType.value !== null
)

const filteredPractices = computed(() => {
  let filtered = practices.value

  // 搜索过滤
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(query) ||
      p.key.toLowerCase().includes(query) ||
      (p.description && p.description.toLowerCase().includes(query))
    )
  }

  // 境界过滤
  if (filterRealmId.value !== null) {
    filtered = filtered.filter(p => p.realm_id === filterRealmId.value)
  }

  // 稀有度过滤
  if (filterRarity.value) {
    filtered = filtered.filter(p => p.rarity === filterRarity.value)
  }

  // 类型过滤
  if (filterType.value) {
    filtered = filtered.filter(p => p.practice_type === filterType.value)
  }

  return filtered
})

const paginatedPractices = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredPractices.value.slice(start, end)
})

function formatYears(years: number): string {
  if (years >= 1) return `${years.toFixed(2)}年`
  const days = years * 365.25
  if (days >= 1) return `${days.toFixed(1)}天`
  const hours = days * 24
  if (hours >= 1) return `${hours.toFixed(1)}小时`
  const minutes = hours * 60
  return `${minutes.toFixed(0)}分钟`
}

// 获取境界名称
function getRealmName(realmId: number): string {
  const realm = realms.value.find(r => r.id === realmId)
  return realm?.name || `境界${realmId}`
}

function getRarityLabel(rarity: string): string {
  const labels: Record<string, string> = {
    'common': '普通',
    'rare': '稀有',
    'epic': '史诗',
    'legendary': '传说',
    'mythic': '神话'
  }
  return labels[rarity] || rarity
}

function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    'basic': '基础',
    'advanced': '高级',
    'secret': '秘法',
    'forbidden': '禁术'
  }
  return labels[type] || type
}

function clearFilters() {
  searchQuery.value = ''
  filterRealmId.value = null
  filterRarity.value = null
  filterType.value = null
}

function resetForm() {
  formData.value = {
    key: '',
    name: '',
    emoji: '🔥',
    description: '',
    realmId: 1,
    requiredRealmLevel: 0,
    practiceType: 'basic',
    category: 'cultivation',
    difficulty: 1,
    practiceTime: 3600,
    cooldownTime: 0,
    costMerit: 0,
    costLifeYears: 0,
    costCoin: 0,
    rewardLifeYears: 0,
    rewardMerit: 0,
    rewardShard: 0,
    rewardExp: 100,
    effectType: null,
    effectValue: 0,
    effectDuration: 0,
    helpsBreakthrough: false,
    breakthroughContribution: 0,
    maxLevel: 10,
    dailyLimit: 0,
    rarity: 'common',
    sortOrder: 0,
    isActive: true
  }
  editingId.value = null
}

function openCreateModal() {
  resetForm()
  showModal.value = true
}

function openEditModal(practice: any) {
  formData.value = {
    key: practice.key,
    name: practice.name,
    emoji: practice.emoji,
    description: practice.description,
    realmId: practice.realm_id,
    requiredRealmLevel: practice.required_realm_level,
    practiceType: practice.practice_type,
    category: practice.category,
    difficulty: practice.difficulty,
    practiceTime: practice.practice_time,
    cooldownTime: practice.cooldown_time,
    costMerit: practice.cost_merit,
    costLifeYears: secsToYears(practice.cost_life || 0),
    costCoin: practice.cost_coin,
    rewardLifeYears: secsToYears(practice.reward_life || 0),
    rewardMerit: practice.reward_merit,
    rewardShard: practice.reward_shard,
    rewardExp: practice.reward_exp,
    effectType: practice.effect_type,
    effectValue: practice.effect_value,
    effectDuration: practice.effect_duration,
    helpsBreakthrough: !!practice.helps_breakthrough,
    breakthroughContribution: practice.breakthrough_contribution,
    maxLevel: practice.max_level,
    dailyLimit: practice.daily_limit,
    rarity: practice.rarity,
    sortOrder: practice.sort_order,
    isActive: !!practice.is_active
  }
  editingId.value = practice.id
  showModal.value = true
}

async function loadPractices() {
  try {
    const res = await api('/admin/cultivation-practices') as any
    practices.value = res.practices || []
  } catch (err: any) {
    toast(err.message, 'bad')
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

async function savePractice() {
  if (!formData.value.key || !formData.value.name) {
    toast('请填写项目Key和名称', 'bad')
    return
  }

  loading.value = true
  try {
    // 转换年为秒
    const payload = {
      ...formData.value,
      costLife: yearsToSecs(formData.value.costLifeYears),
      rewardLife: yearsToSecs(formData.value.rewardLifeYears)
    }
    // 删除前端专用字段
    delete (payload as any).costLifeYears
    delete (payload as any).rewardLifeYears

    if (editingId.value) {
      await api(`/admin/cultivation-practices/${editingId.value}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      })
      toast('修炼项目更新成功', 'good')
    } else {
      await api('/admin/cultivation-practices', {
        method: 'POST',
        body: JSON.stringify(payload)
      })
      toast('修炼项目创建成功', 'good')
    }
    showModal.value = false
    resetForm()
    await loadPractices()
  } catch (err: any) {
    toast(err.message, 'bad')
  } finally {
    loading.value = false
  }
}

async function deletePractice(id: number, name: string) {
  if (!confirm(`确定要删除修炼项目"${name}"吗？`)) return

  loading.value = true
  try {
    await api(`/admin/cultivation-practices/${id}`, { method: 'DELETE' })
    toast('修炼项目删除成功', 'good')
    await loadPractices()
  } catch (err: any) {
    toast(err.message, 'bad')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadRealms()
  await loadPractices()
})
</script>

<style scoped src="./admin-form-styles.css"></style>
<style scoped>
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
  min-width: 120px;
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

/* 稀有度徽章 */
.rarity-badge {
  font-size: 10px;
  padding: 3px 8px;
  border-radius: 4px;
  font-family: 'Orbitron', sans-serif;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.rarity-badge.common {
  background: rgba(168,160,138,0.2);
  color: #a8a08a;
  border: 1px solid rgba(168,160,138,0.3);
}

.rarity-badge.rare {
  background: rgba(54,162,235,0.2);
  color: #36a2eb;
  border: 1px solid rgba(54,162,235,0.3);
}

.rarity-badge.epic {
  background: rgba(153,102,255,0.2);
  color: #9966ff;
  border: 1px solid rgba(153,102,255,0.3);
}

.rarity-badge.legendary {
  background: rgba(255,206,86,0.2);
  color: #ffce56;
  border: 1px solid rgba(255,206,86,0.3);
  text-shadow: 0 0 8px rgba(255,206,86,0.4);
}

.rarity-badge.mythic {
  background: rgba(255,99,132,0.2);
  color: #ff6384;
  border: 1px solid rgba(255,99,132,0.3);
  text-shadow: 0 0 8px rgba(255,99,132,0.4);
}

/* 类型徽章 */
.type-badge {
  font-size: 10px;
  padding: 3px 8px;
  border-radius: 4px;
  font-family: 'ZCOOL XiaoWei', serif;
  font-weight: 600;
}

.type-badge.basic {
  background: rgba(54,255,208,0.2);
  color: var(--jade);
  border: 1px solid rgba(54,255,208,0.3);
}

.type-badge.advanced {
  background: rgba(153,102,255,0.2);
  color: #9966ff;
  border: 1px solid rgba(153,102,255,0.3);
}

.type-badge.secret {
  background: rgba(255,206,86,0.2);
  color: var(--gold);
  border: 1px solid rgba(255,206,86,0.3);
}

.type-badge.forbidden {
  background: rgba(255,99,132,0.2);
  color: var(--crimson);
  border: 1px solid rgba(255,99,132,0.3);
}

.meta-realm {
  color: var(--jade);
  font-weight: 600;
  background: rgba(54, 255, 208, 0.1);
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid rgba(54, 255, 208, 0.3);
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
}
</style>
