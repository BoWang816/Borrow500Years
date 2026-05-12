<template>
  <div class="page leaderboard-page">
    <h2 class="page-title">
      <span class="cn">天榜</span>
      <span class="en">Leaderboard</span>
    </h2>
    <div class="container">
      <div class="card">
        <h3><i class="fas fa-trophy"></i> 排行榜</h3>
        <div class="board-list">
          <div v-for="(user, index) in users" :key="user.userId" class="board-item">
            <span class="rank">{{ index + 1 }}</span>
            <span class="name">{{ user.name }}</span>
            <span class="value">{{ user.value }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api, toast } from '../utils/api'

const users = ref<any[]>([])

async function loadBoard() {
  try {
    const res = await api('/board/life')
    users.value = res.users || []
  } catch (err: any) {
    toast(err.message, 'bad')
  }
}

onMounted(() => {
  loadBoard()
})
</script>
