#!/usr/bin/env node

/**
 * 开发服务器启动脚本
 * 同时启动 Vite 开发服务器（前端）和 Wrangler（后端）
 */

import { spawn, exec } from 'child_process'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { promisify } from 'util'

const execAsync = promisify(exec)
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

console.log('🚀 启动开发服务器...\n')

let vite = null
let wranglerProcess = null
let isShuttingDown = false

// 杀掉占用指定端口的进程
async function killPort(port) {
  try {
    const { stdout } = await execAsync(`lsof -ti:${port}`)
    const pids = stdout.trim().split('\n').filter(Boolean)
    if (pids.length > 0) {
      console.log(`🔪 清理端口 ${port} 上的残留进程: ${pids.join(', ')}`)
      await execAsync(`kill -9 ${pids.join(' ')}`)
    }
  } catch (err) {
    // 端口未被占用，忽略错误
  }
}

// 构建服务器代码
async function buildServer() {
  console.log('🔨 构建服务器代码...')
  try {
    await execAsync('npx vite build --config vite.server.config.ts')
    console.log('✅ 服务器代码构建完成\n')
  } catch (err) {
    console.error('❌ 服务器构建失败:', err.message)
    process.exit(1)
  }
}

// 检查并初始化数据库
async function checkAndInitDatabase() {
  const dbPath = '.wrangler/state/v3/d1/miniflare-D1DatabaseObject/338bdf3d99df067ab93ef1cf1eb26b32e260ce07e7eeed83dedc4c72436e7938.sqlite'
  const fs = await import('fs')
  
  // 检查数据库文件是否存在
  if (!fs.existsSync(dbPath)) {
    console.log('🗄️  首次运行，初始化数据库...\n')
    try {
      // 应用迁移
      console.log('📋 应用数据库迁移...')
      await execAsync('npx wrangler d1 migrations apply webapp-production --local')
      console.log('✅ 迁移完成\n')
      
      // 导入种子数据
      console.log('🌱 导入种子数据（包含管理员账号）...')
      await execAsync('npx wrangler d1 execute webapp-production --local --file=./seed.sql')
      console.log('✅ 种子数据导入完成\n')
      
      console.log('📝 默认管理员账号：')
      console.log('   用户名: admin')
      console.log('   密码:   admin123\n')
    } catch (err) {
      console.error('❌ 数据库初始化失败:', err.message)
      console.log('\n💡 提示：你可以手动运行 ./init-db.sh 来初始化数据库\n')
    }
  }
}

// 清理函数
async function cleanup() {
  if (isShuttingDown) return
  isShuttingDown = true
  
  console.log('\n\n👋 关闭开发服务器...')
  
  // 先尝试优雅关闭
  if (vite && !vite.killed) {
    try {
      vite.kill('SIGTERM')
      // 如果是 shell 进程，也杀掉整个进程组
      if (vite.pid) {
        process.kill(-vite.pid, 'SIGTERM')
      }
    } catch (err) {
      // 忽略错误
    }
  }
  
  if (wranglerProcess && !wranglerProcess.killed) {
    try {
      wranglerProcess.kill('SIGTERM')
      if (wranglerProcess.pid) {
        process.kill(-wranglerProcess.pid, 'SIGTERM')
      }
    } catch (err) {
      // 忽略错误
    }
  }
  
  // 等待 500ms 后强制清理端口
  setTimeout(async () => {
    await killPort(5173)
    await killPort(8788)
    process.exit(0)
  }, 500)
}

// 启动前先清理可能占用的端口
await killPort(5173)
await killPort(8788)

// 检查并初始化数据库
await checkAndInitDatabase()

// 构建服务器代码
await buildServer()

// 启动 Wrangler（后端 API）
console.log('📡 启动后端 API 服务器 (port 8788)...')
wranglerProcess = spawn('npx', ['wrangler', 'pages', 'dev', 'dist', '--port', '8788', '--log-level', 'none'], {
  stdio: 'inherit',
  shell: true,
  detached: true,  // 创建新的进程组
  cwd: __dirname
})

// 等待 1 秒后启动 Vite
setTimeout(() => {
  console.log('\n🎨 启动前端开发服务器 (port 5173)...')
  vite = spawn('npx', ['vite', '--port', '5173'], {
    stdio: 'inherit',
    shell: true,
    detached: true,  // 创建新的进程组
    cwd: __dirname
  })

  vite.on('close', (code) => {
    if (!isShuttingDown) {
      console.log(`\n前端服务器退出，代码: ${code}`)
      cleanup()
    }
  })
}, 1000)

wranglerProcess.on('close', (code) => {
  if (!isShuttingDown) {
    console.log(`\n后端服务器退出，代码: ${code}`)
    cleanup()
  }
})

// 处理各种退出信号
process.on('SIGINT', cleanup)
process.on('SIGTERM', cleanup)
process.on('SIGHUP', cleanup)
process.on('exit', cleanup)

// 捕获未处理的异常
process.on('uncaughtException', (err) => {
  console.error('未捕获的异常:', err)
  cleanup()
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的 Promise 拒绝:', reason)
  cleanup()
})
