
/**
 * 上传文件
 */
import request from '../utils/request'

// 创建临时会话
export function uploadData(data, headers) {
  return request({
    url: '/api/oss/upload',
    method: 'post',
    headers,
    data
  })
}