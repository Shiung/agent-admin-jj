<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import API from '@/apis'

import TabBar from '@/components/TabBar/index.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const fetchIsLogin = async () => {
  const res = await API.system.isLogin()
  if (res.data.Code !== 200) return router.push('/login')

  userStore.userInfo = res.data.Data
}

onMounted(() => {
  // TODO - 沒登入的話才要跳
  const userInfo = localStorage.getItem('userToken')
  if (!userInfo) router.push('/login')
  else fetchIsLogin()
})
</script>

<template>
  <main class="min-h-[100svh] md:min-h-dvh flex flex-col overflow-y-auto ios-scroll">
    <RouterView v-slot="{ Component }">
      <transition name="page" mode="out-in">
        <component :is="Component" />
      </transition>
    </RouterView>
  </main>
  <TabBar v-if="route.meta.showTabBar" />
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
  transition: opacity .25s ease-out, transform .25s ease-out;
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
  transition: opacity .20s ease-in, transform .20s ease-in;
}
</style>
