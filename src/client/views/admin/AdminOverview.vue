<template>
  <div class="admin-overview">
    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon"><i class="fas fa-users"></i></div>
        <div class="stat-value">{{ stats.total }}</div>
        <div class="stat-label">总用户数</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon"><i class="fas fa-user-check"></i></div>
        <div class="stat-value">{{ stats.active }}</div>
        <div class="stat-label">已激活</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon"><i class="fas fa-gem"></i></div>
        <div class="stat-value">{{ stats.totalMerit }}</div>
        <div class="stat-label">总功德</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon"><i class="fas fa-heart-broken"></i></div>
        <div class="stat-value">{{ stats.dyingCount }}</div>
        <div class="stat-label">弥留状态</div>
      </div>
    </div>

    <!-- 用户管理卡片 -->
    <div class="card">
      <div class="card-header">
        <h3><i class="fas fa-users-cog"></i> 用户管理</h3>
        <button @click="openCreateModal" class="btn-primary">
          <i class="fas fa-user-plus"></i> 新建用户
        </button>
      </div>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索用户名或姓名..."
          @input="handleSearch"
        />
        <i class="fas fa-search"></i>
      </div>

      <!-- 用户列表 -->
      <div class="admin-list">
        <div v-if="paginatedUsers.length === 0" class="empty">暂无用户</div>
        <div v-for="user in paginatedUsers" :key="user.userId" class="admin-item">
          <span class="item-emoji">
            <i class="fas fa-user-circle"></i>
          </span>
          <div class="item-content">
            <div class="item-header">
              <span class="item-name">{{ user.name }}</span>
              <span v-if="user.dying" class="item-badge dying">弥留</span>
              <span v-else-if="!user.hasProfile" class="item-badge inactive">未激活</span>
              <span v-else class="item-badge active">正常</span>
              <span class="item-id">#{{ user.userId }}</span>
            </div>
            <div v-if="user.name" class="item-desc">{{ user.username }}</div>
            <div class="item-meta">
              <span class="meta-info">
                <i class="fas fa-hourglass-half"></i>
                寿命: {{ formatLife(user.lifeYears) }}
              </span>
              <span class="meta-highlight">
                <i class="fas fa-gem"></i>
                功德: {{ user.merit }}
              </span>
              <span v-if="user.realm" class="meta-success">
                <i class="fas fa-mountain"></i>
                {{ user.realm }}
              </span>
              <span class="meta-warning">
                <i class="fas fa-calendar"></i>
                {{ formatDate(user.createdAt) }}
              </span>
            </div>
          </div>
          <div class="item-actions">
            <button @click="openEditModal(user)" class="btn-edit" title="编辑">
              <i class="fas fa-edit"></i>
            </button>
            <button @click="resetUser(user)" class="btn-warning" title="重置">
              <i class="fas fa-redo"></i>
            </button>
            <button @click="deleteUser(user)" class="btn-delete" title="删除">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>

      <Pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="filteredUsers.length"
      />
    </div>

    <!-- 新建/编辑用户弹窗 -->
    <Modal v-model="showModal" :title="editingUser ? '编辑用户' : '新建用户'" size="large">
      <div class="modal-form">
        <div class="form-grid">
          <div class="form-item">
            <label>用户名 *</label>
            <input v-model="formData.username" placeholder="用户名" :disabled="!!editingUser" />
          </div>
          <div class="form-item" v-if="!editingUser">
            <label>密码 *</label>
            <input v-model="formData.password" type="password" placeholder="密码" />
          </div>
          <div class="form-item">
            <label>姓名</label>
            <input v-model="formData.name" placeholder="真实姓名" />
          </div>
          <div class="form-item">
            <label>性别</label>
            <select v-model="formData.gender">
              <option value="">未设置</option>
              <option value="male">男</option>
              <option value="female">女</option>
            </select>
          </div>
          <div class="form-item">
            <label>年龄</label>
            <input v-model.number="formData.age" type="number" placeholder="年龄" />
          </div>
          <div class="form-item">
            <label>身高(cm)</label>
            <input v-model.number="formData.height" type="number" placeholder="身高" />
          </div>
          <div class="form-item">
            <label>体重(kg)</label>
            <input v-model.number="formData.weight" type="number" placeholder="体重" />
          </div>
          <div class="form-item">
            <label>初始寿命(年)</label>
            <input v-model.number="formData.initialLifeYears" type="number" placeholder="80" />
          </div>
          <div class="form-item">
            <label>功德值</label>
            <input v-model.number="formData.merit" type="number" placeholder="0" />
          </div>
        </div>
      </div>
      
      <template #footer>
        <button @click="showModal = false" class="btn-secondary">
          <i class="fas fa-times"></i> 取消
        </button>
        <button @click="saveUser" class="btn-success" :disabled="loading">
          <i class="fas fa-save"></i> {{ editingUser ? '保存' : '创建' }}
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
const editingUser = ref<any>(null)
const users = ref<any[]>([])
const stats = ref({
  total: 0,
  active: 0,
  avgLifeYears: 0,
  totalMerit: 0,
  dyingCount: 0
})
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(20)

