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
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 从路由参数获取单元标题
const unitTitle = computed(() => route.query.title || 'Unit 1')

// 播放状态
const isPlaying = ref(false)
const currentIndex = ref(0)
const currentSpeed = ref('1.0')
const speeds = ['0.5', '0.75', '1.0', '1.25', '1.5']

// 时间显示
const currentTime = ref('00:00')
const totalTime = ref('03:24')
const progress = ref(0)

// 句子列表静态数据
const sentences = ref([
  { en: 'Hello!', zh: '你好！' },
  { en: 'Hi, Mike!', zh: '嗨，迈克！' },
  { en: 'Let\'s go to school.', zh: '我们去上学吧。' },
  { en: 'OK, let\'s go!', zh: '好的，走吧！' },
  { en: 'Look at the teacher.', zh: '看老师。' },
  { en: 'Good morning, class.', zh: '早上好，同学们。' },
  { en: 'Good morning, teacher.', zh: '早上好，老师。' },
  { en: 'Nice to meet you.', zh: '很高兴见到你。' },
  { en: 'Nice to meet you, too.', zh: '我也很高兴见到你。' },
  { en: 'Let\'s play together.', zh: '让我们一起玩吧。' }
])

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
</style>