import request from '../utils/request'

// 新增坐席
export function addAgents(data) {
  return request({
    url: '/api/im/front/agents',
    method: 'post',
    data
  })
}