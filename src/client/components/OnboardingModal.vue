<template>
  <div v-if="authStore.showOnboardingModal" class="modal-overlay">
    <div class="modal onboarding-modal">
      <h2>注册命盘</h2>
      <p class="subtitle">填写基本信息，开启修仙之旅</p>

      <form @submit.prevent="submit" class="onboarding-form">
        <div class="form-group">
          <label>道号</label>
          <input v-model="form.name" type="text" placeholder="你的道号" required />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>性别</label>
            <select v-model="form.gender" required>
              <option value="male">男</option>
              <option value="female">女</option>
            </select>
          </div>

          <div class="form-group">
            <label>年龄</label>
            <input v-model.number="form.age" type="number" min="1" max="120" required />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>身高 (cm)</label>
            <input v-model.number="form.height" type="number" min="50" max="250" required />
          </div>

          <div class="form-group">
            <label>体重 (kg)</label>
            <input v-model.number="form.weight" type="number" min="20" max="300" required />
          </div>
        </div>

        <div class="form-group">
          <label>吸烟频率</label>
          <select v-model.number="form.smoke" required>
            <option :value="0">不吸烟</option>
            <option :value="1">偶尔</option>
            <option :value="2">经常</option>
            <option :value="3">重度</option>
          </select>
        </div>

        <div class="form-group">
          <label>饮酒频率</label>
          <select v-model.number="form.alcohol" required>
            <option :value="0">不饮酒</option>
            <option :value="1">偶尔</option>
            <option :value="2">经常</option>
            <option :value="3">重度</option>
          </select>
        </div>

        <div class="form-group">
          <label>熬夜频率</label>
          <select v-model.number="form.stayup" required>
            <option :value="0">不熬夜</option>
            <option :value="1">偶尔</option>
            <option :value="2">经常</option>
            <option :value="3">重度</option>
          </select>
        </div>

        <div class="form-group">
          <label>运动频率</label>
          <select v-model.number="form.exercise" required>
            <option :value="0">不运动</option>
            <option :value="1">偶尔</option>
            <option :value="2">经常</option>
            <option :value="3">每天</option>
          </select>
        </div>

        <div class="form-group">
          <label>冥想频率</label>
          <select v-model.number="form.meditate" required>
            <option :value="0">不冥想</option>
            <option :value="1">偶尔</option>
            <option :value="2">经常</option>
            <option :value="3">每天</option>
          </select>
        </div>

        <button type="submit" class="oracle-btn" :disabled="loading">
          开始修炼
        </button>
      </form>

      <div v-if="error" class="error-msg">{{ error }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useStateStore } from '../stores/state'
import { useRouter } from 'vue-router'
import { api, toast } from '../utils/api'

const authStore = useAuthStore()
const stateStore = useStateStore()
const router = useRouter()

const form = ref({
  name: '',
  gender: 'male',
  age: 25,
  height: 170,
  weight: 65,
  smoke: 0,
  alcohol: 0,
  stayup: 0,
  exercise: 1,
  meditate: 0
})

const loading = ref(false)
const error = ref('')

async function submit() {
  error.value = ''
  loading.value = true

  try {
    await api('/profile/onboard', {
      method: 'POST',
      body: JSON.stringify(form.value)
    })

    toast('命盘注册成功！', 'gold')
    authStore.showOnboardingModal = false
    await stateStore.fetchState(true)
    router.push('/dashboard')
  } catch (err: any) {
    error.value = err.message || '注册失败'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.onboarding-modal {
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.subtitle {
  color: var(--ink-dim);
  margin-bottom: 24px;
  text-align: center;
}

.onboarding-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  color: var(--gold);
  font-size: 14px;
  font-weight: 600;
}

.form-group input,
.form-group select {
  padding: 10px;
  background: rgba(10,14,26,0.6);
  border: 1px solid rgba(212,175,55,0.3);
  border-radius: 6px;
  color: var(--ink);
  font-size: 14px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

@media (max-width: 600px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
