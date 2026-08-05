import { fileURLToPath, URL } from 'node:url'
import fs from 'node:fs'
import path from 'node:path'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

/**
 * 静态资源映射插件
 * 将 edu-audio 目录下的 mp3 和 lrc 文件映射到 dev server 虚拟路径
 */
function serveEduAudio() {
  // edu-audio 根目录（基于当前 vite.config.js 所在目录的上级）
  const audioBase = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../edu-audio')
  return {
    name: 'serve-edu-audio',
    configureServer(server) {
      // /audio/* 映射到 edu-audio/mp3/
      // /lrc/* 映射到 edu-audio/lrc-source/
      server.middlewares.use((req, res, next) => {
        const url = req.url || ''
        let filePath = null
        if (url.startsWith('/audio/')) {
          filePath = path.join(audioBase, 'mp3', url.slice('/audio/'.length))
        } else if (url.startsWith('/lrc/')) {
          filePath = path.join(audioBase, 'lrc-source', url.slice('/lrc/'.length))
        }
        if (filePath && fs.existsSync(filePath)) {
          const stat = fs.statSync(filePath)
          res.setHeader('Content-Length', stat.size)
          res.setHeader('Access-Control-Allow-Origin', '*')
          fs.createReadStream(filePath).pipe(res)
          return
        }
        next()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    serveEduAudio(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
