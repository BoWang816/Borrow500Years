/* ==========================================================
   《向天再借500年》· 用户资料模块
   包含：个人信息展示
   ========================================================== */

import { stateCache, nowMs, SEC_PER_DAY, formatLife } from './core.js';

// ============ 渲染：用户资料 ============
export function renderProfile() {
  if (!stateCache) return;
  const p = stateCache.profile;
  document.getElementById('avatar-char').textContent = (p.name || '道')[0];
  const bmi = p.weight / Math.pow(p.height / 100, 2);
  const startedDays = (nowMs() - p.start_timestamp) / 1000 / SEC_PER_DAY;
  document.getElementById('profile-info').innerHTML = `
    <div class="pi-row"><span class="pi-label">道号</span><span class="pi-value">${p.name}</span></div>
    <div class="pi-row"><span class="pi-label">性别 / 年龄</span><span class="pi-value">${p.gender === 'female' ? '坤·女' : '乾·男'} · ${p.age}岁</span></div>
    <div class="pi-row"><span class="pi-label">身形</span><span class="pi-value">${p.height}cm / ${p.weight}kg · BMI ${bmi.toFixed(1)}</span></div>
    <div class="pi-row"><span class="pi-label">命盘开启</span><span class="pi-value">${startedDays.toFixed(2)} 天前</span></div>
    <div class="pi-row"><span class="pi-label">累积修炼增量</span><span class="pi-value">${formatLife(p.bonus_sec)}</span></div>
    <div class="pi-row"><span class="pi-label">复活币 / 功德</span><span class="pi-value">${p.coin} 枚 / ${p.merit} 点</span></div>
  `;
}

// 绑定到 window
window.renderProfile = renderProfile;
