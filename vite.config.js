import { fileURLToPath, URL } from 'node:url'
import fs from 'node:fs'
import path from 'node:path'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// edu-audio 根目录
const audioBase = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../edu-audio')

/**
 * 解析 LRC 文件内容，转换为句子数组
 * @param {string} lrcPath - LRC 文件路径
 * @returns {Array} 句子对象数组 [{ time: number, en: string }]
 */
function parseLrc(lrcPath) {
  if (!fs.existsSync(lrcPath)) return []
  const content = fs.readFileSync(lrcPath, 'utf-8')
  const lines = content.split(/\r?\n/)
  const sentences = []
  for (const line of lines) {
    const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2})\](.*)/)
    if (match) {
      const minutes = parseInt(match[1])
      const seconds = parseInt(match[2])
      const millis = parseInt(match[3]) * 10
      const time = (minutes * 60 + seconds) * 1000 + millis
      const text = match[4].trim()
      if (text) {
        sentences.push({ time, en: text })
      }
    }
  }
  return sentences
}

/**
 * 静态资源映射插件
 * 将 edu-audio 目录下的 mp3 和 lrc 文件映射到 dev server 虚拟路径
 */
function serveEduAudio() {
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

/**
 * Mock API 插件
 * 模拟后端接口响应，便于前端开发调试
 */
function mockApi() {
  return {
    name: 'mock-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url || ''
        // 仅处理 /api 开头的 GET 请求
        if (!url.startsWith('/api/') || req.method !== 'GET') {
          return next()
        }

        // 解析路径和查询参数
        const urlObj = new URL(`http://localhost${url}`)
        const pathname = urlObj.pathname

        // 设置响应头
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        res.setHeader('Access-Control-Allow-Origin', '*')

        // GET /api/books - 课本列表
        if (pathname === '/api/books') {
          const data = {
            code: 200,
            message: 'success',
            data: [
              {
                id: 1,
                name: '六年级上册',
                desc: '人教版 PEP · 三年级起点',
                emoji: '📘',
                coverColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              },
              {
                id: 2,
                name: '六年级下册',
                desc: '人教版 PEP · 三年级起点',
                emoji: '📗',
                coverColor: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
              },
              {
                id: 3,
                name: '五年级上册',
                desc: '人教版 PEP · 三年级起点',
                emoji: '📙',
                coverColor: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
              }
            ]
          }
          res.end(JSON.stringify(data))
          return
        }

        // GET /api/units/:id - 单元列表
        const unitsMatch = pathname.match(/^\/api\/units\/(\d+)$/)
        if (unitsMatch) {
          const bookId = unitsMatch[1]
          const data = {
            code: 200,
            message: 'success',
            data: {
              bookId: parseInt(bookId),
              bookName: '六年级上册',
              units: [
                { id: 1, number: 'Unit 1', title: 'Hello', topic: '你好' },
                { id: 2, number: 'Unit 2', title: 'Colours', topic: '颜色' },
                { id: 3, number: 'Unit 3', title: 'Look at me', topic: '看着我' },
                { id: 4, number: 'Unit 4', title: 'We love animals', topic: '我们爱动物' },
                { id: 5, number: 'Unit 5', title: 'Let\'s eat', topic: '让我们吃' },
                { id: 6, number: 'Unit 6', title: 'Happy birthday', topic: '生日快乐' }
              ]
            }
          }
          res.end(JSON.stringify(data))
          return
        }

        // GET /api/content/:id - 课文内容（音频URL + 句子列表）
        const contentMatch = pathname.match(/^\/api\/content\/(\d+)$/)
        if (contentMatch) {
          const unitId = contentMatch[1]
          // 读取 LRC 文件解析句子
          const lrcPath = path.join(audioBase, 'lrc-source', 'text1.lrc')
          const lrcSentences = parseLrc(lrcPath)

          // 组装句子数据：英文从 LRC 获取，中文用静态翻译
          const zhMap = {
            'Listen and sing.': '听一听，唱一唱。',
            'Travelling Around.': '环游世界。'
          }

          const sentences = lrcSentences.map((s, index) => ({
            id: index + 1,
            time: s.time,
            en: s.en,
            zh: zhMap[s.en] || ''
          }))

          const data = {
            code: 200,
            message: 'success',
            data: {
              unitId: parseInt(unitId),
              audioUrl: '/audio/text1.mp3',
              lrcUrl: '/lrc/text1.lrc',
              totalDuration: 61820,
              sentences
            }
          }
          res.end(JSON.stringify(data))
          return
        }

        // 未匹配的 /api 路径，返回 404
        res.statusCode = 404
        res.end(JSON.stringify({ code: 404, message: 'API not found' }))
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
    mockApi(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
