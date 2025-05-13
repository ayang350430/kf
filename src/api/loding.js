/**
 * loding临时会话创建
 */
import request from '../utils/request'

// 创建临时会话
export function createSession(data, headers) {
  return request({
    url: '/api/im/front/sessions/createSession',
    method: 'post',
    headers,
    data
  })
}