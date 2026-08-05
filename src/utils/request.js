import axios from 'axios'

/**
 * Axios 实例
 * baseURL 设置为 /api，后续通过 Vite 代理转发
 */
const request = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

/**
 * 请求拦截器
 * 可在此添加 token 等通用请求头
 */
request.interceptors.request.use(
  (config) => {
    // 可扩展：添加鉴权 token
    // const token = localStorage.getItem('token')
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`
    // }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

/**
 * 响应拦截器
 * 统一处理错误提示和响应结构
 */
request.interceptors.response.use(
  (response) => {
    // 直接返回后端数据
    return response.data
  },
  (error) => {
    // 统一错误处理
    const message = error.response?.data?.message || '网络异常，请稍后重试'
    console.error('[Request Error]', message)
    // 可扩展：UI 全局提示
    // ElMessage.error(message)
    return Promise.reject(new Error(message))
  }
)

export default request
