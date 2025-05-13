<template>
  <div class="chat-container">
    <div class="chat-sidebar">
      <div class="conversation-list">
        <!-- 没有对话进入 -->
        <div v-if="leftConversations.length == 0" class="empty-state">
          <el-empty description="暂无会话" />
        </div>
        <div v-else v-for="(conversation, index) in leftConversations" :key="index" class="conversation-item" :class="{
          active: currentConversation === index,
          unread: conversation.unread
        }" @click="switchConversation(index)">
          <el-avatar :size="40" icon="User" />
          <div class="conversation-info">
            <div class="title_box">
              <div class="conversation-name">
                {{ conversation.name || 'temp' }}
              </div>
              <div class="conversation-preview">{{ formatDateTime(conversation?.lastMessageTime) }}</div>
            </div>
            <span v-if="conversation.lastMessage" class="unread-badge">{{ conversation.lastMessage || 1 }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="chat-main">
      <!-- 左侧没有对话的时候不显示 确保不报错-->
      <div class="chat-header" v-if="leftConversations.length != 0">
        <div class="current-user">{{ currentConversationName || 'temp' }}</div>
      </div>
      <div class="chat-messages" v-if="leftConversations.length != 0" ref="messagesContainer">
        <div v-if="currentMessages.length == 0" class="empty-state">
          <el-empty description="暂无聊天记录" />
        </div>
        <div v-else v-for="(message, index) in currentMessages" :key="index" class="message"
          :class="{ 'message-self': message.isSelf }">
          <el-avatar :size="40" icon="User" />
          <div class="message-content">
            <div class="message-text">
              <template v-if="message.type === 'image'">
                <img :src="message.content" alt="聊天图片" style="max-width: 100%; max-height: 200px;" />
              </template>
              <template v-else-if="message.type === 'html'">
                <div v-html="message.content" class="html-content"></div>
              </template>
              <template v-else>
                {{ message.content }}
              </template>
            </div>
            <div class="message-time">{{ message.createTime }}</div>
            <div class="message-status" v-if="message.status">
              <el-tag size="small"
                :type="message.status === 'sending' ? 'info' : message.status === 'success' ? 'success' : 'danger'">
                {{ message.status === 'sending' ? '发送中...' : message.status === 'success' ? '已发送' : '发送失败' }}
              </el-tag>
            </div>
          </div>
        </div>
      </div>
      <div class="chat-input" v-if="leftConversations.length != 0">
        <quill-editor v-model:content="messageInput" :options="editorOptions" @keyup.enter="sendMessage"
          content-type="html" placeholder="请输入消息..." class="editor" />
        <div class="resize-handle"></div>
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
      </div>
      <div class="profile-content">
        <el-avatar :size="80" icon="User" />
        <div class="user-info_data">
          <div class="username">{{ currentConversationName || 'temp' }}</div>
          <!-- <div class="status">在线</div> -->
        </div>
        <div class="user-stats">
          <div class="stat-item">
            <div class="stat-label">首次会话时间</div>
            <div class="stat-value">{{ formatDateTime(leftConversations[currentConversation]?.firstConnectTime) || '未知'
            }}
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-label">消息数</div>
            <div class="stat-value">{{ conversationsTotal }}</div>
          </div>
        </div>
        <div class="user-stats">
          <div class="stat-item">
            <div class="stat-label">姓名</div>
            <div class="stat-value">{{ currentConversationName || 'temp' }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">ip</div>
            <div class="stat-value">{{ leftConversations[currentConversation]?.ip }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick, watch, onBeforeUnmount } from 'vue'
import { User } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import 'emoji-picker-element'
// 引入WebSocket客户端
import wsClient from '../utils/websocket'
// 引入api
import { listActive, sessionsPage } from '@/api/chat'
// 引入时间格式化函数
import { formatDateTime } from '@/utils/data.js'
import { QuillEditor } from '@vueup/vue-quill'
import { uploadData } from '@/api/uters.js'
// 引入富文本
import '@vueup/vue-quill/dist/vue-quill.snow.css'


const router = useRouter()
const username = ref(localStorage.getItem('username') || '用户')
const messagesContainer = ref(null)
const messageInput = ref('')
const currentConversation = ref(0)
const totalMessages = ref(0)
const showEmojiPicker = ref(false)
const emojiPickerRef = ref(null)
// 模拟会话数据
const conversations = ref([

])
// 左侧对话数据
const leftConversations = ref([])
const conversationsTotal = ref(0)

const openEmojiPicker = (event) => {
  // 打开表情选择器的逻辑
  // ElMessage.info('表情选择器打开')
  showEmojiPicker.value = true
}
// 点击其他地方时关闭表情选择器
const closeEmojiPicker = () => {
  showEmojiPicker.value = false
}

// 富文本配置
const editorOptions = {
  theme: 'snow',
  modules: {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ 'color': [] }, { 'background': [] }],
    ]
  },
  placeholder: '请输入消息...',
  readOnly: false,
  formats: ['bold', 'italic', 'underline', 'color', 'background'],
  // 添加以下配置确保输出HTML格式
  clipboard: {
    matchVisual: false
  }
}

