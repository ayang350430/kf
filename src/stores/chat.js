import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useChatStore = defineStore('chat', () => {
  // 聊天列表
  const chatList = ref([])
  
  // 当前选中的聊天
  const currentChatId = ref('')
  
  // 消息列表
  const messages = ref({})
  
  // 未读消息计数
  const unreadCount = ref({})
  
  // 获取当前聊天的消息
  const currentMessages = computed(() => {
    return messages.value[currentChatId.value] || []
  })
  
  // 获取当前聊天信息
  const currentChat = computed(() => {
    return chatList.value.find(chat => chat.id === currentChatId.value) || null
  })
  
  // 设置当前聊天
  function setCurrentChat(chatId) {
    currentChatId.value = chatId
    // 重置未读消息计数
    if (unreadCount.value[chatId]) {
      unreadCount.value[chatId] = 0
    }
  }
  
  // 添加聊天
  function addChat(chat) {
    const exists = chatList.value.some(item => item.id === chat.id)
    if (!exists) {
      chatList.value.push(chat)
      messages.value[chat.id] = []
      unreadCount.value[chat.id] = 0
    }
  }
  
  // 添加消息
  function addMessage(chatId, message) {
    if (!messages.value[chatId]) {
      messages.value[chatId] = []
    }
    
    messages.value[chatId].push(message)
    
    // 如果不是当前聊天，增加未读计数
    if (chatId !== currentChatId.value) {
      if (!unreadCount.value[chatId]) {
        unreadCount.value[chatId] = 0
      }
      unreadCount.value[chatId]++
    }
  }
  
  // 清空聊天记录
  function clearMessages(chatId) {
    if (messages.value[chatId]) {
      messages.value[chatId] = []
    }
  }
  
  return {
    chatList,
    currentChatId,
    messages,
    unreadCount,
    currentMessages,
    currentChat,
    setCurrentChat,
    addChat,
    addMessage,
    clearMessages
  }
})