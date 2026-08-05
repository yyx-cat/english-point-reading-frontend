<template>
  <!-- 单元列表页面 -->
  <div class="unit-list">
    <!-- 顶部导航栏 -->
    <header class="nav-bar">
      <button class="back-btn" @click="goBack">
        <span class="back-icon">←</span>
      </button>
      <h1 class="nav-title">六年级上册</h1>
      <div class="nav-placeholder"></div>
    </header>

    <!-- 单元列表 -->
    <div class="unit-cards">
      <div
        v-for="unit in units"
        :key="unit.id"
        class="unit-card"
        @click="goToReader(unit)"
      >
        <div class="unit-number">{{ unit.number }}</div>
        <div class="unit-content">
          <h2 class="unit-title">{{ unit.title }}</h2>
          <p class="unit-topic">{{ unit.topic }}</p>
        </div>
        <div class="unit-action">
          <span class="play-icon">▶</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

// 单元列表静态数据
const units = [
  { id: 1, number: 'Unit 1', title: 'Hello', topic: '你好' },
  { id: 2, number: 'Unit 2', title: 'Colours', topic: '颜色' },
  { id: 3, number: 'Unit 3', title: 'Look at me', topic: '看着我' },
  { id: 4, number: 'Unit 4', title: 'We love animals', topic: '我们爱动物' },
  { id: 5, number: 'Unit 5', title: 'Let\'s eat', topic: '让我们吃' },
  { id: 6, number: 'Unit 6', title: 'Happy birthday', topic: '生日快乐' }
]

/**
 * 返回上一页
 */
const goBack = () => {
  router.back()
}

/**
 * 跳转到点读页面
 * @param {Object} unit - 选中的单元对象
 */
const goToReader = (unit) => {
  router.push({ path: '/reader', query: { unit: unit.id, title: unit.title } })
}
</script>

<style scoped>
/* 页面容器 */
.unit-list {
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

.back-btn {
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

.back-btn:active {
  background: #f0f0f0;
}

.nav-title {
  font-size: 17px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.nav-placeholder {
  width: 36px;
}

/* 单元卡片容器 */
.unit-cards {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

/* 单元卡片 */
.unit-card {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.unit-card:active {
  transform: scale(0.98);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

/* 单元编号 */
.unit-number {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  border-radius: 12px;
  flex-shrink: 0;
}

/* 单元内容 */
.unit-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.unit-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.unit-topic {
  font-size: 13px;
  color: #999;
  margin: 0;
}

/* 播放按钮 */
.unit-action {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
  border-radius: 50%;
  flex-shrink: 0;
  transition: background 0.2s;
}

.unit-card:active .unit-action {
  background: #e0e0e0;
}

.play-icon {
  font-size: 14px;
  color: #667eea;
  margin-left: 2px;
}
</style>