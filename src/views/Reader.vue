<template>
  <!-- 点读主界面 -->
  <div class="reader">
    <!-- 顶部导航栏 -->
    <header class="nav-bar">
      <button class="back-btn" @click="goBack">
        <span class="back-icon">←</span>
      </button>
      <h1 class="nav-title">{{ unitTitle }}</h1>
      <button class="menu-btn">⋯</button>
    </header>

    <!-- 加载中状态 -->
    <div v-if="loading" class="loading">加载中...</div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <button class="retry-btn" @click="fetchContent">重试</button>
    </div>

    <template v-else>
      <!-- 音频控制条 -->
      <div class="audio-bar">
        <!-- 播放控制 -->
        <div class="audio-controls">
          <button class="ctrl-btn" @click="prevSentence">
            <span class="ctrl-icon">⏮</span>
          </button>
          <button class="play-btn" @click="togglePlay">
            <span class="play-icon">{{ isPlaying ? '⏸' : '▶' }}</span>
          </button>
          <button class="ctrl-btn" @click="nextSentence">
            <span class="ctrl-icon">⏭</span>
          </button>
        </div>
        <!-- 进度条 -->
        <div class="progress-wrap">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: progress + '%' }"></div>
          </div>
          <div class="time-display">
            <span>{{ currentTimeLabel }}</span>
            <span>{{ totalTimeLabel }}</span>
          </div>
        </div>
        <!-- 语速控制 -->
        <div class="speed-control">
          <span class="speed-label">速度</span>
          <div class="speed-options">
            <button
              v-for="s in speeds"
              :key="s"
              class="speed-btn"
              :class="{ active: currentSpeed === s }"
              @click="changeSpeed(s)"
            >
              {{ s }}x
            </button>
          </div>
        </div>
      </div>

      <!-- 句子列表 -->
      <div class="sentence-list" ref="listRef">
        <div
          v-for="(sentence, index) in sentences"
          :key="index"
          class="sentence-block"
          :class="{ active: currentIndex === index }"
          :data-index="index"
          @click="handleSentenceClick(index)"
        >
          <div class="sentence-number">{{ index + 1 }}</div>
          <div class="sentence-content">
            <p class="sentence-en">{{ sentence.en }}</p>
            <p class="sentence-zh">{{ sentence.zh }}</p>
          </div>
          <div class="sentence-play" v-if="currentIndex === index && isPlaying">
            <span class="playing-animation">🔊</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import request from '../utils/request'
import {
  playSegment,
  stop as stopAudio,
  pause as pauseAudio,
  resume as resumeAudio,
  onTimeUpdate,
  offTimeUpdate,
  setPlaybackRate,
  getCurrentTime,
  getDuration
} from '../utils/audioPlayer.js'

const router = useRouter()
const route = useRoute()

// 从路由参数获取单元 ID 和标题
const unitId = computed(() => route.query.unit || 1)
const unitTitle = computed(() => route.query.title || 'Unit 1')

// 响应式数据
const sentences = ref([])
const audioUrl = ref('')
const loading = ref(true)
const error = ref('')

// 音频总时长（毫秒）
const totalDuration = ref(0)

// 播放状态
const isPlaying = ref(false)
const currentIndex = ref(0)
const currentSpeed = ref('1.0')
const speeds = ['0.5', '0.75', '1.0', '1.25', '1.5']

// 时间显示
const currentTimeLabel = ref('00:00')
const totalTimeLabel = ref('00:00')
const progress = ref(0)

// 句子列表 DOM 引用
const listRef = ref(null)

// timeupdate 回调引用（用于解绑）
let timeUpdateCallback = null

/**
 * 获取课文内容数据
 */
const fetchContent = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await request.get(`/content/${unitId.value}`)
    if (res.code === 200) {
      const data = res.data
      audioUrl.value = data.audioUrl
      totalDuration.value = data.totalDuration || 0
      totalTimeLabel.value = formatTime(totalDuration.value)
      // 为每个句子计算 endTime（使用下一句的 time 或音频总时长）
      const rawSentences = data.sentences || []
      sentences.value = rawSentences.map((s, i) => ({
        ...s,
        startTime: s.time,
        endTime: i < rawSentences.length - 1
          ? rawSentences[i + 1].time
          : totalDuration.value
      }))
    } else {
      error.value = res.message || '获取数据失败'
    }
  } catch (err) {
    error.value = err.message || '网络异常，请稍后重试'
  } finally {
    loading.value = false
  }
}

