<template>
    <div class="loading-container">
        <div class="loading-content">
            <el-icon class="loading-icon">
                <Loading />
            </el-icon>
            <div class="loading-text">{{ loadingText }}</div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
// 引入api创建临时会话
import { createSession } from '@/api/loding.js'

const router = useRouter()
const route = useRoute()
const loadingText = ref('正在连接客服系统...')

// 创建临时会话 userCode
const createSessionData = async (userCode, han) => {
    const res = await createSession({ ...userCode }, han)
    if (res) {
        ElMessage.success('连接客服系统成功')
        // 存储token到localStorage
        localStorage.setItem('token', res.token)
        // 存储session用户数据到localStorage
        localStorage.setItem('sessionUser', JSON.stringify(res.session))
        // 请求成功后跳转到用户聊天页面
        router.push({
            path: '/user-chat'
        })
    }
}

onMounted(async () => {
    // 获取路由参数
    const userCode = route.query.userCode
    const orgCode = route.query.orgCode
    const name = route.query.name

    // 调用api
    createSessionData({
        userCode,
        orgCode,
        name
    }, {
        'X-Client-Id': `${window.navigator.userAgent}_${window.screen.width}x${window.screen.height}_${window.navigator.hardwareConcurrency}_${window.navigator.platform}_${window.navigator.language}_${new Date().getTime()}`
            .split('')
            .reduce((hash, char) => {
                return ((hash << 5) - hash) + char.charCodeAt(0) | 0;
            }, 0)
            .toString(36)
    })
})

// 模拟API请求
const simulateApiRequest = (userId, source, type) => {
    return new Promise((resolve) => {
        // 这里可以替换为实际的API请求
        loadingText.value = '正在分配客服...'

        setTimeout(() => {
            // 模拟请求完成
            loadingText.value = '连接成功，正在跳转...'
            resolve()
        }, 2000)
    })
}
</script>

<style scoped>
.loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #f5f5f5;
}

.loading-content {
    text-align: center;
    padding: 30px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.loading-icon {
    font-size: 48px;
    color: #4080ff;
    animation: rotate 1.5s linear infinite;
}

.loading-text {
    margin-top: 20px;
    font-size: 16px;
    color: #666;
}

@keyframes rotate {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}
</style>