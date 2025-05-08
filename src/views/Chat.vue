<template>
  <div class="chat-container">
    <div class="chat-sidebar">
      <div class="conversation-list">
        <div v-for="(conversation, index) in conversations" :key="index" class="conversation-item"
          :class="{ active: currentConversation === index }" @click="switchConversation(index)">
          <el-avatar :size="40" icon="User" />
          <div class="conversation-info">
            <div class="conversation-name">{{ conversation.name }}</div>
            <div class="conversation-preview">{{ conversation.lastMessage }}</div>
          </div>
        </div>
      </div>
    </div>
    <div class="chat-main">
      <div class="chat-header">
        <div class="current-user">{{ currentConversationName }}</div>
        <!-- <el-button type="danger" size="small" @click="handleLogout">退出登录</el-button> -->
      </div>
      <div class="chat-messages" ref="messagesContainer">
        <div v-for="(message, index) in currentMessages" :key="index" class="message"
          :class="{ 'message-self': message.isSelf }">
          <el-avatar :size="40" icon="User" />
          <div class="message-content">
            <div class="message-text">
              <template v-if="message.type === 'image'">
                <img :src="message.content" alt="聊天图片" style="max-width: 100%; max-height: 200px;" />
              </template>
              <template v-else>
                {{ message.content }}
              </template>
            </div>
            <div class="message-time">{{ message.time }}</div>
          </div>
        </div>
      </div>
      <div class="chat-input">
        <el-input v-model="messageInput" type="textarea" :rows="3" placeholder="请输入消息..."
          @keyup.enter.native="sendMessage" />
        <div class="input-actions">
          <el-button type="primary" @click="sendMessage">发送</el-button>
          <el-button type="default" @click="openEmojiPicker">表情</el-button>
          <el-button type="default" @click="openImageUploader">图片</el-button>
        </div>
        <div v-if="showEmojiPicker" class="emoji-picker-container">
          <emoji-picker ref="emojiPickerRef" @emoji-click="addEmoji" />
        </div>
      </div>
    </div>
    <div class="user-profile-panel">
      <div class="profile-header">
        <h3>个人信息</h3>
        <!-- <el-button type="primary" size="small" @click="goToProfile">查看详情</el-button> -->
      </div>
      <div class="profile-content">    
        <el-avatar :size="80" icon="User" />
        <div class="user-info_data">
          <div class="username">{{ username }}</div>
          <div class="status">在线</div>
        </div>
        <div class="user-stats">
          <div class="stat-item">
            <div class="stat-label">会话数</div>
            <div class="stat-value">{{ conversations.length }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">消息数</div>
            <div class="stat-value">3</div>
          </div>
        </div>
        <div class="user-stats">
          <div class="stat-item">
            <div class="stat-label">姓名</div>
            <div class="stat-value">游客</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">ip</div>
            <div class="stat-value">192.168.1.1</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick, watch } from 'vue'
import { User } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import 'emoji-picker-element'

const router = useRouter()
const username = ref(localStorage.getItem('username') || '用户')
const messagesContainer = ref(null)
const messageInput = ref('')
const currentConversation = ref(0)
const totalMessages = ref(0)
const showEmojiPicker = ref(false)
const emojiPickerRef = ref(null)
// 模拟会话数据
const conversations = reactive([
  {
    name: '客户1',
    lastMessage: '您好，我需要帮助',
    messages: [
      { content: '您好，有什么可以帮助您的？', time: '09:30', isSelf: false },
      { content: '我想咨询一下产品的使用方法', time: '09:31', isSelf: true },
      { content: '好的，请问您具体想了解哪方面的使用方法？', time: '09:32', isSelf: false }
    ]
  },
  {
    name: '客户2',
    lastMessage: '谢谢您的帮助',
    messages: [
      { content: '您好，欢迎咨询', time: '10:15', isSelf: false },
      { content: '我的账户出现了问题', time: '10:16', isSelf: true },
      { content: '请您详细描述一下问题，我们会尽快为您解决', time: '10:17', isSelf: false }
    ]
  },
  {
    name: '客户3',
    lastMessage: '好的，我明白了',
    messages: [
      { content: '您好，有什么可以帮您？', time: '11:20', isSelf: false },
      { content: '我想退换一个商品', time: '11:21', isSelf: true },
      { content: '请提供您的订单号，我们会为您处理退换事宜', time: '11:22', isSelf: false }
    ]
  },
  {
    name: '客户4',
    lastMessage: '产品质量很好',
    messages: [
      { content: '您好，感谢您选择我们的产品', time: '13:45', isSelf: false },
      { content: '我对你们的产品非常满意', time: '13:47', isSelf: true },
      { content: '谢谢您的支持，如有任何问题随时咨询我们', time: '13:48', isSelf: false }
    ]
  },
  {
    name: '客户5',
    lastMessage: '需要更多信息',
    messages: [
      { content: '您好，欢迎咨询我们的服务', time: '14:30', isSelf: false },
      { content: '我想了解一下你们的最新产品', time: '14:32', isSelf: true },
      { content: '我们最近推出了全新的智能家居系列，您想了解哪方面的信息？', time: '14:33', isSelf: false }
    ]
  }
])

