/* ==========================================================
   《向天再借500年》· 运势与功法模块
   包含：运势系统、功法修炼、全服事件、修仙日志
   ========================================================== */

import { token, api, toast, formatLife, formatTimeLeft, escapeHtml } from './core.js';
import { refreshState } from './state.js';

// ============ 运势系统 ============
export async function loadFortune() {
  if (!token) return;
  try {
    const r = await api('/fortune');
    const display = document.getElementById('fortune-display');
    const fortuneClass = r.fortune === '大吉' ? 'fortune-daji' : r.fortune === '吉' ? 'fortune-ji' : r.fortune === '凶' ? 'fortune-xiong' : r.fortune === '大凶' ? 'fortune-daxiong' : 'fortune-ping';
    display.innerHTML = `
      <div class="fortune-result ${fortuneClass}">
        <div class="fortune-title">${r.fortune}</div>
        <div class="fortune-hint">${r.hint}</div>
        <div class="fortune-multipliers">
          <span>寿命收益 ×${r.lifeMultiplier}</span>
          <span>功德收益 ×${r.meritMultiplier}</span>
        </div>
      </div>
    `;
    const checkinBtn = document.getElementById('checkin-btn');
    if (r.checkedIn) {
      checkinBtn.classList.add('hidden');
    } else {
      checkinBtn.classList.remove('hidden');
    }
  } catch (e) {}
}

export async function checkinFortune() {
  try {
    const r = await api('/fortune/checkin', { method: 'POST' });
    toast(`签到成功！运势：${r.fortune} · 寿命 +${formatLife(r.reward)}`, 'gold');
    await loadFortune();
    await refreshState(false);
  } catch (err) { toast(err.message, 'bad'); }
}

// ============ 功法修炼 ============
export async function loadManuals() {
  if (!token) return;
  try {
    const r = await api('/manuals');
    const list = document.getElementById('manuals-list');
    list.innerHTML = r.manuals.map(m => `
      <div class="manual-item ${m.myLevel > 0 ? 'has-level' : ''} ${m.isActive ? 'is-active' : ''}">
        <div class="manual-icon">${m.emoji}</div>
        <div class="manual-body">
          <div class="manual-name">${m.name} ${m.myLevel > 0 ? '<span class="manual-lv">Lv.' + m.myLevel + '</span>' : ''}</div>
          <div class="manual-desc">${m.description}</div>
          <div class="manual-effect">${getManualEffectText(m)}</div>
        </div>
        <div class="manual-actions">
          ${m.myLevel > 0 ? `
            <button class="toggle-btn ${m.isActive ? 'active' : ''}" onclick="window.toggleManual('${m.key}')">
              ${m.isActive ? '已激活' : '未激活'}
            </button>
          ` : ''}
          ${m.myLevel < m.maxLevel ? `
            <button class="practice-btn" onclick="window.practiceManual('${m.key}', ${m.costMerit})">
              修炼 · ${m.costMerit}功德
            </button>
          ` : '<span class="max-badge">已满级</span>'}
        </div>
      </div>
    `).join('');
  } catch (e) {}
}

function getManualEffectText(m) {
  const val = m.effectValue * (m.myLevel || 1);
  if (m.effectType === 'decay_reduction') return `衰减率降低 ${(val * 100).toFixed(0)}%`;
  if (m.effectType === 'merit_boost') return `功德收益 +${(val * 100).toFixed(0)}%`;
  if (m.effectType === 'life_boost') return `每日自动恢复 ${formatLife(val)}`;
  if (m.effectType === 'task_bonus') return `任务加成 +${(val * 100).toFixed(0)}%`;
  return m.effectType;
}

export async function practiceManual(key, cost) {
  if (!confirm(`确定消耗 ${cost} 功德修炼此功法？`)) return;
  try {
    const r = await api(`/manuals/${key}/practice`, { method: 'POST' });
    toast(`功法突破！升至 ${r.newLevel} 级`, 'gold');
    await loadManuals();
    await refreshState(false);
  } catch (err) { toast(err.message, 'bad'); }
}

export async function toggleManual(key) {
  try {
    await api(`/manuals/${key}/toggle`, { method: 'POST' });
    await loadManuals();
  } catch (err) { toast(err.message, 'bad'); }
}

