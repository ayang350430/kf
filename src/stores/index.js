/**
 * 总文件
 */
import { createPinia } from 'pinia'
import {useChatStore}  from './chat.js'
import {useUserStore}  from './user.js'

const pinia = createPinia()

export {
  pinia,
  useChatStore,
  useUserStore
}
