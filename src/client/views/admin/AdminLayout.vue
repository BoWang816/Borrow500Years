<template>
  <div class="page admin-page">
    <h2 class="page-title">
      <span class="cn">运管后台</span>
      <span class="en">Admin</span>
    </h2>

    <div class="admin-nav">
      <router-link to="/admin/overview" class="admin-nav-item" active-class="active">
        平台概览
      </router-link>
      <router-link to="/admin/realms" class="admin-nav-item" active-class="active">
        境界管理
      </router-link>
      <router-link to="/admin/potions-config" class="admin-nav-item" active-class="active">
        丹药配置
      </router-link>
      <router-link to="/admin/manuals" class="admin-nav-item" active-class="active">
        功法管理
      </router-link>
      <router-link to="/admin/tasks" class="admin-nav-item" active-class="active">
        修炼项目
      </router-link>
      <router-link to="/admin/wellness-tasks" class="admin-nav-item" active-class="active">
        养生任务
      </router-link>
      <router-link to="/admin/explore" class="admin-nav-item" active-class="active">
        历练项目
      </router-link>
      <router-link to="/admin/events" class="admin-nav-item" active-class="active">
        全服事件
      </router-link>
      <router-link to="/admin/potions" class="admin-nav-item" active-class="active">
        丹药记录
      </router-link>
      <router-link to="/admin/logs" class="admin-nav-item" active-class="active">
        操作日志
      </router-link>
    </div>

    <div class="admin-content">
      <router-view />
    </div>
  </div>
</template>
