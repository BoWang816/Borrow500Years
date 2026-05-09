/* ==========================================================
   《向天再借500年》 · 核心交互
   ========================================================== */
'use strict';

// ============ 常量 ============
const STORAGE_KEY = 'borrow500years_v1';
const MS_PER_SEC = 1000;
const SEC_PER_MIN = 60;
const SEC_PER_HOUR = 3600;
const SEC_PER_DAY = 86400;
const SEC_PER_YEAR = 365.25 * SEC_PER_DAY;
const MAX_LIFE_YEARS = 500;

const TITLES = [
  { min: 0,    name: '凡胎肉身' },
  { min: 80,   name: '寿比南山' },
  { min: 120,  name: '地仙之姿' },
  { min: 200,  name: '与天同寿' },
];

const POTIONS = [
  { id: 'liver',     emoji: '💊', name: '护肝片',   desc: '抵消熬夜负面系数 24 小时',         cost: 30, type: 'merit', mod: { id: 'liver',  label: '护肝片 · 抵消熬夜', value: -0.5 }, dur: 24*3600 },
  { id: 'melatonin', emoji: '🌙', name: '褪黑素',   desc: '修正作息判定范围，作息加成翻倍',  cost: 25, type: 'merit', mod: { id: 'mela',   label: '褪黑素 · 作息加倍', value: -0.2 }, dur: 12*3600 },
  { id: 'deep',      emoji: '🛌', name: '深睡胶囊', desc: '若当晚睡眠达标，衰减速度减半 8h', cost: 40, type: 'merit', mod: { id: 'deep',   label: '深睡 · 衰减减半',   value: -0.5 }, dur: 8*3600 },
  { id: 'ginseng',   emoji: '🌿', name: '千年人参', desc: '立即获得 +6 小时寿命',            cost: 50, type: 'merit', instant: { life: 6*3600 } },
  { id: 'lingzhi',   emoji: '🍄', name: '九叶灵芝', desc: '立即获得 +12 小时寿命',           cost: 90, type: 'merit', instant: { life: 12*3600 } },
  { id: 'pill',      emoji: '🟡', name: '九转金丹', desc: '立即获得 +1 年寿命（限购）',      cost: 1,  type: 'coin',  instant: { life: 365*SEC_PER_DAY } },
];

const RANDOM_EVENTS = [
  { good: false, msg: '熬夜看球 — 寿命 -2 小时',         delta: -2*3600 },
  { good: false, msg: '路怒发作 — 寿命 -30 分钟',        delta: -30*60 },
  { good: false, msg: '吃了顿宵夜 — 寿命 -45 分钟',      delta: -45*60 },
  { good: false, msg: '加班到深夜 — 寿命 -1 小时',       delta: -3600 },
  { good: true,  msg: '路边捡到垃圾 · 功德圆满 +10 分钟', delta: 10*60 },
  { good: true,  msg: '帮老奶奶过马路 +30 分钟',         delta: 30*60 },
  { good: true,  msg: '清晨遇到打太极的老者，受其点拨 +1 小时', delta: 3600 },
  { good: true,  msg: '梦中得仙人传法 +2 小时',           delta: 2*3600 },
  { good: true,  msg: '偶得野生灵芝一支 +3 小时',         delta: 3*3600 },
  { good: false, msg: '风寒入体 -20 分钟',               delta: -20*60 },
];

const FAKE_USERS = [
  { name: '青松道人',     age: 380 },
  { name: '紫霞仙子',     age: 220 },
  { name: '太乙真人',     age: 198 },
  { name: '王重阳',       age: 165 },
  { name: '彭祖再世',     age: 140 },
  { name: '黄药师',       age: 128 },
  { name: '南极仙翁',     age: 115 },
  { name: '李铁拐',       age: 102 },
  { name: '何仙姑',       age: 95  },
  { name: '张三丰',       age: 88  },
  { name: '采药老者',     age: 75  },
  { name: '隐世散人',     age: 62  },
];

// ============ 状态 ============
let state = null;
let pulseTimer = null;
let displayMode = 'full'; // full | seconds | days

