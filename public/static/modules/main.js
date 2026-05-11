/* ==========================================================
   《向天再借500年》· 主入口模块
   包含：初始化、事件绑定、渲染调度
   ========================================================== */

import {
  token, setToken, setDisplayMode, setCurrentBoard, setRenderAll, formatLife, lastFetchAt,
  stateCache, pulseTimer
} from './core.js';

import {
  showAuth, hideAuth, showOnboarding, hideOnboarding, setAuthModeUI, authSubmit, logout, onboardSubmit
} from './auth.js';

import { refreshState } from './state.js';

import { renderPulse, renderModifiers, renderEventLog } from './dashboard.js';

import { renderCultivation, doTask, triggerRandomEvent, showDying, hideDying, doRevive } from './cultivation.js';

import { renderInventory, buyPotion, loadPotions, POTIONS_META } from './inventory.js';

import { renderBoard } from './leaderboard.js';

import { renderProfile } from './profile.js';

import { renderAchievements, checkAchievements } from './achievements.js';

import { renderFortune, checkinFortune, loadCultivationLogs, addCultivationLog } from './fortune.js';

import { doExplore, renderAdventure, acceptTribulation, completeTribulation, failTribulation } from './adventure.js';

import { renderAdmin, checkAdmin, saveAdminPotions, resetAdminPotions, createWorldEvent, createManual, createExtraTask, createExplore, createPotionConfig } from './admin.js';

import { loadExtraTasksConfig, loadExtraTasksStatus, renderExtraTasks } from './extra-tasks.js';

// ============ 总渲染调度 ============
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

// 设置渲染函数引用（解决循环依赖）
setRenderAll(renderAll);

// ============ 脉冲定时器 ============
function startPulseTimer() {
  if (pulseTimer) clearInterval(pulseTimer);
  window.pulseTimer = setInterval(() => {
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
  const authForm = document.getElementById('auth-form');
  if (authForm) authForm.addEventListener('submit', authSubmit);

  document.querySelectorAll('.auth-tab').forEach(b => b.addEventListener('click', () => setAuthModeUI(b.dataset.mode)));

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) logoutBtn.addEventListener('click', logout);

  // 注册命盘
  const onboardForm = document.getElementById('onboard-form');
  if (onboardForm) onboardForm.addEventListener('submit', onboardSubmit);

  // 导航
  document.querySelectorAll('.nav-item').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const tab = a.dataset.tab;
      document.querySelectorAll('.nav-item').forEach(x => x.classList.remove('active'));
      a.classList.add('active');
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
      const tabEl = document.getElementById(tab);
      if (tabEl) tabEl.classList.add('active');
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
  const adminNav = document.getElementById('admin-nav');
  if (adminNav) {
    adminNav.addEventListener('click', e => {
      e.preventDefault();
      document.querySelectorAll('.nav-item').forEach(x => x.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
      const adminEl = document.getElementById('admin');
      if (adminEl) adminEl.classList.add('active');
      renderAdmin();
    });
  }

  // 显示模式
  document.querySelectorAll('.t-btn').forEach(b => {
    b.addEventListener('click', () => {
      document.querySelectorAll('.t-btn').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      setDisplayMode(b.dataset.mode);
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
  if (sr && sn && sl) {
    sr.addEventListener('input', () => {
      const s = parseInt(sr.value) || 0;
      sn.textContent = s.toLocaleString();
      let sec = Math.floor(s / 1000) * 12 * 60;
      if (s >= 10000) sec += 2 * 3600;
      sl.textContent = '+' + formatLife(sec);
    });
  }

  // 排行榜切换
  document.querySelectorAll('.board-tab').forEach(t => {
    t.addEventListener('click', () => {
      document.querySelectorAll('.board-tab').forEach(x => x.classList.remove('active'));
      t.classList.add('active');
      setCurrentBoard(t.dataset.board);
      renderBoard();
    });
  });

  // 随机事件和复活
  const triggerEventBtn = document.getElementById('trigger-event');
  if (triggerEventBtn) triggerEventBtn.addEventListener('click', triggerRandomEvent);

  const reviveBtn = document.getElementById('revive-btn');
  if (reviveBtn) reviveBtn.addEventListener('click', doRevive);

  // 探险
  const exploreBtn = document.getElementById('explore-btn');
  if (exploreBtn) exploreBtn.addEventListener('click', doExplore);

  // 天劫
  const tribAccept = document.getElementById('trib-accept');
  if (tribAccept) tribAccept.addEventListener('click', acceptTribulation);

  const tribComplete = document.getElementById('trib-complete');
  if (tribComplete) tribComplete.addEventListener('click', completeTribulation);

  const tribFail = document.getElementById('trib-fail');
  if (tribFail) tribFail.addEventListener('click', failTribulation);

  const checkAchBtn = document.getElementById('check-ach-btn');
  if (checkAchBtn) checkAchBtn.addEventListener('click', checkAchievements);

  // 管理后台
  const adminSavePotions = document.getElementById('admin-save-potions');
  if (adminSavePotions) adminSavePotions.addEventListener('click', saveAdminPotions);

  const adminResetPotions = document.getElementById('admin-reset-potions');
  if (adminResetPotions) adminResetPotions.addEventListener('click', resetAdminPotions);

  const weCreateBtn = document.getElementById('we-create-btn');
  if (weCreateBtn) weCreateBtn.addEventListener('click', createWorldEvent);

  // 新管理功能按钮
  const createManualBtn = document.getElementById('admin-create-manual-btn');
  if (createManualBtn) createManualBtn.addEventListener('click', createManual);

  const createExtraTaskBtn = document.getElementById('admin-create-extra-task-btn');
  if (createExtraTaskBtn) createExtraTaskBtn.addEventListener('click', createExtraTask);

  const createExploreBtn = document.getElementById('admin-create-explore-btn');
  if (createExploreBtn) createExploreBtn.addEventListener('click', createExplore);

  const createPotionBtn = document.getElementById('admin-create-potion-btn');
  if (createPotionBtn) createPotionBtn.addEventListener('click', createPotionConfig);

  // 运势页面
  const checkinBtn = document.getElementById('checkin-btn');
  if (checkinBtn) checkinBtn.addEventListener('click', checkinFortune);

  const addLogBtn = document.getElementById('add-log-btn');
  if (addLogBtn) addLogBtn.addEventListener('click', addCultivationLog);

  // 页面可见性变化
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && token) refreshState(false);
  });
}

// ============ 初始化 ============
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

    // 手动调用当前页面的渲染函数（因为模块加载可能晚于路由初始化）
    const currentPath = Router.getCurrentRoute ? Router.getCurrentRoute() : window.location.pathname;
    const route = Router.routes ? Router.routes[currentPath] : null;

    if (route) {
      if (route.name === 'admin' || route.name === 'admin-overview') {
        renderAdmin();
      } else if (route.name.startsWith('admin-')) {
        renderAdmin();
      } else if (route.name === 'leaderboard') {
        renderBoard();
      } else if (route.name === 'profile') {
        renderProfile();
      } else if (route.name === 'inventory') {
        renderInventory();
      } else if (route.name === 'fortune') {
        renderFortune();
      } else if (route.name === 'adventure') {
        renderAdventure();
        checkAchievements();
      }
    }
  }
}

// 启动应用
document.addEventListener('DOMContentLoaded', init);
