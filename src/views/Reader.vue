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
            <span>{{ currentTime }}</span>
            <span>{{ totalTime }}</span>
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
              @click="currentSpeed = s"
            >
              {{ s }}x
            </button>
          </div>
        </div>
      </div>

      <!-- 句子列表 -->
      <div class="sentence-list">
        <div
          v-for="(sentence, index) in sentences"
          :key="index"
          class="sentence-block"
          :class="{ active: currentIndex === index }"
          @click="playSentence(index)"
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
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import request from '../utils/request'

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

// 播放状态
const isPlaying = ref(false)
const currentIndex = ref(0)
const currentSpeed = ref('1.0')
const speeds = ['0.5', '0.75', '1.0', '1.25', '1.5']

// 时间显示
const currentTime = ref('00:00')
const totalTime = ref('00:00')
const progress = ref(0)

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
      sentences.value = data.sentences
      // 格式化总时长
      totalTime.value = formatTime(data.totalDuration)
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
  router.back()
}

/**
 * 切换播放/暂停
 */
const togglePlay = () => {
  isPlaying.value = !isPlaying.value
}

/**
 * 播放指定句子
 * @param {number} index - 句子索引
 */
const playSentence = (index) => {
  currentIndex.value = index
  isPlaying.value = true
}

/**
 * 上一句
 */
const prevSentence = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
  }
}

/**
 * 下一句
 */
const nextSentence = () => {
  if (currentIndex.value < sentences.value.length - 1) {
    currentIndex.value++
  }
}

// 组件挂载时获取数据
onMounted(fetchContent)
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
  transition: width 0.3s ease;
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
}

.sentence-block.active {
  border-color: #667eea;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
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
  background: #667eea;
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

.sentence-zh {
  font-size: 13px;
  color: #999;
  margin: 0;
  line-height: 1.4;
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