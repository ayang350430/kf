<template>
  <div class="info-container">
    <div class="info-header">
      <h2>个人信息</h2>
    </div>
    <div class="info-content">
      <div class="avatar-section">
        <el-avatar :size="100" :src="userInfo.avatar" icon="User" />
        <el-button type="primary" size="small" class="upload-btn" @click="upAvater">更换头像</el-button>
      </div>
      <div class="info-form">
        <el-form :model="userInfo" label-width="80px">
          <el-form-item label="用户名">
            <el-input v-model="userInfo.username" disabled></el-input>
          </el-form-item>
          <el-form-item label="组织简介">
            <el-input v-model="userInfo.zzjj"></el-input>
          </el-form-item>
          <el-form-item label="组织名称">
            <el-input v-model="userInfo.zzmc"></el-input>
          </el-form-item>
          <!-- <el-form-item label="手机号">
            <el-input v-model="userInfo.phone"></el-input>
          </el-form-item>
          <el-form-item label="地址">
            <el-input v-model="userInfo.address" type="textarea" :rows="2"></el-input>
          </el-form-item> -->
          <el-form-item>
            <el-button type="primary" @click="saveUserInfo">保存</el-button>
            <el-button @click="resetForm">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
// 引入api
import { editUserInfo } from '@/api/info.js'

const router = useRouter()
const userInfo = ref({
  username: localStorage.getItem('username') || '用户',
  name: '游客',
  zzjj: '',
  zzmc: '',
  avatar: ''// 头像
})

// 保存用户信息
const saveUserInfo = async () => {
  let obj = {
    nickName: userInfo.value.name,
    orgBrief: userInfo.value.zzjj,
    orgName: userInfo.value.zzmc,
    avatarPath: userInfo.value.avatar
  }
  const res = await editUserInfo(obj)
  console.log(res);
  
  ElMessage.success('保存成功')
}

// 选择头像
const upAvater = () => {
  // 创建一个隐藏的文件输入元素
  const fileInput = document.createElement('input')
  fileInput.type = 'file'
  fileInput.accept = 'image/*'
  
  // 监听文件选择事件
  fileInput.onchange = (event) => {
    const file = event.target.files[0]
    if (file) {
      // 创建一个FormData对象用于上传
      const formData = new FormData()
      formData.append('avatar', file)
      
      // 这里可以添加上传头像的API调用
      // 例如: const res = await uploadAvatar(formData)
      
      // 临时显示选择的图片
      const reader = new FileReader()
      reader.onload = (e) => {
        // 这里可以预览图片或更新头像
        // 例如: userInfo.value.avatar = e.target.result
        userInfo.value.avatar = e.target.result
      }
      reader.readAsDataURL(file)
      
      ElMessage.success('头像已选择，等待上传')
    }
  }
  
  // 触发文件选择对话框
  fileInput.click()
}

// 重置表单
const resetForm = () => {
  userInfo.value = {
    username: localStorage.getItem('username') || '用户',
    name: '游客',
    email: '',
    phone: '',
    address: '',
  }
  ElMessage.info('已重置')
}

onMounted(() => {
  // 这里可以添加获取用户信息的逻辑
  // 例如从API获取用户详细信息
})
</script>

<style scoped lang="scss">
.info-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 30px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.info-header {
  margin-bottom: 30px;
  border-bottom: 2px solid #52bfff;
  padding-bottom: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-header h2 {
  color: #333;
  font-size: 24px;
  margin: 0;
}

.info-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 6px;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 40px;
  position: relative;
}

.avatar-section .el-avatar {
  border: 4px solid #52bfff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.avatar-section .el-avatar:hover {
  transform: scale(1.05);
}

.upload-btn {
  margin-top: 15px;
  background-color: #52bfff;
  border-color: #52bfff;
  transition: all 0.3s ease;
}

.upload-btn:hover {
  background-color: #3aa8e8;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.info-form {
  width: 100%;
  max-width: 500px;
  padding: 20px;
  background-color: #fff;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.info-form .el-form-item {
  margin-bottom: 20px;
}

.info-form .el-input {
  border-radius: 4px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 30px;
}

.form-actions .el-button {
  padding: 10px 20px;
  transition: all 0.3s ease;
}

.form-actions .el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .info-container {
    padding: 15px;
  }
  
  .info-form {
    padding: 15px;
  }
}

.info-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.info-header {
  margin-bottom: 30px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.info-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
}

.upload-btn {
  margin-top: 10px;
}

.info-form {
  width: 100%;
  max-width: 500px;
}
</style>
