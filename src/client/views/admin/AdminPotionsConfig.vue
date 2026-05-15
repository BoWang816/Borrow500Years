<template>
  <div class="admin-potions-config">
    <div class="card">
      <div class="card-header">
        <h3><i class="fas fa-flask"></i> 丹药配置管理</h3>
        <button @click="openCreateModal" class="btn-primary">
          <i class="fas fa-plus"></i> 新建丹药
        </button>
      </div>

      <!-- 搜索和过滤栏 -->
      <div class="filter-bar">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="搜索丹药名称、ID或描述..." 
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
          </select>
        </div>
        <div class="filter-group">
          <label>类别：</label>
          <select v-model="filterCategory" class="filter-select">
            <option :value="null">全部</option>
            <option value="recovery">恢复</option>
            <option value="buff">增益</option>
            <option value="special">特殊</option>
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
          显示 {{ filteredPotions.length }} / {{ potions.length }} 个丹药
        </div>
      </div>

      <div class="admin-list">
        <div v-if="filteredPotions.length === 0" class="empty">
          {{ hasFilters ? '没有找到匹配的丹药' : '暂无丹药配置' }}
        </div>
        <div v-for="potion in paginatedPotions" :key="potion.id" class="admin-item">
          <span class="item-emoji">{{ potion.emoji }}</span>
          <div class="item-content">
            <div class="item-header">
              <span class="item-name">{{ potion.name }}</span>
              <span :class="['rarity-badge', potion.rarity || 'common']">
                {{ getRarityLabel(potion.rarity) }}
              </span>
              <span :class="['category-badge', potion.category || 'recovery']">
                {{ getCategoryLabel(potion.category) }}
              </span>
              <span class="item-badge" :class="{ active: potion.is_active }">
                {{ potion.is_active ? '启用' : '禁用' }}
              </span>
              <span class="item-id">#{{ potion.id }}</span>
            </div>
            <div class="item-desc">{{ potion.desc }}</div>
            <div class="item-meta">
              <span class="meta-realm">
                <i class="fas fa-mountain"></i>
                {{ getRealmRangeDesc(potion.min_realm_id, potion.max_realm_id) }}
              </span>
              <span class="meta-highlight">
                <i class="fas fa-gem"></i>
                {{ potion.cost }} {{ potion.type === 'merit' ? '功德' : '复活币' }}
              </span>
              <span v-if="potion.instant_life > 0" class="meta-success">
                <i class="fas fa-bolt"></i>
                +{{ formatYears(secsToYears(potion.instant_life)) }}
              </span>
              <span v-if="potion.dur > 0" class="meta-info">
                <i class="fas fa-clock"></i>
                {{ formatYears(secsToYears(potion.dur)) }}
              </span>
              <span v-if="potion.dur_decay_reduction > 0" class="meta-warning">
                <i class="fas fa-shield-alt"></i>
                -{{ (potion.dur_decay_reduction * 100).toFixed(0) }}% 衰减
              </span>
              <span v-if="potion.dur_merit_boost > 0" class="meta-special">
                <i class="fas fa-star"></i>
                +{{ (potion.dur_merit_boost * 100).toFixed(0) }}% 功德
              </span>
            </div>
          </div>
          <div class="item-actions">
            <button @click="openEditModal(potion)" class="btn-edit" title="编辑">
              <i class="fas fa-edit"></i>
            </button>
            <button @click="deletePotion(potion.id, potion.name)" class="btn-delete" title="删除">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>

      <Pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="filteredPotions.length"
      />
    </div>

    <Modal v-model="showModal" :title="editingId ? '编辑丹药配置' : '新建丹药配置'" size="large">
      <div class="modal-form">
        <div class="form-grid">
          <div class="form-item">
            <label>丹药ID *</label>
            <input v-model="formData.id" placeholder="唯一标识" :disabled="!!editingId" />
          </div>
          <div class="form-item">
            <label>丹药名称 *</label>
            <input v-model="formData.name" placeholder="丹药名称" />
          </div>
          <div class="form-item">
            <label>图标</label>
            <input v-model="formData.emoji" placeholder="emoji" maxlength="2" />
          </div>
          <div class="form-item">
            <label>境界ID *</label>
            <select v-model.number="formData.realmId" class="form-select">
              <option v-for="realm in realms" :key="realm.id" :value="realm.id">
                {{ realm.name }}
              </option>
            </select>
          </div>
          <div class="form-item">
            <label>最小境界 *</label>
            <select v-model.number="formData.minRealmId" class="form-select">
              <option v-for="realm in realms" :key="realm.id" :value="realm.id">
                {{ realm.name }}
              </option>
            </select>
          </div>
          <div class="form-item">
            <label>最大境界 *</label>
            <select v-model.number="formData.maxRealmId" class="form-select">
              <option v-for="realm in realms" :key="realm.id" :value="realm.id">
                {{ realm.name }}
              </option>
            </select>
          </div>
          <div class="form-item">
            <label>稀有度 *</label>
            <select v-model="formData.rarity" class="form-select">
              <option value="common">普通</option>
              <option value="rare">稀有</option>
              <option value="epic">史诗</option>
              <option value="legendary">传说</option>
            </select>
          </div>
          <div class="form-item">
            <label>类别 *</label>
            <select v-model="formData.category" class="form-select">
              <option value="recovery">恢复</option>
              <option value="buff">增益</option>
              <option value="special">特殊</option>
            </select>
          </div>
          <div class="form-item">
            <label>消耗类型</label>
            <select v-model="formData.costType">
              <option value="merit">功德</option>
              <option value="shard">复活币</option>
            </select>
          </div>
          <div class="form-item">
            <label>消耗数量</label>
            <input v-model.number="formData.cost" type="number" />
          </div>
          <div class="form-item">
            <label>即时寿命(年)</label>
            <input v-model.number="formData.instantLifeYears" type="number" step="0.01" />
          </div>
          <div class="form-item">
            <label>持续时间(秒)</label>
            <input v-model.number="formData.dur" type="number" />
          </div>
          <div class="form-item">
            <label>衰减减少(0-1)</label>
            <input v-model.number="formData.durDecayReduction" type="number" step="0.01" />
          </div>
          <div class="form-item">
            <label>功德加成(0-1)</label>
            <input v-model.number="formData.durMeritBoost" type="number" step="0.01" />
          </div>
          <div class="form-item">
            <label>排序</label>
            <input v-model.number="formData.sortOrder" type="number" />
          </div>
          <div class="form-item">
            <label style="display: flex; align-items: center; gap: 8px;">
              <input type="checkbox" v-model="formData.isActive" />
              <span>启用</span>
            </label>
          </div>
        </div>
        <div class="form-item full-width">
          <label>丹药描述</label>
          <textarea v-model="formData.description" placeholder="丹药描述" rows="3"></textarea>
        </div>
      </div>
      
      <template #footer>
        <button @click="showModal = false" class="btn-secondary">
          <i class="fas fa-times"></i> 取消
        </button>
        <button @click="savePotion" class="btn-success" :disabled="loading">
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
const editingId = ref<string | null>(null)
const potions = ref<any[]>([])
const realms = ref<any[]>([])
const currentPage = ref(1)
const pageSize = ref(10)