// 添加 WebSocket 消息处理函数
const handleWebSocketMessage = (data) => {
  console.log('收到WebSocket消息:', data)

  // 根据消息类型处理不同的消息
  // 根据消息类型处理 消息发送成功
  if (data.type === 'DOWN_MESSAGE_SENT') {
    // 更新最后一条消息的发送状态
    const lastMessage = conversations.value[conversations.value.length - 1]
    if (lastMessage && lastMessage.isSelf) {
      lastMessage.status = 'success'
    }

    nextTick(() => {
      scrollToBottom()
    })
  }

  // 消息发送失败
  if (data.type === 'DOWN_ERROR') {
    // 更新最后一条消息的发送状态为失败
    const lastMessage = conversations.value[conversations.value.length - 1]
    if (lastMessage && lastMessage.isSelf) {
      lastMessage.status = 'failed'
    }

    nextTick(() => {
      scrollToBottom()
    })
  }

  // 处理新消息
  if (data.type === 'DOWN_NEW_MESSAGE') {
    // 构造新消息对象
    const newMessage = {
      content: data.data.chat.content,
      createTime: data.data.chat.createTime,
      isSelf: false,
      type: 'html'
    }

    // 将新消息添加到会话中
    conversations.value.push(newMessage)

    // 更新未读消息数
    if (data.data.unreadCount) {
      const targetConversation = leftConversations.value.find(
        conv => conv.id === data.data.sessionId
      )
      if (targetConversation) {
        targetConversation.unread = data.data.unreadCount
        targetConversation.lastMessage = data.data.chat.content
        targetConversation.lastMessageTime = data.data.chat.createTime
      }
    }
  }

  // 处理新会话
  if (data.type === 'DOWN_NEW_SESSION') {
    // 构造新会话对象
    const newConversation = {
      id: data.data.id,
      name: data.data.name,
      unread: data.data.unreadCount,
      lastMessage: data.data.lastMessage,
      lastMessageTime: data.data.lastMessageTime,
      firstConnectTime: data.data.firstConnectTime,
      ip: data.data.ip
    }

    // 将新会话添加到会话列表中
    leftConversations.value.unshift(newConversation)

    // 更新未读消息数
    if (data.data.unreadCount) {
      const targetConversation = leftConversations.value.find(
        conv => conv.id === data.data.id
      )
      if (targetConversation) {
        targetConversation.unread = data.data.unreadCount
        targetConversation.lastMessage = data.data.lastMessage
        targetConversation.lastMessageTime = data.data.lastMessageTime
      }
    }
  }
}



// 查询历史回话数据 id: 查看历史会话的临时用户ID
const dataList = async (row) => {

  // 请求参数处理
  let obj = {
    page: 0,
    size: 100,
    sessionId: row?.id,
  }
  let res = await sessionsPage(obj)
  if (res) {
    let constRes = []
    res.content.forEach(element => {
      if (element.chatType == 1) {
        element.type = 'html'
        element.isSelf = true
      } else {
        element.type = 'html'
        element.isSelf = false
      }
      constRes.unshift(element)
    });
    conversations.value = constRes;
    conversationsTotal.value = res.totalElements
  }
}

// 获取左侧会话列表
const getConversations = async () => {
  try {
    const resData = await listActive()

    if (resData.length != 0) {
      leftConversations.value = resData;
      // 在获取默认第一条对话的历史数据、首次进入
      dataList(resData[0])
    }
  } catch (error) {
    console.error('获取会话列表失败:', error)
  }
}

