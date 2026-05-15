<template>
  <div class="admin-explore">
    <div class="card">
      <div class="card-header">
        <h3><i class="fas fa-compass"></i> 历练项目管理</h3>
        <button @click="openCreateModal" class="btn-primary">
          <i class="fas fa-plus"></i> 新建项目
        </button>
      </div>

      <!-- 搜索和过滤栏 -->
      <div class="filter-bar">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="搜索项目名称、消息..." 
            @input="currentPage = 1"
          />
        </div>
        <div class="filter-group">
          <label>境界过滤</label>
          <select v-model="realmFilter" @change="currentPage = 1">
            <option value="">全部境界</option>
            <option v-for="realm in realms" :key="realm.id" :value="realm.id">
              {{ realm.name }}
            </option>
          </select>
        </div>
        <div class="filter-group">
          <label>难度</label>
          <select v-model="difficultyFilter" @change="currentPage = 1">
            <option value="">全部</option>
            <option value="easy">简单</option>
            <option value="normal">普通</option>
            <option value="hard">困难</option>
            <option value="extreme">极难</option>
          </select>
        </div>
        <div class="filter-group">
          <label>品质</label>
          <select v-model="categoryFilter" @change="currentPage = 1">
            <option value="">全部</option>
            <option value="common">普通</option>
            <option value="rare">稀有</option>
            <option value="epic">史诗</option>
            <option value="legendary">传说</option>
          </select>
        </div>
        <button @click="clearFilters" class="btn-clear-filters" title="清除过滤">
          <i class="fas fa-times"></i> 清除
        </button>
      </div>

      <!-- 统计信息 -->
      <div class="stats-bar">
        <span>显示 {{ filteredLoots.length }}/{{ loots.length }} 个项目</span>
      </div>

      <div class="admin-list">
        <div v-if="paginatedLoots.length === 0" class="empty">暂无历练项目</div>
        <div v-for="loot in paginatedLoots" :key="loot.id" class="admin-item">
          <div class="item-content">
            <div class="item-header">
              <span class="item-name">{{ loot.name }}</span>
              <div class="item-badges">
                <span class="item-badge">权重: {{ loot.weight }}</span>
                <span :class="['difficulty-badge', `difficulty-${loot.difficulty}`]">
                  {{ getDifficultyLabel(loot.difficulty) }}
                </span>
                <span :class="['category-badge', `category-${loot.category}`]">
                  {{ getCategoryLabel(loot.category) }}
                </span>
              </div>
            </div>
            <div class="item-desc">{{ loot.msg }}</div>
            <div class="item-meta">
              <span class="meta-realm">
                <i class="fas fa-mountain"></i>
                {{ getRealmRangeDisplay(loot) }}
              </span>
              <span class="meta-reward">
                <i class="fas fa-heart"></i> 寿命: +{{ formatYears(secsToYears(loot.life)) }}
              </span>
              <span class="meta-reward">
                <i class="fas fa-star"></i> 功德: +{{ loot.merit }}
              </span>
              <span class="meta-reward" v-if="loot.shard > 0">
                <i class="fas fa-gem"></i> 碎片: +{{ loot.shard }}
              </span>
            </div>
          </div>
          <div class="item-actions">
            <button @click="openEditModal(loot)" class="btn-edit" title="编辑">
              <i class="fas fa-edit"></i>
            </button>
            <button @click="deleteLoot(loot.id, loot.name)" class="btn-delete" title="删除">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>

      <Pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="filteredLoots.length"
      />
    </div>

    <Modal v-model="showModal" :title="editingId ? '编辑历练项目' : '新建历练项目'" size="large">
      <div class="modal-form">
        <div class="form-grid">
          <div class="form-item">
            <label>项目名称 *</label>
            <input v-model="formData.name" placeholder="项目名称" />
          </div>
          <div class="form-item">
            <label>权重</label>
            <input v-model.number="formData.weight" type="number" placeholder="权重" />
          </div>
          <div class="form-item">
            <label>排序</label>
            <input v-model.number="formData.sortOrder" type="number" placeholder="排序" />
          </div>
          <div class="form-item">
            <label>境界要求</label>
            <select v-model.number="formData.realmId">
              <option v-for="realm in realms" :key="realm.id" :value="realm.id">
                {{ realm.name }}
              </option>
            </select>
          </div>
          <div class="form-item">
            <label>最低境界</label>
            <select v-model.number="formData.minRealmId">
              <option v-for="realm in realms" :key="realm.id" :value="realm.id">
                {{ realm.name }}
              </option>
            </select>
          </div>
          <div class="form-item">
            <label>最高境界</label>
            <select v-model.number="formData.maxRealmId">
              <option v-for="realm in realms" :key="realm.id" :value="realm.id">
                {{ realm.name }}
              </option>
            </select>
          </div>
          <div class="form-item">
            <label>难度</label>
            <select v-model="formData.difficulty">
              <option value="easy">简单</option>
              <option value="normal">普通</option>
              <option value="hard">困难</option>
              <option value="extreme">极难</option>
            </select>
          </div>
          <div class="form-item">
            <label>品质</label>
            <select v-model="formData.category">
              <option value="common">普通</option>
              <option value="rare">稀有</option>
              <option value="epic">史诗</option>
              <option value="legendary">传说</option>
            </select>
          </div>
          <div class="form-item">
            <label>寿命奖励（年）</label>
            <input v-model.number="formData.lifeYears" type="number" placeholder="寿命" step="0.01" />
          </div>
          <div class="form-item">
            <label>功德奖励</label>
            <input v-model.number="formData.merit" type="number" placeholder="功德" />
          </div>
          <div class="form-item">
            <label>碎片奖励</label>
            <input v-model.number="formData.shard" type="number" placeholder="碎片" />
          </div>
          <div class="form-item">
            <label>状态</label>
            <select v-model="formData.isActive">
              <option :value="true">启用</option>
              <option :value="false">禁用</option>
            </select>
          </div>
        </div>
        <div class="form-item full-width">
          <label>提示消息</label>
          <textarea v-model="formData.msg" placeholder="提示消息" rows="3"></textarea>
        </div>
      </div>
      
      <template #footer>
        <button @click="showModal = false" class="btn-secondary">
          <i class="fas fa-times"></i> 取消
        </button>
        <button @click="saveLoot" class="btn-success" :disabled="loading">
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
const loots = ref<any[]>([])
const realms = ref<any[]>([])
const currentPage = ref(1)
const pageSize = ref(10)