function defaultState() {
  return {
    onboarded: false,
    profile: { name: '', gender: 'male', age: 25, height: 170, weight: 65,
               smoke: false, alcohol: false, stayup: false, hereditary: false, exercise: false, meditate: false },
    initialLifeSec: 0,        // 初始寿命（秒）
    startTimestamp: 0,        // 起始时间戳（ms）
    bonusSec: 0,              // 累积修炼增量（秒）
    decayMods: [],            // 衰减修正项 [{id,label,value,expireAt?}]
    coin: 0,                  // 复活币
    shard: 0,                 // 复活币碎片 (5个=1币)
    merit: 0,                 // 功德值
    today: '',                // 今日日期
    todayTasks: { ziwu:false, steps:false, water:0, meditate:false, earlyrise:false, diet:false },
    streak: 0,                // 早起连续天数
    activePotions: [],        // [{id,name,expireAt,modId?}]
    events: [],               // 日志 [{time,msg,kind}]
    dying: false,
    lastSavedAt: 0,
    totalGainedSec: 0,        // 累计通过养生延长的总寿命（用于功德榜）
  };
}

// ============ 工具 ============
function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function nowMs() { return Date.now(); }
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function pad(n, w=2) { return String(Math.floor(n)).padStart(w,'0'); }
function timeStr() {
  const d = new Date();
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function save() {
  state.lastSavedAt = nowMs();
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch(e){}
}
function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return Object.assign(defaultState(), parsed);
    }
  } catch(e){}
  return defaultState();
}

// ============ 寿命核心 ============
function expectedLifespanYears(p) {
  // 基础：男 76 / 女 81
  let base = p.gender === 'female' ? 81 : 76;
  const bmi = p.weight / Math.pow(p.height / 100, 2);
  // BMI修正
  if (bmi < 18.5) base -= 1;
  else if (bmi < 24) base += 1.5;
  else if (bmi < 28) base -= 1;
  else if (bmi < 32) base -= 3;
  else base -= 5;
  // 恶习
  if (p.smoke) base -= 6;
  if (p.alcohol) base -= 4;
  if (p.stayup) base -= 5;
  if (p.hereditary) base -= 3;
  if (p.exercise) base += 4;
  if (p.meditate) base += 2;
  return clamp(base, 5, 120);
}

function computeBaseDecayMultiplier() {
  // 基础修正：根据用户根骨
  let mult = 1.0;
  const p = state.profile;
  if (p.stayup) mult += 0.5;       // 长期熬夜
  if (p.smoke) mult += 0.4;
  if (p.alcohol) mult += 0.2;
  if (p.exercise) mult -= 0.15;
  if (p.meditate) mult -= 0.1;
  return mult;
}

function getActiveMods() {
  // 清理过期道具
  const now = nowMs();
  state.decayMods = state.decayMods.filter(m => !m.expireAt || m.expireAt > now);
  state.activePotions = state.activePotions.filter(p => p.expireAt > now);
  return state.decayMods;
}

function currentDecayRate() {
  let mult = computeBaseDecayMultiplier();
  for (const m of getActiveMods()) mult += m.value;
  return clamp(mult, 0.2, 5.0);
}

function currentLifeSec() {
  if (!state.onboarded) return 0;
  const elapsed = (nowMs() - state.startTimestamp) / 1000;
  // 简化：以当前衰减率乘以已经过秒数（活跃道具逻辑通过近似处理）
  // 为公平起见，我们对已逝的时间用「平均」基础衰减；活跃道具仅影响未来
  const base = computeBaseDecayMultiplier();
  const remaining = state.initialLifeSec + state.bonusSec - elapsed * base;
  return remaining;
}

function realLifeSec() {
  return Math.max(0, currentLifeSec());
}

function getRealm() {
  // 当前年龄 = 起始年龄 + 已过去时间(年)
  const yearsLived = state.profile.age + (nowMs() - state.startTimestamp) / 1000 / SEC_PER_YEAR;
  // 也叠加 bonus 转化成"虚岁"
  const totalAge = yearsLived + state.bonusSec / SEC_PER_YEAR;
  let title = TITLES[0].name;
  for (const t of TITLES) if (totalAge >= t.min) title = t.name;
  return { title, totalAge };
}

