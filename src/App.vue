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
  <div class="min-h-screen">
    <RouterView />
    <TabBar v-if="route.meta.showTabBar" />
    <VanToast />
  </div>
</template>

<style scoped></style>
