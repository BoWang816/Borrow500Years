/* ==========================================================
   前端路由管理器 · Router Module
   ========================================================== */
'use strict';

const ROUTES = {
  '/': { name: 'dashboard', title: '命脉 · Dashboard' },
  '/dashboard': { name: 'dashboard', title: '命脉 · Dashboard' },
  '/fortune': { name: 'fortune', title: '运势天机 · Fortune' },
  '/cultivation': { name: 'cultivation', title: '养生修炼 · Cultivation' },
  '/inventory': { name: 'inventory', title: '丹房 · Inventory' },
  '/adventure': { name: 'adventure', title: '历练 · Adventure' },
  '/leaderboard': { name: 'leaderboard', title: '天榜 · Leaderboard' },
  '/profile': { name: 'profile', title: '道号印鉴 · Profile' },
  '/admin': { name: 'admin', title: '运管后台 · Admin' },
  '/admin/overview': { name: 'admin-overview', title: '平台概览 · Overview' },
  '/admin/potions': { name: 'admin-potions', title: '丹药配置 · Potions' },
  '/admin/logs': { name: 'admin-logs', title: '操作日志 · Logs' },
  '/admin/events': { name: 'admin-events', title: '全服事件 · Events' },
  '/admin/manuals': { name: 'admin-manuals', title: '功法管理 · Manuals' },
  '/admin/tasks': { name: 'admin-tasks', title: '修炼项目 · Tasks' },
  '/admin/explore': { name: 'admin-explore', title: '历练项目 · Explore' },
  '/admin/potions-config': { name: 'admin-potions-config', title: '丹药项目 · Potions Config' }
};

let currentRoute = '/';
let beforeRouteHooks = [];
let afterRouteHooks = [];

// 获取当前路径
function getPath() {
  return window.location.pathname;
}

// 路由匹配
function matchRoute(path) {
  return ROUTES[path] || ROUTES['/'];
}

// 切换页面显示
function showPage(routeName) {
  // 隐藏所有页面
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
  // 显示目标页面
  const target = document.getElementById(routeName);
  if (target) target.classList.add('active');

  // 更新导航高亮
  document.querySelectorAll('.nav-item').forEach(x => {
    x.classList.toggle('active', x.dataset.tab === routeName);
  });
}

// 执行路由
async function navigateTo(path, pushState = true) {
  const route = matchRoute(path);

  // 执行前置钩子
  for (const hook of beforeRouteHooks) {
    const result = await hook(path, route);
    if (result === false) return; // 阻止导航
  }

  // 更新页面
  showPage(route.name);
  currentRoute = path;

  // 更新浏览器历史
  if (pushState) {
    window.history.pushState({ path }, route.title, path);
  }

  // 更新页面标题
  document.title = `${route.title} · 向天再借500年`;

  // 执行后置钩子
  for (const hook of afterRouteHooks) {
    await hook(path, route);
  }

  // 触发页面特定渲染函数
  if (route.name === 'leaderboard' && typeof renderBoard === 'function') {
    await renderBoard();
  } else if (route.name === 'profile' && typeof renderProfile === 'function') {
    await renderProfile();
  } else if ((route.name === 'admin' || route.name.startsWith('admin-')) && typeof renderAdmin === 'function') {
    await renderAdmin();
  }

  // 滚动到顶部
  window.scrollTo(0, 0);
}

// 处理浏览器前进后退
function handlePopState(e) {
  const path = e.state?.path || getPath();
  navigateTo(path, false);
}

// 初始化路由
function initRouter() {
  // 监听浏览器历史变化
  window.addEventListener('popstate', handlePopState);

  // 劫持所有导航链接点击
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[data-route]');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href || !ROUTES[href]) return;

    e.preventDefault();
    navigateTo(href);
  });

  // 初始加载时路由到当前路径
  const initialPath = getPath();
  if (ROUTES[initialPath]) {
    showPage(ROUTES[initialPath].name);
    currentRoute = initialPath;
    // 更新标题
    document.title = `${ROUTES[initialPath].title} · 向天再借500年`;
  } else {
    // 未匹配到路由，默认到首页
    window.history.replaceState({ path: '/' }, ROUTES['/'].title, '/');
    showPage('dashboard');
    currentRoute = '/';
  }
}

// 添加导航前置钩子
function beforeRoute(fn) {
  beforeRouteHooks.push(fn);
}

// 添加导航后置钩子
function afterRoute(fn) {
  afterRouteHooks.push(fn);
}

// 程序化导航
function routerPush(path) {
  navigateTo(path);
}

// 获取当前路由
function getCurrentRoute() {
  return currentRoute;
}

// 导出
window.Router = {
  init: initRouter,
  push: routerPush,
  beforeRoute,
  afterRoute,
  getCurrentRoute,
  routes: ROUTES
};
