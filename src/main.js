import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index.js'
import { playSegment, stop, pause, resume, getCurrentTime, getDuration } from './utils/audioPlayer.js'

// 创建 Vue 应用实例
const app = createApp(App)

// 挂载路由
app.use(router)

// 挂载到 DOM
app.mount('#app')

// 将音频引擎方法挂载到 window，便于浏览器控制台调试测试
window.playSegment = playSegment
window.stop = stop
window.pause = pause
window.resume = resume
window.getCurrentTime = getCurrentTime
window.getDuration = getDuration