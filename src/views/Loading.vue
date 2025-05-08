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

const router = useRouter()
const route = useRoute()
const loadingText = ref('正在连接客服系统...')

onMounted(async () => {
    try {
        // 获取路由参数
        const userId = route.query.userId
        const source = route.query.source
        const type = route.query.type

        // 模拟API请求
        await simulateApiRequest(userId, source, type)

        // 请求成功后跳转到用户聊天页面
        router.push({
            path: '/user-chat',
            query: {
                userId: userId,
                source: source,
                type: type
            }
        })
    } catch (error) {
        loadingText.value = '连接失败，请稍后重试...'
        ElMessage.error('连接客服系统失败')

        // 3秒后返回首页
        setTimeout(() => {
            // 示例：跳转到加载页面
            router.push({
                path: '/loading',
                query: {
                    userId: '123',
                    source: 'website',
                    type: 'support'
                }
            })
        }, 3000)
    }
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