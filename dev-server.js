#!/usr/bin/env node

/**
 * 开发服务器启动脚本
 * 同时启动 Vite 开发服务器（前端）和 Wrangler（后端）
 */

import { spawn } from 'child_process'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

console.log('🚀 启动开发服务器...\n')

// 启动 Wrangler（后端 API）
console.log('📡 启动后端 API 服务器 (port 8788)...')
const wrangler = spawn('npx', ['wrangler', 'pages', 'dev', 'dist', '--port', '8788', '--log-level', 'none'], {
  stdio: 'inherit',
  shell: true,
  cwd: __dirname
})

// 等待 1 秒后启动 Vite
setTimeout(() => {
  console.log('\n🎨 启动前端开发服务器 (port 5173)...')
  const vite = spawn('npx', ['vite', '--port', '5173'], {
    stdio: 'inherit',
    shell: true,
    cwd: __dirname
  })

  vite.on('close', (code) => {
    console.log(`\n前端服务器退出，代码: ${code}`)
    wrangler.kill()
    process.exit(code)
  })
}, 1000)

wrangler.on('close', (code) => {
  console.log(`\n后端服务器退出，代码: ${code}`)
  process.exit(code)
})

// 处理退出信号
process.on('SIGINT', () => {
  console.log('\n\n👋 关闭开发服务器...')
  wrangler.kill()
  process.exit(0)
})
