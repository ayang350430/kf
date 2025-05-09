<template>
  <div>
    <div class="sidebar">
      <div class="sidebar-item" @mouseenter="sidebarMouseenter">
        <div class="icon user-icon"></div>
        <div class="dropdown-menu" :style="{ height: dropdownHeiht + 'px' }" @mouseleave="sidebarMouseleave">
          <div class="dropdown-item" @click="toInfo">个人信息</div>
          <div class="dropdown-item" @click="toSize">设置</div>
          <div class="dropdown-item" @click="handleLogout">退出登录</div>
        </div>
      </div>
      <div class="sidebar-item">
        <div class="icon message-icon" @click="toChat"></div>
      </div>
      <div class="sidebar-item">
        <div class="icon group-icon" @click="toStaff"></div>
      </div>
      <!-- <div class="sidebar-item">
        <div class="icon share-icon"></div>
      </div>
      <div class="sidebar-item">
        <div class="icon settings-icon"></div>
      </div>
      <div class="sidebar-item">
        <div class="icon chat-icon"></div>
      </div> -->
    </div>
  </div>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { ref } from 'vue'
// 引入用户仓库
import { useUserStore } from '../stores/index.js'

const router = useRouter()
const dropdownHeiht = ref(0)

// 退出登录
const handleLogout = async() => {
  let res = await useUserStore().logouts();
  if (res == 'OK') {
    ElMessage.success('退出登录成功')
    router.push('/login')// 定向到登录页面
  }
}  

// 鼠标移入
const sidebarMouseenter = () => {
  dropdownHeiht.value = 110
}

// 鼠标移出
const sidebarMouseleave = () => {
  dropdownHeiht.value = 0
}

// 进入个人中心
const toInfo = () => {
  router.push('/info')
}

// 进入聊天页面
const toChat = () => {
  router.push('/chat')
}

// 点击设置
const toSize = () => {
  // ElMessage.info('暂未开发')
  router.push('/setting')
}

// 进入坐席管理
const toStaff = () => {
  router.push('/staff')
}
</script>

<style scoped lang="scss">
.dropdown-menu {
  position: absolute;
  left: 80px;
  top: 20px;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  // padding: 10px 0;
  min-width: 120px;
  z-index: 10;
  transition: all .3s;
  overflow: hidden;
}

.dropdown-item {
  padding: 8px 16px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  transition: background-color 0.3s;
}

.dropdown-item:hover {
  background-color: #f5f7fa;
  color: #52bfff;
}

.sidebar {
  width: 80px;
  height: 100vh;
  background-color: #52bfff;
  display: flex;
  flex-direction: column;
  align-items: center;
  // padding: 20px 0;
  box-sizing: border-box;
}

.sidebar-item {
  width: 40px;
  height: 40px;
  margin: 20px 0;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.icon {
  width: 40px;
  height: 40px;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}

.user-icon {
  background-image: url('../assets/user.png');
}

.message-icon {
  background-image: url('../assets/message.png');
}

.group-icon {
  background-image: url('../assets/group.png');
}

.share-icon {
  background-image: url('../assets/share.png');
}

/* .settings-icon {
  background-image: url('../assets/settings.png');
}

.chat-icon {
  background-image: url('../assets/chat.png');
} */
</style>