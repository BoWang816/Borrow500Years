import { Hono } from 'hono'
import { renderer } from './renderer'
import api from './api'
import type { Bindings } from './types'

// 页面组件
import {
  Background, Header, CrisisOverlay,
  AuthModal, OnboardingModal,
  Dashboard, Fortune, Cultivation, Inventory,
  Adventure, Leaderboard, Profile,
  Admin, AdminOverview, AdminPotions, AdminLogs, AdminEvents,
  AdminManuals, AdminTasks, AdminExplore, AdminPotionsConfig
} from './pages'

const app = new Hono<{ Bindings: Bindings }>()

app.route('/api', api)

app.use(renderer)

// 页面渲染函数
const renderMainPage = (c: any) => {
  return c.render(
    <>
      <Background />
      <Header />

      <AuthModal />
      <OnboardingModal />

      <main class="main">
        <Dashboard />
        <Fortune />
        <Cultivation />
        <Inventory />
        <Adventure />
        <Leaderboard />
        <Profile />
        <Admin />
        <AdminOverview />
        <AdminPotions />
        <AdminLogs />
        <AdminEvents />
        <AdminManuals />
        <AdminTasks />
        <AdminExplore />
        <AdminPotionsConfig />
      </main>

      <CrisisOverlay />
    </>
  )
}

// 根路由
app.get('/', renderMainPage)

// 前端路由路径 - SPA fallback
const FRONTEND_ROUTES = [
  '/dashboard',
  '/fortune',
  '/cultivation',
  '/inventory',
  '/adventure',
  '/leaderboard',
  '/profile',
  '/admin',
  '/admin/overview',
  '/admin/potions',
  '/admin/logs',
  '/admin/events',
  '/admin/manuals',
  '/admin/tasks',
  '/admin/explore',
  '/admin/potions-config'
]

FRONTEND_ROUTES.forEach(path => {
  app.get(path, renderMainPage)
})

export default app
