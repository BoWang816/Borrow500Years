/* ==========================================================
   《向天再借500年》· 主面板模块
   包含：寿命倒计时、衰减系数、事件日志
   ========================================================== */

import {
  stateCache, displayMode, SEC_PER_YEAR, SEC_PER_DAY, SEC_PER_HOUR, SEC_PER_MIN,
  pad, nowMs, formatLife, currentLifeSec, baseDecayMultiplier, getRealm
} from './core.js';

// ============ 渲染：Pulse 倒计时 ============
export function renderPulse() {
  if (!stateCache || !stateCache.profile) return;
  const p = stateCache.profile;
  let life = currentLifeSec();

  // 弥留时显示 24 小时倒计时
  if (p.dying && p.dying_start_at) {
    const passed = (nowMs() - p.dying_start_at) / 1000;
    const left = 24 * 3600 - passed;
    life = -left;
  }

  document.body.classList.toggle('crisis', life > 0 && life < 30 * SEC_PER_DAY);
  const crisisOverlay = document.getElementById('crisis-overlay');
  if (life > 0 && life < 30 * SEC_PER_DAY) crisisOverlay.classList.remove('hidden');
  else crisisOverlay.classList.add('hidden');

  const safeLife = Math.max(0, life);
  const totalSec = safeLife;
  const years = Math.floor(totalSec / SEC_PER_YEAR);
  const remAfterYears = totalSec - years * SEC_PER_YEAR;
  const days = Math.floor(remAfterYears / SEC_PER_DAY);
  const remAfterDays = remAfterYears - days * SEC_PER_DAY;
  const hours = Math.floor(remAfterDays / SEC_PER_HOUR);
  const remAfterHours = remAfterDays - hours * SEC_PER_HOUR;
  const minutes = Math.floor(remAfterHours / SEC_PER_MIN);
  const seconds = Math.floor(remAfterHours - minutes * SEC_PER_MIN);

  const pulseEl = document.getElementById('pulse-time');
  if (displayMode === 'full') {
    pulseEl.style.display = 'flex';
    pulseEl.querySelector('[data-k="years"]').textContent = pad(years, 3);
    pulseEl.querySelector('[data-k="days"]').textContent = pad(days, 3);
    pulseEl.querySelector('[data-k="hours"]').textContent = pad(hours, 2);
    pulseEl.querySelector('[data-k="minutes"]').textContent = pad(minutes, 2);
    pulseEl.querySelector('[data-k="seconds"]').textContent = pad(seconds, 2);
  } else if (displayMode === 'seconds') {
    pulseEl.style.display = 'block';
    pulseEl.innerHTML = `<span class="seg" style="min-width:auto">${Math.floor(totalSec).toLocaleString()}</span><em style="margin-left:8px">秒</em>`;
  } else {
    pulseEl.style.display = 'block';
    const totalDays = Math.floor(totalSec / SEC_PER_DAY);
    pulseEl.innerHTML = `<span class="seg" style="min-width:auto">${totalDays.toLocaleString()}</span><em style="margin-left:8px">天</em>`;
  }

  document.getElementById('pulse-seconds').textContent =
    p.dying ? `弥留期剩余：${pad(Math.floor(-life/3600))}:${pad(Math.floor((-life%3600)/60))}:${pad(Math.floor(-life%60))}` :
    `精确秒：${totalSec.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;

  const rate = stateCache.decayRate || 1.0;
  const rateEl = document.getElementById('decay-rate');
  rateEl.textContent = rate.toFixed(2) + 'x';
  rateEl.style.color = rate > 1.2 ? 'var(--blood)' : rate < 0.8 ? 'var(--jade)' : 'var(--gold-soft)';

  const realm = getRealm();
  document.getElementById('realm').textContent = realm.title;
  document.getElementById('title-badge').textContent = realm.title;
  document.getElementById('revive-coin').innerHTML = `<i class="fas fa-coins"></i> ${p.coin}`;
}

// ============ 渲染：衰减系数列表 ============
export function renderModifiers() {
  if (!stateCache) return;
  const p = stateCache.profile;
  const ul = document.getElementById('modifier-list');
  const items = [];
  if (p.stayup) items.push({ name: '长期熬夜', value: '+0.50x', kind: 'bad' });
  if (p.smoke) items.push({ name: '烟瘾深重', value: '+0.40x', kind: 'bad' });
  if (p.alcohol) items.push({ name: '嗜酒贪杯', value: '+0.20x', kind: 'bad' });
  if (p.exercise) items.push({ name: '常年习武', value: '-0.15x', kind: 'good' });
  if (p.meditate) items.push({ name: '静坐打坐', value: '-0.10x', kind: 'good' });
  for (const m of stateCache.potions) {
    if (!m.mod_value) continue;
    const sign = m.mod_value >= 0 ? '+' : '';
    items.push({ name: m.mod_label, value: `${sign}${m.mod_value.toFixed(2)}x`, kind: m.mod_value >= 0 ? 'bad' : 'good' });
  }
  if (items.length === 0) {
    ul.innerHTML = `<li class="empty">暂无修正项 · 当前 ${baseDecayMultiplier(p).toFixed(2)}x</li>`;
    return;
  }
  ul.innerHTML = items.map(it => `
    <li><span class="mod-name">${it.name}</span><span class="mod-val ${it.kind}">${it.value}</span></li>
  `).join('') + `<li><span class="mod-name">合计衰减</span><span class="mod-val">${(stateCache.decayRate || 1).toFixed(2)}x</span></li>`;
}

// ============ 渲染：事件日志 ============
export function renderEventLog() {
  if (!stateCache) return;
  const ul = document.getElementById('event-log');
  const events = (stateCache.events || []).slice().reverse();
  if (events.length === 0) {
    ul.innerHTML = `<li style="justify-content:center;color:var(--ink-dim);">命盘静谧，未见波澜</li>`;
    return;
  }
  ul.innerHTML = events.map(e => `
    <li><time>${e.time}</time><span class="${e.kind === 'good' ? 'ev-good' : e.kind === 'bad' ? 'ev-bad' : ''}">${e.msg}</span></li>
  `).join('');
}
