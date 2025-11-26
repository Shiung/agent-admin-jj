import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { preloadTabsOnce } from '@/utils/preloadTabs'
import Login from '@/pages/login/index.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: { isPublic: true },
  },
  {
    path: '/',
    name: 'index',
    component: () => import('@/pages/index/index.vue'),
    meta: {
      showTabBar: true,
      showHeaderBar: true,
    },
  },
  {
    path: '/manage',
    name: 'manage',
    component: () => import('@/pages/manage/index.vue'),
    redirect: '/manage/member',
    children: [
      {
        path: 'member',
        name: 'manageMember',
        component: () => import('@/pages/manage/member.vue'),
        meta: {
          showTabBar: true,
          showHeaderBar: true,
        },
      },
      {
        path: 'agent',
        name: 'manageAgent',
        component: () => import('@/pages/manage/agent.vue'),
        meta: {
          showTabBar: true,
          showHeaderBar: true,
        },
      },
      {
        path: 'team',
        name: 'manageTeam',
        component: () => import('@/pages/manage/team.vue'),
        meta: {
          showTabBar: true,
          showHeaderBar: true,
        },
      },
      /** 巢狀路由(管理) 頁面迷航 導回會員管理 */
      {
        path: '/manage/:pathMatch(.*)*',
        redirect: '/manage/member',
      },
    ],
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
          showHeaderBar: true,
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
      showHeaderBar: true,
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

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  const token = userStore.token

  // 已登入 → 不讓去 login
  if (to.name === 'login' && token) {
    return next({ name: 'index' })
  }

  // 未登入 → 不給進非 public 頁
  if (!token && to.meta.isPublic !== true) {
    return next({ name: 'login' })
  }

  next()
})

router.afterEach((to) => {
  if (to.meta.showTabBar) {
    preloadTabsOnce()
  }
})

export default router
