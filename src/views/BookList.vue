<template>
  <!-- 课本列表页面 -->
  <div class="book-list">
    <!-- 页面头部 -->
    <header class="page-header">
      <h1 class="page-title">英语点读</h1>
      <p class="page-subtitle">选择课本开始学习</p>
    </header>

    <!-- 课本卡片列表 -->
    <div class="book-cards">
      <div
        v-for="book in books"
        :key="book.id"
        class="book-card"
        @click="goToUnits(book)"
      >
        <div class="book-cover" :style="{ background: book.coverColor }">
          <span class="book-emoji">{{ book.emoji }}</span>
        </div>
        <div class="book-info">
          <h2 class="book-name">{{ book.name }}</h2>
          <p class="book-desc">{{ book.desc }}</p>
          <span class="book-arrow">进入 →</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 课本列表静态数据
const books = [
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

/**
 * 跳转到单元列表页
 * @param {Object} book - 选中的课本对象
 */
const emit = defineEmits([])
const goToUnits = (book) => {
  // 通过路由跳转到单元列表
  window.location.hash = `#/units?book=${book.id}`
}
</script>

<style scoped>
/* 页面容器 */
.book-list {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 16px;
  box-sizing: border-box;
}

/* 页面头部 */
.page-header {
  text-align: center;
  padding: 24px 0 32px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin: 0 0 8px;
}

.page-subtitle {
  font-size: 14px;
  color: #888;
  margin: 0;
}

/* 课本卡片容器 - Flex布局 */
.book-cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 600px;
  margin: 0 auto;
}

/* 课本卡片 */
.book-card {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.book-card:active {
  transform: scale(0.98);
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.1);
}

/* 课本封面 */
.book-cover {
  width: 90px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.book-emoji {
  font-size: 36px;
}

/* 课本信息 */
.book-info {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.book-name {
  font-size: 17px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.book-desc {
  font-size: 13px;
  color: #999;
  margin: 0;
}

.book-arrow {
  font-size: 14px;
  color: #667eea;
  font-weight: 500;
  margin-top: 4px;
}
</style>