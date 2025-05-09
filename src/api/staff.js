import request from '../utils/request'

// 新增坐席
export function addAgents(data) {
  return request({
    url: '/api/im/front/agents',
    method: 'post',
    data
  })
}

// 删除坐席
export function deleteAgents(agentId) {
  return request({
    url: `/api/im/front/agents/deleteAgent/${agentId}`,
    method: 'delete'
  })
}

// 坐席列表(下拉)
export function getAgentsList(params) {
  return request({
    url: '/api/im/front/agents/list',
    method: 'get',
    params
  })
}

// 作息列表 （分页）
export function getShiftsList(params) {
  return request({
    url: '/api/im/front/agents/page',
    method: 'get',
    params
  })
}

// 修改坐席
export function updateAgents(data) {
  return request({
    url: '/api/im/front/agents/modifyAgent',
    method: 'post',
    data
  })
}

// 分页查询包含自己的坐席
export function getAgentsPage(params) {
  return request({
    url: '/api/im/front/agents/page',
    method: 'get',
    params
  })
}