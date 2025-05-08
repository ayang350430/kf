<template>
  <div class="settings-container">
    <div class="page-header">
      <h2>系统设置</h2>
    </div>

    <el-tabs v-model="activeTab" class="settings-tabs">
      <el-tab-pane label="基本设置" name="basic">
        <div class="settings-card">
          <!-- <h3 class="settings-card-title">基本信息</h3> -->
          <el-form :model="basicForm" label-width="120px">
            <el-form-item label="系统名称">
              <el-input v-model="basicForm.systemName" placeholder="请输入系统名称" />
            </el-form-item>
            <el-form-item label="系统Logo">
              <el-upload
                class="avatar-uploader"
                action="#"
                :show-file-list="false"
                :before-upload="beforeLogoUpload"
              >
                <img v-if="basicForm.logoUrl" :src="basicForm.logoUrl" class="avatar" />
                <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
              </el-upload>
              <div class="upload-tip">建议尺寸: 200px × 200px，支持jpg、png格式</div>
            </el-form-item>
            <el-form-item label="系统描述">
              <el-input
                v-model="basicForm.description"
                type="textarea"
                :rows="3"
                placeholder="请输入系统描述"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveBasicSettings">保存设置</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>

      <el-tab-pane label="客服设置" name="service">
        <div class="settings-card">
          <!-- <h3 class="settings-card-title">客服配置</h3> -->
          <el-form :model="serviceForm" label-width="120px">
            <el-form-item label="工作时间">
              <el-time-picker
                v-model="serviceForm.workStartTime"
                placeholder="开始时间"
                format="HH:mm"
              />
              <span class="time-separator">至</span>
              <el-time-picker
                v-model="serviceForm.workEndTime"
                placeholder="结束时间"
                format="HH:mm"
              />
            </el-form-item>
            <el-form-item label="自动回复">
              <el-switch v-model="serviceForm.autoReply" />
            </el-form-item>
            <el-form-item label="自动回复内容" v-if="serviceForm.autoReply">
              <el-input
                v-model="serviceForm.autoReplyContent"
                type="textarea"
                :rows="3"
                placeholder="请输入自动回复内容"
              />
            </el-form-item>
            <el-form-item label="最大接待数量">
              <el-input-number v-model="serviceForm.maxServiceCount" :min="1" :max="50" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveServiceSettings">保存设置</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>

      <el-tab-pane label="消息设置" name="message">
        <div class="settings-card">
          <!-- <h3 class="settings-card-title">消息配置</h3> -->
          <el-form :model="messageForm" label-width="120px">
            <el-form-item label="消息提醒">
              <el-switch v-model="messageForm.enableNotification" />
            </el-form-item>
            <el-form-item label="声音提醒">
              <el-switch v-model="messageForm.enableSound" />
            </el-form-item>
            <el-form-item label="提示音选择" v-if="messageForm.enableSound">
              <el-select v-model="messageForm.soundType" placeholder="请选择提示音">
                <el-option label="默认提示音" value="default" />
                <el-option label="轻柔提示音" value="soft" />
                <el-option label="清脆提示音" value="clear" />
              </el-select>
              <el-button class="play-sound-btn" @click="playSound">试听</el-button>
            </el-form-item>
            <el-form-item label="历史记录保存">
              <el-select v-model="messageForm.historyDuration" placeholder="请选择保存时长">
                <el-option label="7天" value="7" />
                <el-option label="30天" value="30" />
                <el-option label="90天" value="90" />
                <el-option label="永久" value="forever" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveMessageSettings">保存设置</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>

      <el-tab-pane label="安全设置" name="security">
        <div class="settings-card">
          <!-- <h3 class="settings-card-title">安全配置</h3> -->
          <el-form :model="securityForm" label-width="120px">
            <el-form-item label="密码有效期">
              <el-select v-model="securityForm.passwordExpiry" placeholder="请选择密码有效期">
                <el-option label="30天" value="30" />
                <el-option label="60天" value="60" />
                <el-option label="90天" value="90" />
                <el-option label="永不过期" value="never" />
              </el-select>
            </el-form-item>
            <el-form-item label="登录失败锁定">
              <el-switch v-model="securityForm.enableLockout" />
            </el-form-item>
            <el-form-item label="失败次数" v-if="securityForm.enableLockout">
              <el-input-number v-model="securityForm.lockoutThreshold" :min="3" :max="10" />
            </el-form-item>
            <el-form-item label="锁定时间(分钟)" v-if="securityForm.enableLockout">
              <el-input-number v-model="securityForm.lockoutDuration" :min="5" :max="60" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveSecuritySettings">保存设置</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

