export interface Profile {
  userId: number
  username: string
  name: string
  gender: string
  age: number
  height: number
  weight: number
  smoke: number
  alcohol: number
  stayup: number
  exercise: number
  meditate: number
  initialLifeSec: number
  bonusSec: number
  startTimestamp: number
  totalGainedSec: number
  coin: number
  shard: number
  merit: number
  streak: number
  dying: boolean
  dyingStartAt: number | null
  lifeSec: number
  totalAge: number
  realm: string
  bmi: number
}

export interface Modifier {
  id: number
  potionId: string
  potionName: string
  potionEmoji: string
  modId: string
  modLabel: string
  modValue: number
  expireAt: number
}

export interface Event {
  id: number
  msg: string
  type: string
  createdAt: number
}

export interface Potion {
  id: string
  emoji: string
  name: string
  desc: string
  cost: number
  type: 'merit' | 'coin'
  instant_life?: number
  dur?: number
  dur_decay_reduction?: number
}

export interface Task {
  task_key: string
  name: string
  emoji: string
  description: string
  life_reward: number
  merit_reward: number
  shard_reward: number
}

export interface Achievement {
  id: number
  key: string
  name: string
  emoji: string
  description: string
  unlocked: boolean
  unlockedAt?: number
}
