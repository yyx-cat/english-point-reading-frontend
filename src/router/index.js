import { createRouter, createWebHashHistory } from 'vue-router'
import BookList from '../views/BookList.vue'
import UnitList from '../views/UnitList.vue'
import Reader from '../views/Reader.vue'

// 路由配置表
const routes = [
  {
    path: '/',
    redirect: '/books'
  },
  {
    path: '/books',
    name: 'BookList',
    component: BookList,
    meta: { title: '课本列表' }
  },
  {
    path: '/units',
    name: 'UnitList',
    component: UnitList,
    meta: { title: '单元列表' }
  },
  {
    path: '/reader',
    name: 'Reader',
    component: Reader,
    meta: { title: '点读' }
  }
]

/**
 * 创建路由实例
 * 使用 Hash 模式，适配移动端 WebView
 */
const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router