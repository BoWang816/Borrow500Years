/* ==========================================================
   《向天再借500年》· 状态管理模块
   包含：状态刷新、弥留处理
   ========================================================== */

import {
  token, setStateCache, setServerNowOffset, setLastFetchAt, stateCache,
  api, toast, callRenderAll
} from './core.js';

import { showAuth, showOnboarding } from './auth.js';
import { showDying, hideDying } from './cultivation.js';
import { checkAdmin } from './admin.js';

// ============ 拉取状态 ============
export async function refreshState(showError = true) {
  if (!token) { showAuth(); return; }
  try {
    const r = await api('/state');
    setStateCache(r);
    setServerNowOffset((r.serverNow || Date.now()) - Date.now());
    setLastFetchAt(Date.now());
    document.getElementById('user-name').textContent = stateCache.profile.name;
    document.getElementById('user-tag').classList.remove('hidden');
    document.getElementById('logout-btn').classList.remove('hidden');

    // 弥留处理
    if (stateCache.profile.dying) {
      showDying();
    } else {
      hideDying();
    }

    callRenderAll();

    // 检查管理员身份
    checkAdmin();
  } catch (err) {
    if (err.status === 401) {
      setToken('');
      showAuth();
    } else if (err.status === 404) {
      showOnboarding();
    } else if (showError) {
      toast(err.message, 'bad');
    }
  }
}

// 需要在 core.js 中导出的 setToken 函数
import { setToken } from './core.js';
