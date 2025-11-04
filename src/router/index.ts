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
    // {
    //   path: '/commission-detail/:id',
    //   name: 'commission-detail',
    //   component: () => import('@/pages/commission-detail/index.vue'),
    // },
  ],
})

export default router
