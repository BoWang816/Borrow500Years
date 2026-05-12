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
      <router-link to="/admin/potions" class="admin-nav-item" active-class="active">
        丹药记录
      </router-link>
      <router-link to="/admin/potions-config" class="admin-nav-item" active-class="active">
        丹药配置
      </router-link>
      <router-link to="/admin/logs" class="admin-nav-item" active-class="active">
        操作日志
      </router-link>
      <router-link to="/admin/events" class="admin-nav-item" active-class="active">
        全服事件
      </router-link>
      <router-link to="/admin/manuals" class="admin-nav-item" active-class="active">
        功法管理
      </router-link>
      <router-link to="/admin/tasks" class="admin-nav-item" active-class="active">
        修炼项目
      </router-link>
      <router-link to="/admin/explore" class="admin-nav-item" active-class="active">
        历练项目
      </router-link>
    </div>

    <div class="admin-content">
      <router-view />
    </div>
  </div>
</template>

<style scoped>
.admin-nav {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.admin-nav-item {
  padding: 8px 16px;
  background: rgba(212,175,55,0.1);
  border: 1px solid rgba(212,175,55,0.3);
  border-radius: 6px;
  color: var(--gold);
  text-decoration: none;
  transition: all 0.3s;
}

.admin-nav-item:hover,
.admin-nav-item.active {
  background: rgba(212,175,55,0.2);
  border-color: var(--gold);
}
</style>
