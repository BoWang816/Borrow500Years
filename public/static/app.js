/* ==========================================================
   《向天再借500年》 · 前端（API 版本）
   ========================================================== */
'use strict';

const TOKEN_KEY = 'borrow500_token';
const SEC_PER_MIN = 60;
const SEC_PER_HOUR = 3600;
const SEC_PER_DAY = 86400;
const SEC_PER_YEAR = 365.25 * SEC_PER_DAY;

const TITLES = [
  { min: 0,    name: '凡胎肉身' },
  { min: 80,   name: '寿比南山' },
  { min: 120,  name: '地仙之姿' },
  { min: 200,  name: '与天同寿' },
];

// ============ 状态（缓存自服务端） ============
let token = localStorage.getItem(TOKEN_KEY) || '';
let stateCache = null;     // 完整服务端 state
let displayMode = 'full';
let currentBoard = 'longevity';
let pulseTimer = null;
let serverNowOffset = 0;   // serverNow - clientNow，用于校准
let authMode = 'login';    // login | register
let lastFetchAt = 0;

// ============ HTTP ============
async function api(path, opts = {}) {
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
  if (token) headers['Authorization'] = 'Bearer ' + token;
  const r = await fetch('/api' + path, { ...opts, headers });
  let data = null;
  try { data = await r.json(); } catch (e) { data = {}; }
  if (!r.ok) {
    const err = new Error((data && data.error) || `HTTP ${r.status}`);
    err.status = r.status; err.data = data;
    throw err;
  }
  return data;
}

// ============ 工具 ============
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function pad(n, w = 2) { return String(Math.floor(n)).padStart(w, '0'); }
function nowMs() { return Date.now() + serverNowOffset; }

function formatLife(sec) {
  if (sec >= SEC_PER_YEAR) return (sec / SEC_PER_YEAR).toFixed(1) + ' 年';
  if (sec >= SEC_PER_DAY) return (sec / SEC_PER_DAY).toFixed(1) + ' 天';
  if (sec >= SEC_PER_HOUR) return (sec / SEC_PER_HOUR).toFixed(1) + ' 小时';
  if (sec >= 60) return Math.round(sec / 60) + ' 分钟';
  return Math.round(sec) + ' 秒';
}

function baseDecayMultiplier(p) {
  let mult = 1.0;
  if (p.stayup) mult += 0.5;
  if (p.smoke) mult += 0.4;
  if (p.alcohol) mult += 0.2;
  if (p.exercise) mult -= 0.15;
  if (p.meditate) mult -= 0.1;
  return mult;
}

function currentLifeSec() {
  if (!stateCache || !stateCache.profile) return 0;
  const p = stateCache.profile;
  if (p.dying) return 0;
  const elapsed = (nowMs() - p.start_timestamp) / 1000;
  const base = baseDecayMultiplier(p);
  return p.initial_life_sec + p.bonus_sec - elapsed * base;
}

function getRealm() {
  if (!stateCache || !stateCache.profile) return { title: TITLES[0].name, totalAge: 0 };
  const p = stateCache.profile;
  const yearsLived = p.age + (nowMs() - p.start_timestamp) / 1000 / SEC_PER_YEAR;
  const totalAge = yearsLived + p.bonus_sec / SEC_PER_YEAR;
  let title = TITLES[0].name;
  for (const t of TITLES) if (totalAge >= t.min) title = t.name;
  return { title, totalAge };
}

// ============ Toast ============
function toast(msg, kind = 'normal') {
  const wrap = document.getElementById('toast-wrap');
  const t = document.createElement('div');
  t.className = 'toast' + (kind === 'bad' ? ' bad' : kind === 'gold' ? ' gold' : '');
  t.textContent = msg;
  wrap.appendChild(t);
  setTimeout(() => t.remove(), 3200);
}

// ============ 认证 ============
function showAuth() {
  document.getElementById('auth-modal').classList.remove('hidden');
  document.getElementById('onboarding').classList.add('hidden');
}
function hideAuth() {
  document.getElementById('auth-modal').classList.add('hidden');
}
function showOnboarding() {
  document.getElementById('onboarding').classList.remove('hidden');
  document.getElementById('auth-modal').classList.add('hidden');
}
function hideOnboarding() {
  document.getElementById('onboarding').classList.add('hidden');
}

function setAuthMode(mode) {
  authMode = mode;
  document.querySelectorAll('.auth-tab').forEach(b => {
    b.classList.toggle('active', b.dataset.mode === mode);
  });
  document.getElementById('auth-btn-text').textContent = mode === 'login' ? '入 · 仙 · 籍' : '开 · 立 · 道 · 号';
  document.getElementById('auth-err').textContent = '';
}

