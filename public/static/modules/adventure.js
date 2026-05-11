/* ==========================================================
   《向天再借500年》· 探险与天劫模块
   包含：秘境探险、天劫挑战
   ========================================================== */

import { token, api, toast, formatLife } from './core.js';
import { refreshState } from './state.js';
import { renderAchievements, checkAchievements } from './achievements.js';

// ============ 秘境探险 ============
export async function doExplore() {
  try {
    const r = await api('/explore', { method: 'POST' });
    const resEl = document.getElementById('explore-result');
    const l = r.loot;
    const cls = l.life >= 6*3600 ? 'rare' : l.life > 0 ? 'good' : 'bad';
    resEl.innerHTML = `
      <div class="explore-roll ${cls}">
        <div class="roll-name">${l.name}</div>
        <div class="roll-msg">${l.msg}</div>
        <div class="roll-stats">
          ${l.life > 0 ? `<span>寿命 +${formatLife(l.life)}</span>` : '<span>寿命 无变化</span>'}
          ${l.merit > 0 ? `<span>功德 +${l.merit}</span>` : '<span>功德 -20</span>'}
          ${l.shard > 0 ? `<span>碎片 +${l.shard}</span>` : ''}
        </div>
      </div>
    `;
    await refreshState(false);
  } catch (err) { toast(err.message, 'bad'); }
}

// ============ 天劫挑战 ============
let tribulationCache = null;

const TASK_LABELS = {
  ziwu: '子午流注（早睡）',
  steps: '步步为营（10000步）',
  water: '上善若水（8杯水）',
  meditate: '静坐冥想',
  diet: '清淡饮食',
};

export async function renderAdventure() {
  if (!token) return;
  // 加载天劫状态
  try {
    const t = await api('/tribulation');
    tribulationCache = t;
    const statusEl = document.getElementById('trib-status');
    const actionsEl = document.getElementById('trib-actions');
    const acceptBtn = document.getElementById('trib-accept');
    const completeBtn = document.getElementById('trib-complete');
    const failBtn = document.getElementById('trib-fail');

    if (t.isCompleted) {
      statusEl.innerHTML = `<div class="trib-done">🌩️ 本周天劫已渡，静待下周</div>`;
      actionsEl.classList.add('hidden');
    } else if (t.isFailed) {
      statusEl.innerHTML = `<div class="trib-failed">💀 本周天劫失败，修为受损</div>`;
      actionsEl.classList.add('hidden');
    } else if (t.canAccept) {
      const tasksHtml = t.tasks.map((tk, i) => `<div class="trib-task"><span class="tnum">${i+1}</span>${TASK_LABELS[tk.task] || tk.task}</div>`).join('');
      statusEl.innerHTML = `<div class="trib-pending"><p>天劫内容（需今日全部完成）：</p>${tasksHtml}</div>`;
      actionsEl.classList.remove('hidden');
      acceptBtn.classList.remove('hidden');
      completeBtn.classList.add('hidden');
      failBtn.classList.add('hidden');
    } else if (t.canComplete) {
      const tasksHtml = t.tasks.map((tk, i) => `<div class="trib-task ${tk.done ? 'done' : ''}"><span class="tnum">${i+1}</span>${TASK_LABELS[tk.task] || tk.task} ${tk.done ? '✅' : '⏳'}</div>`).join('');
      statusEl.innerHTML = `<div class="trib-active"><p>天劫进行中：</p>${tasksHtml}</div>`;
      actionsEl.classList.remove('hidden');
      acceptBtn.classList.add('hidden');
      completeBtn.classList.remove('hidden');
      failBtn.classList.remove('hidden');
    } else if (t.status === 'accepted') {
      const tasksHtml = t.tasks.map((tk, i) => `<div class="trib-task ${tk.done ? 'done' : ''}"><span class="tnum">${i+1}</span>${TASK_LABELS[tk.task] || tk.task} ${tk.done ? '✅' : '⏳'}</div>`).join('');
      statusEl.innerHTML = `<div class="trib-active"><p>天劫进行中：</p>${tasksHtml}</div>`;
      actionsEl.classList.remove('hidden');
      acceptBtn.classList.add('hidden');
      completeBtn.classList.add('hidden');
      failBtn.classList.remove('hidden');
    }
  } catch (e) {
    document.getElementById('trib-status').innerHTML = `<div class="trib-loading">天劫数据加载失败</div>`;
  }

  // 加载成就
  await renderAchievements();
}

export async function acceptTribulation() {
  try {
    await api('/tribulation/accept', { method: 'POST' });
    toast('⚡ 接下天劫，本周需完成指定修炼', 'gold');
    await renderAdventure();
  } catch (err) { toast(err.message, 'bad'); }
}

export async function completeTribulation() {
  try {
    const r = await api('/tribulation/complete', { method: 'POST' });
    toast(`🌩️ 渡劫成功 · 寿命 +${formatLife(r.rewardSec)} · 功德 +${r.merit}`, 'gold');
    await renderAdventure();
    await refreshState(false);
  } catch (err) { toast(err.message, 'bad'); }
}

export async function failTribulation() {
  if (!confirm('确定放弃渡劫？将扣除 3 小时寿命。')) return;
  try {
    await api('/tribulation/fail', { method: 'POST' });
    toast('💀 天劫失败 · 寿命 -3 小时', 'bad');
    await renderAdventure();
    await refreshState(false);
  } catch (err) { toast(err.message, 'bad'); }
}

// 绑定到 window
window.acceptTribulation = acceptTribulation;
window.completeTribulation = completeTribulation;
window.failTribulation = failTribulation;
window.doExplore = doExplore;