// 搜索和过滤
const searchQuery = ref('')
const realmFilter = ref('')
const difficultyFilter = ref('')
const categoryFilter = ref('')

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
  name: '',
  weight: 10,
  sortOrder: 0,
  msg: '',
  lifeYears: 0,
  merit: 0,
  shard: 0,
  realmId: 1,
  minRealmId: 1,
  maxRealmId: 20,
  difficulty: 'normal',
  category: 'common',
  isActive: true
})

// 过滤后的历练项目
const filteredLoots = computed(() => {
  let result = loots.value

  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(loot => 
      loot.name.toLowerCase().includes(query) ||
      (loot.msg && loot.msg.toLowerCase().includes(query))
    )
  }

  // 境界过滤
  if (realmFilter.value) {
    const realmId = parseInt(realmFilter.value)
    result = result.filter(loot => 
      loot.realm_id === realmId || 
      (loot.min_realm_id <= realmId && loot.max_realm_id >= realmId)
    )
  }

  // 难度过滤
  if (difficultyFilter.value) {
    result = result.filter(loot => loot.difficulty === difficultyFilter.value)
  }

  // 品质过滤
  if (categoryFilter.value) {
    result = result.filter(loot => loot.category === categoryFilter.value)
  }

  return result
})

const paginatedLoots = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredLoots.value.slice(start, end)
})

function clearFilters() {
  searchQuery.value = ''
  realmFilter.value = ''
  difficultyFilter.value = ''
  categoryFilter.value = ''
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
    common: '普通',
    rare: '稀有',
    epic: '史诗',
    legendary: '传说'
  }
  return labels[category] || category
}

