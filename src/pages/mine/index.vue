<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const agentAccount = computed(() => {
  return userStore.userInfo?.Admin?.Username || ''
})
const lastLoginIp = ''

const goProfile = () => {
  router.push({ name: 'mineProfile' })
}

</script>

<template>
  <div class="bg-white flex flex-col">
    <!-- 個人卡片 -->
    <div class="flex items-center px-3 py-2" @click="goProfile">
      <van-image width="84" height="84" src="./static/images/avatar.png" />
      <div class="flex-1 flex flex-col justify-center ml-1">
        <p class="text-lg font-normal text-neutral-basic">
          {{ agentAccount }}
        </p>
        <p class="text-sm text-neutral-secondary">
          最近登陆 {{ lastLoginIp }}
        </p>
      </div>
      <van-icon name="arrow" size="24" class="text-neutral2-tertiary" />
    </div>

    <!-- 我的錢包 -->

    <!-- 常用功能 -->

    <!-- 設置列表 -->

    <!-- 版本號 -->
  </div>
</template>
