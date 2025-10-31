import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      component: () => import('@/pages/login/index.vue'),
    },
    {
      path: '/',
      component: () => import('@/pages/index/index.vue'),
      meta: {
        showTabBar: true,
      },
    },
  ],
})

export default router