// 搜索和过滤
const searchQuery = ref('')
const filterRealmId = ref<number | null>(null)
const filterRarity = ref<string | null>(null)
const filterCategory = ref<string | null>(null)

const formData = ref({
  id: '',
  name: '',
  emoji: '💊',
  description: '',
  cost: 30,
  costType: 'merit',
  instantLifeYears: 0,
  dur: 86400,
  durDecayReduction: 0,
  durMeritBoost: 0,
  realmId: 1,
  minRealmId: 1,
  maxRealmId: 20,
  rarity: 'common',
  category: 'recovery',
  sortOrder: 0,
  isActive: true
})

// 是否有筛选条件
const hasFilters = computed(() => 
  searchQuery.value.trim() !== '' || 
  filterRealmId.value !== null || 
  filterRarity.value !== null ||
  filterCategory.value !== null
)

// 过滤后的丹药
const filteredPotions = computed(() => {
  let filtered = potions.value

  // 搜索过滤
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(potion => 
      potion.name.toLowerCase().includes(query) ||
      potion.id.toLowerCase().includes(query) ||
      (potion.desc && potion.desc.toLowerCase().includes(query))
    )
  }

  // 境界过滤
  if (filterRealmId.value !== null) {
    filtered = filtered.filter(potion => 
      (potion.min_realm_id || 1) <= filterRealmId.value! && 
      (potion.max_realm_id || 20) >= filterRealmId.value!
    )
  }

  // 稀有度过滤
  if (filterRarity.value) {
    filtered = filtered.filter(potion => 
      (potion.rarity || 'common') === filterRarity.value
    )
  }

  // 类别过滤
  if (filterCategory.value) {
    filtered = filtered.filter(potion => 
      (potion.category || 'recovery') === filterCategory.value
    )
  }

  return filtered
})

const paginatedPotions = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredPotions.value.slice(start, end)
})

// 获取境界名称
function getRealmName(realmId: number): string {
  const realm = realms.value.find(r => r.id === realmId)
  return realm?.name || `境界${realmId}`
}

// 获取境界范围描述
function getRealmRangeDesc(minRealmId: number, maxRealmId: number): string {
  const min = minRealmId || 1
  const max = maxRealmId || 20
  if (min === max) {
    return getRealmName(min)
  }
  return `${getRealmName(min)} - ${getRealmName(max)}`
}

// 获取稀有度标签
function getRarityLabel(rarity: string): string {
  const labels: Record<string, string> = {
    'common': '普通',
    'rare': '稀有',
    'epic': '史诗',
    'legendary': '传说'
  }
  return labels[rarity] || '普通'
}

// 获取类别标签
function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    'recovery': '恢复',
    'buff': '增益',
    'special': '特殊'
  }
  return labels[category] || '恢复'
}

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

