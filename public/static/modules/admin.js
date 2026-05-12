/* ==========================================================
   《向天再借500年》· 管理后台模块
   包含：权限检查、平台概览、数据管理
   ========================================================== */

import { token, stateCache, api, toast, formatLife, escapeHtml } from './core.js';
import { refreshState } from './state.js';

// ============ 管理员状态 ============
let adminCache = null;

// ============ 检查管理员身份 ============
export async function checkAdmin() {
  if (!token) return;
  try {
    const r = await api('/admin/me');
    const nav = document.getElementById('admin-nav');
    if (r.admin) {
      nav.classList.remove('hidden');
    } else {
      nav.classList.add('hidden');
    }
  } catch (e) {}
}

// ============ 显示管理员验证界面 ============
export function showAdminGate(msg) {
  const gate = document.getElementById('admin-gate');
  const gateMsg = document.getElementById('admin-gate-msg');
  const gateBtn = document.getElementById('admin-gate-btn');

  // 隐藏所有管理内容入口
  const navContent = document.getElementById('admin-nav-content');
  if (navContent) navContent.classList.add('hidden');

  if (gate) gate.classList.remove('hidden');
  if (gateMsg) gateMsg.textContent = msg;
  if (gateBtn) gateBtn.classList.remove('hidden');
}

// ============ 渲染管理员子模块 ============
export async function renderAdminModule(moduleName) {
  // 基础权限检查已在 renderAdmin 处理，这里主要负责各子页面的数据加载
  if (!token) return;

  switch (moduleName) {
    case 'admin-overview':
      await loadAdminOverview();
      break;
    case 'admin-potions':
      await loadAdminPotions();
      break;
    case 'admin-logs':
      await loadAdminLogs();
      break;
    case 'admin-events':
      await loadAdminEvents();
      break;
    case 'admin-manuals':
      await loadAdminManuals();
      break;
    case 'admin-tasks':
      await loadAdminTasks();
      break;
    case 'admin-explore':
      await loadAdminExplore();
      break;
    case 'admin-potions-config':
      await loadAdminPotionsConfig();
      break;
  }
}

// ============ 加载平台概览 ============
export async function loadAdminOverview() {
  try {
    const r = await api('/admin/overview');
    adminCache = r;

    // 概览统计数据
    const statTotal = document.getElementById('stat-total');
    const statActive = document.getElementById('stat-active');
    const statPotions = document.getElementById('stat-potions');
    const statEvents = document.getElementById('stat-events');

    if (statTotal) statTotal.textContent = r.userCount;
    if (statActive) statActive.textContent = r.activeUsers;
    if (statPotions) statPotions.textContent = r.totalPotionsUsed;
    if (statEvents) statEvents.textContent = r.eventCount;

    // 用户列表
    const userCount = document.getElementById('user-count');
    const userTable = document.getElementById('admin-user-table');
    if (userCount) userCount.textContent = r.recentUsers?.length || 0;

    if (userTable) {
      const tbody = userTable.querySelector('tbody');
      if (tbody) {
        if (!r.recentUsers || r.recentUsers.length === 0) {
          tbody.innerHTML = '<tr><td colspan="11" class="empty">暂无用户数据</td></tr>';
        } else {
          tbody.innerHTML = r.recentUsers.map((u, i) => `
            <tr>
              <td>${i + 1}</td>
              <td>${u.name}</td>
              <td>${u.name}</td>
              <td>-</td>
              <td>-</td>
              <td>-</td>
              <td>${formatLife(u.life)}</td>
              <td>-</td>
              <td>-</td>
              <td>-</td>
              <td><span class="badge active">正常</span></td>
            </tr>
          `).join('');
        }
      }
    }
  } catch (err) {
    toast('加载平台数据失败', 'bad');
  }
}

// ============ 加载丹药使用记录 ============
export async function loadAdminPotions() {
  try {
    const r = await api('/admin/potions');
    const list = document.getElementById('admin-potion-list');
    if (!r.logs || r.logs.length === 0) {
      list.innerHTML = '<div class="empty">暂无使用记录</div>';
      return;
    }
    list.innerHTML = r.logs.map(l => `
      <div class="potion-log">
        <span class="log-user">${l.user}</span>
        <span class="log-potion">${l.potion}</span>
        <span class="log-time">${l.time}</span>
      </div>
    `).join('');
  } catch (err) {
    const list = document.getElementById('admin-potion-list');
    if (list) list.innerHTML = '<div class="empty">加载失败</div>';
  }
}

