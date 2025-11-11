<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useGlobalStore } from '@/stores/global'

const router = useRouter()
const route = useRoute()
const globalStore = useGlobalStore()

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
    key: 'profile',
    label: '个人',
    icon: 'user-o',
    activeIcon: 'user-o',
    path: '/profile',
  },
]

const activeKey = ref('home')

const tabbarContainer = ref<HTMLDivElement | null>(null)

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

onMounted(() => {
  globalStore.tabbarHeight = tabbarContainer.value?.clientHeight || 0
})
</script>

<template>
  <div :style="{ height: globalStore.tabbarHeight + 'px' }" />
  <div class="tabbar-container" ref="tabbarContainer">
    <van-tabbar v-model="activeKey" active-color="#007AFF" @change="handleTabChange" :fixed="false" :safe-area-inset-bottom="true">
      <van-tabbar-item v-for="tab in tabs" :key="tab.key" :name="tab.key" :icon="tab.icon">
        {{ tab.label }}
      </van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<style scoped>
.tabbar-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

:deep(.van-tabbar-item__icon) {
  font-size: 22px;
  margin-bottom: 4px;
}

:deep(.van-tabbar-item__text) {
  font-size: 12px;
}
</style>

