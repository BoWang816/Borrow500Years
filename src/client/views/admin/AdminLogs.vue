<template>
  <div class="admin-logs">
    <div class="card">
      <div class="card-header">
        <h3><i class="fas fa-history"></i> 操作日志</h3>
        <div class="header-stats">
          <span class="stat-badge">
            <i class="fas fa-list"></i>
            共 {{ logs.length }} 条记录
          </span>
        </div>
      </div>
      
      <!-- 操作日志列表 -->
      <div class="logs-container">
        <div v-if="logs.length === 0" class="empty">
          <i class="fas fa-inbox"></i>
          <p>暂无操作日志</p>
        </div>
        <div v-else class="logs-timeline">
          <div v-for="log in logs" :key="log.id" class="log-item">
            <div class="log-icon">
              <i :class="getActionIcon(log.action)"></i>
            </div>
            <div class="log-content">
              <div class="log-header">
                <span class="log-action" :class="getActionClass(log.action)">
                  {{ log.action }}
                </span>
                <span class="log-time">
                  <i class="fas fa-clock"></i>
                  {{ log.time }}
                </span>
              </div>
              <div class="log-body">
                <div class="log-admin">
                  <i class="fas fa-user-shield"></i>
                  <span>{{ log.admin }}</span>
                </div>
                
                <!-- 审计日志详情 -->
                <div class="log-detail" v-if="log.detail && hasDetailContent(log.detail)">
                  <div class="detail-content">
                    <!-- 创建操作 -->
                    <template v-if="log.detail.type === 'create'">
                      <div class="audit-header">
                        <i class="fas fa-plus-circle"></i>
                        <span>创建了 <strong>{{ log.detail.resource }}</strong>: {{ log.detail.name }}</span>
                      </div>
                      <div class="detail-grid">
                        <div v-for="(value, key) in log.detail.data" :key="key" class="detail-row">
                          <span class="detail-label">{{ formatKey(key) }}</span>
                          <span class="detail-value new-value">{{ formatValue(value) }}</span>
                        </div>
                      </div>
                    </template>
                    
                    <!-- 删除操作 -->
                    <template v-else-if="log.detail.type === 'delete'">
                      <div class="audit-header delete">
                        <i class="fas fa-trash"></i>
                        <span>删除了 <strong>{{ log.detail.resource }}</strong>: {{ log.detail.name }}</span>
                      </div>
                    </template>
                    
                    <!-- 更新操作 -->
                    <template v-else-if="log.detail.type === 'update'">
                      <div class="audit-header">
                        <i class="fas fa-edit"></i>
                        <span>更新了 <strong>{{ log.detail.resource }}</strong>: {{ log.detail.name }}</span>
                      </div>
                      <div v-if="log.detail.changes && log.detail.changes.length > 0" class="changes-list">
                        <div v-for="(change, idx) in log.detail.changes" :key="idx" class="change-item">
                          <div class="change-field">
                            <i class="fas fa-arrow-right"></i>
                            <span>{{ formatKey(change.field) }}</span>
                          </div>
                          <div class="change-values">
                            <div class="old-value">
                              <span class="value-label">旧值:</span>
                              <span class="value-content">{{ formatValue(change.oldValue) }}</span>
                            </div>
                            <i class="fas fa-long-arrow-alt-right change-arrow"></i>
                            <div class="new-value">
                              <span class="value-label">新值:</span>
                              <span class="value-content">{{ formatValue(change.newValue) }}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div v-else class="no-changes">
                        <i class="fas fa-info-circle"></i>
                        <span>无字段变更</span>
                      </div>
                    </template>
                    
                    <!-- 旧格式兼容 -->
                    <template v-else>
                      <div class="detail-text">{{ typeof log.detail === 'string' ? log.detail : JSON.stringify(log.detail) }}</div>
                    </template>
                  </div>
                </div>
                
                <div v-else class="log-no-detail">
                  <i class="fas fa-info-circle"></i>
                  <span>无详细信息</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api, toast } from '../../utils/api'

const logs = ref<any[]>([])

