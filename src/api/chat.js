import request from '../utils/request'

// 查询活跃会话列表 左侧会话列表
export function listActive(params) {
  return request({
    url: '/api/im/front/sessions/listActive',
    method: 'get',
    params
  })
}