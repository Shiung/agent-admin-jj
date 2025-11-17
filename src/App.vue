<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import API from '@/apis'

import TabBar from '@/components/TabBar/index.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const goLogin = () => {
  if (route.name !== 'login') {
    router.push({ name: 'login' })
  }
}

const fetchIsLogin = async () => {
  try {
    const res = await API.system.isLogin()
    if (res.data.Code !== 200) {
      userStore.setToken(null)
      goLogin()
      return
    }

    userStore.userInfo = res.data.Data
  } catch (err) {
    console.error('isLogin error', err)
    goLogin()
  }
}

onMounted(() => {
  const token = userStore.token

  if (!token) {
    goLogin()
    return
  }

  // 有 token → 檢查是否仍有效
  fetchIsLogin()
})
</script>

<template>
  <main class="min-h-[100svh] md:min-h-dvh flex flex-col overflow-y-auto ios-scroll">
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
