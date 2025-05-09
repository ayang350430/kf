import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
// 导入退出api
import { logout } from '@/api/login'
import { getInfo } from '@/api/user'

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || '{}'))
  
  // getter 获取缓存中的登录状态
  const isLoggedIn = computed(() => !!token.value)
  const username = computed(() => userInfo.value.username || '')
  
  // actions
  // 设置token
  function setToken(newToken) {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }
  // 设置用户信息
  function setUserInfo(info) {
    userInfo.value = info
    localStorage.setItem('userInfo', JSON.stringify(info))
  }
  // 退出登录
  async function logouts() {
    let res = await logout()
    if (res == 'OK') {
      // 清除缓存
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      localStorage.setItem('isLoggedIn', 'false')
      localStorage.setItem('username', {})
      return res
    }
  }

  // 获取用户信息
  function getUserInfo() {
    return getInfo().then(res => {
      setUserInfo(res)
    })
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    username,
    setToken,
    setUserInfo,
    logouts,
    getUserInfo
  }
})