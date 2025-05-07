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
        <el-button type="danger" size="small" @click="handleLogout">退出登录</el-button>
      </div>
      <div class="chat-messages" ref="messagesContainer">
        <div v-for="(message, index) in currentMessages" :key="index" class="message"
          :class="{ 'message-self': message.isSelf }">
          <el-avatar :size="40" icon="User" />
          <div class="message-content">
            <div class="message-text">{{ message.content }}</div>
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

const router = useRouter()
const username = ref(localStorage.getItem('username') || '用户')
const messagesContainer = ref(null)
const messageInput = ref('')
const currentConversation = ref(0)
const totalMessages = ref(0)
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
  }
])

const openEmojiPicker = () => {
  // 打开表情选择器的逻辑
  ElMessage.info('表情选择器打开')
}

const openImageUploader = () => {
  // 打开图片上传器的逻辑
  ElMessage.info('图片上传器打开')
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
    isSelf: true
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
      isSelf: false
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

// 退出登录
const handleLogout = () => {
  localStorage.removeItem('isLoggedIn')
  localStorage.removeItem('username')
  ElMessage.success('已退出登录')
  router.push('/login')
}

onMounted(() => {
  // 初始化时滚动到底部
  scrollToBottom()
})
</script>

<style scoped>
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
</style>