async function authSubmit(e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  const username = (fd.get('username') || '').toString().trim();
  const password = (fd.get('password') || '').toString();
  const errEl = document.getElementById('auth-err');
  errEl.textContent = '';
  try {
    const r = await api(authMode === 'login' ? '/auth/login' : '/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    token = r.token;
    localStorage.setItem(TOKEN_KEY, token);
    document.getElementById('user-name').textContent = r.username;
    document.getElementById('user-tag').classList.remove('hidden');
    document.getElementById('logout-btn').classList.remove('hidden');
    hideAuth();
    if (authMode === 'register' || !r.hasProfile) {
      showOnboarding();
    } else {
      await refreshState();
    }
    toast(authMode === 'login' ? '欢迎归来，' + username + ' 道友' : '已开立道号 · ' + username, 'gold');
  } catch (err) {
    errEl.textContent = err.message || '操作失败';
  }
}

async function logout() {
  try { await api('/auth/logout', { method: 'POST' }); } catch (e) {}
  token = '';
  localStorage.removeItem(TOKEN_KEY);
  stateCache = null;
  document.getElementById('user-tag').classList.add('hidden');
  document.getElementById('logout-btn').classList.add('hidden');
  showAuth();
}

// ============ Onboarding ============
async function onboardSubmit(e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  const body = {
    name: (fd.get('name') || '').toString().slice(0, 12),
    gender: fd.get('gender'),
    age: parseInt(fd.get('age')) || 25,
    height: parseInt(fd.get('height')) || 170,
    weight: parseInt(fd.get('weight')) || 65,
    smoke: fd.get('smoke') === 'on',
    alcohol: fd.get('alcohol') === 'on',
    stayup: fd.get('stayup') === 'on',
    hereditary: fd.get('hereditary') === 'on',
    exercise: fd.get('exercise') === 'on',
    meditate: fd.get('meditate') === 'on',
  };
  try {
    const r = await api('/profile/onboard', { method: 'POST', body: JSON.stringify(body) });
    toast('命盘开启 · 预测剩余寿命 ' + r.remainYears.toFixed(1) + ' 年', 'gold');
    hideOnboarding();
    await refreshState();
  } catch (err) {
    toast(err.message, 'bad');
  }
}

// ============ 拉取状态 ============
async function refreshState(showError = true) {
  if (!token) { showAuth(); return; }
  try {
    const r = await api('/state');
    stateCache = r;
    serverNowOffset = (r.serverNow || Date.now()) - Date.now();
    lastFetchAt = Date.now();
    document.getElementById('user-name').textContent = stateCache.profile.name;
    document.getElementById('user-tag').classList.remove('hidden');
    document.getElementById('logout-btn').classList.remove('hidden');
    // 弥留处理
    if (stateCache.profile.dying) {
      showDying();
    } else {
      hideDying();
    }
    renderAll();
    // 检查管理员身份
    checkAdmin();
  } catch (err) {
    if (err.status === 401) {
      token = '';
      localStorage.removeItem(TOKEN_KEY);
      showAuth();
    } else if (err.status === 404) {
      // 未开命盘
      showOnboarding();
    } else if (showError) {
      toast(err.message, 'bad');
    }
  }
}

// ============ 渲染：Pulse ============
function renderPulse() {
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

function renderModifiers() {
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

function renderEventLog() {
  if (!stateCache) return;
  const ul = document.getElementById('event-log');
  const events = (stateCache.events || []).slice().reverse();
  if (events.length === 0) { ul.innerHTML = `<li style="justify-content:center;color:var(--ink-dim);">命盘静谧，未见波澜</li>`; return; }
  ul.innerHTML = events.map(e => `
    <li><time>${e.time}</time><span class="${e.kind === 'good' ? 'ev-good' : e.kind === 'bad' ? 'ev-bad' : ''}">${e.msg}</span></li>
  `).join('');
}

function renderCultivation() {
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

let POTIONS_META = []; // 从API动态获取

function formatDuration(seconds) {
  if (seconds >= 86400) return Math.floor(seconds / 86400) + '天';
  if (seconds >= 3600) return Math.floor(seconds / 3600) + '小时';
  return Math.floor(seconds / 60) + '分钟';
}

function getPotionDesc(po) {
  if (po.mod && po.dur) {
    return `${po.mod.label} · 持续${formatDuration(po.dur)}`;
  }
  if (po.instant && po.instant.life) {
    const hours = Math.floor(po.instant.life / 3600);
    if (hours >= 8760) return `立即获得 +${Math.floor(hours / 8760)}年寿命`;
    if (hours >= 24) return `立即获得 +${Math.floor(hours / 24)}天寿命`;
    return `立即获得 +${hours}小时寿命`;
  }
  return po.desc || '神秘丹药';
}

function renderInventory() {
  if (!stateCache) return;
  const p = stateCache.profile;
  document.getElementById('inv-coin').textContent = p.coin;
  document.getElementById('inv-merit').textContent = p.merit;
  document.getElementById('inv-shard').textContent = `${p.shard} / 5`;

  const grid = document.getElementById('potion-grid');
  grid.innerHTML = POTIONS_META.map(po => {
    const can = po.type === 'merit' ? p.merit >= po.cost : p.coin >= po.cost;
    return `
      <div class="potion">
        <div class="potion-emoji">${po.emoji}</div>
        <h4>${po.name}</h4>
        <div class="potion-desc">${getPotionDesc(po)}</div>
        <div class="potion-cost">${po.type === 'merit' ? '功德 ' + po.cost : '复活币 ' + po.cost}</div>
        <button class="potion-buy" data-pid="${po.id}" ${can ? '' : 'disabled'}>${can ? '炼制 · 服用' : '资源不足'}</button>
      </div>
    `;
  }).join('');
  grid.querySelectorAll('.potion-buy').forEach(b => {
    b.addEventListener('click', () => buyPotion(b.dataset.pid));
  });

  const ap = document.getElementById('active-potions');
  const actives = (stateCache.potions || []).filter(p => p.expire_at > nowMs());
  if (actives.length === 0) { ap.innerHTML = `<p class="empty">尚无丹药生效</p>`; return; }
  ap.innerHTML = actives.map(p => {
    const remain = Math.max(0, Math.floor((p.expire_at - nowMs()) / 1000));
    const h = Math.floor(remain / 3600), m = Math.floor((remain % 3600) / 60);
    return `<div class="active-potion">
      <div class="ap-name">${p.potion_emoji || '✨'} ${p.potion_name}</div>
      <div class="ap-time">剩余 ${h}h ${m}m</div>
    </div>`;
  }).join('');
}

async function buyPotion(pid) {
  try {
    const r = await api('/potion/' + pid, { method: 'POST' });
    toast(r.msg, 'gold');
    await refreshState();
  } catch (err) { toast(err.message, 'bad'); }
}

async function renderBoard() {
  if (!token) return;
  const list = document.getElementById('board-list');
  list.innerHTML = `<div style="text-align:center; padding:30px; color:var(--ink-dim);">天榜推演中...</div>`;
  try {
    const r = await api('/board/' + currentBoard);
    list.innerHTML = r.rows.map((row, i) => {
      const rank = i + 1;
      const cls = ['', 'top1', 'top2', 'top3'][rank] || '';
      const valTxt = currentBoard === 'longevity'
        ? `剩余 ${(row.lifeSec / SEC_PER_YEAR).toFixed(2)} 年`
        : `延寿 ${formatLife(row.meritGained)}`;
      return `
        <div class="board-row ${cls} ${row.isMe ? 'me' : ''}">
          <div class="rank">${rank <= 3 ? ['🥇','🥈','🥉'][rank-1] : '#' + rank}</div>
          <div>
            <div class="name">${row.name}${row.isMe ? '<span class="you">YOU</span>' : ''}</div>
            <div class="title">${row.realm} · ${Math.floor(row.age)}岁</div>
          </div>
          <div class="val">${valTxt}</div>
        </div>
      `;
    }).join('');
  } catch (err) {
    list.innerHTML = `<div style="text-align:center; padding:30px; color:var(--blood);">加载失败：${err.message}</div>`;
  }
}

function renderProfile() {
  if (!stateCache) return;
  const p = stateCache.profile;
  document.getElementById('avatar-char').textContent = (p.name || '道')[0];
  const bmi = p.weight / Math.pow(p.height / 100, 2);
  // 推算预期寿命（仅展示）
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

// ============ 任务执行 ============
async function doTask(name) {
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

async function triggerRandomEvent() {
  try {
    const r = await api('/event/random', { method: 'POST' });
    toast(r.msg, r.good ? 'gold' : 'bad');
    await refreshState();
  } catch (err) { toast(err.message, 'bad'); }
}

// ============ 弥留 / 转世 ============
function showDying() { document.getElementById('dying-modal').classList.remove('hidden'); }
function hideDying() { document.getElementById('dying-modal').classList.add('hidden'); }

async function doRevive() {
  try {
    await api('/revive', { method: 'POST' });
    toast('💗 起死回生', 'gold');
    hideDying();
    await refreshState();
  } catch (err) { toast(err.message, 'bad'); }
}

// ============ 成就系统 ============
async function renderAchievements() {
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

async function checkAchievements() {
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

// ============ 运势系统 ============
async function loadFortune() {
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

async function checkinFortune() {
  try {
    const r = await api('/fortune/checkin', { method: 'POST' });
    toast(`签到成功！运势：${r.fortune} · 寿命 +${formatLife(r.reward)}`, 'gold');
    await loadFortune();
    await refreshState(false);
  } catch (err) { toast(err.message, 'bad'); }
}

// ============ 功法修炼 ============
async function loadManuals() {
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
            <button class="toggle-btn ${m.isActive ? 'active' : ''}" onclick="toggleManual('${m.key}')">
              ${m.isActive ? '已激活' : '未激活'}
            </button>
          ` : ''}
          ${m.myLevel < m.maxLevel ? `
            <button class="practice-btn" onclick="practiceManual('${m.key}', ${m.costMerit})">
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

async function practiceManual(key, cost) {
  if (!confirm(`确定消耗 ${cost} 功德修炼此功法？`)) return;
  try {
    const r = await api(`/manuals/${key}/practice`, { method: 'POST' });
    toast(`功法突破！升至 ${r.newLevel} 级`, 'gold');
    await loadManuals();
    await refreshState(false);
  } catch (err) { toast(err.message, 'bad'); }
}

async function toggleManual(key) {
  try {
    await api(`/manuals/${key}/toggle`, { method: 'POST' });
    await loadManuals();
  } catch (err) { toast(err.message, 'bad'); }
}

// ============ 全服事件 ============
async function loadWorldEvents() {
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
        ${!e.hasJoined ? `<button class="join-btn" onclick="joinWorldEvent(${e.id})">参与事件</button>` : ''}
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

function formatTimeLeft(endAt) {
  const left = Math.max(0, endAt - Date.now());
  const hours = Math.floor(left / 3600000);
  const mins = Math.floor((left % 3600000) / 60000);
  return `${hours}小时${mins}分`;
}

async function joinWorldEvent(id) {
  try {
    await api(`/world-events/${id}/join`, { method: 'POST' });
    toast('已参与全服事件！', 'gold');
    await loadWorldEvents();
  } catch (err) { toast(err.message, 'bad'); }
}

// ============ 修仙日志 ============
async function loadCultivationLogs() {
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
        <button class="log-delete" onclick="deleteLog(${l.id})">删除</button>
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

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

async function addCultivationLog() {
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

async function deleteLog(id) {
  if (!confirm('确定删除这条日志？')) return;
  try {
    await api(`/cultivation-logs/${id}`, { method: 'DELETE' });
    await loadCultivationLogs();
  } catch (err) { toast(err.message, 'bad'); }
}

// ============ 运势页面渲染 ============
async function renderFortune() {
  await loadFortune();
  await loadManuals();
  await loadWorldEvents();
  await loadCultivationLogs();
}

// ============ 管理后台 ============
let adminCache = null;

async function checkAdmin() {
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

// 显示管理员验证界面
function showAdminGate(msg) {
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

// 渲染管理员子模块
async function renderAdminModule(moduleName) {
  // 基础权限检查已在 renderAdmin 处理，这里主要负责各子页面的数据加载
  const userId = stateCache?.userId;
  if (!userId) return;

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

async function loadAdminOverview() {
  // 平台统计
  try {
    const s = await api('/admin/stats');
    const total = document.getElementById('stat-total');
    if (total) total.textContent = s.totalUsers;
    const active = document.getElementById('stat-active');
    if (active) active.textContent = s.activeUsers;
    const tasks = document.getElementById('stat-tasks');
    if (tasks) tasks.textContent = s.todayTasks;
    const events = document.getElementById('stat-events');
    if (events) events.textContent = s.totalEvents;
    const pots = document.getElementById('stat-potions');
    if (pots) pots.textContent = s.totalPotions;
    const ach = document.getElementById('stat-ach');
    if (ach) ach.textContent = s.totalAchievements;
  } catch (e) {}

  // 用户列表
  try {
    const r = await api('/admin/users');
    adminCache = r;
    const uCount = document.getElementById('user-count');
    if (uCount) uCount.textContent = r.users.length;
    const tbody = document.querySelector('#admin-user-table tbody');
    if (tbody) {
      tbody.innerHTML = r.users.map(u => `
        <tr>
          <td>${u.userId}</td>
          <td>${u.username}</td>
          <td>${u.name || '—'}</td>
          <td>${u.age || '—'}</td>
          <td>${u.bmi || '—'}</td>
          <td>${u.realm || '—'}</td>
          <td>${u.hasProfile ? formatLife(u.lifeSec) : '—'}</td>
          <td>${u.merit}</td>
          <td>${u.coin}</td>
          <td>${u.streak}</td>
          <td>${u.dying ? '<span class="badge bad">弥留</span>' : u.hasProfile ? '<span class="badge ok">正常</span>' : '<span class="badge">未开</span>'}</td>
        </tr>
      `).join('');
    }
  } catch (e) {}
}

async function loadAdminPotions() {
  try {
    const p = await api('/admin/potions');
    const list = document.getElementById('admin-potion-list');
    if (!list) return;
    list.innerHTML = p.potions.map(po => `
      <div class="admin-potion-row" data-pid="${po.id}">
        <div class="ap-meta">
          <span class="ap-emoji">${po.emoji}</span>
          <span class="ap-name">${po.name}</span>
          <span class="ap-type">${po.type === 'merit' ? '功德' : '复活币'}</span>
        </div>
        <div class="ap-fields">
          <label>价格 <input type="number" class="ap-cost" data-field="cost" value="${po.cost}" min="0" /></label>
          <label>寿命增益(秒) <input type="number" class="ap-life" data-field="life" value="${po.instant ? po.instant.life : 0}" min="0" /></label>
          <label>持续时间(秒) <input type="number" class="ap-dur" data-field="dur" value="${po.dur || 0}" min="0" /></label>
        </div>
      </div>
    `).join('');
  } catch (e) {}
}

async function loadAdminLogs() {
  try {
    const l = await api('/admin/logs');
    const tbody = document.querySelector('#admin-log-table tbody');
    if (!tbody) return;
    tbody.innerHTML = (l.logs || []).map(log => `
      <tr>
        <td>${log.time}</td>
        <td>${log.admin}</td>
        <td>${log.action}</td>
        <td><pre class="log-detail">${log.detail || '—'}</pre></td>
      </tr>
    `).join('');
  } catch (e) {}
}

async function loadAdminEvents() {
  try {
    const events = await api('/world-events');
    const list = document.getElementById('admin-we-list');
    if (!list) return;
    if (!events.events || events.events.length === 0) {
      list.innerHTML = '<div class="empty">暂无进行中的全服事件</div>';
    } else {
      list.innerHTML = events.events.map(e => `
        <div class="admin-we-item">
          <span class="we-item-emoji">${e.emoji}</span>
          <span class="we-item-name">${e.name}</span>
          <span class="we-item-effect">${e.effectType}</span>
          <span class="we-item-time">${formatTimeLeft(e.endAt)}</span>
          <button class="we-end-btn" onclick="endWorldEvent(${e.id})">结束</button>
        </div>
      `).join('');
    }
  } catch (e) {}
}

async function loadAdminManuals() {
  try {
    const manuals = await api('/admin/manuals');
    const list = document.getElementById('admin-manuals-list');
    if (!list) return;
    if (!manuals.manuals || manuals.manuals.length === 0) {
      list.innerHTML = '<div class="empty">暂无功法</div>';
    } else {
      list.innerHTML = manuals.manuals.map(m => `
        <div class="admin-manual-item" data-id="${m.id}">
          <span class="item-emoji">${m.emoji || '📿'}</span>
          <div class="item-info">
            <div class="item-name">${m.name} (${m.key})</div>
            <div class="item-desc">${m.description || '无描述'}</div>
            <div class="item-meta">效果: ${m.effect_type} ${m.effect_value} | 最高等级: ${m.max_level} | 消耗: ${m.cost_merit}功德</div>
          </div>
          <div class="item-actions">
            <button onclick="editManual(${m.id})">编辑</button>
            <button class="delete-btn" onclick="deleteManual(${m.id})">删除</button>
          </div>
        </div>
      `).join('');
    }
  } catch (e) {}
}

async function loadAdminTasks() {
  try {
    const tasks = await api('/admin/extra-tasks');
    const list = document.getElementById('admin-extra-tasks-list');
    if (!list) return;
    if (!tasks.tasks || tasks.tasks.length === 0) {
      list.innerHTML = '<div class="empty">暂无修炼项目</div>';
    } else {
      list.innerHTML = tasks.tasks.map(t => `
        <div class="admin-extra-task-item" data-id="${t.id}">
          <span class="item-emoji">${t.emoji || '🧘'}</span>
          <div class="item-info">
            <div class="item-name">${t.name} (${t.task_key})</div>
            <div class="item-desc">${t.description || '无描述'}</div>
            <div class="item-meta">寿命+${t.life_reward}s | 功德+${t.merit_reward} | 碎片+${t.shard_reward} | 排序${t.sort_order}</div>
          </div>
          <div class="item-actions">
            <button onclick="editExtraTask(${t.id})">编辑</button>
            <button class="delete-btn" onclick="deleteExtraTask(${t.id})">删除</button>
          </div>
        </div>
      `).join('');
    }
  } catch (e) {}
}

async function loadAdminExplore() {
  try {
    const loots = await api('/admin/explore-loot');
    const list = document.getElementById('admin-explore-list');
    if (!list) return;
    if (!loots.loots || loots.loots.length === 0) {
      list.innerHTML = '<div class="empty">暂无历练项目</div>';
    } else {
      list.innerHTML = loots.loots.map(l => `
        <div class="admin-explore-item" data-id="${l.id}">
          <div class="item-info">
            <div class="item-name">${l.name}</div>
            <div class="item-desc">${l.msg}</div>
            <div class="item-meta">权重:${l.weight} | 寿命+${l.life}s | 功德+${l.merit} | 碎片+${l.shard}</div>
          </div>
          <div class="item-actions">
            <button onclick="editExplore(${l.id})">编辑</button>
            <button class="delete-btn" onclick="deleteExplore(${l.id})">删除</button>
          </div>
        </div>
      `).join('');
    }
  } catch (e) {}
}

async function loadAdminPotionsConfig() {
  try {
    const potions = await api('/admin/potions-config');
    const list = document.getElementById('admin-potions-config-list');
    if (!list) return;
    if (!potions.potions || potions.potions.length === 0) {
      list.innerHTML = '<div class="empty">暂无丹药项目</div>';
    } else {
      list.innerHTML = potions.potions.map(p => `
        <div class="admin-potion-config-item" data-id="${p.id}">
          <span class="item-emoji">${p.emoji || '💊'}</span>
          <div class="item-info">
            <div class="item-name">${p.name} (${p.id})</div>
            <div class="item-desc">${p.desc || '无描述'}</div>
            <div class="item-meta">消耗:${p.cost}功德 | 立即+${p.instant_life}s寿命 | 持续${p.dur}s | 衰减-${p.dur_decay_reduction}</div>
          </div>
          <div class="item-actions">
            <button onclick="editPotionConfig('${p.id}')">编辑</button>
            <button class="delete-btn" onclick="deletePotionConfig('${p.id}')">删除</button>
          </div>
        </div>
      `).join('');
    }
  } catch (e) {}
}

async function renderAdmin() {
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

// 渲染管理员子模块
async function renderAdminModule(moduleName) {
  // 基础权限检查已在 renderAdmin 处理，这里主要负责各子页面的数据加载
  const userId = stateCache?.userId;
  if (!userId) return;

  // 确保内容容器显示
  const content = document.getElementById('admin-content');
  if (content) content.classList.remove('hidden');

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

function showAdminGate(msg) {
  const gate = document.getElementById('admin-gate');
  const gateMsg = document.getElementById('admin-gate-msg');
  const gateBtn = document.getElementById('admin-gate-btn');
  
  // 隐藏所有管理内容
  const navContent = document.getElementById('admin-nav-content');
  const content = document.getElementById('admin-content');
  if (navContent) navContent.classList.add('hidden');
  if (content) content.classList.add('hidden');

  if (gate) gate.classList.remove('hidden');
  if (gateMsg) gateMsg.textContent = msg;
  if (gateBtn) gateBtn.classList.remove('hidden');
}

async function createWorldEvent() {
  const key = document.getElementById('we-key').value.trim();
  const name = document.getElementById('we-name').value.trim();
  const emoji = document.getElementById('we-emoji').value.trim() || '📢';
  const desc = document.getElementById('we-desc').value.trim();
  const effectType = document.getElementById('we-effect-type').value;
  const effectValue = parseFloat(document.getElementById('we-effect-value').value) || 0.5;
  const duration = parseInt(document.getElementById('we-duration').value) || 86400;

  if (!key || !name) {
    toast('事件KEY和名称不能为空', 'bad');
    return;
  }

  try {
    await api('/admin/world-events', {
      method: 'POST',
      body: JSON.stringify({ key, name, description: desc, emoji, effect_type: effectType, effect_value: effectValue, duration })
    });
    toast('全服事件已创建', 'gold');
    // 清空表单
    document.getElementById('we-key').value = '';
    document.getElementById('we-name').value = '';
    document.getElementById('we-desc').value = '';
    await renderAdmin();
  } catch (err) { toast(err.message, 'bad'); }
}

async function endWorldEvent(id) {
  if (!confirm('确定结束此全服事件？')) return;
  try {
    await api(`/admin/world-events/${id}/end`, { method: 'POST' });
    toast('事件已结束', 'gold');
    await renderAdmin();
  } catch (err) { toast(err.message, 'bad'); }
}

async function saveAdminPotions() {
  try {
    const rows = document.querySelectorAll('.admin-potion-row');
    const overrides = {};
    rows.forEach(row => {
      const id = row.dataset.pid;
      const cost = row.querySelector('[data-field="cost"]');
      const life = row.querySelector('[data-field="life"]');
      const dur = row.querySelector('[data-field="dur"]');
      const o = {};
      if (cost) o.cost = parseInt(cost.value) || 0;
      if (life && parseInt(life.value) > 0) o.instant = { life: parseInt(life.value) };
      if (dur && parseInt(dur.value) > 0) o.dur = parseInt(dur.value);
      if (Object.keys(o).length > 0) overrides[id] = o;
    });
    await api('/admin/potions', { method: 'POST', body: JSON.stringify({ overrides }) });
    toast('丹药配置已保存', 'gold');
    await renderAdmin();
  } catch (err) { toast(err.message, 'bad'); }
}

async function resetAdminPotions() {
  if (!confirm('确定恢复默认丹药配置？')) return;
  try {
    await api('/admin/potions', { method: 'POST', body: JSON.stringify({ overrides: {} }) });
    toast('已恢复默认配置', 'gold');
    await renderAdmin();
  } catch (err) { toast(err.message, 'bad'); }
}

// ============ 功法管理功能 ============
async function createManual() {
  const key = document.getElementById('manual-key').value.trim();
  const name = document.getElementById('manual-name').value.trim();
  const emoji = document.getElementById('manual-emoji').value.trim();
  const description = document.getElementById('manual-desc').value.trim();
  const effect_type = document.getElementById('manual-effect-type').value;
  const effect_value = parseFloat(document.getElementById('manual-effect-value').value) || 0;
  const max_level = parseInt(document.getElementById('manual-max-level').value) || 10;
  const cost_merit = parseInt(document.getElementById('manual-cost').value) || 100;

  if (!key || !name) {
    toast('功法KEY和名称不能为空', 'bad');
    return;
  }

  try {
    await api('/admin/manuals', {
      method: 'POST',
      body: JSON.stringify({ key, name, emoji, description, effect_type, effect_value, max_level, cost_merit })
    });
    toast('功法已添加', 'gold');
    // 清空表单
    document.getElementById('manual-key').value = '';
    document.getElementById('manual-name').value = '';
    document.getElementById('manual-desc').value = '';
    await renderAdmin();
  } catch (err) { toast(err.message, 'bad'); }
}

async function deleteManual(id) {
  if (!confirm('确定删除此功法？')) return;
  try {
    await api(`/admin/manuals/${id}`, { method: 'DELETE' });
    toast('功法已删除', 'gold');
    await renderAdmin();
  } catch (err) { toast(err.message, 'bad'); }
}

// 功法编辑功能
let editingManualId = null;

async function editManual(id) {
  editingManualId = id;
  const item = document.querySelector(`.admin-manual-item[data-id="${id}"]`);
  if (!item) return;

  const nameEl = item.querySelector('.item-name');
  const descEl = item.querySelector('.item-desc');
  const metaEl = item.querySelector('.item-meta');
  const actionsEl = item.querySelector('.item-actions');

  // 获取当前数据
  const currentName = nameEl.textContent.split(' (')[0];
  const currentKey = nameEl.textContent.match(/\((.*)\)/)?.[1] || '';
  const currentDesc = descEl.textContent === '无描述' ? '' : descEl.textContent;
  const metaMatch = metaEl.textContent.match(/效果: (\w+) ([\d.]+) \| 最高等级: (\d+) \| 消耗: (\d+)功德/);
  const currentEffectType = metaMatch?.[1] || 'decay_reduction';
  const currentEffectValue = metaMatch?.[2] || '0';
  const currentMaxLevel = metaMatch?.[3] || '10';
  const currentCost = metaMatch?.[4] || '100';

  // 替换为编辑表单
  nameEl.innerHTML = `<input type="text" class="edit-name" value="${currentName}" placeholder="功法名称" /> <input type="text" class="edit-key" value="${currentKey}" placeholder="KEY" disabled style="opacity:0.5" />`;
  descEl.innerHTML = `<input type="text" class="edit-desc" value="${currentDesc}" placeholder="描述" style="width:100%" />`;
  metaEl.innerHTML = `
    <select class="edit-effect-type" style="width:100px">
      <option value="decay_reduction" ${currentEffectType === 'decay_reduction' ? 'selected' : ''}>降低衰减</option>
      <option value="merit_boost" ${currentEffectType === 'merit_boost' ? 'selected' : ''}>功德加成</option>
      <option value="life_boost" ${currentEffectType === 'life_boost' ? 'selected' : ''}>寿命加成</option>
      <option value="task_bonus" ${currentEffectType === 'task_bonus' ? 'selected' : ''}>任务加成</option>
    </select>
    <input type="number" class="edit-effect-value" value="${currentEffectValue}" placeholder="效果值" step="0.01" style="width:80px" />
    <input type="number" class="edit-max-level" value="${currentMaxLevel}" placeholder="最高等级" style="width:80px" />
    <input type="number" class="edit-cost" value="${currentCost}" placeholder="消耗" style="width:80px" />
  `;
  actionsEl.innerHTML = `<button onclick="saveManual(${id})">保存</button><button class="delete-btn" onclick="cancelEditManual()">取消</button>`;

  item.classList.add('edit-mode');
}

async function saveManual(id) {
  const item = document.querySelector(`.admin-manual-item[data-id="${id}"]`);
  if (!item) return;

  const name = item.querySelector('.edit-name').value.trim();
  const description = item.querySelector('.edit-desc').value.trim();
  const effect_type = item.querySelector('.edit-effect-type').value;
  const effect_value = parseFloat(item.querySelector('.edit-effect-value').value) || 0;
  const max_level = parseInt(item.querySelector('.edit-max-level').value) || 10;
  const cost_merit = parseInt(item.querySelector('.edit-cost').value) || 100;

  if (!name) {
    toast('功法名称不能为空', 'bad');
    return;
  }

  try {
    await api(`/admin/manuals/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name, description, effect_type, effect_value, max_level, cost_merit })
    });
    toast('功法已更新', 'gold');
    editingManualId = null;
    await renderAdmin();
  } catch (err) { toast(err.message, 'bad'); }
}

function cancelEditManual() {
  editingManualId = null;
  renderAdmin();
}

// ============ 修炼项目管理功能 ============
async function createExtraTask() {
  const task_key = document.getElementById('extra-task-key').value.trim();
  const name = document.getElementById('extra-task-name').value.trim();
  const emoji = document.getElementById('extra-task-emoji').value.trim();
  const description = document.getElementById('extra-task-desc').value.trim();
  const life_reward = parseInt(document.getElementById('extra-task-life').value) || 0;
  const merit_reward = parseInt(document.getElementById('extra-task-merit').value) || 0;
  const shard_reward = parseInt(document.getElementById('extra-task-shard').value) || 0;
  const sort_order = parseInt(document.getElementById('extra-task-sort').value) || 0;

  if (!task_key || !name) {
    toast('任务KEY和名称不能为空', 'bad');
    return;
  }

  try {
    await api('/admin/extra-tasks', {
      method: 'POST',
      body: JSON.stringify({ task_key, name, emoji, description, life_reward, merit_reward, shard_reward, sort_order })
    });
    toast('修炼项目已添加', 'gold');
    // 清空表单
    document.getElementById('extra-task-key').value = '';
    document.getElementById('extra-task-name').value = '';
    document.getElementById('extra-task-desc').value = '';
    await renderAdmin();
  } catch (err) { toast(err.message, 'bad'); }
}

async function deleteExtraTask(id) {
  if (!confirm('确定删除此修炼项目？')) return;
  try {
    await api(`/admin/extra-tasks/${id}`, { method: 'DELETE' });
    toast('修炼项目已删除', 'gold');
    await renderAdmin();
  } catch (err) { toast(err.message, 'bad'); }
}

// 修炼项目编辑功能
async function editExtraTask(id) {
  const item = document.querySelector(`.admin-extra-task-item[data-id="${id}"]`);
  if (!item) return;

  const nameEl = item.querySelector('.item-name');
  const descEl = item.querySelector('.item-desc');
  const metaEl = item.querySelector('.item-meta');
  const actionsEl = item.querySelector('.item-actions');

  // 获取当前数据
  const currentName = nameEl.textContent.split(' (')[0];
  const currentKey = nameEl.textContent.match(/\((.*)\)/)?.[1] || '';
  const currentDesc = descEl.textContent === '无描述' ? '' : descEl.textContent;
  const metaMatch = metaEl.textContent.match(/寿命\+(\d+)s \| 功德\+(\d+) \| 碎片\+(\d+) \| 排序(\d+)/);
  const currentLife = metaMatch?.[1] || '600';
  const currentMerit = metaMatch?.[2] || '1';
  const currentShard = metaMatch?.[3] || '0';
  const currentSort = metaMatch?.[4] || '0';

  // 替换为编辑表单
  nameEl.innerHTML = `<input type="text" class="edit-name" value="${currentName}" placeholder="名称" style="width:120px" /> <input type="text" class="edit-key" value="${currentKey}" placeholder="KEY" disabled style="opacity:0.5;width:80px" />`;
  descEl.innerHTML = `<input type="text" class="edit-desc" value="${currentDesc}" placeholder="描述" style="width:100%" />`;
  metaEl.innerHTML = `
    <input type="number" class="edit-life" value="${currentLife}" placeholder="寿命奖励" style="width:80px" />
    <input type="number" class="edit-merit" value="${currentMerit}" placeholder="功德奖励" style="width:70px" />
    <input type="number" class="edit-shard" value="${currentShard}" placeholder="碎片奖励" style="width:70px" />
    <input type="number" class="edit-sort" value="${currentSort}" placeholder="排序" style="width:60px" />
  `;
  actionsEl.innerHTML = `<button onclick="saveExtraTask(${id})">保存</button><button class="delete-btn" onclick="renderAdmin()">取消</button>`;

  item.classList.add('edit-mode');
}

async function saveExtraTask(id) {
  const item = document.querySelector(`.admin-extra-task-item[data-id="${id}"]`);
  if (!item) return;

  const name = item.querySelector('.edit-name').value.trim();
  const description = item.querySelector('.edit-desc').value.trim();
  const life_reward = parseInt(item.querySelector('.edit-life').value) || 0;
  const merit_reward = parseInt(item.querySelector('.edit-merit').value) || 0;
  const shard_reward = parseInt(item.querySelector('.edit-shard').value) || 0;
  const sort_order = parseInt(item.querySelector('.edit-sort').value) || 0;

  if (!name) {
    toast('任务名称不能为空', 'bad');
    return;
  }

  try {
    await api(`/admin/extra-tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name, description, life_reward, merit_reward, shard_reward, sort_order })
    });
    toast('修炼项目已更新', 'gold');
    await renderAdmin();
  } catch (err) { toast(err.message, 'bad'); }
}

// ============ 历练项目管理功能 ============
async function createExplore() {
  const name = document.getElementById('explore-name').value.trim();
  const msg = document.getElementById('explore-msg').value.trim();
  const weight = parseFloat(document.getElementById('explore-weight').value) || 10;
  const life = parseInt(document.getElementById('explore-life').value) || 0;
  const merit = parseInt(document.getElementById('explore-merit').value) || 0;
  const shard = parseInt(document.getElementById('explore-shard').value) || 0;
  const sort_order = parseInt(document.getElementById('explore-sort').value) || 0;

  if (!name || !msg) {
    toast('名称和描述不能为空', 'bad');
    return;
  }

  try {
    await api('/admin/explore-loot', {
      method: 'POST',
      body: JSON.stringify({ name, msg, weight, life, merit, shard, sort_order })
    });
    toast('历练项目已添加', 'gold');
    // 清空表单
    document.getElementById('explore-name').value = '';
    document.getElementById('explore-msg').value = '';
    await renderAdmin();
  } catch (err) { toast(err.message, 'bad'); }
}

async function deleteExplore(id) {
  if (!confirm('确定删除此历练项目？')) return;
  try {
    await api(`/admin/explore-loot/${id}`, { method: 'DELETE' });
    toast('历练项目已删除', 'gold');
    await renderAdmin();
  } catch (err) { toast(err.message, 'bad'); }
}

// 历练项目编辑功能
async function editExplore(id) {
  const item = document.querySelector(`.admin-explore-item[data-id="${id}"]`);
  if (!item) return;

  const nameEl = item.querySelector('.item-name');
  const descEl = item.querySelector('.item-desc');
  const metaEl = item.querySelector('.item-meta');
  const actionsEl = item.querySelector('.item-actions');

  // 获取当前数据
  const currentName = nameEl.textContent;
  const currentMsg = descEl.textContent;
  const metaMatch = metaEl.textContent.match(/权重:([\d.]+) \| 寿命\+(\d+)s \| 功德\+(\d+) \| 碎片\+(\d+)/);
  const currentWeight = metaMatch?.[1] || '10';
  const currentLife = metaMatch?.[2] || '0';
  const currentMerit = metaMatch?.[3] || '0';
  const currentShard = metaMatch?.[4] || '0';

  // 替换为编辑表单
  nameEl.innerHTML = `<input type="text" class="edit-name" value="${currentName}" placeholder="名称" style="width:120px" />`;
  descEl.innerHTML = `<input type="text" class="edit-msg" value="${currentMsg}" placeholder="描述" style="width:100%" />`;
  metaEl.innerHTML = `
    <input type="number" class="edit-weight" value="${currentWeight}" placeholder="权重" step="0.5" style="width:80px" />
    <input type="number" class="edit-life" value="${currentLife}" placeholder="寿命奖励" style="width:80px" />
    <input type="number" class="edit-merit" value="${currentMerit}" placeholder="功德奖励" style="width:70px" />
    <input type="number" class="edit-shard" value="${currentShard}" placeholder="碎片奖励" style="width:70px" />
  `;
  actionsEl.innerHTML = `<button onclick="saveExplore(${id})">保存</button><button class="delete-btn" onclick="renderAdmin()">取消</button>`;

  item.classList.add('edit-mode');
}

async function saveExplore(id) {
  const item = document.querySelector(`.admin-explore-item[data-id="${id}"]`);
  if (!item) return;

  const name = item.querySelector('.edit-name').value.trim();
  const msg = item.querySelector('.edit-msg').value.trim();
  const weight = parseFloat(item.querySelector('.edit-weight').value) || 1;
  const life = parseInt(item.querySelector('.edit-life').value) || 0;
  const merit = parseInt(item.querySelector('.edit-merit').value) || 0;
  const shard = parseInt(item.querySelector('.edit-shard').value) || 0;

  if (!name || !msg) {
    toast('名称和描述不能为空', 'bad');
    return;
  }

  try {
    await api(`/admin/explore-loot/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name, msg, weight, life, merit, shard })
    });
    toast('历练项目已更新', 'gold');
    await renderAdmin();
  } catch (err) { toast(err.message, 'bad'); }
}

// ============ 丹药项目管理功能 ============
async function createPotionConfig() {
  const id = document.getElementById('potion-config-id').value.trim();
  const name = document.getElementById('potion-config-name').value.trim();
  const emoji = document.getElementById('potion-config-emoji').value.trim();
  const desc = document.getElementById('potion-config-desc').value.trim();
  const cost = parseInt(document.getElementById('potion-config-cost').value) || 0;
  const instant_life = parseInt(document.getElementById('potion-config-instant-life').value) || 0;
  const dur = parseInt(document.getElementById('potion-config-dur').value) || 0;
  const dur_decay_reduction = parseFloat(document.getElementById('potion-config-decay').value) || 0;

  if (!id || !name) {
    toast('丹药ID和名称不能为空', 'bad');
    return;
  }

  try {
    await api('/admin/potions-config', {
      method: 'POST',
      body: JSON.stringify({ id, name, emoji, desc, cost, instant_life, dur, dur_decay_reduction, type: 'merit' })
    });
    toast('丹药项目已添加', 'gold');
    // 清空表单
    document.getElementById('potion-config-id').value = '';
    document.getElementById('potion-config-name').value = '';
    document.getElementById('potion-config-desc').value = '';
    await renderAdmin();
  } catch (err) { toast(err.message, 'bad'); }
}

async function deletePotionConfig(id) {
  if (!confirm('确定删除此丹药项目？')) return;
  try {
    await api(`/admin/potions-config/${id}`, { method: 'DELETE' });
    toast('丹药项目已删除', 'gold');
    await renderAdmin();
  } catch (err) { toast(err.message, 'bad'); }
}

// 丹药项目编辑功能
async function editPotionConfig(id) {
  const item = document.querySelector(`.admin-potion-config-item[data-id="${id}"]`);
  if (!item) return;

  const nameEl = item.querySelector('.item-name');
  const descEl = item.querySelector('.item-desc');
  const metaEl = item.querySelector('.item-meta');
  const actionsEl = item.querySelector('.item-actions');

  // 获取当前数据
  const nameMatch = nameEl.textContent.match(/(.*) \((.*)\)/);
  const currentName = nameMatch?.[1] || '';
  const currentDesc = descEl.textContent === '无描述' ? '' : descEl.textContent;
  const metaMatch = metaEl.textContent.match(/消耗:(\d+)功德 \| 立即\+(\d+)s寿命 \| 持续(\d+)s \| 衰减-([\d.]+)/);
  const currentCost = metaMatch?.[1] || '30';
  const currentInstantLife = metaMatch?.[2] || '0';
  const currentDur = metaMatch?.[3] || '86400';
  const currentDecay = metaMatch?.[4] || '0';

  // 替换为编辑表单
  nameEl.innerHTML = `<input type="text" class="edit-name" value="${currentName}" placeholder="名称" style="width:150px" /> <span style="opacity:0.5">(${id})</span>`;
  descEl.innerHTML = `<input type="text" class="edit-desc" value="${currentDesc}" placeholder="描述" style="width:100%" />`;
  metaEl.innerHTML = `
    <input type="number" class="edit-cost" value="${currentCost}" placeholder="功德消耗" style="width:80px" />
    <input type="number" class="edit-instant-life" value="${currentInstantLife}" placeholder="立即增加寿命" style="width:100px" />
    <input type="number" class="edit-dur" value="${currentDur}" placeholder="持续时间" style="width:90px" />
    <input type="number" class="edit-decay" value="${currentDecay}" placeholder="衰减降低" step="0.01" style="width:80px" />
  `;
  actionsEl.innerHTML = `<button onclick="savePotionConfig('${id}')">保存</button><button class="delete-btn" onclick="renderAdmin()">取消</button>`;

  item.classList.add('edit-mode');
}

async function savePotionConfig(id) {
  const item = document.querySelector(`.admin-potion-config-item[data-id="${id}"]`);
  if (!item) return;

  const name = item.querySelector('.edit-name').value.trim();
  const desc = item.querySelector('.edit-desc').value.trim();
  const cost = parseInt(item.querySelector('.edit-cost').value) || 0;
  const instant_life = parseInt(item.querySelector('.edit-instant-life').value) || 0;
  const dur = parseInt(item.querySelector('.edit-dur').value) || 0;
  const dur_decay_reduction = parseFloat(item.querySelector('.edit-decay').value) || 0;

  if (!name) {
    toast('丹药名称不能为空', 'bad');
    return;
  }

  try {
    await api(`/admin/potions-config/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name, desc, cost, instant_life, dur, dur_decay_reduction })
    });
    toast('丹药项目已更新', 'gold');
    await renderAdmin();
  } catch (err) { toast(err.message, 'bad'); }
}

// ============ 秘境探险 ============
async function doExplore() {
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

async function renderAdventure() {
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

async function acceptTribulation() {
  try {
    await api('/tribulation/accept', { method: 'POST' });
    toast('⚡ 接下天劫，本周需完成指定修炼', 'gold');
    await renderAdventure();
  } catch (err) { toast(err.message, 'bad'); }
}

async function completeTribulation() {
  try {
    const r = await api('/tribulation/complete', { method: 'POST' });
    toast(`🌩️ 渡劫成功 · 寿命 +${formatLife(r.rewardSec)} · 功德 +${r.merit}`, 'gold');
    await renderAdventure();
    await refreshState(false);
  } catch (err) { toast(err.message, 'bad'); }
}

async function failTribulation() {
  if (!confirm('确定放弃渡劫？将扣除 3 小时寿命。')) return;
  try {
    await api('/tribulation/fail', { method: 'POST' });
    toast('💀 天劫失败 · 寿命 -3 小时', 'bad');
    await renderAdventure();
    await refreshState(false);
  } catch (err) { toast(err.message, 'bad'); }
}

// ============ 总入口 ============
function renderAll() {
  if (!stateCache || !stateCache.profile) return;
  renderPulse();
  renderModifiers();
  renderEventLog();
  renderCultivation();
  renderInventory();
  renderProfile();
  // 排行榜按需加载（切换到 tab 时）
  checkAchievements();
  renderAdventure();
}

function startPulseTimer() {
  if (pulseTimer) clearInterval(pulseTimer);
  pulseTimer = setInterval(() => {
    if (stateCache && stateCache.profile) renderPulse();
  }, 1000);
  // 每 30 秒后台同步一次
  setInterval(() => {
    if (token && stateCache && Date.now() - lastFetchAt > 25000) refreshState(false);
  }, 30000);
}

// ============ 事件绑定 ============
function bindEvents() {
  // 认证
  document.getElementById('auth-form').addEventListener('submit', authSubmit);
  document.querySelectorAll('.auth-tab').forEach(b => b.addEventListener('click', () => setAuthMode(b.dataset.mode)));
  document.getElementById('logout-btn').addEventListener('click', logout);

  // 注册命盘
  document.getElementById('onboard-form').addEventListener('submit', onboardSubmit);

  // 导航
  document.querySelectorAll('.nav-item').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const tab = a.dataset.tab;
      document.querySelectorAll('.nav-item').forEach(x => x.classList.remove('active'));
      a.classList.add('active');
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
      document.getElementById(tab).classList.add('active');
      if (tab === 'leaderboard') renderBoard();
      if (tab === 'profile') renderProfile();
      if (tab === 'inventory') renderInventory();
      if (tab === 'adventure') { renderAdventure(); checkAchievements(); }
      if (tab === 'fortune') renderFortune();
      if (tab === 'cultivation') renderExtraTasks();
      if (tab === 'admin') renderAdmin();
    });
  });

  // 管理员入口点击处理
  document.getElementById('admin-nav').addEventListener('click', e => {
    e.preventDefault();
    document.querySelectorAll('.nav-item').forEach(x => x.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    document.getElementById('admin').classList.add('active');
    renderAdmin();
  });

  // 显示模式
  document.querySelectorAll('.t-btn').forEach(b => {
    b.addEventListener('click', () => {
      document.querySelectorAll('.t-btn').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      displayMode = b.dataset.mode;
      renderPulse();
    });
  });

  // 任务按钮
  document.querySelectorAll('.task-btn').forEach(btn => {
    btn.addEventListener('click', () => doTask(btn.dataset.task));
  });

  // 步数滑杆
  const sr = document.getElementById('steps-range');
  const sn = document.getElementById('steps-num');
  const sl = document.getElementById('steps-life');
  sr.addEventListener('input', () => {
    const s = parseInt(sr.value) || 0;
    sn.textContent = s.toLocaleString();
    let sec = Math.floor(s / 1000) * 12 * 60;
    if (s >= 10000) sec += 2 * 3600;
    sl.textContent = '+' + formatLife(sec);
  });

  // 排行榜切换
  document.querySelectorAll('.board-tab').forEach(t => {
    t.addEventListener('click', () => {
      document.querySelectorAll('.board-tab').forEach(x => x.classList.remove('active'));
      t.classList.add('active');
      currentBoard = t.dataset.board;
      renderBoard();
    });
  });

  document.getElementById('trigger-event').addEventListener('click', triggerRandomEvent);
  document.getElementById('revive-btn').addEventListener('click', doRevive);

  document.getElementById('explore-btn').addEventListener('click', doExplore);
  document.getElementById('trib-accept').addEventListener('click', acceptTribulation);
  document.getElementById('trib-complete').addEventListener('click', completeTribulation);
  document.getElementById('trib-fail').addEventListener('click', failTribulation);
  document.getElementById('check-ach-btn').addEventListener('click', checkAchievements);

  // 管理后台
  document.getElementById('admin-save-potions').addEventListener('click', saveAdminPotions);
  document.getElementById('admin-reset-potions').addEventListener('click', resetAdminPotions);
  document.getElementById('we-create-btn').addEventListener('click', createWorldEvent);

  // 新管理功能按钮
  document.getElementById('admin-create-manual-btn').addEventListener('click', createManual);
  document.getElementById('admin-create-extra-task-btn').addEventListener('click', createExtraTask);
  document.getElementById('admin-create-explore-btn').addEventListener('click', createExplore);
  document.getElementById('admin-create-potion-btn').addEventListener('click', createPotionConfig);

  // 运势页面
  document.getElementById('checkin-btn').addEventListener('click', checkinFortune);
  document.getElementById('add-log-btn').addEventListener('click', addCultivationLog);

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && token) refreshState(false);
  });
}

// ============ 扩展养生修炼任务 ============
let extraTasksConfig = [];
let extraTasksStatus = {};

async function loadExtraTasksConfig() {
  try {
    const r = await api('/extra-tasks/config');
    extraTasksConfig = r.tasks || [];
  } catch (e) {
    console.error('加载扩展任务配置失败:', e);
  }
}

async function loadExtraTasksStatus() {
  if (!token) return;
  try {
    const r = await api('/extra-tasks/status');
    extraTasksStatus = r.status || {};
  } catch (e) {
    console.error('加载扩展任务状态失败:', e);
  }
}

async function renderExtraTasks() {
  const grid = document.getElementById('extra-tasks-grid');
  if (!grid) return;

  grid.innerHTML = extraTasksConfig.map(task => {
    const isCompleted = extraTasksStatus[task.task_key] === 1;
    const rewardLife = formatLife(task.life_reward);
    const rewardMerit = task.merit_reward > 0 ? `· 功德 +${task.merit_reward}` : '';
    const rewardShard = task.shard_reward > 0 ? `· 碎片 +${task.shard_reward}` : '';

    return `
      <div class="extra-task-card ${isCompleted ? 'completed' : ''}" data-task="${task.task_key}">
        <div class="extra-task-icon">${task.emoji}</div>
        <div class="extra-task-body">
          <h4>${task.name}</h4>
          <p>${task.description}</p>
          <div class="extra-task-reward">奖励：<span class="reward-life">+${rewardLife}</span> ${rewardMerit} ${rewardShard}</div>
        </div>
        <button class="extra-task-btn" data-task="${task.task_key}" ${isCompleted ? 'disabled' : ''}>
          ${isCompleted ? '已完成' : '打卡'}
        </button>
      </div>
    `;
  }).join('');

  // 添加点击事件
  grid.querySelectorAll('.extra-task-btn').forEach(btn => {
    if (!btn.disabled) {
      btn.addEventListener('click', async () => {
        const taskKey = btn.dataset.task;
        try {
          await api(`/extra-tasks/${taskKey}`, { method: 'POST' });
          await loadExtraTasksStatus();
          await renderExtraTasks();
          await refreshState();
          toast('任务完成！奖励已发放', 'good');
        } catch (e) {
          toast(e.message || '任务失败', 'bad');
        }
      });
    }
  });
}

// ============ 启动 ============
async function loadPotions() {
  try {
    const r = await api('/potions');
    POTIONS_META = r.potions || [];
    if (POTIONS_META.length === 0) {
      // Fallback to default if API returns empty
      POTIONS_META = [
        { id: 'liver', emoji: '💊', name: '护肝片', desc: '抵消熬夜负面系数 24 小时', cost: 30, type: 'merit' },
        { id: 'melatonin', emoji: '🌙', name: '褪黑素', desc: '修正作息判定范围，作息加成翻倍', cost: 25, type: 'merit' },
        { id: 'deep', emoji: '🛌', name: '深睡胶囊', desc: '若当晚睡眠达标，衰减速度减半 8h', cost: 40, type: 'merit' },
        { id: 'ginseng', emoji: '🌿', name: '千年人参', desc: '立即获得 +6 小时寿命', cost: 50, type: 'merit' },
        { id: 'lingzhi', emoji: '🍄', name: '九叶灵芝', desc: '立即获得 +12 小时寿命', cost: 90, type: 'merit' },
        { id: 'pill', emoji: '🟡', name: '九转金丹', desc: '立即获得 +1 年寿命', cost: 1, type: 'coin' },
      ];
    }
  } catch (e) {
    console.error('Failed to load potions:', e);
  }
}

async function init() {
  bindEvents();
  startPulseTimer();
  await loadPotions();
  await loadExtraTasksConfig();
  if (!token) {
    showAuth();
  } else {
    await loadExtraTasksStatus();
    await refreshState();
  }

  // 初始化前端路由（在所有基础功能初始化之后）
  if (window.Router) {
    // 添加路由守卫：需要登录的页面
    Router.beforeRoute((path, route) => {
      const publicRoutes = ['/', '/dashboard'];
      if (!publicRoutes.includes(path) && !token) {
        showAuth();
        return false;
      }
      return true;
    });
    Router.init();
  }
}

document.addEventListener('DOMContentLoaded', init);
