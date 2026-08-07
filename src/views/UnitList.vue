<template>
  <!-- 单元列表页面 -->
  <div class="unit-list">
    <!-- 顶部导航栏 -->
    <header class="nav-bar">
      <button class="back-btn" @click="goBack">
        <span class="back-icon">←</span>
      </button>
      <h1 class="nav-title">{{ bookName }}</h1>
      <div class="nav-placeholder"></div>
    </header>

    <!-- 加载中状态 -->
    <div v-if="loading" class="loading">加载中...</div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <button class="retry-btn" @click="fetchUnits">重试</button>
    </div>

    <!-- 单元列表 -->
    <div v-else class="unit-cards">
      <div
        v-for="unit in units"
        :key="unit.id"
        class="unit-card"
        @click="goToReader(unit)"
      >
        <div class="unit-number">{{ unit.unitNo }}</div>
        <div class="unit-content">
          <h2 class="unit-title">{{ unit.title }}</h2>
          <p v-if="unit.titleZh" class="unit-title-zh">{{ unit.titleZh }}</p>
        </div>
        <div class="unit-action">
          <span class="play-icon">▶</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import request from '../utils/request'

const router = useRouter()
const route = useRoute()

// 从路由参数获取课本 ID
const bookId = computed(() => route.query.book || 1)

// 响应式数据
const units = ref([])
const bookName = ref('')
const loading = ref(true)
const error = ref('')

/**
 * 获取单元列表数据
 */
const fetchUnits = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await request.get(`/units/${bookId.value}`)
    if (res.code === 200) {
      // 后端返回数组格式：[{id, unitNo, title, sortOrder}]
      if (Array.isArray(res.data)) {
        units.value = res.data
        // 如果有 units[0].title，提取课本名称作为标题
        bookName.value = res.data.length > 0 ? `课本 ${bookId.value}` : '单元列表'
      } else {
        // 兼容旧格式：{ bookName, units }
        bookName.value = res.data.bookName || '单元列表'
        units.value = res.data.units || []
      }
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

// 组件挂载时获取数据
onMounted(fetchUnits)
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

.unit-title-zh {
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