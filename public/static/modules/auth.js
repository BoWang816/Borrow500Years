/* ==========================================================
   《向天再借500年》· 认证模块
   包含：登录、注册、用户引导
   ========================================================== */

import {
  token, setToken, setStateCache, setServerNowOffset, setAuthMode, authMode,
  api, toast, SEC_PER_DAY
} from './core.js';

import { refreshState } from './state.js';

// ============ 认证界面 ============
export function showAuth() {
  document.getElementById('auth-modal').classList.remove('hidden');
  document.getElementById('onboarding').classList.add('hidden');
}

export function hideAuth() {
  document.getElementById('auth-modal').classList.add('hidden');
}

export function showOnboarding() {
  document.getElementById('onboarding').classList.remove('hidden');
  document.getElementById('auth-modal').classList.add('hidden');
}

export function hideOnboarding() {
  document.getElementById('onboarding').classList.add('hidden');
}

export function setAuthModeUI(mode) {
  setAuthMode(mode);
  document.querySelectorAll('.auth-tab').forEach(b => {
    b.classList.toggle('active', b.dataset.mode === mode);
  });
  document.getElementById('auth-btn-text').textContent = mode === 'login' ? '入 · 仙 · 籍' : '开 · 立 · 道 · 号';
  document.getElementById('auth-err').textContent = '';
}

// ============ 登录/注册 ============
export async function authSubmit(e) {
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
    setToken(r.token);
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

export async function logout() {
  try { await api('/auth/logout', { method: 'POST' }); } catch (e) {}
  setToken('');
  setStateCache(null);
  document.getElementById('user-tag').classList.add('hidden');
  document.getElementById('logout-btn').classList.add('hidden');
  showAuth();
}

// ============ 用户引导 ============
export async function onboardSubmit(e) {
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
