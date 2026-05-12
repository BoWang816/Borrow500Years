<template>
  <div class="admin-page">
    <div class="admin-header">
      <h2>境界管理</h2>
      <p class="admin-subtitle">管理修炼境界体系 · 5大境界 · 20小境</p>
    </div>

    <div v-if="loading" class="loading-state">
      <i class="fas fa-spinner fa-spin"></i> 加载中...
    </div>

    <div v-else class="realms-container">
      <!-- 境界统计 -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon"><i class="fas fa-layer-group"></i></div>
          <div class="stat-content">
            <div class="stat-value">{{ realms.length }}</div>
            <div class="stat-label">总境界数</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon"><i class="fas fa-users"></i></div>
          <div class="stat-content">
            <div class="stat-value">{{ totalUsers }}</div>
            <div class="stat-label">修炼者总数</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon"><i class="fas fa-crown"></i></div>
          <div class="stat-content">
            <div class="stat-value">{{ highestRealmUsers }}</div>
            <div class="stat-label">最高境界人数</div>
          </div>
        </div>
      </div>

      <!-- 按大境界分组显示 -->
      <div v-for="majorRealm in majorRealms" :key="majorRealm.id" class="major-realm-section">
        <div class="major-realm-header" @click="toggleMajorRealm(majorRealm.id)">
          <div class="major-realm-title">
            <i :class="['fas', expandedMajorRealms.includes(majorRealm.id) ? 'fa-chevron-down' : 'fa-chevron-right']"></i>
            <span class="major-realm-name">{{ majorRealm.name }}</span>
            <span class="major-realm-badge">{{ majorRealm.realms.length }}境</span>
          </div>
          <div class="major-realm-users">
            <i class="fas fa-users"></i> {{ majorRealm.totalUsers }} 人
          </div>
        </div>

        <transition name="expand">
          <div v-show="expandedMajorRealms.includes(majorRealm.id)" class="realms-grid">
            <div v-for="realm in majorRealm.realms" :key="realm.id" class="realm-card">
              <div class="realm-card-header">
                <div class="realm-title">
                  <span class="realm-id">{{ realm.id }}</span>
                  <span class="realm-name">{{ realm.name }}</span>
                </div>
                <div class="realm-users">
                  <i class="fas fa-user"></i> {{ getRealmUserCount(realm.id) }}
                </div>
              </div>

              <div class="realm-info">
                <div class="info-row">
                  <span class="info-label">寿命上限:</span>
                  <span class="info-value">{{ formatLife(realm.lifespan_max) }}</span>
                </div>
                <div v-if="realm.breakthrough_age_min" class="info-row">
                  <span class="info-label">突破年龄:</span>
                  <span class="info-value">{{ formatAge(realm.breakthrough_age_min) }} - {{ formatAge(realm.breakthrough_age_max) }}</span>
                </div>
                <div v-if="realm.cultivation_span_min" class="info-row">
                  <span class="info-label">修炼跨度:</span>
                  <span class="info-value">{{ formatLife(realm.cultivation_span_min) }} - {{ formatLife(realm.cultivation_span_max) }}</span>
                </div>
              </div>

              <div class="realm-desc">
                <div class="desc-item">
                  <strong>描述:</strong> {{ realm.description }}
                </div>
                <div class="desc-item">
                  <strong>核心:</strong> {{ realm.core_logic }}
                </div>
              </div>

              <div class="realm-actions">
                <button @click="editRealm(realm)" class="btn-edit">
                  <i class="fas fa-edit"></i> 编辑
                </button>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>

    <!-- 编辑弹窗 -->
    <div v-if="editingRealm" class="modal-overlay" @click.self="closeEdit">
      <div class="modal-content">
        <div class="modal-header">
          <h3>编辑境界: {{ editingRealm.name }}</h3>
          <button @click="closeEdit" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label>境界名称</label>
            <input v-model="editForm.name" type="text" class="form-input" />
          </div>

          <div class="form-group">
            <label>寿命上限（秒）</label>
            <input v-model.number="editForm.lifespan_max" type="number" class="form-input" />
            <span class="form-hint">{{ formatLife(editForm.lifespan_max) }}</span>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>突破最小年龄（秒）</label>
              <input v-model.number="editForm.breakthrough_age_min" type="number" class="form-input" />
            </div>
            <div class="form-group">
              <label>突破最大年龄（秒）</label>
              <input v-model.number="editForm.breakthrough_age_max" type="number" class="form-input" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>修炼跨度最小（秒）</label>
              <input v-model.number="editForm.cultivation_span_min" type="number" class="form-input" />
            </div>
            <div class="form-group">
              <label>修炼跨度最大（秒）</label>
              <input v-model.number="editForm.cultivation_span_max" type="number" class="form-input" />
            </div>
          </div>

          <div class="form-group">
            <label>境界描述</label>
            <textarea v-model="editForm.description" class="form-textarea" rows="2"></textarea>
          </div>

          <div class="form-group">
            <label>核心逻辑</label>
            <textarea v-model="editForm.core_logic" class="form-textarea" rows="3"></textarea>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="closeEdit" class="btn-cancel">取消</button>
          <button @click="saveRealm" class="btn-save" :disabled="saving">
            <i :class="['fas', saving ? 'fa-spinner fa-spin' : 'fa-save']"></i>
            {{ saving ? '保存中...' : '保存' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { api } from '../../utils/api'

interface Realm {
  id: number
  name: string
  major_realm: number
  sub_realm: number
  major_realm_name: string
  lifespan_max: number
  breakthrough_age_min: number | null
  breakthrough_age_max: number | null
  description: string
  core_logic: string
  cultivation_span_min: number | null
  cultivation_span_max: number | null
  sort_order: number
}

interface RealmStats {
  id: number
  name: string
  major_realm_name: string
  user_count: number
}

const loading = ref(true)
const saving = ref(false)
const realms = ref<Realm[]>([])
const stats = ref<RealmStats[]>([])
const editingRealm = ref<Realm | null>(null)
const editForm = ref<any>({})
const expandedMajorRealms = ref<number[]>([1, 2, 3, 4, 5])

const majorRealms = computed(() => {
  const groups: any[] = []
  const majorRealmNames = ['凡蜕期', '超凡期', '化境期', '极境期', '道极期']
  
  for (let i = 1; i <= 5; i++) {
    const realmList = realms.value.filter(r => r.major_realm === i)
    const totalUsers = realmList.reduce((sum, r) => sum + getRealmUserCount(r.id), 0)
    
    groups.push({
      id: i,
      name: majorRealmNames[i - 1],
      realms: realmList,
      totalUsers
    })
  }
  
  return groups
})

const totalUsers = computed(() => {
  return stats.value.reduce((sum, s) => sum + s.user_count, 0)
})

const highestRealmUsers = computed(() => {
  if (stats.value.length === 0) return 0
  const highest = stats.value[stats.value.length - 1]
  return highest?.user_count || 0
})

function getRealmUserCount(realmId: number): number {
  const stat = stats.value.find(s => s.id === realmId)
  return stat?.user_count || 0
}

function formatLife(seconds: number): string {
  if (!seconds) return '0'
  const years = seconds / 31536000
  if (years >= 10000) return `${(years / 10000).toFixed(1)}万年`
  if (years >= 1000) return `${(years / 1000).toFixed(1)}千年`
  if (years >= 1) return `${years.toFixed(1)}年`
  const days = seconds / 86400
  return `${days.toFixed(1)}天`
}

function formatAge(seconds: number): string {
  if (!seconds) return '0'
  const years = seconds / 31536000
  return `${years.toFixed(0)}岁`
}

function toggleMajorRealm(id: number) {
  const index = expandedMajorRealms.value.indexOf(id)
  if (index > -1) {
    expandedMajorRealms.value.splice(index, 1)
  } else {
    expandedMajorRealms.value.push(id)
  }
}

function editRealm(realm: Realm) {
  editingRealm.value = realm
  editForm.value = { ...realm }
}

function closeEdit() {
  editingRealm.value = null
  editForm.value = {}
}

async function saveRealm() {
  if (!editingRealm.value) return
  
  saving.value = true
  try {
    await api(`/admin/realms/${editingRealm.value.id}`, {
      method: 'PUT',
      body: JSON.stringify(editForm.value)
    })
    
    // 更新本地数据
    const index = realms.value.findIndex(r => r.id === editingRealm.value!.id)
    if (index > -1) {
      realms.value[index] = { ...editForm.value }
    }
    
    closeEdit()
  } catch (err: any) {
    alert('保存失败: ' + err.message)
  } finally {
    saving.value = false
  }
}

async function loadData() {
  loading.value = true
  try {
    const [realmsRes, statsRes] = await Promise.all([
      api('/admin/realms') as Promise<{ realms: Realm[] }>,
      api('/admin/realms/stats') as Promise<{ stats: RealmStats[] }>
    ])
    
    realms.value = realmsRes.realms
    stats.value = statsRes.stats
  } catch (err: any) {
    alert('加载失败: ' + err.message)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
@import './admin-form-styles.css';
</style>
