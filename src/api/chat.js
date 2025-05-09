import request from '../utils/request'

// 查询活跃会话列表 左侧会话列表
export function listActive(params) {
  return request({
    url: '/api/im/front/sessions/listActive',
    method: 'get',
    params
  })
}

// 查询会话历史（分页，支持状态过滤）
export function sessionsPage(params) {
  return request({
    url: '/api/im/front/chats/pageList4Chat',
    method: 'get',
    params
  })
}