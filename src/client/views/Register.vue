<template>
  <div class="auth-page register">
    <!-- 赛博粒子效果 -->
    <div class="cyber-particles">
      <div v-for="i in 20" :key="i" class="particle" :style="particleStyle(i)"></div>
    </div>
    
    <!-- 道教符文漂浮 -->
    <div class="floating-runes">
      <span class="rune" v-for="(rune, i) in runes" :key="i" :style="runeStyle(i)">{{ rune }}</span>
    </div>
    
    <div class="auth-container">
      <div class="auth-card">
        <!-- 赛博边角装饰 -->
        <div class="corner-decoration corner-tl"></div>
        <div class="corner-decoration corner-tr"></div>
        <div class="corner-decoration corner-bl"></div>
        <div class="corner-decoration corner-br"></div>
        
        <!-- 扫描线 -->
        <div class="scan-line"></div>
        
        <div class="auth-header">
          <div class="title-glyph">☯</div>
          <h1 class="title-cn">天命测算</h1>
          <p class="title-en">Oracle of Fate</p>
          <p class="subtitle">降下，旋如天机门，测先辈上根骨</p>
        </div>

        <form @submit.prevent="handleRegister" class="auth-form">
          <div class="form-left">
            <div class="form-group">
              <label>道号</label>
              <input 
                v-model="username" 
                type="text" 
                placeholder="请输入道号"
                required
              />
            </div>

            <div class="form-group">
              <label>心法口诀</label>
              <input 
                v-model="password" 
                type="password" 
                placeholder="请输入心法口诀"
                required
              />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>年龄</label>
                <input 
                  v-model.number="age" 
                  type="number" 
                  placeholder="年龄"
                  min="1" 
                  max="100"
                  required
                />
              </div>
              <div class="form-group">
                <label>性别</label>
                <select v-model="gender" required>
                  <option value="male">乾身</option>
                  <option value="female">坤身</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>身高(cm)</label>
                <input 
                  v-model.number="height" 
                  type="number" 
                  placeholder="身高"
                  min="100" 
                  max="250"
                  required
                />
              </div>
              <div class="form-group">
                <label>体重(kg)</label>
                <input 
                  v-model.number="weight" 
                  type="number" 
                  placeholder="体重"
                  min="30" 
                  max="200"
                  required
                />
              </div>
            </div>

            <div class="form-group">
              <label>习性/恶习</label>
              <div class="checkbox-grid">
                <label class="checkbox-item">
                  <input type="checkbox" v-model="habits.smoke" />
                  <span>吸烟</span>
                </label>
                <label class="checkbox-item">
                  <input type="checkbox" v-model="habits.alcohol" />
                  <span>嗜酒</span>
                </label>
                <label class="checkbox-item">
                  <input type="checkbox" v-model="habits.stayup" />
                  <span>熬夜</span>
                </label>
                <label class="checkbox-item">
                  <input type="checkbox" v-model="habits.hereditary" />
                  <span>病史</span>
                </label>
                <label class="checkbox-item bad">
                  <input type="checkbox" v-model="habits.exercise" />
                  <span>习武</span>
                </label>
                <label class="checkbox-item bad">
                  <input type="checkbox" v-model="habits.meditate" />
                  <span>打坐</span>
                </label>
              </div>
            </div>
          </div>

          <div class="form-right">
            <div v-if="destiny" class="destiny-preview">
              <div class="destiny-item">
                <span class="label">天命寿元：</span>
                <span class="value">{{ destiny.maxYears.toFixed(1) }} 年</span>
              </div>
              <div class="destiny-item">
                <span class="label">剩余寿元：</span>
                <span class="value">{{ destiny.remainYears.toFixed(1) }} 年</span>
              </div>
              <div class="destiny-item">
                <span class="label">根骨评级：</span>
                <span :class="['value', destiny.grade]">{{ destiny.gradeText }}</span>
              </div>
              <div v-if="destiny.isLastChance" class="last-chance">
                ⚠️ 一线生机：逆天改命，初始功德 +100
              </div>
            </div>

            <button type="submit" class="submit-btn" :disabled="loading">
              {{ loading ? '测算中...' : '开 · 启 · 命 · 盘' }}
            </button>

            <div v-if="error" class="error-msg">{{ error }}</div>

            <div class="auth-footer">
              <span>已有命盘？</span>
              <router-link to="/login" class="link">返回登录</router-link>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { api } from '../utils/api'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const age = ref(25)