// ============ 全服事件 ============
export async function loadWorldEvents() {
  if (!token) return;
  try {
    const r = await api('/world-events');
    const list = document.getElementById('world-events-list');
    if (!r.events || r.events.length === 0) {
      list.innerHTML = '<div class="empty">暂无进行中的全服事件</div>';
      return;
    }
    list.innerHTML = r.events.map(e => `
      <div class="world-event ${e.hasJoined ? 'joined' : ''}">
        <div class="we-emoji">${e.emoji}</div>
        <div class="we-body">
          <div class="we-name">${e.name} ${e.hasJoined ? '<span class="joined-badge">已参与</span>' : ''}</div>
          <div class="we-desc">${e.description}</div>
          <div class="we-effect">${getWorldEventEffectText(e)}</div>
          <div class="we-timer">剩余 ${formatTimeLeft(e.endAt)}</div>
        </div>
        ${!e.hasJoined ? `<button class="join-btn" onclick="window.joinWorldEvent(${e.id})">参与事件</button>` : ''}
      </div>
    `).join('');
  } catch (e) {}
}

function getWorldEventEffectText(e) {
  if (e.effectType === 'global_decay') return `全服衰减率 ${e.effectValue > 0 ? '+' : ''}${(e.effectValue * 100).toFixed(0)}%`;
  if (e.effectType === 'global_merit') return `全服功德收益 ${e.effectValue > 0 ? '+' : ''}${(e.effectValue * 100).toFixed(0)}%`;
  if (e.effectType === 'global_life') return `全服寿命增益 ${e.effectValue > 0 ? '+' : ''}${(e.effectValue * 100).toFixed(0)}%`;
  if (e.effectType === 'task_double') return `任务奖励双倍`;
  return e.effectType;
}

export async function joinWorldEvent(id) {
  try {
    await api(`/world-events/${id}/join`, { method: 'POST' });
    toast('已参与全服事件！', 'gold');
    await loadWorldEvents();
  } catch (err) { toast(err.message, 'bad'); }
}

// ============ 修仙日志 ============
export async function loadCultivationLogs() {
  if (!token) return;
  try {
    const r = await api('/cultivation-logs');
    const list = document.getElementById('cultivation-logs-list');
    if (!r.logs || r.logs.length === 0) {
      list.innerHTML = '<div class="empty">暂无日志</div>';
      return;
    }
    list.innerHTML = r.logs.map(l => `
      <div class="log-item ${l.type}">
        <div class="log-header">
          <span class="log-type">${getLogTypeLabel(l.type)}</span>
          <span class="log-time">${l.time}</span>
          ${l.mood ? `<span class="log-mood">${l.mood}</span>` : ''}
        </div>
        <div class="log-content">${escapeHtml(l.content)}</div>
        <button class="log-delete" onclick="window.deleteLog(${l.id})">删除</button>
      </div>
    `).join('');
  } catch (e) {}
}

function getLogTypeLabel(type) {
  if (type === 'milestone') return '里程碑';
  if (type === 'note') return '笔记';
  if (type === 'reflection') return '感悟';
  return type;
}

export async function addCultivationLog() {
  const content = document.getElementById('log-content').value.trim();
  if (!content) { toast('请输入内容', 'bad'); return; }
  const mood = document.getElementById('log-mood').value;
  const type = document.getElementById('log-type').value;
  try {
    await api('/cultivation-logs', { method: 'POST', body: JSON.stringify({ content, mood, type }) });
    toast('日志已记录', 'gold');
    document.getElementById('log-content').value = '';
    await loadCultivationLogs();
  } catch (err) { toast(err.message, 'bad'); }
}

export async function deleteLog(id) {
  if (!confirm('确定删除这条日志？')) return;
  try {
    await api(`/cultivation-logs/${id}`, { method: 'DELETE' });
    await loadCultivationLogs();
  } catch (err) { toast(err.message, 'bad'); }
}

// ============ 运势页面渲染 ============
export async function renderFortune() {
  await loadFortune();
  await loadManuals();
  await loadWorldEvents();
  await loadCultivationLogs();
}

// 绑定到 window 以便 HTML onclick 调用
window.toggleManual = toggleManual;
window.practiceManual = practiceManual;
window.joinWorldEvent = joinWorldEvent;
window.deleteLog = deleteLog;
