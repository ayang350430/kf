/**
 * 时间处理工具函数
 */

/**
 * 格式化日期时间
 * @param {Date|number|string} date - 日期对象、时间戳或日期字符串
 * @param {string} format - 格式化模式，默认为 'YYYY-MM-DD HH:mm:ss'
 * @returns {string} 格式化后的日期字符串
 */
export function formatDateTime(date, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!date) return '';
  
  const d = date instanceof Date ? date : new Date(date);
  
  if (isNaN(d.getTime())) return '';
  
  const formatMap = {
    'YYYY': d.getFullYear(),
    'MM': String(d.getMonth() + 1).padStart(2, '0'),
    'DD': String(d.getDate()).padStart(2, '0'),
    'HH': String(d.getHours()).padStart(2, '0'),
    'mm': String(d.getMinutes()).padStart(2, '0'),
    'ss': String(d.getSeconds()).padStart(2, '0')
  };
  
  return format.replace(/YYYY|MM|DD|HH|mm|ss/g, match => formatMap[match]);
}

/**
 * 获取相对时间描述
 * @param {Date|number|string} date - 日期对象、时间戳或日期字符串
 * @returns {string} 相对时间描述，如"刚刚"、"5分钟前"、"2小时前"等
 */
export function getRelativeTime(date) {
  if (!date) return '';
  
  const d = date instanceof Date ? date : new Date(date);
  
  if (isNaN(d.getTime())) return '';
  
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  
  // 转换为秒
  const seconds = Math.floor(diff / 1000);
  
  if (seconds < 60) {
    return '刚刚';
  } else if (seconds < 3600) {
    return `${Math.floor(seconds / 60)}分钟前`;
  } else if (seconds < 86400) {
    return `${Math.floor(seconds / 3600)}小时前`;
  } else if (seconds < 604800) {
    return `${Math.floor(seconds / 86400)}天前`;
  } else if (d.getFullYear() === now.getFullYear()) {
    return formatDateTime(d, 'MM-DD HH:mm');
  } else {
    return formatDateTime(d, 'YYYY-MM-DD');
  }
}

/**
 * 获取聊天消息时间显示格式
 * @param {Date|number|string} date - 日期对象、时间戳或日期字符串
 * @returns {string} 适合聊天界面显示的时间格式
 */
export function getChatTimeString(date) {
  if (!date) return '';
  
  const d = date instanceof Date ? date : new Date(date);
  
  if (isNaN(d.getTime())) return '';
  
  const now = new Date();
  const isToday = d.getDate() === now.getDate() && 
                  d.getMonth() === now.getMonth() && 
                  d.getFullYear() === now.getFullYear();
  
  if (isToday) {
    return formatDateTime(d, 'HH:mm');
  } else if (d.getFullYear() === now.getFullYear()) {
    return formatDateTime(d, 'MM-DD HH:mm');
  } else {
    return formatDateTime(d, 'YYYY-MM-DD HH:mm');
  }
}
