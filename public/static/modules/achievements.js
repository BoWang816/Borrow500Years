/* ==========================================================
   《向天再借500年》· 成就系统模块
   包含：成就列表、解锁检查
   ========================================================== */

import { token, stateCache, api, toast } from './core.js';
import { refreshState } from './state.js';

// ============ 渲染：成就列表 ============
export async function renderAchievements() {
  if (!token) return;
  try {
    const r = await api('/achievements');
    const list = document.getElementById('achievements-list');
    document.getElementById('ach-count').textContent = `${r.unlockedCount}/${r.achievements.length}`;
    list.innerHTML = r.achievements.map(a => `
      <div class="ach-item ${a.unlocked ? 'unlocked' : 'locked'}">
        <div class="ach-icon">${a.unlocked ? '🏆' : '🔒'}</div>
        <div class="ach-body">
          <div class="ach-name">${a.name}</div>
          <div class="ach-desc">${a.desc}</div>
          ${a.unlocked ? `<div class="ach-reward">功德 +${a.merit}${a.coin > 0 ? ' · 复活币 +' + a.coin : ''}</div>` : ''}
        </div>
      </div>
    `).join('');
  } catch (e) {}
}

// ============ 检查新成就 ============
export async function checkAchievements() {
  if (!token || !stateCache) return;
  try {
    const r = await api('/achievements/check', { method: 'POST' });
    if (r.newly && r.newly.length > 0) {
      for (const a of r.newly) {
        toast(`🏆 解锁成就「${a.name}」· 功德 +${a.merit}${a.coin > 0 ? ' · 复活币 +' + a.coin : ''}`, 'gold');
      }
      await renderAchievements();
      await refreshState(false);
    }
  } catch (e) {}
}
