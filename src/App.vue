<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import { useGlobalStore } from '@/stores/global'
import { useUserStore } from '@/stores/user'
import HeaderBar from '@/components/HeaderBar/index.vue'
import TabBar from '@/components/TabBar/index.vue'
import api from '@/apis'

const route = useRoute()
const router = useRouter()
const globalStore = useGlobalStore()
const userStore = useUserStore()

let lastCheckTime = 0
const CHECK_DEBOUNCE_MS = 300

const handleCheckToken = () => {
  if (!userStore.token) return

  const now = Date.now()
  if (now - lastCheckTime < CHECK_DEBOUNCE_MS) return
  lastCheckTime = now

  api.system.checkToken()
}

const handleVisibilityChange = () => {
  if (document.visibilityState === 'visible') {
    handleCheckToken()
  }
}

const handleFocus = () => {
  handleCheckToken()
}

onMounted(async () => {
  globalStore.fetchSystemConfig()

  // 監聽頁面可見性變化和 focus 事件
  document.addEventListener('visibilitychange', handleVisibilityChange)
  window.addEventListener('focus', handleFocus)

  if (!userStore.token) return

  try {
    await userStore.ensureUser()
  } catch (e) {
    userStore.logout()
    router.replace({ name: 'login' })
  }
})

onUnmounted(() => {
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  window.removeEventListener('focus', handleFocus)
})
</script>

<template>
  <main class="min-h-[100svh] md:min-h-dvh flex flex-col overflow-y-auto ios-scroll">
    <!-- 头像与功能按钮行 -->
    <HeaderBar v-if="route.meta.showHeaderBar" />
    <RouterView v-slot="{ Component }">
      <transition name="page" mode="out-in">
        <component :is="Component" />
      </transition>
    </RouterView>
    <TabBar v-if="route.meta.showTabBar" />
  </main>
</template>

<style scoped>
/* 進場 */
.page-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

.page-enter-to {
  opacity: 1;
  transform: none;
}

.page-enter-active {
  transition: opacity 0.25s ease-out, transform 0.25s ease-out;
}

/* 離場 */
.page-leave-from {
  opacity: 1;
  transform: none;
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.page-leave-active {
  transition: opacity 0.2s ease-in, transform 0.2s ease-in;
}
</style>
