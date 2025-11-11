<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

// 代理账号
const agentAccount = computed(() => {
  return userStore.userInfo?.Admin?.Username || '代理用户'
})

// 消息未读状态
const hasUnreadMessage = ref(true)

// 跳转到代理代存页面
const handleDepositClick = () => {
  router.push('/deposit')
}

// 跳转到实时通知页面
const handleNotificationClick = () => {
  hasUnreadMessage.value = false
  router.push('/notifications')
}
</script>

<template>
  <div class="flex items-center justify-between h-11 px-3 py-2 bg-white">
    <!-- 左侧：头像与欢迎语 -->
    <div class="flex items-center gap-3">
      <div class="w-7 h-7 rounded-full flex items-center justify-center border-2">
        <svg class="w-7 h-7 text-neutral-secondary" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
      </div>
      <div class="text-neutral-basic">
        <div class="text-base font-semibold">{{ agentAccount }} 欢迎回来</div>
      </div>
    </div>

    <!-- 右侧：代存按钮和消息图标 -->
    <div class="flex items-center gap-3">
      <!-- 代存按钮 -->
      <div class="text-primary-normal text-xs font-semibold border border-primary-normal rounded-[6.25rem] h-8 px-2 py-1 flex items-center justify-center cursor-pointer" @click="handleDepositClick">
        <van-icon name="add" class="mr-1" size="14"/>代存
      </div>

      <!-- 消息通知图标 -->
      <button
        @click="handleNotificationClick"
        class="relative w-10 h-10 backdrop-blur-sm rounded-lg flex items-center justify-center"
      >
        <svg class="w-5 h-5 text-neutral-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <!-- 红点提示 -->
        <span v-if="hasUnreadMessage" class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
      </button>
    </div>
  </div>
</template>

