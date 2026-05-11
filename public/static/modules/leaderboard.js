/* ==========================================================
   《向天再借500年》· 排行榜模块
   包含：天榜排名、切换
   ========================================================== */

import { token, currentBoard, SEC_PER_YEAR, api, formatLife } from './core.js';

// ============ 渲染：排行榜 ============
export async function renderBoard() {
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

// 绑定到 window
window.renderBoard = renderBoard;