/**
 * 将毫秒数格式化为 mm:ss
 * @param {number} ms - 毫秒数
 * @returns {string} 格式化后的时间字符串
 */
const formatTime = (ms) => {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

/**
 * 返回上一页
 */
const goBack = () => {
  stopAudio()
  cleanupListeners()
  router.back()
}

/**
 * 处理 timeupdate 事件：更新高亮句子、进度条
 * @param {number} currentTimeMs - 当前播放时间（毫秒）
 */
const handleTimeUpdate = (currentTimeMs) => {
  // 更新进度条
  if (totalDuration.value > 0) {
    progress.value = Math.min(100, (currentTimeMs / totalDuration.value) * 100)
  }
  currentTimeLabel.value = formatTime(currentTimeMs)

  // 根据当前时间查找对应句子
  const idx = findSentenceIndex(currentTimeMs)
  if (idx !== -1 && idx !== currentIndex.value) {
    currentIndex.value = idx
    // 自动滚动到当前句子
    scrollToSentence(idx)
  }
}

/**
 * 根据时间查找对应的句子索引
 * @param {number} timeMs - 当前时间（毫秒）
 * @returns {number} 句子索引，未找到返回 -1
 */
const findSentenceIndex = (timeMs) => {
  const list = sentences.value
  for (let i = 0; i < list.length; i++) {
    if (timeMs >= list[i].startTime && timeMs < list[i].endTime) {
      return i
    }
  }
  return -1
}

/**
 * 滚动到指定句子
 * @param {number} index - 句子索引
 */
const scrollToSentence = (index) => {
  nextTick(() => {
    const container = listRef.value
    if (!container) return
    const target = container.querySelector(`[data-index="${index}"]`)
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      })
    }
  })
}

/**
 * 初始化 timeupdate 监听
 */
const initListeners = () => {
  timeUpdateCallback = handleTimeUpdate
  onTimeUpdate(timeUpdateCallback)
}

/**
 * 清理 timeupdate 监听
 */
const cleanupListeners = () => {
  if (timeUpdateCallback) {
    offTimeUpdate(timeUpdateCallback)
    timeUpdateCallback = null
  }
}

/**
 * 点击句子：触发播放 + 高亮 + 滚动
 * @param {number} index - 句子索引
 */
const handleSentenceClick = (index) => {
  const sentence = sentences.value[index]
  if (!sentence || !audioUrl.value) return

  // 先停止旧播放，再播放新片段
  stopAudio()
  playSegment(audioUrl.value, sentence.startTime)

  // 设置播放状态
  isPlaying.value = true
  currentIndex.value = index

  // 设置播放倍速
  setPlaybackRate(parseFloat(currentSpeed.value))

  // 绑定 timeupdate 监听
  initListeners()

  // 滚动到该句子
  scrollToSentence(index)
}

/**
 * 切换播放/暂停
 */
const togglePlay = () => {
  if (isPlaying.value) {
    pauseAudio()
    isPlaying.value = false
  } else {
    if (audioUrl.value) {
      // 如果没有在播放任何内容，从当前句子开始
      if (getCurrentTime() === 0 || getCurrentTime() < sentences.value[currentIndex.value]?.startTime) {
        handleSentenceClick(currentIndex.value)
      } else {
        resumeAudio()
      }
    }
    isPlaying.value = true
  }
}

/**
 * 上一句
 */
const prevSentence = () => {
  if (currentIndex.value > 0) {
    handleSentenceClick(currentIndex.value - 1)
  }
}

/**
 * 下一句
 */
const nextSentence = () => {
  if (currentIndex.value < sentences.value.length - 1) {
    handleSentenceClick(currentIndex.value + 1)
  }
}

