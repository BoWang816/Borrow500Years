import type { D1Database } from '@cloudflare/workers-types';

export type Bindings = {
  DB: D1Database;
  ADMIN_USERS: string;
}

export type ApiVariables = {
  userId: number;
  username: string;
  profile?: Profile;
  adminUserId?: number;
  adminUsername?: string;
}

export type Profile = {
  id: number;
  username: string;
  password_hash: string;
  token: string | null;
  token_expire_at: number | null;
  created_at: number;
  name: string | null;
  gender: 'male' | 'female' | null;
  age: number | null;
  height: number | null;
  weight: number | null;
  smoke: number;
  alcohol: number;
  stayup: number;
  hereditary: number;
  exercise: number;
  meditate: number;
  initial_life_sec: number | null;
  bonus_sec: number;
  start_timestamp: number | null;
  total_gained_sec: number;
  coin: number;
  shard: number;
  merit: number;
  streak: number;
  dying: number;
  dying_start_at: number | null;
  updated_at: number | null;
}

export type DailyTask = {
  user_id: number;
  task_date: string;
  ziwu: number;
  steps: number;
  water: number;
  meditate: number;
  earlyrise: number;
  diet: number;
}

export type ActivePotion = {
  id: number;
  user_id: number;
  potion_id: string;
  potion_name: string;
  potion_emoji: string | null;
  mod_id: string | null;
  mod_label: string | null;
  mod_value: number;
  expire_at: number;
}

export type EventRow = {
  id: number;
  user_id: number;
  msg: string;
  kind: 'good' | 'bad' | 'normal';
  created_at: number;
}
