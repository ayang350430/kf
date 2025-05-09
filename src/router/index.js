import { createRouter, createWebHistory } from 'vue-router'
// import metar from "@/components/metar.vue";

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  // 个人中心
  {
    path: '/profile',
    name: 'profile',
    component: () => import('../views/Profile.vue'),
    meta: {
      requiresAuth: true
    }
  },
  // 登录
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  // 注册
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue')
  },
  // 聊天
  {
    path: '/chat',
    name: 'Chat',
    component: () => import('../views/Chat.vue'),
    meta: { requiresAuth: true }
  },
  // 个人信息
  {
    path: '/info',
    name: 'info',
    component: () => import('../views/info.vue'),
  },
  // 用户聊天页面
  {
    path: '/user-chat',
    name: 'UserChat',
    component: () => import('../views/UserChat.vue')
  },
  // 用户端客户进入页面
  {
    path: '/loading',
    name: 'Loading',
    component: () => import('../views/Loading.vue')
  },
  // 坐席管理页面
  {
    path: '/staff',
    name: 'Staff',
    component: () => import('../views/UserManagement.vue')
  },
  // 设置页面
  {
    path: '/setting',
    name: 'Setting',
    component: () => import('../views/Settings.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫，检查用户是否已登录
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const isLoggedIn = localStorage.getItem('isLoggedIn')

  // 如果需要登录认证但未登录，跳转到登录页
  if (to.meta.requiresAuth && !isLoggedIn) {
    next('/login')
    return
  }

  // 已登录用户不允许访问登录和注册页面
  if (isLoggedIn && token && (to.path === '/login' || to.path === '/register')) {
    next('/chat')
    return
  }

  next()
})

export default router