import { Hono } from 'hono'
import { serveStatic } from 'hono/cloudflare-pages'
import type { Bindings } from './types'
import api from './api'

const app = new Hono<{ Bindings: Bindings }>()

// API routes
app.route('/api', api)

// Serve static files and SPA fallback
app.get('*', serveStatic({ root: './' }))
app.get('*', serveStatic({ path: './index.html' }))

export default app
