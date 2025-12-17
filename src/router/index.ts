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
        component: () => import('@/pages/manage/member.vue'),
        children: [
          {
            path: '',
            name: 'manageMember',
            component: () => import('@/pages/manage/member/index.vue'),
            meta: {
              showTabBar: true,
              showHeaderBar: true,
            },
          },
          {
            path: ':id',
            name: 'manageMemberDetail',
            component: () => import('@/pages/manage/member/detail/index.vue')
          },
          {
            path: 'belongApply',
            name: 'manageMemberBelongApply',
            component: () => import('@/pages/manage/member/belongApply.vue')
          },
          {
            path: 'belongRecord',
            name: 'manageMemberBelongRecord',
            component: () => import('@/pages/manage/member/belongRecord.vue')
          }
        ]
      },
      {
        path: 'agent',
        name: 'manageAgent',
        component: () => import('@/pages/manage/agent/index.vue'),
        meta: {
          showTabBar: true,
          showHeaderBar: true,
        },
      },
      {
        path: 'agent/orgChart',
        name: 'agentOrgChart',
        component: () => import('@/pages/manage/agent/orgChart.vue'),
      },
      {
        path: 'agent/deposit',
        name: 'agentDeposit',
        component: () => import('@/pages/agent/deposit/index.vue'),
      },
      {
        path: 'agent/depositRecord',
        name: 'agentDepositRecord',
        component: () => import('@/pages/agent/depositRecord/index.vue'),
      },
      {
        path: 'team',
        name: 'manageTeam',
        component: () => import('@/pages/manage/team/index.vue'),
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
    path: '/report/finance/game-record',
    name: 'financeGameRecord',
    component: () => import('@/pages/report/finance/gameRecord.vue'),
  },
  {
    path: '/report/finance/game-order-detail',
    name: 'financeGameOrderDetail',
    component: () => import('@/pages/report/finance/gameOrderDetail.vue'),
  },
  {
    path: '/report/finance/deposit-withdraw-record',
    name: 'financeDepositWithdrawRecord',
    component: () => import('@/pages/report/finance/depositWithdrawRecord.vue'),
  },
  {
    path: '/report/finance/bonus-record',
    name: 'financeBonusRecord',
    component: () => import('@/pages/report/finance/bonusRecord.vue'),
  },
  {
    path: '/report/finance/deposit-record',
    name: 'financeDepositRecord',
    component: () => import('@/pages/report/finance/depositRecord.vue'),
  },
  {
    path: '/report/finance/deposit-withdraw-fee-record',
    name: 'financeDepositWithdrawFeeRecord',
    component: () => import('@/pages/report/finance/depositWithdrawFeeRecord.vue'),
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
    path: '/mine/nickname',
    name: 'mineNickname',
    component: () => import('@/pages/mine/nickname.vue'),
  },
  {
    path: '/mine/realName',
    name: 'mineRealName',
    component: () => import('@/pages/mine/realname.vue'),
  },
  {
    path: '/mine/phone',
    name: 'minePhone',
    component: () => import('@/pages/mine/phone.vue'),
  },
  {
    path: '/mine/email',
    name: 'mineEmail',
    component: () => import('@/pages/mine/email.vue'),
  },
  {
    path: '/mine/googleCode',
    name: 'mineGoogleCode',
    component: () => import('@/pages/mine/googleCode.vue'),
  },
  {
    path: '/mine/qq',
    name: 'mineQQ',
    component: () => import('@/pages/mine/qq.vue'),
  },
  {
    path: '/mine/withdrawAccount',
    name: 'withdrawAccount',
    component: () => import('@/pages/mine/withdrawAccount.vue'),
  },
  {
    path: '/mine/memberRecharge',
    name: 'memberRecharge',
    component: () => import('@/pages/mine/memberRecord/memberRecharge.vue'),
  },
  {
    path: '/mine/memberRechargeRecord',
    name: 'memberRechargeRecord',
    component: () => import('@/pages/mine/memberRecord/memberRechargeRecord.vue'),
  },
  {
    path: '/mine/security',
    name: 'security',
    component: () => import('@/pages/mine/security/index.vue'),
  },
  {
    path: '/mine/help',
    name: 'help',
    component: () => import('@/pages/mine/help/index.vue'),
    children: [
      {
        path: 'detail',
        name: 'helpDetail',
        component: () => import('@/pages/mine/help/detail.vue'),
      }
    ],
  },
  {
    path: '/mine/security/password',
    name: 'password',
    component: () => import('@/pages/mine/security/password.vue'),
  },
  {
    path: '/mine/security/loginSetting',
    name: 'loginSetting',
    component: () => import('@/pages/mine/security/loginSetting.vue'),
  },
  {
    path: '/mine/security/privatePassword',
    name: 'privatePassword',
    component: () => import('@/pages/mine/security/privatePassword.vue'),
  },
  {
    path: '/mine/security/gesturePassword',
    name: 'gesturePassword',
    component: () => import('@/pages/mine/security/gesturePassword.vue'),
    children: [
      {
        path: 'gesture',
        name: 'gesture',
        component: () => import('@/pages/mine/security/gesture.vue'),
      },
    ],
  },
  {
    path: '/mine/betRecord',
    name: 'betRecord',
    component: () => import('@/pages/mine/betRecord.vue')
  },
  {
    path: '/mine/fundDetail',
    name: 'fundDetail',
    component: () => import('@/pages/mine/fundDetail.vue')
  },
  {
    path: '/commission-detail',
    name: 'commissionDetail',
    component: () => import('@/pages/commission-detail/index.vue'),
  },
  {
    path: '/withdraw',
    name: 'withdraw',
    component: () => import('@/pages/finance/withdraw/index.vue'),
    children: [
      {
        path: '',
        name: 'withdrawPage',
        component: () => import('@/pages/finance/withdraw/withdraw.vue'),
      },
      {
        path: 'withdrawRecord',
        name: 'withdrawRecord',
        component: () => import('@/pages/finance/withdraw/withdrawRecord.vue'),
      },
    ]
  },
  {
    path: '/recharge',
    name: 'recharge',
    component: () => import('@/pages/finance/recharge/index.vue'),
    children: [
      {
        path: '',
        name: 'rechargePage',
        component: () => import('@/pages/finance/recharge/recharge.vue'),
      },
      {
        path: 'rechargeRecord',
        name: 'rechargeRecord',
        component: () => import('@/pages/finance/recharge/rechargeRecord.vue'),
      },
    ]
  },
  {
    path: '/mine/commissionQuota',
    name: 'commissionQuota',
    component: () => import('@/pages/mine/commissionQuota/index.vue'),
    children: [
      {
        path: 'record',
        name: 'record',
        component: () => import('@/pages/mine/commissionQuota/record.vue'),
      },
    ]
  }
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