// 当前激活的标签页
const activeTab = ref('basic')

// 基本设置表单
const basicForm = reactive({
  systemName: '客服管理系统',
  logoUrl: '',
  description: '专业的客服管理系统，提供高效的客户服务解决方案。'
})

// 客服设置表单
const serviceForm = reactive({
  workStartTime: new Date(2000, 0, 1, 9, 0),
  workEndTime: new Date(2000, 0, 1, 18, 0),
  autoReply: true,
  autoReplyContent: '您好，感谢您的咨询。我们的工作时间是9:00-18:00，请问有什么可以帮助您的？',
  maxServiceCount: 10
})

// 消息设置表单
const messageForm = reactive({
  enableNotification: true,
  enableSound: true,
  soundType: 'default',
  historyDuration: '30'
})

// 安全设置表单
const securityForm = reactive({
  passwordExpiry: '90',
  enableLockout: true,
  lockoutThreshold: 5,
  lockoutDuration: 30
})

// Logo上传前的处理
const beforeLogoUpload = (file) => {
  const isJPG = file.type === 'image/jpeg'
  const isPNG = file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPG && !isPNG) {
    ElMessage.error('上传头像图片只能是 JPG 或 PNG 格式!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('上传头像图片大小不能超过 2MB!')
    return false
  }
  
  // 模拟上传成功，实际项目中应该调用上传API
  const reader = new FileReader()
  reader.readAsDataURL(file)
  reader.onload = () => {
    basicForm.logoUrl = reader.result
  }
  
  return false // 阻止默认上传行为
}

// 试听提示音
const playSound = () => {
  const audio = new Audio()
  
  switch (messageForm.soundType) {
    case 'default':
      audio.src = '../assets/moren.mp3'
      break
    case 'soft':
      audio.src = 'https://cdn.example.com/sounds/notification/soft.mp3'
      break
    case 'clear':
      audio.src = 'https://cdn.example.com/sounds/notification/clear.mp3'
      break
  }
  
  audio.play().catch(e => {
    ElMessage.warning('无法播放音频，请检查浏览器设置')
    console.error('播放音频失败:', e)
  })
}

// 保存基本设置
const saveBasicSettings = () => {
  ElMessage.success('基本设置保存成功')
  // 实际项目中应该调用API保存设置
}

// 保存客服设置
const saveServiceSettings = () => {
  ElMessage.success('客服设置保存成功')
  // 实际项目中应该调用API保存设置
}

// 保存消息设置
const saveMessageSettings = () => {
  ElMessage.success('消息设置保存成功')
  // 实际项目中应该调用API保存设置
}

// 保存安全设置
const saveSecuritySettings = () => {
  ElMessage.success('安全设置保存成功')
  // 实际项目中应该调用API保存设置
}
</script>

<style scoped lang="scss">
.settings-container {
  padding: 30px;
  background-color: #f9f9f9;
  min-height: calc(100vh - 60px);
}

.page-header {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eaeaea;
  
  h2 {
    font-size: 24px;
    color: #333;
    margin: 0;
    position: relative;
    padding-left: 12px;
    
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 4px;
      height: 20px;
      background-color: #4080ff;
      border-radius: 2px;
    }
  }
}

.settings-tabs {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  
  :deep(.el-tabs__header) {
    margin-bottom: 0;
    padding: 0 20px;
  }
  
  :deep(.el-tabs__nav-wrap::after) {
    height: 1px;
  }
  
  :deep(.el-tabs__item) {
    height: 50px;
    line-height: 50px;
    font-size: 15px;
    
    &.is-active {
      color: #4080ff;
    }
  }
  
  :deep(.el-tabs__active-bar) {
    background-color: #4080ff;
  }
}

.settings-card {
  padding: 20px;
  
  .settings-card-title {
    font-size: 18px;
    color: #333;
    margin: 0 0 20px 0;
    padding-bottom: 15px;
    border-bottom: 1px solid #f0f0f0;
  }
}

.avatar-uploader {
  width: 120px;
  height: 120px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: border-color 0.3s;
  
  &:hover {
    border-color: #4080ff;
  }
  
  .avatar {
    width: 100%;
    height: 100%;
    display: block;
  }
  
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 120px;
    height: 120px;
    line-height: 120px;
    text-align: center;
  }
}

.upload-tip {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}

.time-separator {
  margin: 0 10px;
  color: #666;
}

.play-sound-btn {
  margin-left: 10px;
}

:deep(.el-form-item) {
  margin-bottom: 22px;
}

:deep(.el-input), :deep(.el-select) {
  width: 350px;
}

:deep(.el-input-number) {
  width: 180px;
}
</style>