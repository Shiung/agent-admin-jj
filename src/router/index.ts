import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
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
          name: 'materialPort',
          components: {
            default: () => import('@/pages/promote/materialPort.vue'),
          },
          meta: {
            showTabBar: true,
          }
        },
        {
          path: 'material/:productId/edit',
          name: 'materialEdit',
          components: {
            default: () => import('@/pages/promote/marerialEdit.vue'),
          }
        }
      ]
    },
    {
      path: '/commission-detail',
      name: 'commission-detail',
      component: () => import('@/pages/commission-detail/index.vue'),
    },
  ],
})

export default router
