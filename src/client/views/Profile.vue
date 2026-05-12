<template>
  <div class="page profile-page">
    <h2 class="page-title">
      <span class="cn">道号印鉴</span>
      <span class="en">Profile</span>
    </h2>
    <div class="container" v-if="stateStore.profile">
      <div class="card profile-card">
        <h3><i class="fas fa-user-circle"></i> 个人信息</h3>
        <div class="profile-info">
          <div class="info-row">
            <span class="label">道号</span>
            <span class="value">{{ stateStore.profile.name }}</span>
          </div>
          <div class="info-row">
            <span class="label">境界</span>
            <span class="value">{{ stateStore.profile.realm }}</span>
          </div>
          <div class="info-row">
            <span class="label">功德</span>
            <span class="value">{{ stateStore.profile.merit }}</span>
          </div>
          <div class="info-row">
            <span class="label">复活币</span>
            <span class="value">{{ stateStore.profile.coin }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useStateStore } from '../stores/state'

const stateStore = useStateStore()
</script>