const formData = ref({
  username: '',
  password: '',
  name: '',
  gender: '',
  age: null as number | null,
  height: null as number | null,
  weight: null as number | null,
  initialLifeYears: 80,
  merit: 0
})

const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value
  const query = searchQuery.value.toLowerCase()
  return users.value.filter(user => 
    user.username.toLowerCase().includes(query) ||
    (user.name && user.name.toLowerCase().includes(query))
  )
})

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredUsers.value.slice(start, end)
})

function formatLife(years: number): string {
  if (!years) return '0'
  if (years >= 10000) return `${(years / 10000).toFixed(1)}万年`
  if (years >= 1000) return `${(years / 1000).toFixed(1)}千年`
  if (years >= 1) return `${years.toFixed(1)}年`
  const days = years * 365.25
  return `${days.toFixed(1)}天`
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp * 1000)
  return date.toLocaleDateString('zh-CN')
}

function handleSearch() {
  currentPage.value = 1
}

function resetForm() {
  formData.value = {
    username: '',
    password: '',
    name: '',
    gender: '',
    age: null,
    height: null,
    weight: null,
    initialLifeYears: 80,
    merit: 0
  }
  editingUser.value = null
}

function openCreateModal() {
  resetForm()
  showModal.value = true
}

function openEditModal(user: any) {
  formData.value = {
    username: user.username,
    password: '',
    name: user.name || '',
    gender: user.gender || '',
    age: user.age || null,
    height: user.height || null,
    weight: user.weight || null,
    initialLifeYears: user.initialLifeYears || 80,
    merit: user.merit || 0
  }
  editingUser.value = user
  showModal.value = true
}

async function loadUsers() {
  try {
    const res = await api('/admin/users') as any
    users.value = res.users || []
    stats.value = res.stats || {
      total: 0,
      active: 0,
      avgLifeYears: 0,
      totalMerit: 0,
      dyingCount: 0
    }
  } catch (err: any) {
    toast(err.message, 'bad')
  }
}

async function saveUser() {
  if (!formData.value.username) {
    toast('请填写用户名', 'bad')
    return
  }
  if (!editingUser.value && !formData.value.password) {
    toast('请填写密码', 'bad')
    return
  }

  loading.value = true
  try {
    if (editingUser.value) {
      await api(`/admin/users/${editingUser.value.userId}`, {
        method: 'PUT',
        body: JSON.stringify(formData.value)
      })
      toast('用户更新成功', 'good')
    } else {
      await api('/admin/users', {
        method: 'POST',
        body: JSON.stringify(formData.value)
      })
      toast('用户创建成功', 'good')
    }
    showModal.value = false
    resetForm()
    await loadUsers()
  } catch (err: any) {
    toast(err.message, 'bad')
  } finally {
    loading.value = false
  }
}

async function resetUser(user: any) {
  if (!confirm(`确定要重置用户"${user.username}"的所有游戏数据吗？此操作不可恢复！`)) return

  loading.value = true
  try {
    await api(`/admin/users/${user.userId}/reset`, { method: 'POST' })
    toast('用户重置成功', 'good')
    await loadUsers()
  } catch (err: any) {
    toast(err.message, 'bad')
  } finally {
    loading.value = false
  }
}

async function deleteUser(user: any) {
  if (!confirm(`确定要删除用户"${user.username}"吗？此操作将永久删除用户及所有数据，不可恢复！`)) return

  loading.value = true
  try {
    await api(`/admin/users/${user.userId}`, { method: 'DELETE' })
    toast('用户删除成功', 'good')
    await loadUsers()
  } catch (err: any) {
    toast(err.message, 'bad')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadUsers()
})
</script>


<style scoped src="./admin-form-styles.css"></style>
<style scoped>
.search-bar {
  position: relative;
  margin-bottom: 20px;
}

.search-bar input {
  width: 100%;
  padding: 12px 45px 12px 16px;
  background: rgba(0,0,0,0.3);
  border: 1px solid var(--line);
  border-radius: 8px;
  color: var(--ink);
  font-size: 14px;
  transition: all 0.3s;
}

.search-bar input:focus {
  outline: none;
  border-color: var(--jade);
  background: rgba(0,0,0,0.4);
  box-shadow: 0 0 0 2px rgba(54,255,208,0.15), 0 0 15px rgba(54,255,208,0.2);
}

.search-bar i {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--jade);
  font-size: 16px;
  pointer-events: none;
}

.item-badge.dying {
  background: rgba(255, 107, 157, 0.2);
  border: 1px solid rgba(255, 107, 157, 0.4);
  color: #ff6b9d;
}

.item-badge.inactive {
  background: rgba(168, 160, 138, 0.2);
  border: 1px solid rgba(168, 160, 138, 0.3);
  color: var(--ink-dim);
}

/* 修复分页组件样式 */
:deep(.pagination) {
  display: flex !important;
  flex-direction: row !important;
  align-items: center !important;
  justify-content: center !important;
}

:deep(.page-numbers) {
  display: flex !important;
  flex-direction: row !important;
}
</style>
