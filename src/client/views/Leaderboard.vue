<template>
  <section id="leaderboard" class="tab-pane active">
    <h2 class="page-title">
      <span class="cn">天榜 · The Pantheon</span>
      <span class="en">Leaderboard</span>
    </h2>
    
    <div class="board-tabs">
      <button 
        :class="['board-tab', { active: currentBoard === 'longevity' }]" 
        @click="switchBoard('longevity')"
      >
        长生榜（剩余寿命）
      </button>
      <button 
        :class="['board-tab', { active: currentBoard === 'merit' }]" 
        @click="switchBoard('merit')"
      >
        功德榜（养生延寿）
      </button>
    </div>

    <div class="board-list">
      <div v-if="users.length === 0" class="empty">暂无数据</div>
      <div v-for="(user, index) in users" :key="user.userId" :class="['board-item', getRankClass(index)]">
        <div class="board-rank">{{ index + 1 }}</div>
        <div class="board-avatar">
          <i class="fas fa-user-astronaut"></i>
        </div>
        <div class="board-info">
          <div class="board-name">{{ user.name }}</div>
          <div class="board-realm">{{ user.realm }}</div>
        </div>
        <div class="board-value">
          <span v-if="currentBoard === 'longevity'">{{ formatLife(user.lifeSec) }}</span>
          <span v-else>{{ user.merit }} 功德</span>
        </div>
      </div>
    </div>

    <div class="title-system">
      <h3 class="sub-title">— 称号体系 —</h3>
      <div class="titles">
        <div class="title-card">
          <span class="age-range">0-80岁</span>
          <span class="title-name">凡胎肉身</span>
        </div>
        <div class="title-card">
          <span class="age-range">80-120岁</span>
          <span class="title-name">寿比南山</span>
        </div>
        <div class="title-card">
          <span class="age-range">120-200岁</span>
          <span class="title-name">地仙之姿</span>
        </div>
        <div class="title-card legendary">
          <span class="age-range">200-500岁</span>
          <span class="title-name">与天同寿</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api, formatLife, toast } from '../utils/api'

const currentBoard = ref<'longevity' | 'merit'>('longevity')
const users = ref<any[]>([])

function getRankClass(index: number): string {
  if (index === 0) return 'rank-1'
  if (index === 1) return 'rank-2'
  if (index === 2) return 'rank-3'
  return ''
}

async function loadBoard() {
  try {
    const endpoint = currentBoard.value === 'longevity' ? '/board/life' : '/board/merit'
    const res = await api(endpoint)
    users.value = res.users || []
  } catch (err: any) {
    toast(err.message, 'bad')
  }
}

function switchBoard(board: 'longevity' | 'merit') {
  currentBoard.value = board
  loadBoard()
}

onMounted(() => {
  loadBoard()
})
</script>
