<!-- src/pages/mine/profile.vue -->
<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import NavBar from '@/components/NavBar/index.vue'

const router = useRouter()
const userStore = useUserStore()

const handleLogout = () => {
  userStore.logout()
  router.replace({ name: 'login' })
}
</script>

<template>
  <div class="flex flex-col pb-6">
    <!-- NavBar -->
    <NavBar title="基础资料" />

    <div class="px-3 pt-3 flex-1">
      <van-button block round type="primary" @click="handleLogout">
        退出登录
      </van-button>
    </div>
  </div>
</template>

<style scoped></style>
