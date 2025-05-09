/**
 * 登录/注册页面所有接口
 */
import request from '../utils/request'

// 登录
export function login(data) {
  return request({
    url: '/auth/login',
    method: 'post',
    data
  })
}

// 获取验证码
export function getCaptcha() {
  return request({
    url: '/auth/code',
    method: 'get'
  })
}

// 用户注册
export function register(data) {
  return request({
    url: '/auth/register',
    method: 'post',
    data
  })
}

// 退出登录
export function logout(data) {
  return request({
    url: '/auth/logout',
    method: 'DELETE',
    data
  })
}