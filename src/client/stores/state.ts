import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '../utils/api'
import type { Profile, Modifier, Event } from '../types'

export const useStateStore = defineStore('state', () => {
  const profile = ref<Profile | null>(null)
  const modifiers = ref<Modifier[]>([])
  const events = ref<Event[]>([])
  const loading = ref<boolean>(false)
  const lastFetch = ref<number>(0)

  async function fetchState(force = false) {
    if (!force && Date.now() - lastFetch.value < 5000) {
      return
    }

    loading.value = true
    try {
      const res = await api('/state')
      profile.value = res.profile
      modifiers.value = res.modifiers || []
      events.value = res.events || []
      lastFetch.value = Date.now()
    } catch (err) {
      console.error('Failed to fetch state:', err)
    } finally {
      loading.value = false
    }
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
    loading,
    fetchState,
    updateProfile
  }
})
