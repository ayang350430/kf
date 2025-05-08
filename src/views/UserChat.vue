<template>
  <div class="user-chat-container">
    <div class="chat-header">
      <div class="header-title">
        <span>客服中心</span>
      </div>
      <div class="header-actions">
        <!-- <el-button type="primary" size="small" @click="minimizeChat">最小化</el-button> -->
        <el-icon  @click="closeChat"><Close /></el-icon>
        <!-- <el-button type="" size="small" @click="closeChat">
        </el-button> -->
      </div>
    </div>
    
    <div class="chat-messages" ref="messagesContainer">
      <div 
        v-for="(message, index) in messages" 
        :key="index"
        class="message"
        :class="{ 'message-self': message.isSelf }"
      >
        <el-avatar :size="40" :icon="message.isSelf ? 'User' : 'Service'" />
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
      <el-input
        v-model="messageInput"
        type="textarea"
        :rows="3"
        placeholder="请输入消息..."
        @keyup.enter.native="sendMessage"
      />
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
import { ref, reactive, onMounted, nextTick } from 'vue'
import { User, Service } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import 'emoji-picker-element'

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

// 打开表情选择器
const openEmojiPicker = () => {
  showEmojiPicker.value = !showEmojiPicker.value
}

// 选择表情
const addEmoji = (event) => {
  messageInput.value += event.detail.unicode
  showEmojiPicker.value = false
}

// 选择图片
const openImageUploader = () => {
  const fileInput = document.createElement('input')
  fileInput.type = 'file'
  fileInput.accept = 'image/*'
  fileInput.style.display = 'none'
  
  fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageMessage = {
          content: e.target.result,
          time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
          isSelf: true,
          type: 'image'
        }
        
        messages.push(imageMessage)
        messageInput.value = ''
        
        nextTick(() => {
          scrollToBottom()
        })
        
        // 模拟客服回复
        setTimeout(() => {
          simulateServiceReply()
        }, 1000)
      }
      reader.readAsDataURL(file)
    }
  })
  
  document.body.appendChild(fileInput)
  fileInput.click()
  document.body.removeChild(fileInput)
}

// 发送消息
const sendMessage = () => {
  if (!messageInput.value.trim()) return

  const newMessage = {
    content: messageInput.value,
    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    isSelf: true,
    type: 'text'
  }

  messages.push(newMessage)
  messageInput.value = ''

  nextTick(() => {
    scrollToBottom()
  })

  // 模拟客服回复
  setTimeout(() => {
    simulateServiceReply()
  }, 1000)
}

// 模拟客服回复
const simulateServiceReply = () => {
  // 随机选择一个回复
  const replies = [
    '您好，我们正在处理您的问题，请稍等。',
    '感谢您的咨询，我们会尽快为您解决问题。',
    '您的问题我已经记录下来了，稍后会有专人为您解答。',
    '请问您能提供更多详细信息吗？这样我们能更好地帮助您。',
    '我们已经收到您的反馈，正在为您查询相关信息。'
  ]
  
  const randomReply = replies[Math.floor(Math.random() * replies.length)]
  
  const serviceMessage = {
    content: randomReply,
    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    isSelf: false,
    type: 'text'
  }
  
  messages.push(serviceMessage)
  
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

// 滚动到底部
const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// 最小化聊天窗口
const minimizeChat = () => {
  ElMessage.info('聊天窗口已最小化')
  // 这里可以实现实际的最小化逻辑
}

// 关闭聊天窗口
const closeChat = () => {
  ElMessage.info('聊天已结束')
  router.push('/')
}

// 提交评价
const submitRating = () => {
  ElMessage.success(`感谢您的评价：${serviceRating.value}星`)
  showRating.value = false
}

onMounted(() => {
  // 初始化时滚动到底部
  scrollToBottom()

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
})
</script>

<style scoped lang="scss">
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