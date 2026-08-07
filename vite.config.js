import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// 后端服务器地址
const backendTarget = 'http://192.168.1.106:8080'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  // 开发服务器配置
  server: {
    // 允许局域网设备（手机）访问
    host: '0.0.0.0',
    port: 5173,
    // 代理配置：始终转发到真实后端
    proxy: {
      // API 接口代理 - 保留 /api 前缀
      '/api': {
        target: backendTarget,
        changeOrigin: true,
      },
      // 音频文件代理 - 保留 /audio 前缀
      '/audio': {
        target: backendTarget,
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
