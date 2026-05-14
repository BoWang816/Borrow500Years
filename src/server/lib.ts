// 通用工具：寿命计算、密码哈希、token

export const SEC_PER_DAY = 86400;
export const SEC_PER_YEAR = 365.25 * SEC_PER_DAY;

// Web Crypto SHA-256 哈希（Cloudflare Workers 兼容）
export async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function hashPassword(password: string): Promise<string> {
  return sha256('borrow500years_salt_v1::' + password);
}

export function genToken(): string {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function clamp(v: number, a: number, b: number): number {
  return Math.max(a, Math.min(b, v));
}

export function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function expectedLifespanYears(p: {
  gender: string; age: number; height: number; weight: number;
  smoke: number; alcohol: number; stayup: number; hereditary: number; exercise: number; meditate: number;
}): number {
  let base = p.gender === 'female' ? 81 : 76;
  const bmi = p.weight / Math.pow(p.height / 100, 2);
  if (bmi < 18.5) base -= 1;
  else if (bmi < 24) base += 1.5;
  else if (bmi < 28) base -= 1;
  else if (bmi < 32) base -= 3;
  else base -= 5;
  if (p.smoke) base -= 6;
  if (p.alcohol) base -= 4;
  if (p.stayup) base -= 5;
  if (p.hereditary) base -= 3;
  if (p.exercise) base += 4;
  if (p.meditate) base += 2;
  return clamp(base, 5, 120);
}

export function baseDecayMultiplier(p: { smoke: number; alcohol: number; stayup: number; exercise: number; meditate: number; }): number {
  let mult = 1.0;
  if (p.stayup) mult += 0.5;
  if (p.smoke) mult += 0.4;
  if (p.alcohol) mult += 0.2;
  if (p.exercise) mult -= 0.15;
  if (p.meditate) mult -= 0.1;
  return mult;
}

export function currentDecayRate(p: any, mods: { mod_value: number }[]): number {
  let mult = baseDecayMultiplier(p);
  for (const m of mods) mult += (m.mod_value || 0);
  return clamp(mult, 0.2, 5.0);
}

// 当前剩余寿命（秒）
export function currentLifeSec(p: any): number {
  const elapsed = (Date.now() - p.start_timestamp) / 1000;
  const base = baseDecayMultiplier(p);
  return p.initial_life_sec + p.bonus_sec - elapsed * base;
}

const TITLES = [
  { min: 0,    name: '凡胎肉身' },
  { min: 80,   name: '寿比南山' },
  { min: 120,  name: '地仙之姿' },
  { min: 200,  name: '与天同寿' },
];

export function getRealmTitle(totalAge: number): string {
  let title = TITLES[0].name;
  for (const t of TITLES) if (totalAge >= t.min) title = t.name;
  return title;
}

export function formatLife(sec: number): string {
  if (sec >= SEC_PER_YEAR) return (sec / SEC_PER_YEAR).toFixed(1) + ' 年';
  if (sec >= SEC_PER_DAY) return (sec / SEC_PER_DAY).toFixed(1) + ' 天';
  if (sec >= 3600) return (sec / 3600).toFixed(1) + ' 小时';
  if (sec >= 60) return Math.round(sec / 60) + ' 分钟';
  return Math.round(sec) + ' 秒';
}

// 获取当前时间戳（秒）- 替代 Math.floor(Date.now() / 1000)
export function nowSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

// 根据总年龄从数据库获取境界（异步版本）
export async function getRealmByAge(db: D1Database, totalAge: number): Promise<{ id: number; name: string }> {
  // 查询所有境界，按sort_order排序
  const realms = await db.prepare(`
    SELECT id, name, breakthrough_age_min, breakthrough_age_max
    FROM realms
    WHERE breakthrough_age_min IS NOT NULL
    ORDER BY sort_order ASC
  `).all<{ id: number; name: string; breakthrough_age_min: number; breakthrough_age_max: number }>()

  if (!realms.results || realms.results.length === 0) {
    return { id: 1, name: '炼气期' } // 默认境界
  }

  // 将总年龄转换为秒
  const totalAgeSec = totalAge * SEC_PER_YEAR

  // 从高到低查找匹配的境界
  for (let i = realms.results.length - 1; i >= 0; i--) {
    const realm = realms.results[i]
    if (totalAgeSec >= realm.breakthrough_age_min) {
      return { id: realm.id, name: realm.name }
    }
  }

  // 如果没有匹配，返回第一个境界
  return { id: realms.results[0].id, name: realms.results[0].name }
}
