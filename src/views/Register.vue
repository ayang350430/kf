<template>
  <div class="register-container">
    <div class="bg">
        <div class="register-box">
          <h1 class="title">用户注册</h1>
          <el-form :model="registerForm" :rules="rules" ref="registerFormRef">
            <el-form-item prop="username">
              <el-input v-model="registerForm.username" placeholder="账号" prefix-icon="User" />
            </el-form-item>
            <el-form-item prop="password">
              <el-input v-model="registerForm.password" type="password" placeholder="密码" prefix-icon="Lock" show-password />
            </el-form-item>
            <el-form-item prop="confirmPassword">
              <el-input v-model="registerForm.confirmPassword" type="password" placeholder="确认密码" prefix-icon="Lock" show-password />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" class="register-btn" @click="handleRegister">注册</el-button>
            </el-form-item>
            <div class="login-link">
              <span>已有账号？</span>
              <router-link to="/login">返回登录</router-link>
            </div>
          </el-form>
        </div>
    </div>
    <div class="register-image">
      <img src="../assets/customer-service.png" alt="客服图片" />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { User, Lock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
// 导入rsa加密
import { encrypt } from '../utils/rsaEncypt.js'
// 引入注册接口
import { register } from '../api/login'

const router = useRouter()
const registerFormRef = ref(null)

const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: ''
})

const validatePass = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请输入密码'))
  } else {
    if (registerForm.confirmPassword !== '') {
      registerFormRef.value.validateField('confirmPassword')
    }
    callback()
  }
}

const validatePass2 = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

const rules = {
  username: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, validator: validatePass, trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validatePass2, trigger: 'blur' }
  ]
}

const handleRegister = () => {
  registerFormRef.value.validate(async (valid) => {
    if (valid) {
      // 注册接口
      let pas = encrypt(registerForm.password)
      let obj = {
        username: registerForm.username,
        password: pas,
        rePassword: pas,
      }
      let res = await register(obj)
      if (res == 'OK') {
        ElMessage.success('注册成功')
        router.push('/login')
      }
    }
  })
}
</script>

<style scoped>
.register-container {
  display: flex;
  height: 100vh;
  /* background-color: #4080ff; */
  overflow: hidden;
}

.bg {
    flex: 1;
    background-image: url('../assets/bg.png');
    background-size: 110% 130%;
    background-repeat: no-repeat;
    background-position: 100% 50%;
    display: flex;
    align-items: center;
}

.register-box {
  /* width: 400px; */
  min-width: 300px;
  padding: 40px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  margin: auto 0;
  margin-left: 10%;
  z-index: 1;
}

.title {
  text-align: center;
  margin-bottom: 30px;
  font-size: 24px;
  color: #333;
}

.register-btn {
  width: 100%;
  margin-top: 10px;
}

.login-link {
  text-align: center;
  margin-top: 15px;
  font-size: 14px;
}

.register-image {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.register-image img {
  max-width: 80%;
  max-height: 80%;
}
</style>