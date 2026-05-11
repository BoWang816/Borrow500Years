/* ==========================================================
   《向天再借500年》· 扩展任务模块
   包含：养生修炼任务列表
   ========================================================== */

import { token, api, toast, formatLife } from './core.js';
import { refreshState } from './state.js';

// ============ 扩展任务状态 ============
let extraTasksConfig = [];
let extraTasksStatus = {};

export async function loadExtraTasksConfig() {
  try {
    const r = await api('/extra-tasks/config');
    extraTasksConfig = r.tasks || [];
  } catch (e) {
    console.error('加载扩展任务配置失败:', e);
  }
}

export async function loadExtraTasksStatus() {
  if (!token) return;
  try {
    const r = await api('/extra-tasks/status');
    extraTasksStatus = r.status || {};
  } catch (e) {
    console.error('加载扩展任务状态失败:', e);
  }
}

export async function renderExtraTasks() {
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
