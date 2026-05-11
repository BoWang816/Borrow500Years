/* ==========================================================
   《向天再借500年》· 核心模块
   包含：常量、全局状态、API 工具、通用工具函数
   ========================================================== */

// ============ 常量配置 ============
export const TOKEN_KEY = 'borrow500_token';
export const SEC_PER_MIN = 60;
export const SEC_PER_HOUR = 3600;
export const SEC_PER_DAY = 86400;
export const SEC_PER_YEAR = 365.25 * SEC_PER_DAY;

export const TITLES = [
  { min: 0,    name: '凡胎肉身' },
  { min: 80,   name: '寿比南山' },
  { min: 120,  name: '地仙之姿' },
  { min: 200,  name: '与天同寿' },
];

// ============ 全局状态 ============
export let token = localStorage.getItem(TOKEN_KEY) || '';
export let stateCache = null;
export let displayMode = 'full';
export let currentBoard = 'longevity';
export let pulseTimer = null;
export let serverNowOffset = 0;
export let authMode = 'login';
export let lastFetchAt = 0;

// ============ 状态设置器 ============
export function setToken(newToken) {
  token = newToken;
  if (newToken) {
    localStorage.setItem(TOKEN_KEY, newToken);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function setStateCache(cache) {
  stateCache = cache;
}

export function setServerNowOffset(offset) {
  serverNowOffset = offset;
}

export function setDisplayMode(mode) {
  displayMode = mode;
}

export function setCurrentBoard(board) {
  currentBoard = board;
}

export function setAuthMode(mode) {
  authMode = mode;
}

export function setLastFetchAt(time) {
  lastFetchAt = time;
}

// ============ 渲染回调 ============
let renderAllCallback = null;

export function setRenderAll(fn) {
  renderAllCallback = fn;
}

export function callRenderAll() {
  if (renderAllCallback) renderAllCallback();
}

// ============ HTTP API ============
export async function api(path, opts = {}) {
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
  if (token) headers['Authorization'] = 'Bearer ' + token;
  const r = await fetch('/api' + path, { ...opts, headers });
  let data = null;
  try { data = await r.json(); } catch (e) { data = {}; }
  if (!r.ok) {
    const err = new Error((data && data.error) || `HTTP ${r.status}`);
    err.status = r.status;
    err.data = data;
    throw err;
  }
  return data;
}

// ============ 工具函数 ============
export function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

export function pad(n, w = 2) {
  return String(Math.floor(n)).padStart(w, '0');
}

export function nowMs() {
  return Date.now() + serverNowOffset;
}

export function formatLife(sec) {
  if (sec >= SEC_PER_YEAR) return (sec / SEC_PER_YEAR).toFixed(1) + ' 年';
  if (sec >= SEC_PER_DAY) return (sec / SEC_PER_DAY).toFixed(1) + ' 天';
  if (sec >= SEC_PER_HOUR) return (sec / SEC_PER_HOUR).toFixed(1) + ' 小时';
  if (sec >= 60) return Math.round(sec / 60) + ' 分钟';
  return Math.round(sec) + ' 秒';
}

export function formatDuration(seconds) {
  if (seconds >= 86400) return Math.floor(seconds / 86400) + '天';
  if (seconds >= 3600) return Math.floor(seconds / 3600) + '小时';
  return Math.floor(seconds / 60) + '分钟';
}

export function formatTimeLeft(endAt) {
  const left = Math.max(0, endAt - Date.now());
  const hours = Math.floor(left / 3600000);
  const mins = Math.floor((left % 3600000) / 60000);
  return `${hours}小时${mins}分`;
}

export function baseDecayMultiplier(p) {
  let mult = 1.0;
  if (p.stayup) mult += 0.5;
  if (p.smoke) mult += 0.4;
  if (p.alcohol) mult += 0.2;
  if (p.exercise) mult -= 0.15;
  if (p.meditate) mult -= 0.1;
  return mult;
}

export function currentLifeSec() {
  if (!stateCache || !stateCache.profile) return 0;
  const p = stateCache.profile;
  if (p.dying) return 0;
  const elapsed = (nowMs() - p.start_timestamp) / 1000;
  const base = baseDecayMultiplier(p);
  return p.initial_life_sec + p.bonus_sec - elapsed * base;
}

export function getRealm() {
  if (!stateCache || !stateCache.profile) {
    return { title: TITLES[0].name, totalAge: 0 };
  }
  const p = stateCache.profile;
  const yearsLived = p.age + (nowMs() - p.start_timestamp) / 1000 / SEC_PER_YEAR;
  const totalAge = yearsLived + p.bonus_sec / SEC_PER_YEAR;
  let title = TITLES[0].name;
  for (const t of TITLES) if (totalAge >= t.min) title = t.name;
  return { title, totalAge };
}

export function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ============ Toast 通知 ============
export function toast(msg, kind = 'normal') {
  const wrap = document.getElementById('toast-wrap');
  if (!wrap) return;
  const t = document.createElement('div');
  t.className = 'toast' + (kind === 'bad' ? ' bad' : kind === 'gold' ? ' gold' : '');
  t.textContent = msg;
  wrap.appendChild(t);
  setTimeout(() => t.remove(), 3200);
}
