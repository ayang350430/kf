import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
// 导入退出api
import { logout } from '../api/login'

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || '{}'))
  
  // getter
  const isLoggedIn = computed(() => !!token.value)
  const username = computed(() => userInfo.value.username || '')
  
  // actions
  function setToken(newToken) {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }
  
  function setUserInfo(info) {
    userInfo.value = info
    localStorage.setItem('userInfo', JSON.stringify(info))
  }
  
  async function logouts() {
    let res = await logout()
    if (res == 'OK') {
      // 清除缓存
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
    }
    return res
  }
  
  return {
    token,
    userInfo,
    isLoggedIn,
    username,
    setToken,
    setUserInfo,
    logouts
  }
})