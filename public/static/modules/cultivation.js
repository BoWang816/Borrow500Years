/* ==========================================================
   《向天再借500年》· 修炼任务模块
   包含：日常修炼、弥留/转世、随机事件
   ========================================================== */

import { stateCache, token, api, toast } from './core.js';
import { refreshState } from './state.js';

// ============ 渲染：修炼任务 ============
export function renderCultivation() {
  if (!stateCache) return;
  const t = stateCache.todayTasks;
  ['ziwu', 'meditate', 'diet', 'earlyrise', 'steps'].forEach(k => {
    const card = document.querySelector(`.task-card[data-task="${k}"]`);
    if (!card) return;
    const done = !!t[k];
    card.classList.toggle('done', done);
    const btn = card.querySelector('.task-btn');
    if (btn) btn.disabled = done;
  });

  const wc = document.getElementById('water-cups');
  wc.innerHTML = '';
  for (let i = 0; i < 8; i++) {
    const c = document.createElement('div');
    c.className = 'water-cup' + (i < t.water ? ' filled' : '');
    wc.appendChild(c);
  }
  const waterCard = document.querySelector('.task-card[data-task="water"]');
  waterCard.classList.toggle('done', t.water >= 8);
  waterCard.querySelector('.task-btn').disabled = t.water >= 8;

  // streak
  const sb = document.getElementById('streak-bar');
  sb.innerHTML = '';
  const streak = stateCache.profile.streak || 0;
  for (let i = 0; i < 7; i++) {
    const s = document.createElement('span');
    if (i < streak) s.classList.add('on');
    sb.appendChild(s);
  }
  document.getElementById('streak-num').textContent = streak;
}

// ============ 执行任务 ============
export async function doTask(name) {
  const body = {};
  if (name === 'steps') {
    const s = parseInt(document.getElementById('steps-range').value) || 0;
    if (s < 1000) return toast('至少需要 1000 步', 'bad');
    body.steps = s;
  }
  try {
    const r = await api('/task/' + name, { method: 'POST', body: JSON.stringify(body) });
    toast(r.msg, 'gold');
    await refreshState();
  } catch (err) { toast(err.message, 'bad'); }
}

// ============ 随机事件 ============
export async function triggerRandomEvent() {
  try {
    const r = await api('/event/random', { method: 'POST' });
    toast(r.msg, r.good ? 'gold' : 'bad');
    await refreshState();
  } catch (err) { toast(err.message, 'bad'); }
}

// ============ 弥留 / 转世 ============
export function showDying() {
  document.getElementById('dying-modal').classList.remove('hidden');
}

export function hideDying() {
  document.getElementById('dying-modal').classList.add('hidden');
}

export async function doRevive() {
  try {
    await api('/revive', { method: 'POST' });
    toast('💗 起死回生', 'gold');
    hideDying();
    await refreshState();
  } catch (err) { toast(err.message, 'bad'); }
}
