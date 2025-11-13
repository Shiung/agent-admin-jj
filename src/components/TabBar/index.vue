<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

interface TabItem {
  key: string
  label: string
  icon: string
  activeIcon: string
  path: string
}

const tabs: TabItem[] = [
  {
    key: 'home',
    label: '首页',
    icon: 'home-o',
    activeIcon: 'home-o',
    path: '/',
  },
  {
    key: 'manage',
    label: '管理',
    icon: 'setting-o',
    activeIcon: 'setting-o',
    path: '/manage',
  },
  {
    key: 'promote',
    label: '推广',
    icon: 'share-o',
    activeIcon: 'share-o',
    path: '/promote',
  },
  {
    key: 'report',
    label: '报表',
    icon: 'chart-trending-o',
    activeIcon: 'chart-trending-o',
    path: '/report',
  },
  {
    key: 'mine',
    label: '个人',
    icon: 'user-o',
    activeIcon: 'user-o',
    path: '/mine',
  },
]

const activeKey = ref('home')

// 根據當前路由更新 activeKey
watch(
  () => route.path,
  (newPath) => {
    const tab = tabs.find((t) => t.path === newPath)
    if (tab) {
      activeKey.value = tab.key
    }
  },
  { immediate: true },
)

const handleTabChange = (key: string) => {
  const tab = tabs.find((t) => t.key === key)
  if (tab && route.path !== tab.path) {
    router.push(tab.path)
  }
}
</script>

<template>
  <van-tabbar class="app-tabbar" v-model="activeKey" active-color="#007AFF" @change="handleTabChange" placeholder
    safe-area-inset-bottom>
    <van-tabbar-item v-for="tab in tabs" :key="tab.key" :name="tab.key" :icon="tab.icon">
      {{ tab.label }}
    </van-tabbar-item>
  </van-tabbar>
</template>

<style lang="scss" scoped>
.app-tabbar {
  :deep(.van-tabbar-item__icon) {
    font-size: 22px;
    margin-bottom: 4px;
  }

  :deep(.van-tabbar-item__text) {
    font-size: 12px;
  }
}
</style>