// ============ Onboarding ============
function showOnboarding() {
  document.getElementById('onboarding').classList.remove('hidden');
}
function hideOnboarding() {
  document.getElementById('onboarding').classList.add('hidden');
}

function onboardSubmit(e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  const profile = {
    name: (fd.get('name') || '无名道友').toString().slice(0, 12),
    gender: fd.get('gender'),
    age: clamp(parseInt(fd.get('age')) || 25, 1, 120),
    height: clamp(parseInt(fd.get('height')) || 170, 50, 250),
    weight: clamp(parseInt(fd.get('weight')) || 65, 20, 300),
    smoke: fd.get('smoke') === 'on',
    alcohol: fd.get('alcohol') === 'on',
    stayup: fd.get('stayup') === 'on',
    hereditary: fd.get('hereditary') === 'on',
    exercise: fd.get('exercise') === 'on',
    meditate: fd.get('meditate') === 'on',
  };
  const expected = expectedLifespanYears(profile);
  const remainYears = Math.max(1, expected - profile.age);

  state = defaultState();
  state.profile = profile;
  state.initialLifeSec = remainYears * SEC_PER_YEAR;
  state.startTimestamp = nowMs();
  state.onboarded = true;
  state.today = todayStr();
  state.coin = 1; // 赠送 1 枚启动复活币
  pushEvent(`命盘开启 · ${profile.name} · 预测剩余寿命 ${remainYears.toFixed(1)} 年`, 'good');
  save();
  hideOnboarding();
  renderAll();
}

