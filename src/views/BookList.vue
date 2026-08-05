<template>
  <!-- 课本列表页面 -->
  <div class="book-list">
    <!-- 页面头部 -->
    <header class="page-header">
      <h1 class="page-title">英语点读</h1>
      <p class="page-subtitle">选择课本开始学习</p>
    </header>

    <!-- 加载中状态 -->
    <div v-if="loading" class="loading">加载中...</div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <button class="retry-btn" @click="fetchBooks">重试</button>
    </div>

    <!-- 课本卡片列表 -->
    <div v-else class="book-cards">
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import request from '../utils/request'

const router = useRouter()

// 响应式数据
const books = ref([])
const loading = ref(true)
const error = ref('')

/**
 * 获取课本列表数据
 */
const fetchBooks = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await request.get('/books')
    // 后端返回格式：{ code: 200, data: [...] }
    if (res.code === 200) {
      books.value = res.data
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
 * 跳转到单元列表页
 * @param {Object} book - 选中的课本对象
 */
const goToUnits = (book) => {
  router.push({ path: '/units', query: { book: book.id } })
}

// 组件挂载时获取数据
onMounted(fetchBooks)
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