/**
 * 切换播放速度
 * @param {string} speed - 倍速值
 */
const changeSpeed = (speed) => {
  currentSpeed.value = speed
  setPlaybackRate(parseFloat(speed))
}

// 组件挂载时获取数据
onMounted(async () => {
  await fetchContent()
})

// 组件卸载时清理资源
onBeforeUnmount(() => {
  stopAudio()
  cleanupListeners()
})
</script>

<style scoped>
/* 页面容器 */
.reader {
  min-height: 100vh;
  background: #f5f7fa;
  display: flex;
  flex-direction: column;
}

/* 顶部导航栏 */
.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  position: sticky;
  top: 0;
  z-index: 10;
}

.back-btn,
.menu-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  font-size: 20px;
  color: #333;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s;
}

.back-btn:active,
.menu-btn:active {
  background: #f0f0f0;
}

.nav-title {
  font-size: 17px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

/* 音频控制条 */
.audio-bar {
  background: #fff;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

/* 播放控制 */
.audio-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
}

.ctrl-btn {
  width: 40px;
  height: 40px;
  border: none;
  background: #f5f5f5;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.ctrl-btn:active {
  background: #e0e0e0;
}

.ctrl-icon {
  font-size: 16px;
  color: #666;
}

.play-btn {
  width: 56px;
  height: 56px;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
  transition: transform 0.2s;
}

.play-btn:active {
  transform: scale(0.95);
}

.play-btn .play-icon {
  font-size: 22px;
  color: #fff;
}

/* 进度条 */
.progress-wrap {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.progress-bar {
  height: 4px;
  background: #e8e8e8;
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 2px;
  transition: width 0.1s linear;
}

.time-display {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #999;
}

/* 语速控制 */
.speed-control {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
}

.speed-label {
  font-size: 12px;
  color: #999;
}

.speed-options {
  display: flex;
  gap: 4px;
}

.speed-btn {
  padding: 4px 10px;
  font-size: 12px;
  border: 1px solid #e0e0e0;
  background: #fff;
  border-radius: 12px;
  cursor: pointer;
  color: #666;
  transition: all 0.2s;
}

.speed-btn.active {
  background: #667eea;
  color: #fff;
  border-color: #667eea;
}

/* 句子列表 */
.sentence-list {
  flex: 1;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 700px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
  overflow-y: auto;
}

/* 句子块 */
.sentence-block {
  display: flex;
  align-items: flex-start;
  background: #fff;
  border-radius: 12px;
  padding: 14px 16px;
  gap: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
  scroll-margin: 80px;
}

.sentence-block.active {
  border-color: #f5a623;
  background: linear-gradient(135deg, rgba(255, 214, 102, 0.2) 0%, rgba(255, 165, 0, 0.1) 100%);
  box-shadow: 0 2px 8px rgba(245, 166, 35, 0.3);
}

.sentence-block:active {
  transform: scale(0.99);
}

/* 句子编号 */
.sentence-number {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 600;
  color: #666;
  flex-shrink: 0;
}

.sentence-block.active .sentence-number {
  background: #f5a623;
  color: #fff;
}

/* 句子内容 */
.sentence-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sentence-en {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin: 0;
  line-height: 1.5;
}

.sentence-block.active .sentence-en {
  color: #d48806;
}

.sentence-zh {
  font-size: 13px;
  color: #999;
  margin: 0;
  line-height: 1.4;
}

.sentence-block.active .sentence-zh {
  color: #b36b00;
}

/* 播放动画 */
.sentence-play {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.playing-animation {
  font-size: 18px;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

/* 加载中状态 */
.loading {
  text-align: center;
  padding: 60px 0;
  font-size: 14px;
  color: #999;
}

/* 错误状态 */
.error {
  text-align: center;
  padding: 60px 0;
  color: #e74c3c;
}

.error p {
  margin: 0 0 16px;
  font-size: 14px;
}

.retry-btn {
  padding: 8px 24px;
  background: #667eea;
  color: #fff;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  border: none;
}

.retry-btn:active {
  background: #5568d3;
}
</style>