function clearFilters() {
  searchQuery.value = ''
  filterRealmId.value = null
  filterRarity.value = null
  filterCategory.value = null
}

function resetForm() {
  formData.value = {
    id: '',
    name: '',
    emoji: '💊',
    description: '',
    cost: 30,
    costType: 'merit',
    instantLifeYears: 0,
    dur: 86400,
    durDecayReduction: 0,
    durMeritBoost: 0,
    realmId: 1,
    minRealmId: 1,
    maxRealmId: 20,
    rarity: 'common',
    category: 'recovery',
    sortOrder: 0,
    isActive: true
  }
  editingId.value = null
}

function openCreateModal() {
  resetForm()
  showModal.value = true
}

function openEditModal(potion: any) {
  formData.value = {
    id: potion.id,
    name: potion.name,
    emoji: potion.emoji,
    description: potion.desc,
    cost: potion.cost,
    costType: potion.type,
    instantLifeYears: secsToYears(potion.instant_life || 0),
    dur: potion.dur,
    durDecayReduction: potion.dur_decay_reduction,
    durMeritBoost: potion.dur_merit_boost,
    realmId: potion.realm_id || 1,
    minRealmId: potion.min_realm_id || 1,
    maxRealmId: potion.max_realm_id || 20,
    rarity: potion.rarity || 'common',
    category: potion.category || 'recovery',
    sortOrder: potion.sort_order,
    isActive: !!potion.is_active
  }
  editingId.value = potion.id
  showModal.value = true
}

async function loadRealms() {
  try {
    const res = await api('/realms/list') as { realms: any[] }
    realms.value = res.realms || []
  } catch (err: any) {
    console.error('Failed to load realms:', err)
  }
}

async function loadPotions() {
  try {
    const res = await api('/admin/potions-config') as any
    potions.value = res.potions || []
  } catch (err: any) {
    toast(err.message, 'bad')
  }
}

async function savePotion() {
  if (!formData.value.id || !formData.value.name) {
    toast('请填写丹药ID和名称', 'bad')
    return
  }

  loading.value = true
  try {
    // 转换年为秒
    const payload = {
      ...formData.value,
      instantLife: yearsToSecs(formData.value.instantLifeYears)
    }
    // 删除前端专用字段
    delete (payload as any).instantLifeYears

    if (editingId.value) {
      await api(`/admin/potions-config/${editingId.value}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      })
      toast('丹药配置更新成功', 'good')
    } else {
      await api('/admin/potions-config', {
        method: 'POST',
        body: JSON.stringify(payload)
      })
      toast('丹药配置创建成功', 'good')
    }
    showModal.value = false
    resetForm()
    await loadPotions()
  } catch (err: any) {
    toast(err.message, 'bad')
  } finally {
    loading.value = false
  }
}

async function deletePotion(id: string, name: string) {
  if (!confirm(`确定要删除丹药配置"${name}"吗？`)) return

  loading.value = true
  try {
    await api(`/admin/potions-config/${id}`, { method: 'DELETE' })
    toast('丹药配置删除成功', 'good')
    await loadPotions()
  } catch (err: any) {
    toast(err.message, 'bad')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadRealms()
  await loadPotions()
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

/* 管理列表 */
.admin-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.admin-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: rgba(0,0,0,0.15);
  border: 1px solid var(--line);
  border-radius: 8px;
  transition: all 0.3s;
}

.admin-item:hover {
  background: rgba(54,255,208,0.05);
  border-color: rgba(54,255,208,0.3);
}

.item-emoji {
  font-size: 24px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(212,175,55,0.1);
  border: 1px solid rgba(212,175,55,0.3);
  border-radius: 8px;
  flex-shrink: 0;
}

.item-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.item-header {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.item-name {
  font-weight: 600;
  color: var(--gold-soft);
  font-size: 14px;
  font-family: 'ZCOOL XiaoWei', serif;
}

.item-badge {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Orbitron', sans-serif;
  text-transform: uppercase;
}

.item-badge.active {
  background: rgba(54,255,208,0.2);
  color: var(--jade);
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

/* 类别徽章 */
.category-badge {
  font-size: 10px;
  padding: 3px 8px;
  border-radius: 4px;
  font-family: 'ZCOOL XiaoWei', serif;
  font-weight: 600;
}

.category-badge.recovery {
  background: rgba(54,255,208,0.2);
  color: var(--jade);
  border: 1px solid rgba(54,255,208,0.3);
}

.category-badge.buff {
  background: rgba(255,159,64,0.2);
  color: #ff9f40;
  border: 1px solid rgba(255,159,64,0.3);
}

.category-badge.special {
  background: rgba(255,99,132,0.2);
  color: #ff6384;
  border: 1px solid rgba(255,99,132,0.3);
}

.item-actions {
  display: flex;
  gap: 8px;
  align-items: center;
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
  
  .admin-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .item-actions {
    align-self: flex-end;
  }
}
</style>
