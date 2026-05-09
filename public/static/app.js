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
    if (r.reborn) {
      // 弥留期满已转世
      stateCache = null;
      toast('弥留期已过 · 已转世清档', 'bad');
      showOnboarding();
      return;
    }
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
  const ms = Math.floor((totalSec - Math.floor(totalSec)) * 1000);

  const pulseEl = document.getElementById('pulse-time');
  if (displayMode === 'full') {
    pulseEl.style.display = 'flex';
    pulseEl.querySelector('[data-k="years"]').textContent = pad(years, 3);
    pulseEl.querySelector('[data-k="days"]').textContent = pad(days, 3);
    pulseEl.querySelector('[data-k="hours"]').textContent = pad(hours, 2);
    pulseEl.querySelector('[data-k="minutes"]').textContent = pad(minutes, 2);
    pulseEl.querySelector('[data-k="seconds"]').textContent = pad(seconds, 2);
    pulseEl.querySelector('[data-k="ms"]').textContent = pad(ms, 3);
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

const POTIONS_META = [
  { id: 'liver',     emoji: '💊', name: '护肝片',   desc: '抵消熬夜负面系数 24 小时',         cost: 30, type: 'merit' },
  { id: 'melatonin', emoji: '🌙', name: '褪黑素',   desc: '修正作息判定范围，作息加成翻倍',  cost: 25, type: 'merit' },
  { id: 'deep',      emoji: '🛌', name: '深睡胶囊', desc: '若当晚睡眠达标，衰减速度减半 8h', cost: 40, type: 'merit' },
  { id: 'ginseng',   emoji: '🌿', name: '千年人参', desc: '立即获得 +6 小时寿命',            cost: 50, type: 'merit' },
  { id: 'lingzhi',   emoji: '🍄', name: '九叶灵芝', desc: '立即获得 +12 小时寿命',           cost: 90, type: 'merit' },
  { id: 'pill',      emoji: '🟡', name: '九转金丹', desc: '立即获得 +1 年寿命',              cost: 1,  type: 'coin'  },
];

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
        <div class="potion-desc">${po.desc}</div>
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

async function doReborn() {
  if (!confirm('确定转世重修？所有修炼数据将清零（账号保留）。')) return;
  try {
    await api('/reborn', { method: 'POST' });
    stateCache = null;
    hideDying();
    showOnboarding();
    toast('已转世，请重开命盘', 'gold');
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
}

function startPulseTimer() {
  if (pulseTimer) clearInterval(pulseTimer);
  pulseTimer = setInterval(() => {
    if (stateCache && stateCache.profile) renderPulse();
  }, 50);
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
    });
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
  document.getElementById('reborn-btn').addEventListener('click', doReborn);
  document.getElementById('reset-btn').addEventListener('click', doReborn);

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && token) refreshState(false);
  });
}

// ============ 启动 ============
async function init() {
  bindEvents();
  startPulseTimer();
  if (!token) {
    showAuth();
  } else {
    await refreshState();
  }
}

document.addEventListener('DOMContentLoaded', init);
