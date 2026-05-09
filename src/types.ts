export type Bindings = {
  DB: D1Database;
}

export type Profile = {
  user_id: number;
  name: string;
  gender: 'male' | 'female';
  age: number;
  height: number;
  weight: number;
  smoke: number;
  alcohol: number;
  stayup: number;
  hereditary: number;
  exercise: number;
  meditate: number;
  initial_life_sec: number;
  bonus_sec: number;
  start_timestamp: number;
  total_gained_sec: number;
  coin: number;
  shard: number;
  merit: number;
  streak: number;
  dying: number;
  dying_start_at: number | null;
  updated_at: number;
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