const openEmojiPicker = (event) => {
  // 打开表情选择器的逻辑
  // ElMessage.info('表情选择器打开')
  showEmojiPicker.value = true
}
// 点击其他地方时关闭表情选择器
const closeEmojiPicker = () => {
  showEmojiPicker.value = false
}

// 在组件挂载后添加全局点击事件监听器
onMounted(() => {
  document.addEventListener('click', (event) => {
    // 检查点击是否在表情选择器外部
    const emojiPicker = document.querySelector('.emoji-picker-container')
    const emojiButton = event.target.closest('button')
    
    // 如果表情选择器已显示，且点击不在表情选择器内部，也不是打开表情选择器的按钮
    if (showEmojiPicker.value && 
        emojiPicker && 
        !emojiPicker.contains(event.target) && 
        (!emojiButton || !emojiButton.textContent.includes('表情'))) {
      showEmojiPicker.value = false
    }
  })
})


// 选择表情包
const addEmoji = (event) => {
  messageInput.value += event.detail.unicode
  showEmojiPicker.value = false
}

// 选择图片
const openImageUploader = () => {
  // 打开图片上传器的逻辑
  // ElMessage.info('图片上传器打开')
  // 创建文件选择器
  const fileInput = document.createElement('input')
  fileInput.type = 'file'
  fileInput.accept = 'image/*'
  fileInput.style.display = 'none'
  
  // 监听文件选择事件
  fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0]
    if (file) {
      // 处理选择的图片
      const reader = new FileReader()
      reader.onload = (e) => {
        // 将图片数据存储到消息内容中，并设置消息类型为图片
        const imageMessage = {
          content: e.target.result,
          time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
          isSelf: true,
          type: 'image'
        }
        
        // 直接添加图片消息到当前会话
        conversations[currentConversation.value].messages.push(imageMessage)
        
        // 清空输入框，因为图片已经作为单独消息发送
        messageInput.value = ''
        
        // 滚动到底部显示新消息
        nextTick(() => {
          scrollToBottom()
        })
        
        // 阻止继续执行后面的sendMessage()，因为我们已经手动添加了消息
        return
        // 这里可以扩展为实际发送图片的逻辑
        // 例如: sendImageMessage(e.target.result)
        
        // 发送消息
        sendMessage()
      }
      reader.readAsDataURL(file)
    }
  })
  
  // 触发文件选择器
  document.body.appendChild(fileInput)
  fileInput.click()
  document.body.removeChild(fileInput)
}


// 计算属性：当前会话名称
const currentConversationName = computed(() => {
  return conversations[currentConversation.value]?.name || ''
})

// 计算属性：当前会话消息
const currentMessages = computed(() => {
  return conversations[currentConversation.value]?.messages || []
})

// 切换会话
const switchConversation = (index) => {
  currentConversation.value = index
  // 切换后滚动到底部
  nextTick(() => {
    scrollToBottom()
  })
}

// 发送消息
const sendMessage = () => {
  if (!messageInput.value.trim()) return

  // 添加新消息
  const newMessage = {
    content: messageInput.value,
    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    isSelf: true,
    type: 'text'
  }

  conversations[currentConversation.value].messages.push(newMessage)

  // 更新最后一条消息预览
  conversations[currentConversation.value].lastMessage = messageInput.value

  // 清空输入框
  messageInput.value = ''

  // 滚动到底部
  nextTick(() => {
    scrollToBottom()
  })

  // 模拟自动回复
  setTimeout(() => {
    const autoReply = {
      content: '已收到您的消息，我们会尽快处理您的问题。',
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      isSelf: false,
      type:'text'
    }
    conversations[currentConversation.value].messages.push(autoReply)
    conversations[currentConversation.value].lastMessage = autoReply.content

    // 滚动到底部
    nextTick(() => {
      scrollToBottom()
    })
  }, 1000)
}

