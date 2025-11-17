import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/pages/login/index.vue'),
  },
  {
    path: '/',
    name: 'index',
    component: () => import('@/pages/index/index.vue'),
    meta: {
      showTabBar: true,
    },
  },
  {
    path: '/manage',
    name: 'manage',
    component: () => import('@/pages/manage/index.vue'),
    meta: {
      showTabBar: true,
    },
  },
  {
    path: '/promote',
    name: 'promote',
    components: {
      default: () => import('@/pages/promote/index.vue'),
    },
    children: [
      {
        path: '',
        name: 'promoteHome',
        components: {
          default: () => import('@/pages/promote/promoteHome.vue'),
        },
        meta: {
          showTabBar: true,
        },
      },
      {
        path: 'material/:productId',
        name: 'promoteMaterialPort',
        components: {
          default: () => import('@/pages/promote/materialPort.vue'),
        },
        meta: {
          showTabBar: true,
        },
      },
      {
        path: 'material/:productId/edit',
        name: 'promoteMaterialEdit',
        components: {
          default: () => import('@/pages/promote/materialEdit.vue'),
        },
      },
    ],
  },
  {
    path: '/report',
    name: 'report',
    component: () => import('@/pages/report/index.vue'),
    meta: {
      showTabBar: true,
    },
  },
  {
    path: '/mine',
    name: 'mine',
    component: () => import('@/pages/mine/index.vue'),
    meta: {
      showTabBar: true,
    },
  },
  {
    path: '/mine/profile',
    name: 'mineProfile',
    component: () => import('@/pages/mine/profile.vue'),
  },
  {
    path: '/commission-detail',
    name: 'commissionDetail',
    component: () => import('@/pages/commission-detail/index.vue'),
  },
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const token = userStore.token

  // 已登入 → 禁止進 login
  if (to.name === 'login' && token) {
    return next({ name: 'index' })
  }

  // 未登入 → 想進非 login → 導到 login
  if (!token && to.name !== 'login') {
    return next({ name: 'login' })
  }

  next()
})

export default router
