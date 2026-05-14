import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { title: '登录 · 向天再借500年' }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue'),
    meta: { title: '注册 · 向天再借500年' }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: { requiresAuth: true, title: '命脉 · Dashboard' }
  },
  {
    path: '/cultivation',
    name: 'Cultivation',
    component: () => import('../views/Cultivation.vue'),
    meta: { requiresAuth: true, title: '养生修炼 · Cultivation' }
  },
  {
    path: '/cultivation-practices',
    name: 'CultivationPractices',
    component: () => import('../views/CultivationPractices.vue'),
    meta: { requiresAuth: true, title: '修炼项目 · Practices' }
  },
  {
    path: '/inventory',
    name: 'Inventory',
    component: () => import('../views/Inventory.vue'),
    meta: { requiresAuth: true, title: '丹房 · Inventory' }
  },
  {
    path: '/adventure',
    name: 'Adventure',
    component: () => import('../views/Adventure.vue'),
    meta: { requiresAuth: true, title: '历练 · Adventure' }
  },
  {
    path: '/leaderboard',
    name: 'Leaderboard',
    component: () => import('../views/Leaderboard.vue'),
    meta: { requiresAuth: true, title: '天榜 · Leaderboard' }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/Profile.vue'),
    meta: { requiresAuth: true, title: '道号印鉴 · Profile' }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('../views/admin/AdminLayout.vue'),
    meta: { requiresAuth: true, requiresAdmin: true, title: '运管后台 · Admin' },
    children: [
      {
        path: '',
        redirect: '/admin/overview'
      },
      {
        path: 'overview',
        name: 'AdminOverview',
        component: () => import('../views/admin/AdminOverview.vue')
      },
      {
        path: 'potions',
        name: 'AdminPotions',
        component: () => import('../views/admin/AdminPotions.vue')
      },
      {
        path: 'potions-config',
        name: 'AdminPotionsConfig',
        component: () => import('../views/admin/AdminPotionsConfig.vue')
      },
      {
        path: 'logs',
        name: 'AdminLogs',
        component: () => import('../views/admin/AdminLogs.vue')
      },
      {
        path: 'events',
        name: 'AdminEvents',
        component: () => import('../views/admin/AdminEvents.vue')
      },
      {
        path: 'cultivation-practices',
        name: 'AdminCultivationPractices',
        component: () => import('../views/admin/AdminCultivationPractices.vue')
      },
      {
        path: 'wellness-tasks',
        name: 'AdminWellnessTasks',
        component: () => import('../views/admin/AdminWellnessTasksUnified.vue')
      },
      {
        path: 'explore',
        name: 'AdminExplore',
        component: () => import('../views/admin/AdminExplore.vue')
      },
      {
        path: 'realms',
        name: 'AdminRealms',
        component: () => import('../views/admin/AdminRealms.vue')
      },
      {
        path: 'fortune',
        name: 'AdminFortune',
        component: () => import('../views/admin/AdminFortune.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.title) {
    document.title = `${to.meta.title}`
  }

  // 如果需要认证但未登录，重定向到登录页
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
    return
  }

  // 如果已登录且访问登录/注册页，重定向到dashboard
  if ((to.path === '/login' || to.path === '/register') && authStore.isAuthenticated) {
    next('/dashboard')
    return
  }

  // 如果需要管理员权限，先检查管理员状态
  if (to.meta.requiresAdmin) {
    // 如果还没有检查过管理员状态，先检查
    if (!authStore.adminChecked) {
      await authStore.checkAdmin()
    }
    
    // 检查后如果不是管理员，重定向
    if (!authStore.isAdmin) {
      next('/dashboard')
      return
    }
  }

  next()
})

export default router
