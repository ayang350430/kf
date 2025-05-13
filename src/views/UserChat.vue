<template>
  <div class="user-chat-container">
    <div class="chat-header">
      <div class="header-title">
        <span>客服中心</span>
      </div>
      <div class="header-actions">
        <!-- <el-button type="primary" size="small" @click="minimizeChat">最小化</el-button> -->
        <el-icon @click="closeChat">
          <Close />
        </el-icon>
        <!-- <el-button type="" size="small" @click="closeChat">
        </el-button> -->
      </div>
    </div>

    <div class="chat-messages" ref="messagesContainer">
      <div v-for="(message, index) in messages" :key="index" class="message"
        :class="{ 'message-self': message.isSelf }">
        <el-avatar :size="40" :icon="message.isSelf ? 'User' : 'Service'" />
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
          <div class="message-time">{{ message.time }}</div>
          <div class="message-status" v-if="message.status">
            <el-tag size="small"
              :type="message.status === 'sending' ? 'info' : message.status === 'success' ? 'success' : 'danger'">
              {{ message.status === 'sending' ? '发送中...' : message.status === 'success' ? '已发送' : '发送失败' }}
            </el-tag>
          </div>
        </div>
      </div>
    </div>

    <div class="chat-input">
      <quill-editor v-model:content="messageInput" :options="editorOptions" @keyup.enter="sendMessage"
        content-type="html" placeholder="请输入消息..." class="editor" />
      <div class="resize-handle"></div>
      <div class="input-actions">
        <el-button type="default" @click="openEmojiPicker">表情</el-button>
        <el-button type="default" @click="openImageUploader">图片</el-button>
        <el-button type="primary" @click="sendMessage">发送</el-button>
      </div>
      <div v-if="showEmojiPicker" class="emoji-picker-container">
        <emoji-picker ref="emojiPickerRef" @emoji-click="addEmoji" />
      </div>
    </div>

    <div class="chat-footer">
      <div class="footer-info">
        <span>客服工作时间: 9:00-18:00</span>
      </div>
      <div class="footer-rating" v-if="showRating">
        <span>请对本次服务进行评价：</span>
        <el-rate v-model="serviceRating" />
        <el-button type="primary" size="small" @click="submitRating">提交评价</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, onBeforeUnmount } from 'vue'
import { User, Service, Close } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import 'emoji-picker-element'
// 引入WebSocket客户端
import wsClient from '../utils/websocket'
import { QuillEditor } from '@vueup/vue-quill'
import { uploadData } from '@/api/uters.js'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

const router = useRouter()
const messagesContainer = ref(null)
const messageInput = ref('')
const showEmojiPicker = ref(false)
const emojiPickerRef = ref(null)
const serviceRating = ref(5)
const showRating = ref(false)

// 聊天消息数据
const messages = reactive([
  { content: '您好，欢迎来到客服中心，请问有什么可以帮助您的？', time: '09:30', isSelf: false, type: 'text' },
])

// 富文本配置
const editorOptions = {
  theme: 'snow',
  modules: {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ 'color': [] }, { 'background': [] }],
      // ['image']
    ]
  },
  placeholder: '请输入消息...',
  readOnly: false,
  formats: ['bold', 'italic', 'underline', 'color', 'background', 'image'],
  // 添加以下配置确保输出HTML格式
  clipboard: {
    matchVisual: false
  }
}

// 滚动到底部
const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const openEmojiPicker = (event) => {
  // 打开表情选择器的逻辑
  // ElMessage.info('表情选择器打开')
  showEmojiPicker.value = true
}

// 点击其他地方时关闭表情选择器
const closeEmojiPicker = () => {
  showEmojiPicker.value = false
}

// 选择表情包
const addEmoji = (event) => {
  messageInput.value += event.detail.unicode
  showEmojiPicker.value = false
}