// 在组件挂载后添加全局点击事件监听器
onMounted(() => {
  // 连接WebSocket
  wsClient.connect()

  // 注册WebSocket消息处理函数
  const removeMessageListener = wsClient.onMessage(handleWebSocketMessage)

  // 初始化时滚动到底部
  scrollToBottom()

  if (!customElements.get('emoji-picker')) {
    import('emoji-picker-element').then(({ default: EmojiPicker }) => {
      customElements.define('emoji-picker', EmojiPicker)
    })
  }

  // 初始化时获取会话列表
  getConversations()
})

// 在组件卸载前断开WebSocket连接
onBeforeUnmount(() => {
  wsClient.disconnect()
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
      reader.onload = async (e) => {
        const fileUrl = URL.createObjectURL(file) // 创建临时Blob URL用于预览图片
        // 上传图片到服务器
        const formData = new FormData()
        formData.append('file', file)
        const response = await uploadData(formData, {
          'Content-Type': 'multipart/form-data'
        })
        messageInput.value += `<img src="${response.url}" alt="上传图片" />`

        // 滚动到底部显示新消息
        nextTick(() => {
          scrollToBottom()
        })
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
  return leftConversations.value[currentConversation.value]?.name || ''
})

// 计算属性：当前会话消息
const currentMessages = computed(() => {
  return conversations.value || []
})

// 切换会话
const switchConversation = (index) => {
  currentConversation.value = index
  // 查询历史数据
  dataList(leftConversations.value[index])
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
    type: 'html',
    status: 'sending'
  }

  conversations.value.push(newMessage)
 
  try {
    wsClient.send({
      "type": "UP_SEND_MESSAGE",
      "data": {
        "sessionId": leftConversations.value[currentConversation.value]?.id, // 会话 ID
        "content": messageInput.value // 消息内容
      }
    })
  } catch (error) {
    console.error('发送WebSocket消息失败:', error)
  }

   // 清空输入框
  messageInput.value = '<p><br></p>'



  // 滚动到底部
  nextTick(() => {
    scrollToBottom()
  })

  // 模拟自动回复
  // setTimeout(() => {
  //   const autoReply = {
  //     content: '已收到您的消息，我们会尽快处理您的问题。',
  //     time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
  //     isSelf: false,
  //     type: 'text'
  //   }
  //   conversations.value[currentConversation.value].messages.push(autoReply)
  //   conversations.value[currentConversation.value].lastMessage = autoReply.content


  // }, 1000)
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
.message-text {
  :deep(.html-content) {
    img {
      max-width: 100%;
      max-height: 200px;
      object-fit: contain;
    }
  }
}

.chat-input {
  padding: 15px;
  background-color: #fff;
  border-top: 1px solid #e0e0e0;
  position: relative;

  .resize-handle {
    height: 5px;
    background-color: #e0e0e0;
    cursor: ns-resize;
    width: 100%;
    position: relative;
    margin-bottom: 10px;

    &:hover {
      background-color: #ccc;
    }
  }

  // 添加以下样式来控制编辑器大小
  :deep(.editor) {
    max-height: 80px;
    overflow-y: auto;

    img {
      max-width: 100%;
      max-height: 150px;
      object-fit: contain;
    }
  }

  :deep(.ql-container) {
    font-size: 14px;
    max-height: 80px;
    overflow-y: auto;
  }

  :deep(.ql-editor) {
    min-height: 80px;
    max-height: 80px;
  }

  :deep(.ql-toolbar) {
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
  }
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  padding: 20px;

  :deep(.el-empty) {
    padding: 40px 0;

    .el-empty__description {
      margin-top: 10px;
      color: #909399;
      font-size: 14px;
    }

    .el-empty__image {
      width: 120px;
      height: 120px;
    }
  }
}

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
  margin-left: 10px;
}

.stat-label {
  font-size: 12px;
  color: #666;
  // margin-top: 5px;
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
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 150px;
}

.title_box {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.unread-badge {
  font-size: 14px;
  color: #999;
  display: flex;
  justify-content: baseline;
  max-width: 150px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.conversation-preview {
  font-size: 12px;
  color: #586f03;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  justify-content: space-between;
  align-items: center;
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