function getActionIcon(action: string): string {
  const iconMap: Record<string, string> = {
    '创建用户': 'fas fa-user-plus',
    '更新用户': 'fas fa-user-edit',
    '删除用户': 'fas fa-user-times',
    '重置用户': 'fas fa-undo',
    '创建养生任务': 'fas fa-plus-circle',
    '更新养生任务': 'fas fa-edit',
    '删除养生任务': 'fas fa-trash',
    '创建修炼项目': 'fas fa-plus-circle',
    '更新修炼项目': 'fas fa-edit',
    '删除修炼项目': 'fas fa-trash',
    '创建历练项目': 'fas fa-plus-circle',
    '更新历练项目': 'fas fa-edit',
    '删除历练项目': 'fas fa-trash',
    '创建丹药配置': 'fas fa-plus-circle',
    '更新丹药配置': 'fas fa-edit',
    '删除丹药配置': 'fas fa-trash',
    '创建全服事件': 'fas fa-calendar-plus',
    '更新全服事件': 'fas fa-calendar-edit',
    '删除全服事件': 'fas fa-calendar-times',
    '结束全服事件': 'fas fa-calendar-check',
    '修改丹药配置': 'fas fa-cog'
  }
  return iconMap[action] || 'fas fa-circle'
}

function getActionClass(action: string): string {
  if (action.includes('创建') || action.includes('新建')) return 'action-create'
  if (action.includes('更新') || action.includes('修改') || action.includes('编辑')) return 'action-update'
  if (action.includes('删除')) return 'action-delete'
  if (action.includes('重置')) return 'action-reset'
  return 'action-default'
}

function isJsonDetail(detail: any): boolean {
  // 如果已经是对象，直接返回true
  if (typeof detail === 'object' && detail !== null) {
    return true
  }
  // 如果是字符串，尝试解析
  if (typeof detail === 'string') {
    try {
      const parsed = JSON.parse(detail)
      return typeof parsed === 'object' && parsed !== null
    } catch {
      return false
    }
  }
  return false
}

function parseJsonDetail(detail: any): Record<string, any> {
  // 如果已经是对象，直接返回
  if (typeof detail === 'object' && detail !== null) {
    return detail
  }
  // 如果是字符串，尝试解析
  if (typeof detail === 'string') {
    try {
      const parsed = JSON.parse(detail)
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed
      }
    } catch {
      // 解析失败，返回空对象
    }
  }
  return {}
}

function formatKey(key: string): string {
  const keyMap: Record<string, string> = {
    'id': 'ID',
    'name': '名称',
    'username': '用户名',
    'taskKey': '任务键',
    'task_key': '任务键',
    'key': '键值',
    'emoji': '图标',
    'description': '描述',
    'desc': '描述',
    'lifeReward': '寿命奖励',
    'life_reward': '寿命奖励',
    'life': '寿命',
    'meritReward': '功德奖励',
    'merit_reward': '功德奖励',
    'merit': '功德',
    'shardReward': '碎片奖励',
    'shard_reward': '碎片奖励',
    'shard': '碎片',
    'coinReward': '金币奖励',
    'coin_reward': '金币奖励',
    'coin': '金币',
    'realmId': '境界ID',
    'realm_id': '境界ID',
    'minRealmId': '最低境界',
    'min_realm_id': '最低境界',
    'maxRealmId': '最高境界',
    'max_realm_id': '最高境界',
    'difficulty': '难度',
    'category': '类别',
    'rarity': '稀有度',
    'sortOrder': '排序',
    'sort_order': '排序',
    'isActive': '状态',
    'is_active': '状态',
    'cost': '消耗',
    'costType': '消耗类型',
    'type': '类型',
    'dur': '持续时间',
    'instant_life': '即时寿命',
    'instantLife': '即时寿命',
    'durDecayReduction': '衰减降低',
    'dur_decay_reduction': '衰减降低',
    'durMeritBoost': '功德加成',
    'dur_merit_boost': '功德加成',
    'weight': '权重',
    'msg': '消息',
    'rewardType': '奖励类型',
    'reward_type': '奖励类型',
    'realmRequirement': '境界要求',
    'realm_requirement': '境界要求',
    'age': '年龄',
    'userId': '用户ID',
    'initialLifeYears': '初始寿命'
  }
  return keyMap[key] || key
}

function hasDetailContent(detail: any): boolean {
  if (!detail) return false
  if (typeof detail === 'string' && detail.trim() === '') return false
  if (typeof detail === 'object') {
    // 如果是审计日志格式
    if (detail.type) {
      if (detail.type === 'create' && detail.data) return true
      if (detail.type === 'delete') return true
      if (detail.type === 'update' && detail.changes) return true
    }
    // 否则检查是否有内容
    return Object.keys(detail).length > 0
  }
  return true
}

