import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '../utils/api'
import type { Profile, Modifier, Event } from '../types'

interface Realm {
  id: number
  name: string
  major_realm: number
  sub_realm: number
  major_realm_name: string
  lifespan_max: number
  description: string
  sort_order: number
}

export const useStateStore = defineStore('state', () => {
  const profile = ref<Profile | null>(null)
  const modifiers = ref<Modifier[]>([])
  const events = ref<Event[]>([])
  const realms = ref<Realm[]>([])
  const loading = ref<boolean>(false)
  const lastFetch = ref<number>(0)
  const realmsLoaded = ref<boolean>(false)

  async function fetchState(force = false) {
    // 防抖：30秒内不重复请求（除非强制刷新）
    if (!force && Date.now() - lastFetch.value < 30000) {
      return
    }

    loading.value = true
    try {
      const res = await api('/state')
      profile.value = res.profile
      modifiers.value = res.potions?.map((p: any) => ({
        id: p.id,
        potionId: p.potion_id,
        potionName: p.potion_name,
        potionEmoji: p.potion_emoji,
        modId: p.mod_id,
        modLabel: p.mod_label,
        modValue: p.mod_value,
        expireAt: p.expire_at
      })) || []
      events.value = res.events?.map((e: any) => ({
        id: e.id || Math.random(),
        msg: e.msg,
        type: e.kind || 'good',
        createdAt: e.created_at || Math.floor(Date.now() / 1000)
      })) || []
      lastFetch.value = Date.now()
    } catch (err) {
      console.error('Failed to fetch state:', err)
    } finally {
      loading.value = false
    }
  }

  async function fetchRealms() {
    if (realmsLoaded.value) return
    
    try {
      const res = await api('/realms/list') as any
      realms.value = res.realms || []
      realmsLoaded.value = true
    } catch (err) {
      console.error('Failed to fetch realms:', err)
    }
  }

  function getRealmName(realmId: number): string {
    const realm = realms.value.find(r => r.id === realmId)
    return realm?.name || '未知境界'
  }

  function updateProfile(updates: Partial<Profile>) {
    if (profile.value) {
      profile.value = { ...profile.value, ...updates }
    }
  }

  return {
    profile,
    modifiers,
    events,
    realms,
    loading,
    fetchState,
    fetchRealms,
    getRealmName,
    updateProfile
  }
})