function getRealmRangeDisplay(loot: any): string {
  const minRealm = realms.value.find(r => r.id === loot.min_realm_id)
  const maxRealm = realms.value.find(r => r.id === loot.max_realm_id)
  
  if (minRealm && maxRealm) {
    if (minRealm.id === maxRealm.id) {
      return minRealm.name
    }
    return `${minRealm.name} - ${maxRealm.name}`
  }
  return `境界${loot.min_realm_id}-${loot.max_realm_id}`
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

function resetForm() {
  formData.value = {
    name: '',
    weight: 10,
    sortOrder: 0,
    msg: '',
    lifeYears: 0,
    merit: 0,
    shard: 0,
    realmId: 1,
    minRealmId: 1,
    maxRealmId: 20,
    difficulty: 'normal',
    category: 'common',
    isActive: true
  }
  editingId.value = null
}

function openCreateModal() {
  resetForm()
  showModal.value = true
}

function openEditModal(loot: any) {
  formData.value = {
    name: loot.name,
    weight: loot.weight,
    sortOrder: loot.sort_order,
    msg: loot.msg,
    lifeYears: secsToYears(loot.life || 0),
    merit: loot.merit,
    shard: loot.shard,
    realmId: loot.realm_id || 1,
    minRealmId: loot.min_realm_id || 1,
    maxRealmId: loot.max_realm_id || 20,
    difficulty: loot.difficulty || 'normal',
    category: loot.category || 'common',
    isActive: loot.is_active !== 0
  }
  editingId.value = loot.id
  showModal.value = true
}

async function loadRealms() {
  try {
    const res = await api('/admin/realms') as any
    realms.value = res.realms || []
  } catch (err: any) {
    toast(err.message, 'bad')
  }
}

async function loadLoots() {
  try {
    const res = await api('/admin/explore-loot') as any
    loots.value = res.loots || []
  } catch (err: any) {
    toast(err.message, 'bad')
  }
}

async function saveLoot() {
  if (!formData.value.name) {
    toast('请填写项目名称', 'bad')
    return
  }

  loading.value = true
  try {
    // 转换年为秒
    const payload = {
      ...formData.value,
      life: yearsToSecs(formData.value.lifeYears)
    }
    // 删除前端专用字段
    delete (payload as any).lifeYears

    if (editingId.value) {
      await api(`/admin/explore-loot/${editingId.value}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      })
      toast('历练项目更新成功', 'good')
    } else {
      await api('/admin/explore-loot', {
        method: 'POST',
        body: JSON.stringify(payload)
      })
      toast('历练项目创建成功', 'good')
    }
    showModal.value = false
    resetForm()
    await loadLoots()
  } catch (err: any) {
    toast(err.message, 'bad')
  } finally {
    loading.value = false
  }
}

async function deleteLoot(id: number, name: string) {
  if (!confirm(`确定要删除历练项目"${name}"吗？`)) return

  loading.value = true
  try {
    await api(`/admin/explore-loot/${id}`, { method: 'DELETE' })
    toast('历练项目删除成功', 'good')
    await loadLoots()
  } catch (err: any) {
    toast(err.message, 'bad')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadRealms()
  loadLoots()
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
  z-index: 1;
}

.search-box input {
  width: 100%;
  padding: 10px 12px 10px 36px;
  background: rgba(0,0,0,0.3);
  border: 1px solid rgba(212,175,55,0.3);
  border-radius: 6px;
  color: var(--ink);
  font-size: 14px;
  transition: all 0.3s;
}

.search-box input:focus {
  outline: none;
  border-color: var(--gold);
  background: rgba(0,0,0,0.4);
}

.search-box input::placeholder {
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

.filter-group select {
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

.filter-group select:hover {
  border-color: var(--gold);
}

.filter-group select:focus {
  outline: none;
  border-color: var(--gold);
  background: rgba(0,0,0,0.4);
}

.btn-clear-filters {
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

.btn-clear-filters:hover {
  background: rgba(255,0,0,0.2);
  border-color: #ff6b6b;
}

/* 统计信息栏 */
.stats-bar {
  padding: 12px 16px;
  background: rgba(54,255,208,0.05);
  border: 1px solid rgba(54,255,208,0.2);
  border-radius: 6px;
  margin-bottom: 16px;
  color: var(--jade);
  font-size: 14px;
  font-weight: 600;
}

/* 项目列表 */
.item-badges {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.item-meta {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  font-size: 13px;
  margin-top: 4px;
}

.meta-realm {
  color: var(--jade);
  font-weight: 600;
}

.meta-realm i {
  margin-right: 4px;
}

.meta-reward {
  color: var(--ink-dim);
}

.meta-reward i {
  margin-right: 4px;
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
  
  .filter-group select {
    flex: 1;
  }
  
  .btn-clear-filters {
    width: 100%;
    justify-content: center;
  }
}
</style>
