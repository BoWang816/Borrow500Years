<template>
  <section id="profile" class="tab-pane active">
    <h2 class="page-title">
      <span class="cn">道号印鉴</span>
      <span class="en">Profile</span>
    </h2>
    
    <div v-if="stateStore.profile" class="profile-card">
      <div class="avatar-wrap">
        <div class="avatar">
          <span>{{ stateStore.profile.name?.charAt(0) || '道' }}</span>
        </div>
        <div class="avatar-ring"></div>
      </div>
      <div class="profile-info">
        <div class="pi-row">
          <span class="pi-label">道号</span>
          <span class="pi-value">{{ stateStore.profile.name }}</span>
        </div>
        <div class="pi-row">
          <span class="pi-label">境界</span>
          <span class="pi-value">{{ stateStore.profile.realm }}</span>
        </div>
        <div class="pi-row">
          <span class="pi-label">性别</span>
          <span class="pi-value">{{ stateStore.profile.gender === 'male' ? '男' : '女' }}</span>
        </div>
        <div class="pi-row">
          <span class="pi-label">年龄</span>
          <span class="pi-value">{{ stateStore.profile.age }} 岁</span>
        </div>
        <div class="pi-row">
          <span class="pi-label">身高</span>
          <span class="pi-value">{{ stateStore.profile.height }} cm</span>
        </div>
        <div class="pi-row">
          <span class="pi-label">体重</span>
          <span class="pi-value">{{ stateStore.profile.weight }} kg</span>
        </div>
        <div class="pi-row">
          <span class="pi-label">BMI</span>
          <span class="pi-value">{{ stateStore.profile.bmi?.toFixed(1) }}</span>
        </div>
        <div class="pi-row">
          <span class="pi-label">初始寿命</span>
          <span class="pi-value">{{ formatLife(stateStore.profile.initialLifeSec) }}</span>
        </div>
        <div class="pi-row">
          <span class="pi-label">累计增益</span>
          <span class="pi-value" style="color: var(--jade);">+{{ formatLife(stateStore.profile.totalGainedSec) }}</span>
        </div>
        <div class="pi-row">
          <span class="pi-label">功德值</span>
          <span class="pi-value" style="color: var(--gold-soft);">{{ stateStore.profile.merit }}</span>
        </div>
        <div class="pi-row">
          <span class="pi-label">复活币</span>
          <span class="pi-value">{{ stateStore.profile.coin }}</span>
        </div>
        <div class="pi-row">
          <span class="pi-label">碎片</span>
          <span class="pi-value">{{ stateStore.profile.shard }} / 5</span>
        </div>
        <div class="pi-row">
          <span class="pi-label">连续签到</span>
          <span class="pi-value">{{ stateStore.profile.streak }} 天</span>
        </div>
      </div>
    </div>

    <div class="formula-card">
      <h3>核心寿命公式</h3>
      <pre class="formula">L_current = L_initial + Σ L_gain − (T_now − T_start) × R_decay</pre>
      <p class="formula-note">L_gain：养生行为增量 · R_decay：衰减系数（受作息、心情等加成影响）</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useStateStore } from '../stores/state'
import { formatLife } from '../utils/api'

const stateStore = useStateStore()
</script>