// ============ 渲染 · 倒计时 ============
function renderPulse() {
  if (!state.onboarded) return;

  // 每日刷新
  const today = todayStr();
  if (state.today !== today) {
    state.today = today;
    state.todayTasks = { ziwu:false, steps:false, water:0, meditate:false, earlyrise:false, diet:false };
    pushEvent('新的一天，气运重置', 'good');
  }

  let life = currentLifeSec();
  // 进入弥留
  if (life <= 0 && !state.dying) {
    state.dying = true;
    state.dyingStartAt = nowMs();
    save();
    showDying();
  }
  if (state.dying) {
    const passed = (nowMs() - (state.dyingStartAt || nowMs())) / 1000;
    const dyingLeft = 24 * 3600 - passed;
    if (dyingLeft <= 0) {
      // 转世清档
      pushEvent('弥留期已过 · 转世重修', 'bad');
      doReborn();
      return;
    }
    life = -dyingLeft; // 仅用于显示，不再扣
  }

  // 危机状态
  document.body.classList.toggle('crisis', life > 0 && life < 30 * SEC_PER_DAY);
  const crisisOverlay = document.getElementById('crisis-overlay');
  if (life > 0 && life < 30 * SEC_PER_DAY) crisisOverlay.classList.remove('hidden');
  else crisisOverlay.classList.add('hidden');

  // 渲染数值
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
    state.dying ? `弥留期剩余：${pad(Math.floor(-life/3600))}:${pad(Math.floor((-life%3600)/60))}:${pad(Math.floor(-life%60))}` :
    `精确秒：${totalSec.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;

  // Decay rate
  const rate = currentDecayRate();
  const rateEl = document.getElementById('decay-rate');
  rateEl.textContent = `${rate.toFixed(2)}x`;
  rateEl.style.color = rate > 1.2 ? 'var(--blood)' : rate < 0.8 ? 'var(--jade)' : 'var(--gold-soft)';

  const realm = getRealm();
  document.getElementById('realm').textContent = realm.title;
  document.getElementById('title-badge').textContent = realm.title;

  document.getElementById('revive-coin').innerHTML = `<i class="fas fa-coins"></i> ${state.coin}`;
}

function renderModifiers() {
  const ul = document.getElementById('modifier-list');
  const base = computeBaseDecayMultiplier();
  const items = [];
  // 基础修正
  const p = state.profile;
  if (p.stayup) items.push({ name: '长期熬夜', value: '+0.50x', kind: 'bad' });
  if (p.smoke) items.push({ name: '烟瘾深重', value: '+0.40x', kind: 'bad' });
  if (p.alcohol) items.push({ name: '嗜酒贪杯', value: '+0.20x', kind: 'bad' });
  if (p.exercise) items.push({ name: '常年习武', value: '-0.15x', kind: 'good' });
  if (p.meditate) items.push({ name: '静坐打坐', value: '-0.10x', kind: 'good' });
  // 道具
  for (const m of getActiveMods()) {
    const sign = m.value >= 0 ? '+' : '';
    items.push({ name: m.label, value: `${sign}${m.value.toFixed(2)}x`, kind: m.value >= 0 ? 'bad' : 'good' });
  }
  // 今日打卡修正
  if (state.todayTasks.ziwu) items.push({ name: '子午流注 · 早睡', value: '-0.20x', kind: 'good' });

  if (items.length === 0) {
    ul.innerHTML = `<li class="empty">暂无修正项 · 当前 ${base.toFixed(2)}x</li>`;
    return;
  }
  ul.innerHTML = items.map(it => `
    <li><span class="mod-name">${it.name}</span><span class="mod-val ${it.kind}">${it.value}</span></li>
  `).join('') + `<li><span class="mod-name">合计衰减</span><span class="mod-val">${currentDecayRate().toFixed(2)}x</span></li>`;
}

function renderEventLog() {
  const ul = document.getElementById('event-log');
  const recent = state.events.slice(-30).reverse();
  if (recent.length === 0) { ul.innerHTML = `<li style="justify-content:center;color:var(--ink-dim);">命盘静谧，未见波澜</li>`; return; }
  ul.innerHTML = recent.map(e => `
    <li><time>${e.time}</time><span class="${e.kind === 'good' ? 'ev-good' : e.kind === 'bad' ? 'ev-bad' : ''}">${e.msg}</span></li>
  `).join('');
}

function pushEvent(msg, kind = 'normal') {
  state.events.push({ time: timeStr(), msg, kind });
  if (state.events.length > 100) state.events.shift();
}

// ============ 渲染 · 修炼 ============
function renderCultivation() {
  // ziwu/meditate/diet/earlyrise: 完成态
  ['ziwu', 'meditate', 'diet', 'earlyrise', 'steps'].forEach(k => {
    const card = document.querySelector(`.task-card[data-task="${k}"]`);
    if (!card) return;
    const done = k === 'steps' ? state.todayTasks.steps : state.todayTasks[k];
    card.classList.toggle('done', !!done);
    const btn = card.querySelector('.task-btn');
    if (btn) btn.disabled = !!done;
  });
  // water cups
  const wc = document.getElementById('water-cups');
  wc.innerHTML = '';
  for (let i = 0; i < 8; i++) {
    const c = document.createElement('div');
    c.className = 'water-cup' + (i < state.todayTasks.water ? ' filled' : '');
    wc.appendChild(c);
  }
  const waterCard = document.querySelector('.task-card[data-task="water"]');
  if (state.todayTasks.water >= 8) waterCard.classList.add('done');
  else waterCard.classList.remove('done');
  const waterBtn = waterCard.querySelector('.task-btn');
  waterBtn.disabled = state.todayTasks.water >= 8;

  // streak bar
  const sb = document.getElementById('streak-bar');
  sb.innerHTML = '';
  for (let i = 0; i < 7; i++) {
    const s = document.createElement('span');
    if (i < state.streak) s.classList.add('on');
    sb.appendChild(s);
  }
  document.getElementById('streak-num').textContent = state.streak;
}

// ============ 渲染 · 丹房 ============
function renderInventory() {
  document.getElementById('inv-coin').textContent = state.coin;
  document.getElementById('inv-merit').textContent = state.merit;
  document.getElementById('inv-shard').textContent = `${state.shard} / 5`;

  const grid = document.getElementById('potion-grid');
  grid.innerHTML = POTIONS.map(p => {
    const can = p.type === 'merit' ? state.merit >= p.cost : state.coin >= p.cost;
    return `
      <div class="potion">
        <div class="potion-emoji">${p.emoji}</div>
        <h4>${p.name}</h4>
        <div class="potion-desc">${p.desc}</div>
        <div class="potion-cost">${p.type === 'merit' ? '功德 ' + p.cost : '复活币 ' + p.cost}</div>
        <button class="potion-buy" data-pid="${p.id}" ${can ? '' : 'disabled'}>
          ${can ? '炼制 · 服用' : '资源不足'}
        </button>
      </div>
    `;
  }).join('');
  grid.querySelectorAll('.potion-buy').forEach(b => {
    b.addEventListener('click', () => buyPotion(b.dataset.pid));
  });

  const ap = document.getElementById('active-potions');
  const actives = state.activePotions.filter(p => p.expireAt > nowMs());
  if (actives.length === 0) { ap.innerHTML = `<p class="empty">尚无丹药生效</p>`; return; }
  ap.innerHTML = actives.map(p => {
    const remain = Math.max(0, Math.floor((p.expireAt - nowMs()) / 1000));
    const h = Math.floor(remain / 3600), m = Math.floor((remain % 3600) / 60);
    return `<div class="active-potion">
      <div class="ap-name">${p.emoji || '✨'} ${p.name}</div>
      <div class="ap-time">剩余 ${h}h ${m}m</div>
    </div>`;
  }).join('');
}

function buyPotion(pid) {
  const p = POTIONS.find(x => x.id === pid);
  if (!p) return;
  if (p.type === 'merit' && state.merit < p.cost) return toast('功德不足', 'bad');
  if (p.type === 'coin' && state.coin < p.cost) return toast('复活币不足', 'bad');

  if (p.type === 'merit') state.merit -= p.cost;
  else state.coin -= p.cost;

  if (p.instant) {
    state.bonusSec += p.instant.life;
    state.totalGainedSec += p.instant.life;
    pushEvent(`服下「${p.name}」，寿命 +${formatLife(p.instant.life)}`, 'good');
    toast(`服下 ${p.name}，寿命 +${formatLife(p.instant.life)}`, 'gold');
  }
  if (p.mod) {
    const expireAt = nowMs() + p.dur * 1000;
    state.decayMods.push({ id: p.mod.id + '-' + nowMs(), label: p.mod.label, value: p.mod.value, expireAt });
    state.activePotions.push({ id: p.id, name: p.name, emoji: p.emoji, expireAt });
    pushEvent(`服下「${p.name}」，丹药生效中`, 'good');
    toast(`服下 ${p.name}，效果生效`, 'gold');
  }
  save();
  renderAll();
}

function formatLife(sec) {
  if (sec >= SEC_PER_YEAR) return (sec / SEC_PER_YEAR).toFixed(1) + ' 年';
  if (sec >= SEC_PER_DAY) return (sec / SEC_PER_DAY).toFixed(1) + ' 天';
  if (sec >= SEC_PER_HOUR) return (sec / SEC_PER_HOUR).toFixed(1) + ' 小时';
  if (sec >= 60) return Math.round(sec / 60) + ' 分钟';
  return Math.round(sec) + ' 秒';
}

// ============ 渲染 · 排行榜 ============
let currentBoard = 'longevity';
function renderBoard() {
  const list = document.getElementById('board-list');
  const myLife = realLifeSec();
  const myAge = state.profile.age + (nowMs() - state.startTimestamp) / 1000 / SEC_PER_YEAR + state.bonusSec / SEC_PER_YEAR;
  const myName = state.profile.name || '无名';

  let rows = FAKE_USERS.map(u => {
    // 模拟一个 life：年龄越大剩余越少；用伪随机
    const seed = u.name.charCodeAt(0) + u.age;
    const rand = (seed * 9301 + 49297) % 233280 / 233280;
    const remainYears = Math.max(0.5, (MAX_LIFE_YEARS - u.age) * (0.6 + rand * 0.4));
    const lifeSec = remainYears * SEC_PER_YEAR;
    const meritGained = Math.floor(rand * u.age * SEC_PER_DAY * 5);
    const realm = getRealmByAge(u.age);
    return { name: u.name, age: u.age, lifeSec, meritGained, realm, isMe: false };
  });
  rows.push({ name: myName, age: myAge, lifeSec: myLife, meritGained: state.totalGainedSec, realm: getRealm().title, isMe: true });

  const sortKey = currentBoard === 'longevity' ? 'lifeSec' : 'meritGained';
  rows.sort((a, b) => b[sortKey] - a[sortKey]);

  list.innerHTML = rows.slice(0, 10).map((r, i) => {
    const rank = i + 1;
    const cls = ['', 'top1', 'top2', 'top3'][rank] || '';
    const valTxt = currentBoard === 'longevity'
      ? `剩余 ${(r.lifeSec / SEC_PER_YEAR).toFixed(2)} 年`
      : `延寿 ${formatLife(r.meritGained)}`;
    return `
      <div class="board-row ${cls} ${r.isMe ? 'me' : ''}">
        <div class="rank">${rank <= 3 ? ['🥇','🥈','🥉'][rank-1] : '#' + rank}</div>
        <div>
          <div class="name">${r.name}${r.isMe ? '<span class="you">YOU</span>' : ''}</div>
          <div class="title">${r.realm} · ${Math.floor(r.age)}岁</div>
        </div>
        <div class="val">${valTxt}</div>
      </div>
    `;
  }).join('');
}

function getRealmByAge(age) {
  let title = TITLES[0].name;
  for (const t of TITLES) if (age >= t.min) title = t.name;
  return title;
}

// ============ 渲染 · Profile ============
function renderProfile() {
  const p = state.profile;
  document.getElementById('avatar-char').textContent = (p.name || '道')[0];
  const expected = expectedLifespanYears(p);
  const bmi = p.weight / Math.pow(p.height / 100, 2);
  const startedDays = (nowMs() - state.startTimestamp) / 1000 / SEC_PER_DAY;
  document.getElementById('profile-info').innerHTML = `
    <div class="pi-row"><span class="pi-label">道号</span><span class="pi-value">${p.name}</span></div>
    <div class="pi-row"><span class="pi-label">性别 / 年龄</span><span class="pi-value">${p.gender === 'female' ? '坤·女' : '乾·男'} · ${p.age}岁</span></div>
    <div class="pi-row"><span class="pi-label">身形</span><span class="pi-value">${p.height}cm / ${p.weight}kg · BMI ${bmi.toFixed(1)}</span></div>
    <div class="pi-row"><span class="pi-label">天命预测</span><span class="pi-value">${expected.toFixed(0)} 岁</span></div>
    <div class="pi-row"><span class="pi-label">命盘开启</span><span class="pi-value">${startedDays.toFixed(2)} 天前</span></div>
    <div class="pi-row"><span class="pi-label">累积修炼增量</span><span class="pi-value">${formatLife(state.bonusSec)}</span></div>
    <div class="pi-row"><span class="pi-label">复活币 / 功德</span><span class="pi-value">${state.coin} 枚 / ${state.merit} 点</span></div>
  `;
}

// ============ 任务执行 ============
function doTask(name) {
  if (!state.onboarded) return;
  const t = state.todayTasks;
  let gained = 0, msg = '';

  if (name === 'ziwu') {
    if (t.ziwu) return;
    t.ziwu = true;
    gained = 30 * 60;
    state.merit += 2;
    msg = '【子午流注】 早睡入梦，寿命 +30 分钟，功德 +2';
  } else if (name === 'steps') {
    if (t.steps) return;
    const s = parseInt(document.getElementById('steps-range').value) || 0;
    if (s < 1000) return toast('至少需要 1000 步', 'bad');
    let secGain = Math.floor(s / 1000) * 12 * 60;
    if (s >= 10000) secGain += 2 * 3600;
    t.steps = true;
    gained = secGain;
    state.merit += Math.min(5, Math.floor(s / 2000));
    msg = `【步步为营】 行走 ${s.toLocaleString()} 步，寿命 +${formatLife(secGain)}`;
  } else if (name === 'water') {
    if (t.water >= 8) return;
    t.water += 1;
    gained = 5 * 60;
    if (t.water === 8) state.merit += 3;
    msg = `【上善若水】 第 ${t.water} 杯水，寿命 +5 分钟${t.water === 8 ? '，圆满 · 功德 +3' : ''}`;
  } else if (name === 'meditate') {
    if (t.meditate) return;
    t.meditate = true;
    gained = 15 * 60;
    state.merit += 3;
    state.shard += 1;
    if (state.shard >= 5) { state.shard -= 5; state.coin += 1; toast('复活币碎片合成 · 复活币 +1', 'gold'); }
    msg = '【静坐冥想】 心境清明，寿命 +15 分钟，复活币碎片 +1';
  } else if (name === 'earlyrise') {
    if (t.earlyrise) return;
    t.earlyrise = true;
    state.streak = Math.min(7, state.streak + 1);
    gained = 20 * 60;
    state.merit += 4;
    msg = `【早起挑战】 连续 ${state.streak}/7 天，寿命 +20 分钟`;
    if (state.streak >= 7) {
      state.coin += 1;
      state.streak = 0;
      msg += ' · 七日劫数功成 · 复活币 +1';
    }
  } else if (name === 'diet') {
    if (t.diet) return;
    t.diet = true;
    gained = 20 * 60;
    state.merit += 1;
    msg = '【清淡饮食】 三餐有节，寿命 +20 分钟';
  }

  if (gained > 0) {
    state.bonusSec += gained;
    state.totalGainedSec += gained;
    pushEvent(msg, 'good');
    toast(msg, 'gold');
  }
  save();
  renderAll();
}

// ============ 随机事件 ============
function triggerRandomEvent() {
  const ev = RANDOM_EVENTS[Math.floor(Math.random() * RANDOM_EVENTS.length)];
  state.bonusSec += ev.delta;
  if (ev.delta > 0) state.totalGainedSec += ev.delta;
  pushEvent(ev.msg, ev.good ? 'good' : 'bad');
  toast(ev.msg, ev.good ? 'gold' : 'bad');
  save();
  renderAll();
}

// ============ 弥留 / 转世 ============
function showDying() {
  document.getElementById('dying-modal').classList.remove('hidden');
}
function hideDying() {
  document.getElementById('dying-modal').classList.add('hidden');
}
function doRevive() {
  if (state.coin < 1) return toast('复活币不足', 'bad');
  state.coin -= 1;
  state.dying = false;
  // 续命：恢复初始寿命的 50%
  state.startTimestamp = nowMs();
  state.bonusSec = state.initialLifeSec * 0.5;
  pushEvent('💗 起死回生 · 消耗复活币 1 枚', 'good');
  hideDying();
  save();
  renderAll();
}
function doReborn() {
  if (!confirm('确定转世重修？所有修炼数据将清零。')) return;
  localStorage.removeItem(STORAGE_KEY);
  state = defaultState();
  hideDying();
  showOnboarding();
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

// ============ 总入口 ============
function renderAll() {
  if (!state.onboarded) return;
  renderPulse();
  renderModifiers();
  renderEventLog();
  renderCultivation();
  renderInventory();
  renderBoard();
  renderProfile();
}

function startPulseTimer() {
  if (pulseTimer) clearInterval(pulseTimer);
  pulseTimer = setInterval(() => {
    if (state && state.onboarded) renderPulse();
  }, 50);
  // 每 10 秒持久化一次
  setInterval(() => state && state.onboarded && save(), 10000);
}

// ============ 事件绑定 ============
function bindEvents() {
  // 注册表单
  document.getElementById('onboard-form').addEventListener('submit', onboardSubmit);

  // 导航切换
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

  // 显示模式切换
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

  // 触发随机事件
  document.getElementById('trigger-event').addEventListener('click', triggerRandomEvent);

  // 复活 / 转世
  document.getElementById('revive-btn').addEventListener('click', doRevive);
  document.getElementById('reborn-btn').addEventListener('click', doReborn);

  // 重置
  document.getElementById('reset-btn').addEventListener('click', doReborn);

  // 离线结算（页面重新可见时）
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && state && state.onboarded) {
      renderAll();
    }
  });
}

// ============ 启动 ============
function init() {
  state = load();
  bindEvents();
  if (!state.onboarded) {
    showOnboarding();
  } else {
    if (state.dying) showDying();
    renderAll();
  }
  startPulseTimer();
}

document.addEventListener('DOMContentLoaded', init);