const gender = ref('male')
const height = ref(170)
const weight = ref(65)
const habits = ref({
  smoke: false,
  alcohol: false,
  stayup: false,
  hereditary: false,
  exercise: true,
  meditate: false
})
const loading = ref(false)
const error = ref('')

const runes = ['☯', '卍', '◈', '✦', '⚊', '⚋', '☰', '☷']

function particleStyle(i: number) {
  return {
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 5}s`,
    animationDuration: `${3 + Math.random() * 4}s`
  }
}

function runeStyle(i: number) {
  return {
    left: `${10 + Math.random() * 80}%`,
    top: `${10 + Math.random() * 80}%`,
    animationDelay: `${Math.random() * 3}s`,
    animationDuration: `${4 + Math.random() * 3}s`
  }
}

// 天命测算算法
const destiny = computed(() => {
  if (!age.value || !height.value || !weight.value) {
    return null
  }

  const heightM = height.value / 100
  const bmi = weight.value / (heightM * heightM)
  
  let delta = 1.0
  if (bmi < 18.5 || bmi > 28) {
    delta = 1.0 - (Math.abs(bmi - 23.2) * 0.02)
    delta = Math.max(delta, 0.5)
  } else if (bmi >= 18.5 && bmi <= 24) {
    delta = 1.0
  } else {
    delta = 1.0 - (Math.abs(bmi - 23.2) * 0.02)
    delta = Math.max(delta, 0.5)
  }
  
  const maxYears = 100 * delta
  const remainYears = maxYears - age.value
  const isLastChance = remainYears <= 0
  
  let grade = 'normal'
  let gradeText = '凡品'
  if (delta >= 0.95) {
    grade = 'excellent'
    gradeText = '上品'
  } else if (delta >= 0.85) {
    grade = 'good'
    gradeText = '中品'
  } else if (delta >= 0.7) {
    grade = 'normal'
    gradeText = '凡品'
  } else {
    grade = 'poor'
    gradeText = '下品'
  }
  
  if (isLastChance) {
    gradeText = '逆命'
    grade = 'last-chance'
  }
  
  return {
    bmi,
    delta,
    maxYears,
    remainYears: Math.max(remainYears, 0),
    isLastChance,
    grade,
    gradeText
  }
})

async function handleRegister() {
  error.value = ''
  loading.value = true
  
  try {
    if (!destiny.value) {
      error.value = '请填写完整信息'
      return
    }
    
    const res = await authStore.register(username.value, password.value)
    if (!res) {
      error.value = '注册失败'
      return
    }
    
    const remainSeconds = destiny.value.isLastChance 
      ? 3600
      : Math.max(1, destiny.value.remainYears * 31536000)
    
    const merit = destiny.value.isLastChance ? 100 : 0
    
    await api('/profile/onboard', {
      method: 'POST',
      body: JSON.stringify({
        name: username.value,
        gender: gender.value,
        age: age.value,
        height: height.value,
        weight: weight.value,
        smoke: habits.value.smoke ? 1 : 0,
        alcohol: habits.value.alcohol ? 1 : 0,
        stayup: habits.value.stayup ? 1 : 0,
        hereditary: habits.value.hereditary ? 1 : 0,
        exercise: habits.value.exercise ? 1 : 0,
        meditate: habits.value.meditate ? 1 : 0,
        initialLifeYears: remainSeconds / 31557600,  // 转换秒为年
        initialMerit: merit
      })
    })
    
    router.push('/dashboard')
  } catch (err: any) {
    error.value = err.message || '注册失败'
  } finally {
    loading.value = false
  }
}
</script>
