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
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫，检查用户是否已登录
router.beforeEach((to, from, next) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn')
  if (to.meta.requiresAuth && !isLoggedIn) {
    next('/login')
  } else {
    next()
  }
})

export default router