// 滚动到底部
const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// 监听当前会话变化，更新滚动位置
watch(currentMessages, () => {
  nextTick(() => {
    scrollToBottom()
  })
})

onMounted(() => {
  // 初始化时滚动到底部
  scrollToBottom()

  if (!customElements.get('emoji-picker')) {
    import('emoji-picker-element').then(({ default: EmojiPicker }) => {
      customElements.define('emoji-picker', EmojiPicker)
    })
  }
})
</script>

<style scoped lang="scss">
:deep(.emoji-picker-container) {
  bottom: 7% !important;
  right: 125px !important;
}

.user-profile-panel {
  width: 280px;
  background-color: #fff;
  border-left: 1px solid #e0e0e0;
  padding: 20px;
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.profile-header h3 {
  margin: 0;
  color: #333;
}

.profile-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.user-info_data {
  margin-top: 15px;
  text-align: center;
}

.username {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 5px;
}

.status {
  color: #4caf50;
  font-size: 14px;
}

.user-stats {
  /* display: flex; */
  /* justify-content: space-around; */
  width: 100%;
  /* margin-top: 20px; */
  /* padding-top: 15px; */
  /* border-top: 1px solid #f0f0f0; */
}

.stat-item {
  /* text-align: center; */
  display: flex;
  margin-top: 10px;
}
 
.stat-value {
  font-size: 14px;
  font-weight: bold;
  color: #383838;
}

.stat-label {
  font-size: 12px;
  color: #666;
  margin-top: 5px;
  /* margin-right: 10px; */
  width: 60px;
  text-align-last: left;
}

.chat-container {
  display: flex;
  height: 100vh;
  background-color: #f5f5f5;
}

.chat-sidebar {
  width: 280px;
  background-color: #fff;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
}

.user-info {
  padding: 20px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #e0e0e0;
}

.username {
  margin-left: 10px;
  font-weight: bold;
}

.conversation-list {
  flex: 1;
  overflow-y: auto;
}

.list-title {
  padding: 15px 20px;
  font-weight: bold;
  color: #666;
  border-bottom: 1px solid #f0f0f0;
}

.conversation-item {
  padding: 15px 20px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.3s;
}

.conversation-item:hover {
  background-color: #f9f9f9;
}

.conversation-item.active {
  background-color: #e6f7ff;
}

.conversation-info {
  margin-left: 10px;
  flex: 1;
  overflow: hidden;
}

.conversation-name {
  font-weight: bold;
  margin-bottom: 5px;
}

.conversation-preview {
  font-size: 12px;
  color: #999;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.chat-header {
  padding: 15px 20px;
  background-color: #fff;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.current-user {
  font-weight: bold;
  font-size: 16px;
}

.chat-messages {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: #f5f5f5;
}

.message {
  display: flex;
  margin-bottom: 20px;
  align-items: flex-start;
}

.message-self {
  flex-direction: row-reverse;
}

.message-content {
  margin: 0 10px;
  max-width: 70%;
}

.message-text {
  padding: 10px 15px;
  border-radius: 4px;
  background-color: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.message-self .message-text {
  background-color: #e6f7ff;
  color: #1890ff;
}

.message-time {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
  text-align: right;
}

.message-self .message-time {
  text-align: left;
}

.chat-input {
  padding: 15px;
  background-color: #fff;
  border-top: 1px solid #e0e0e0;
}

.input-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}

.emoji-picker-container {
  position: absolute;
  bottom: 100%;
  right: 15px;
  z-index: 1000;
}

:deep(emoji-picker) {
  --background: #ffffff;
  --border-color: #e0e0e0;
  --button-active-background: #e0e0e0;
  --button-hover-background: #f0f0f0;
  --category-emoji-padding: 0.5rem;
  --category-font-color: #666666;
  --category-font-size: 0.8rem;
  --indicator-color: #666666;
  --input-border-color: #e0e0e0;
  --input-font-color: #333333;
  --input-placeholder-color: #999999;
  --num-columns: 8;
  --outline-color: #666666;
  --outline-width: 1px;
  --skintone-dropdown-border-color: #e0e0e0;
}

</style>