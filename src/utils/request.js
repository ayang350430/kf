import axios from 'axios'
import { ElMessage, ElLoading } from 'element-plus'
import router from '../router'

// 创建加载实例的存储对象
let loadingInstance = null
// 请求计数器
let requestCount = 0

// 显示加载
const showLoading = () => {
  if (requestCount === 0) {
    loadingInstance = ElLoading.service({
      fullscreen: true,
      lock: true,
      text: '加载中...',
      background: 'rgba(0, 0, 0, 0.1)'
    })
  }
  requestCount++
}

// 隐藏加载
const hideLoading = () => {
  requestCount--
  if (requestCount === 0) {
    // 延迟关闭loading，避免闪烁
    setTimeout(() => {
      loadingInstance?.close()
    }, 300)
  }
}
// 创建 axios 实例
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // 从环境变量获取基础URL
  timeout: 15000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
service.interceptors.request.use(
  config => {
     // 显示加载状态
     if (!config.hideLoading) {
      showLoading()
    }
    const token = localStorage.getItem('token')
    // 在发送请求之前做些什么
    if (token) {
      config.headers['Authorization'] = `${token}`
    }
    return config
  },
  error => {
    // 对请求错误做些什么
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
     // 隐藏加载状态
     if (!response.config.hideLoading) {
      hideLoading()
    }
    const res = response.data
    // 根据你的后端API响应结构进行调整
    return res
  },
  error => {
    // 隐藏加载状态
    hideLoading()
    console.log(error.response.data.message == '登录状态已过期，请重新登录' ,'errr' );
    
    if (error.response.data.message == '登录状态已过期，请重新登录') {
      ElMessage.error(error.response.data.message || '请求失败');
      localStorage.removeItem('token');
      window.location.reload();
      return;
    }
    if (error.response.data.status == 400) {
      ElMessage.error(error.response.data.message || '请求失败');
      return Promise.reject(new Error(error.response.data.message|| '请求失败'));
    }
    return Promise.reject(new Error(error.response.data.message || '请求失败'));
  }
)

export default service 