// 选择图片
const openImageUploader = () => {
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
        // 获取文件的本地路径
        const imageUrl = e.target.result
        // 上传图片到服务器
        const formData = new FormData()
        formData.append('file', imageUrl)
        try {
          const response = await uploadData(formData)
          if (response) {
            // 上传成功,将返回的图片URL添加到消息中
            const imageMessage = {
              content: response.data.url,
              time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
              isSelf: true,
              type: 'image',
              status: 'sending'
            }
            messages.push(imageMessage)

            // 发送图片消息到WebSocket
            wsClient.send({
              "type": "UP_SEND_MESSAGE",
              "data": {
                "sessionId": JSON.parse(localStorage.getItem('sessionUser')).id,
                "content": response.data.url
              }
            })
          } else {
            ElMessage.error('图片上传失败')
          }
        } catch (error) {
          console.error('上传图片出错:', error)
          ElMessage.error('图片上传失败')
        }


        // 清空输入框，因为图片已经作为单独消息发送
        messageInput.value = ''

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

// 发送消息
const sendMessage = () => {
  // 检查消息是否为空（去除HTML标签后）
  const textContent = messageInput.value.replace(/<[^>]+>/g, '').trim();
  if (!textContent) return;
  // 通过WebSocket发送消息

  const newMessage = {
    content: messageInput.value,
    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    isSelf: true,
    type: 'html', // 修改类型为html
    status: 'sending'
  }

  messages.push(newMessage)
  messageInput.value = ''
  try {
    wsClient.send({
      "type": "UP_SEND_MESSAGE",
      "data": {
        "sessionId": JSON.parse(localStorage.getItem('sessionUser')).id, // 会话 ID
        "content": messageInput.value // 消息内容
      }
    })
  } catch (error) {
    console.error('发送WebSocket消息失败:', error)
  }

  

  nextTick(() => {
    scrollToBottom()
  })

  // 保留原有的模拟客服回复功能，以防WebSocket连接失败
  // setTimeout(() => {
  //   simulateServiceReply()
  // }, 1000)
}

// 处理WebSocket消息
const handleWebSocketMessage = (data) => {
  console.log('收到WebSocket消息:', data)

  // 根据消息类型处理 消息发送成功
  if (data.type === 'DOWN_MESSAGE_SENT') {
    // 更新最后一条消息的发送状态
    const lastMessage = messages[messages.length - 1]
    if (lastMessage && lastMessage.isSelf) {
      lastMessage.status = 'success'
    }

    nextTick(() => {
      scrollToBottom()
    })

    // 在对话进行一段时间后显示评价
    if (messages.length > 5 && !showRating.value) {
      setTimeout(() => {
        showRating.value = true
      }, 2000)
    }
  }

  // 消息发送失败
  if (data.type === 'DOWN_ERROR') {
    // 更新最后一条消息的发送状态为失败
    const lastMessage = messages[messages.length - 1]
    if (lastMessage && lastMessage.isSelf) {
      lastMessage.status = 'failed'
    }

    nextTick(() => {
      scrollToBottom()
    })
  }

  // 收到客服消息
  if (data.type === 'DOWN_NEW_MESSAGE') {
    // 添加客服消息到消息队列
    const serviceMessage = {
      content: data.data.chat.content,
      time: new Date(data.data.chat.sendTime).toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      isSelf: false,
      type: 'text'
    }
    messages.push(serviceMessage)

    nextTick(() => {
      scrollToBottom()
    })
  }
}

onMounted(() => {
  // 初始化时滚动到底部
  // scrollToBottom()

  // 注册emoji-picker组件
  if (!customElements.get('emoji-picker')) {
    import('emoji-picker-element').then(({ default: EmojiPicker }) => {
      customElements.define('emoji-picker', EmojiPicker)
    })
  }

  // 添加全局点击事件监听器关闭表情选择器
  document.addEventListener('click', (event) => {
    const emojiPicker = document.querySelector('.emoji-picker-container')
    const emojiButton = event.target.closest('button')

    if (showEmojiPicker.value &&
      emojiPicker &&
      !emojiPicker.contains(event.target) &&
      (!emojiButton || !emojiButton.textContent.includes('表情'))) {
      showEmojiPicker.value = false
    }
  })

  // 连接WebSocket
  wsClient.connect()

  // 注册WebSocket消息处理函数
  wsClient.onMessage(handleWebSocketMessage)
})

// 在组件卸载前断开WebSocket连接
onBeforeUnmount(() => {
  wsClient.disconnect()
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

.user-chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-width: 800px;
  margin: 0 auto;
  background-color: #fff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.chat-header {
  padding: 15px 20px;
  background-color: #4080ff;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  font-size: 18px;
  font-weight: bold;
}

.header-actions {
  display: flex;
  gap: 10px;
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
  position: relative;
}

.input-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;
}

.emoji-picker-container {
  position: absolute;
  bottom: 100%;
  right: 15px;
  z-index: 1000;
}

.chat-footer {
  padding: 10px 15px;
  background-color: #f9f9f9;
  border-top: 1px solid #e0e0e0;
}

.footer-info {
  font-size: 12px;
  color: #666;
  text-align: center;
}

.footer-rating {
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 14px;
}

:deep(.emoji-picker-container) {
  bottom: 7% !important;
  right: 125px !important;
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