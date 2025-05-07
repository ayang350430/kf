<template>
    <div class="profile-container">
      <div class="profile-header">
        <h1>个人中心</h1>
        <el-button type="primary" size="small" @click="backToChat">返回聊天</el-button>
      </div>
      <div class="profile-content">
        <div class="profile-card">
          <div class="avatar-section">
            <el-avatar :size="100" icon="User" />
            <div class="username">{{ username }}</div>
          </div>
          <div class="info-section">
            <el-form label-width="100px">
              <el-form-item label="用户名">
                <el-input v-model="username" disabled />
              </el-form-item>
              <el-form-item label="注册时间">
                <el-input v-model="registerTime" disabled />
              </el-form-item>
              <el-form-item label="会话数量">
                <el-input v-model="conversationCount" disabled />
              </el-form-item>
            </el-form>
          </div>
        </div>
        <div class="action-buttons">
          <el-button type="primary" @click="handleLogout">退出登录</el-button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { ElMessage } from 'element-plus'
  import { useRouter } from 'vue-router'
  
  const router = useRouter()
  const username = ref(localStorage.getItem('username') || '用户')
  const registerTime = ref('2023-10-01') // 模拟数据
  const conversationCount = ref('3') // 模拟数据
  
  // 检查登录状态
  onMounted(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn')
    if (!isLoggedIn) {
      ElMessage.warning('请先登录')
      router.push('/login')
    }
  })
  
  // 返回聊天页面
  const backToChat = () => {
    router.push('/chat')
  }
  
  // 退出登录
  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('username')
    ElMessage.success('已退出登录')
    router.push('/login')
  }
  </script>
  
  <style scoped>
  .profile-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
  }
  
  .profile-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 1px solid #eee;
  }
  
  .profile-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  
  .profile-card {
    display: flex;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    padding: 20px;
  }
  
  .avatar-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
    border-right: 1px solid #eee;
  }
  
  .username {
    margin-top: 10px;
    font-size: 18px;
    font-weight: bold;
  }
  
  .info-section {
    flex: 1;
    padding: 20px;
  }
  
  .action-buttons {
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }
  </style>