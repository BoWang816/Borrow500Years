import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard'
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
        path: 'manuals',
        name: 'AdminManuals',
        component: () => import('../views/admin/AdminManuals.vue')
      },
      {
        path: 'tasks',
        name: 'AdminTasks',
        component: () => import('../views/admin/AdminTasks.vue')
      },
      {
        path: 'explore',
        name: 'AdminExplore',
        component: () => import('../views/admin/AdminExplore.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.title) {
    document.title = `${to.meta.title} · 向天再借500年`
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    authStore.showAuthModal = true
    next(false)
    return
  }

  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    next('/dashboard')
    return
  }

  next()
})

export default router