function formatValue(value: any): string {
  if (value === null || value === undefined) return '-'
  if (typeof value === 'boolean') return value ? '✓ 启用' : '✗ 禁用'
  if (typeof value === 'object') return JSON.stringify(value, null, 2)
  
  // 格式化数字
  if (typeof value === 'number') {
    // 持续时间（秒）
    if (value >= 3600 && value % 3600 === 0) {
      return `${value / 3600} 小时`
    }
    if (value >= 60 && value % 60 === 0) {
      return `${value / 60} 分钟`
    }
    // 百分比（0-1之间的小数）
    if (value > 0 && value < 1 && value.toString().includes('.')) {
      return `${(value * 100).toFixed(1)}%`
    }
    // 普通数字
    return value.toLocaleString('zh-CN')
  }
  
  return String(value)
}

function getValueClass(value: any): string {
  if (typeof value === 'boolean') return value ? 'value-success' : 'value-muted'
  if (typeof value === 'number') return 'value-number'
  return 'value-text'
}

async function loadLogs() {
  try {
    const res = await api('/admin/logs') as any
    logs.value = res.logs || []
  } catch (err: any) {
    toast(err.message, 'bad')
  }
}

onMounted(() => {
  loadLogs()
})
</script>

<style scoped>
.admin-logs {
  padding: 24px;
}

.card {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--line);
  border-radius: 12px;
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  background: rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid var(--line);
}

.card-header h3 {
  margin: 0;
  font-size: 20px;
  color: var(--gold-soft);
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: 'ZCOOL XiaoWei', serif;
}

.card-header h3 i {
  color: var(--jade);
}

.header-stats {
  display: flex;
  gap: 12px;
}

.stat-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(54, 255, 208, 0.1);
  border: 1px solid rgba(54, 255, 208, 0.3);
  border-radius: 20px;
  color: var(--jade);
  font-size: 13px;
  font-weight: 600;
}

.stat-badge i {
  font-size: 12px;
}

.logs-container {
  padding: 24px;
}

.empty {
  text-align: center;
  padding: 60px 20px;
  color: var(--ink-dim);
}

.empty i {
  font-size: 48px;
  color: var(--ink-dim);
  opacity: 0.5;
  margin-bottom: 16px;
}

.empty p {
  margin: 0;
  font-size: 16px;
}

.logs-timeline {
  position: relative;
  padding-left: 40px;
}

.logs-timeline::before {
  content: '';
  position: absolute;
  left: 15px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(to bottom, var(--jade), var(--gold));
  opacity: 0.3;
}

.log-item {
  position: relative;
  display: flex;
  gap: 20px;
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.log-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.log-icon {
  position: absolute;
  left: -40px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--jade), var(--gold));
  display: flex;
  align-items: center;
  justify-content: center;
  color: #000;
  font-size: 14px;
  box-shadow: 0 0 20px rgba(54, 255, 208, 0.3);
  z-index: 1;
}

.log-content {
  flex: 1;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 16px;
  transition: all 0.3s;
}

.log-content:hover {
  background: rgba(0, 0, 0, 0.3);
  border-color: rgba(54, 255, 208, 0.3);
  box-shadow: 0 4px 12px rgba(54, 255, 208, 0.1);
}

.log-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 12px;
}

.log-action {
  font-size: 15px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 6px;
  font-family: 'ZCOOL XiaoWei', serif;
}

.action-create {
  background: rgba(76, 175, 80, 0.15);
  color: #4caf50;
  border: 1px solid rgba(76, 175, 80, 0.3);
}

.action-update {
  background: rgba(33, 150, 243, 0.15);
  color: #2196f3;
  border: 1px solid rgba(33, 150, 243, 0.3);
}

.action-delete {
  background: rgba(244, 67, 54, 0.15);
  color: #f44336;
  border: 1px solid rgba(244, 67, 54, 0.3);
}

.action-reset {
  background: rgba(255, 152, 0, 0.15);
  color: #ff9800;
  border: 1px solid rgba(255, 152, 0, 0.3);
}

.action-default {
  background: rgba(128, 128, 128, 0.15);
  color: #999;
  border: 1px solid rgba(128, 128, 128, 0.3);
}

