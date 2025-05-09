<template>
    <div class="login-container">
        <div class="bg">
            <div class="login-box">
                <h1 class="title">
                    <img class="title_logo" src="../assets/logo.png" alt="">
                    中鸡客服管理后台
                </h1>
                <el-form :model="loginForm" :rules="rules" ref="loginFormRef">
                    <el-form-item prop="username">
                        <el-input v-model="loginForm.username" placeholder="账号" prefix-icon="User" />
                    </el-form-item>
                    <el-form-item prop="password">
                        <el-input v-model="loginForm.password" type="password" placeholder="密码" prefix-icon="Lock"
                            show-password />
                    </el-form-item>
                    <el-form-item prop="captcha">
                        <div class="captcha-container">
                            <el-input v-model="loginForm.captcha" placeholder="验证码" />
                            <div class="captcha-img" @click="refreshCaptcha">
                                <img :src="loginForm.img" alt="" srcset="">
                            </div>
                        </div>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" class="login-btn" @click="handleLogin">登录</el-button>
                    </el-form-item>
                    <div class="register-link">
                        <span>还没有账号？</span>
                        <router-link to="/register">立即注册</router-link>
                    </div>
                </el-form>
            </div>
        </div>
        <div class="login-image">
            <img src="../assets/customer-service.png" alt="客服图片" />
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { User, Lock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
// 导入rsa加密
import { encrypt } from '../utils/rsaEncypt.js'
// 导入登录api
import { login, getCaptcha } from '../api/login'
// 引入用户仓库
import { useUserStore } from '../stores/index.js'

const router = useRouter()
const loginFormRef = ref(null)
const captchaText = ref('S3A')

const loginForm = reactive({
    username: '',
    password: '',
    captcha: '',
    uuid:'', // 验证码uuid
    img: '', // 验证码base64链接
})

const rules = {
    username: [
        { required: true, message: '请输入账号', trigger: 'blur' }
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' }
    ],
    captcha: [
        { required: true, message: '请输入验证码', trigger: 'blur' }
    ]
}

// 生成验证码
const generateCaptcha = async() => {
    let res = await getCaptcha()
    loginForm.uuid = res.uuid;
    loginForm.img = res.img;
}

// 点击验证码图片时刷新验证码
const refreshCaptcha = () => {
    generateCaptcha()
}



onMounted(() => {
    generateCaptcha()
})

const handleLogin = () => {
    loginFormRef.value.validate(async (valid) => {
        if (valid) {
            let obj = {
                username: loginForm.username,
                password: encrypt(loginForm.password),
                uuid: loginForm.uuid,
                code: loginForm.captcha
            }
           try {
            let res = await login(obj)
            if (res.token) {
                // 获取验证码
                refreshCaptcha();
                localStorage.setItem('isLoggedIn', 'true')
                localStorage.setItem('username', loginForm.username)
                // 存储用户仓库，持久化储存信息
                useUserStore().setToken(res.token)
                useUserStore().setUserInfo(res.user)
                ElMessage.success('登录成功')
                router.push('/chat')
            }
           } catch (error) {
                refreshCaptcha();
                console.log(error);
           }
        }
    })
}
</script>

<style scoped>
.login-container {
    display: flex;
    height: 100vh;
    /* background-color: #4080ff; */
    overflow: hidden;
}
.title_logo {
    width: 40px;
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
.login-box {
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
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    flex-direction: column;
}

.login-btn {
    width: 100%;
    margin-top: 10px;
}

.captcha-container {
    display: flex;
    align-items: center;
}

.captcha-img {
    width: 100px;
    height: 40px;
    line-height: 40px;
    text-align: center;
    background-color: #f0f0f0;
    margin-left: 10px;
    font-family: 'Arial', sans-serif;
    font-weight: bold;
    font-size: 18px;
    user-select: none;
    cursor: pointer;

    img {
        width: 100px;
        height: 40px;
    }
}

.register-link {
    text-align: center;
    margin-top: 15px;
    font-size: 14px;
}

.login-image {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
}

.login-image img {
    max-width: 80%;
    max-height: 80%;
}
</style>