<template>
  <div id="app-container">
    <router-view />
    <AuthModal />
    <OnboardingModal />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from './stores/auth'
import AuthModal from './components/AuthModal.vue'
import OnboardingModal from './components/OnboardingModal.vue'

const authStore = useAuthStore()

onMounted(() => {
  authStore.checkAuth()
})
</script>

<style>
#app-container {
  width: 100%;
  min-height: 100vh;
}
</style>