// ============ 加载系统日志 ============
export async function loadAdminLogs() {
  try {
    const r = await api('/admin/logs');
    const table = document.getElementById('admin-log-table');
    const tbody = table?.querySelector('tbody');
    if (!tbody) return;

    if (!r.logs || r.logs.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" class="empty">暂无系统日志</td></tr>';
      return;
    }
    tbody.innerHTML = r.logs.map(l => `
      <tr>
        <td>${l.time}</td>
        <td>${l.admin}</td>
        <td>${l.action}</td>
        <td>${escapeHtml(l.detail)}</td>
      </tr>
    `).join('');
  } catch (err) {
    const table = document.getElementById('admin-log-table');
    const tbody = table?.querySelector('tbody');
    if (tbody) tbody.innerHTML = '<tr><td colspan="4" class="empty">加载失败</td></tr>';
  }
}

// ============ 加载事件管理 ============
export async function loadAdminEvents() {
  try {
    const r = await api('/admin/events');
    const list = document.getElementById('admin-we-list');
    if (!r.events || r.events.length === 0) {
      list.innerHTML = '<div class="empty">暂无事件配置</div>';
      return;
    }
    list.innerHTML = r.events.map(e => `
      <div class="event-config-item">
        <div class="event-header">
          <span class="event-name">${e.name}</span>
          <span class="event-chance">概率 ${(e.chance * 100).toFixed(1)}%</span>
        </div>
        <div class="event-effect">${e.effect}</div>
        <div class="event-actions">
          <button onclick="window.triggerAdminEvent(${e.id})">触发</button>
          <button onclick="window.editEvent(${e.id})">编辑</button>
        </div>
      </div>
    `).join('');
  } catch (err) {
    const list = document.getElementById('admin-we-list');
    if (list) list.innerHTML = '<div class="empty">加载失败</div>';
  }
}

// ============ 加载功法管理 ============
export async function loadAdminManuals() {
  try {
    const r = await api('/admin/manuals');
    const list = document.getElementById('admin-manuals-list');
    if (!r.manuals || r.manuals.length === 0) {
      list.innerHTML = '<div class="empty">暂无功法配置</div>';
      return;
    }
    list.innerHTML = r.manuals.map(m => `
      <div class="manual-config-item">
        <div class="manual-header">
          <span class="manual-icon">${m.emoji}</span>
          <span class="manual-name">${m.name}</span>
          <span class="manual-key">${m.key}</span>
        </div>
        <div class="manual-desc">${m.description}</div>
        <div class="manual-effect">${m.effectType} · ${m.effectValue}</div>
      </div>
    `).join('');
  } catch (err) {
    document.getElementById('admin-manuals-list').innerHTML = '<div class="empty">加载失败</div>';
  }
}

// ============ 加载任务管理 ============
export async function loadAdminTasks() {
  try {
    const r = await api('/admin/extra-tasks');
    const list = document.getElementById('admin-extra-tasks-list');
    if (!r.tasks || r.tasks.length === 0) {
      list.innerHTML = '<div class="empty">暂无扩展任务</div>';
      return;
    }
    list.innerHTML = r.tasks.map(t => `
      <div class="task-config-item">
        <div class="task-header">
          <span class="task-icon">${t.emoji}</span>
          <span class="task-name">${t.name}</span>
          <span class="task-key">${t.task_key}</span>
        </div>
        <div class="task-desc">${t.description}</div>
        <div class="task-reward">寿命 +${formatLife(t.life_reward)} · 功德 +${t.merit_reward}</div>
      </div>
    `).join('');
  } catch (err) {
    const list = document.getElementById('admin-extra-tasks-list');
    if (list) list.innerHTML = '<div class="empty">加载失败</div>';
  }
}

// ============ 加载探险配置 ============
export async function loadAdminExplore() {
  try {
    const r = await api('/admin/explore-loot');
    const list = document.getElementById('admin-explore-list');
    if (!r.loots || r.loots.length === 0) {
      list.innerHTML = '<div class="empty">暂无探险配置</div>';
      return;
    }
    list.innerHTML = r.loots.map(l => `
      <div class="explore-config-item">
        <div class="explore-header">
          <span class="explore-name">${l.name}</span>
          <span class="explore-weight">权重 ${l.weight}</span>
        </div>
        <div class="explore-effect">${l.msg}</div>
        <div class="explore-reward">寿命 ${l.life > 0 ? '+' + formatLife(l.life) : l.life} · 功德 ${l.merit > 0 ? '+' + l.merit : l.merit}</div>
      </div>
    `).join('');
  } catch (err) {
    document.getElementById('admin-explore-list').innerHTML = '<div class="empty">加载失败</div>';
  }
}

