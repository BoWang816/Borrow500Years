import build from '@hono/vite-build/cloudflare-pages'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    build({ entry: 'src/server/index.ts' })
  ]
})