.log-time {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--ink-dim);
  font-family: 'Orbitron', sans-serif;
}

.log-time i {
  font-size: 11px;
}

.log-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.log-admin,
.log-detail {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 13px;
  line-height: 1.6;
}

.log-admin {
  color: var(--gold-soft);
  font-weight: 500;
}

.log-admin i {
  color: var(--gold);
  margin-top: 2px;
  font-size: 12px;
}

.log-detail {
  margin-top: 12px;
}

.detail-content {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(54, 255, 208, 0.15);
  border-radius: 8px;
  padding: 16px;
  overflow: hidden;
}

.audit-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: rgba(54, 255, 208, 0.08);
  border: 1px solid rgba(54, 255, 208, 0.2);
  border-radius: 6px;
  margin-bottom: 16px;
  color: var(--jade);
  font-size: 14px;
  font-weight: 500;
}

.audit-header.delete {
  background: rgba(244, 67, 54, 0.08);
  border-color: rgba(244, 67, 54, 0.2);
  color: #f44336;
}

.audit-header i {
  font-size: 16px;
}

.audit-header strong {
  color: var(--gold);
  font-family: 'ZCOOL XiaoWei', serif;
}

.changes-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.change-item {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 14px;
  transition: all 0.2s;
}

.change-item:hover {
  background: rgba(0, 0, 0, 0.4);
  border-color: rgba(54, 255, 208, 0.2);
  transform: translateX(2px);
}

.change-field {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  color: var(--jade);
  font-weight: 600;
  font-size: 13px;
}

.change-field i {
  font-size: 11px;
  opacity: 0.7;
}

.change-values {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 16px;
  align-items: center;
}

.old-value,
.new-value {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px 12px;
  border-radius: 6px;
}

.old-value {
  background: rgba(244, 67, 54, 0.08);
  border: 1px solid rgba(244, 67, 54, 0.2);
}

.new-value {
  background: rgba(76, 175, 80, 0.08);
  border: 1px solid rgba(76, 175, 80, 0.2);
}

.value-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0.7;
}

.old-value .value-label {
  color: #f44336;
}

.new-value .value-label {
  color: #4caf50;
}

.value-content {
  font-size: 13px;
  font-weight: 500;
  color: var(--ink);
  word-break: break-word;
}

.change-arrow {
  color: var(--gold);
  font-size: 18px;
  opacity: 0.6;
}

.no-changes {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: rgba(255, 152, 0, 0.08);
  border: 1px solid rgba(255, 152, 0, 0.2);
  border-radius: 6px;
  color: #ff9800;
  font-size: 13px;
  font-style: italic;
}

.no-changes i {
  font-size: 12px;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 12px;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  transition: all 0.2s;
}

.detail-row:hover {
  background: rgba(0, 0, 0, 0.4);
  border-color: rgba(54, 255, 208, 0.2);
  transform: translateX(2px);
}

.detail-label {
  color: var(--jade);
  font-weight: 600;
  font-size: 12px;
  min-width: 90px;
  flex-shrink: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0.9;
}

.detail-value {
  color: var(--ink);
  font-size: 13px;
  font-weight: 500;
  word-break: break-word;
  flex: 1;
}

.value-success {
  color: #4caf50;
  font-weight: 600;
}

.value-muted {
  color: var(--ink-dim);
}

.value-number {
  color: var(--gold);
  font-family: 'Orbitron', monospace;
  font-weight: 600;
}

.value-text {
  color: var(--ink);
}

.detail-text {
  color: var(--ink);
  font-size: 13px;
  line-height: 1.6;
  padding: 4px 0;
}

.log-no-detail {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  color: var(--ink-dim);
  font-size: 12px;
  font-style: italic;
}

.log-no-detail i {
  font-size: 11px;
  opacity: 0.6;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .admin-logs {
    padding: 16px;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    padding: 16px;
  }

  .logs-timeline {
    padding-left: 30px;
  }

  .logs-timeline::before {
    left: 10px;
  }

  .log-icon {
    left: -30px;
    width: 28px;
    height: 28px;
    font-size: 12px;
  }

  .log-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }

  .detail-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }

  .detail-label {
    min-width: auto;
  }

  .change-values {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .change-arrow {
    display: none;
  }

  .audit-header {
    font-size: 13px;
    padding: 10px 12px;
  }
}
</style>