// ============ 加载丹药配置 ============
export async function loadAdminPotionsConfig() {
  try {
    const r = await api('/admin/potions-config');
    const list = document.getElementById('admin-potions-config-list');
    if (!list) {
      console.error('admin-potions-config-list element not found');
      return;
    }
    console.log('Potions config response:', r);
    if (!r.potions || r.potions.length === 0) {
      list.innerHTML = '<div class="empty">暂无丹药配置</div>';
      return;
    }
    list.innerHTML = r.potions.map(p => `
      <div class="admin-potion-config-item potion-config-item" data-id="${p.id}">
        <div class="potion-header">
          <span class="potion-icon">${p.emoji || '💊'}</span>
          <span class="potion-name">${p.name}</span>
          <span class="potion-id">#${p.id}</span>
        </div>
        <div class="potion-desc">${p.desc || '无描述'}</div>
        <div class="potion-cost">消耗: ${p.cost} ${p.type === 'merit' ? '功德' : '复活币'} | 立即+${p.instant_life}s | 持续${p.dur}s | 衰减-${p.dur_decay_reduction}</div>
      </div>
    `).join('');
  } catch (err) {
    console.error('Load potions config error:', err);
    const list = document.getElementById('admin-potions-config-list');
    if (list) {
      list.innerHTML = '<div class="empty">加载失败: ' + err.message + '</div>';
    }
  }
}

// ============ 渲染管理员主入口 ============
export async function renderAdmin() {
  if (!token) {
    showAdminGate('请先登录');
    return;
  }

  // 基础权限检查
  try {
    const r = await api('/admin/me');
    if (!r.admin) {
      showAdminGate('您没有管理员权限');
      return;
    }
  } catch (e) {
    showAdminGate('权限检查失败');
    return;
  }

  // 通过权限检查，隐藏 Gate
  const gate = document.getElementById('admin-gate');
  if (gate) gate.classList.add('hidden');

  // 获取当前路由
  const currentPath = Router.getCurrentRoute();
  const route = Router.routes[currentPath];

  if (route) {
    // 隐藏所有后台子内容
    document.querySelectorAll('.tab-pane').forEach(p => {
      if (p.id.startsWith('admin')) {
        p.classList.remove('active');
      }
    });
    // 显示目标页面
    const target = document.getElementById(route.name);
    if (target) target.classList.add('active');

    // 加载对应模块数据 (按需调用)
    if (route.name === 'admin' || route.name === 'admin-overview') {
       const navContent = document.getElementById('admin-nav-content');
       if (navContent) navContent.classList.remove('hidden');
       await loadAdminOverview();
    } else if (route.name.startsWith('admin-')) {
       // 确保子页面容器显示
       const content = document.getElementById('admin-content');
       if (content) content.classList.remove('hidden');
       await renderAdminModule(route.name);
    }
  }
}

// ============ 管理员操作 ============
export async function saveAdminPotions() {
  try {
    const config = JSON.parse(document.getElementById('admin-potions-json').value);
    await api('/admin/potions-config', { method: 'POST', body: JSON.stringify(config) });
    toast('配置已保存', 'gold');
  } catch (err) {
    toast('保存失败：' + err.message, 'bad');
  }
}

export async function resetAdminPotions() {
  try {
    const r = await api('/admin/potions-config');
    document.getElementById('admin-potions-json').value = JSON.stringify(r.potions, null, 2);
    toast('已重置为当前配置', 'gold');
  } catch (err) {
    toast('重置失败', 'bad');
  }
}

export async function createWorldEvent() {
  const name = document.getElementById('we-name').value.trim();
  const desc = document.getElementById('we-desc').value.trim();
  const duration = parseInt(document.getElementById('we-duration').value) || 24;
  const effectType = document.getElementById('we-effect-type').value;
  const effectValue = parseFloat(document.getElementById('we-effect-value').value) || 0;

  if (!name || !desc) {
    toast('请填写事件名称和描述', 'bad');
    return;
  }

  try {
    await api('/admin/world-events', {
      method: 'POST',
      body: JSON.stringify({ name, description: desc, duration: duration * 3600 * 1000, effectType, effectValue })
    });
    toast('全服事件已创建', 'gold');
    document.getElementById('we-name').value = '';
    document.getElementById('we-desc').value = '';
  } catch (err) {
    toast('创建失败：' + err.message, 'bad');
  }
}

export async function createManual() {
  // 功法创建功能待实现
  toast('功能开发中', 'bad');
}

export async function createExtraTask() {
  // 扩展任务创建功能待实现
  toast('功能开发中', 'bad');
}

export async function createExplore() {
  // 探险配置创建功能待实现
  toast('功能开发中', 'bad');
}

export async function createPotionConfig() {
  // 丹药配置创建功能待实现
  toast('功能开发中', 'bad');
}

// 绑定到 window
window.renderAdmin = renderAdmin;
window.renderAdminModule = renderAdminModule;
window.saveAdminPotions = saveAdminPotions;
window.resetAdminPotions = resetAdminPotions;
window.createWorldEvent = createWorldEvent;
window.createManual = createManual;
window.createExtraTask = createExtraTask;
window.createExplore = createExplore;
window.createPotionConfig = createPotionConfig;
