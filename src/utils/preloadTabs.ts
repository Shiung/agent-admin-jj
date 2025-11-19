let hasPreloadedTabs = false

export function preloadTabsOnce() {
  if (hasPreloadedTabs) return
  hasPreloadedTabs = true

  console.log('Preloading tab pages...')

  const loaders = [
    () => import('@/pages/index/index.vue'),
    () => import('@/pages/manage/index.vue'),
    () => import('@/pages/promote/index.vue'),
    () => import('@/pages/report/index.vue'),
    () => import('@/pages/mine/index.vue'),
  ]

  loaders.forEach((fn) => fn())
}
