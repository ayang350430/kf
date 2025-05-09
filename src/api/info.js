import request from '../utils/request'

// 查询活跃会话列表 左侧会话列表
export function editUserInfo(data) {
  return request({
    url: '/api/im/front/user',
    method: 'post',
    data
  })
}