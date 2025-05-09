/**
 * 登录/注册页面所有接口
 */
import request from '../utils/request'

// 获取用户信息
export function getInfo() {
  return request({
    url: '/auth/info',
    method: 'get'
  })
}