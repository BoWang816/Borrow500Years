/* ==========================================================
   《向天再借500年》· 背包模块
   包含：丹药列表、购买、效果描述
   ========================================================== */

import { stateCache, token, nowMs, formatDuration, api, toast } from './core.js';
import { refreshState } from './state.js';

// ============ 丹药元数据 ============
export let POTIONS_META = [];

export function setPotionsMeta(meta) {
  POTIONS_META = meta;
}

// ============ 丹药描述 ============
export function getPotionDesc(po) {
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

// ============ 渲染：背包 ============
export function renderInventory() {
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

// ============ 购买丹药 ============
export async function buyPotion(pid) {
  try {
    const r = await api('/potion/' + pid, { method: 'POST' });
    toast(r.msg, 'gold');
    await refreshState();
  } catch (err) { toast(err.message, 'bad'); }
}

// ============ 加载丹药配置 ============
export async function loadPotions() {
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
