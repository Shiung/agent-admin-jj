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
  router.push({ name: 'agentDeposit' })
}

// 跳转到实时通知页面
const handleNotificationClick = () => {
  hasUnreadMessage.value = false
  router.push({ name: 'notifications' })
}
</script>

<template>
  <div class="h-11 w-full" />
  <div class="flex items-center justify-between h-11 w-full px-3 py-2 bg-white fixed top-0 left-0 z-20">
    <!-- 左侧：头像与欢迎语 -->
    <div class="flex items-center space-x-1">
      <van-image width="28" height="28" src="./static/images/avatar.png" />
      <div class="text-neutral-basic">
        <div class="text-base font-semibold">{{ agentAccount }} 欢迎回来</div>
      </div>
    </div>

    <!-- 右侧：代存按钮和消息图标 -->
    <div class="flex items-center gap-3">
      <!-- 代存按钮 -->
      <div
        class="text-primary-normal text-xs font-semibold border border-primary-normal rounded-[6.25rem] h-8 px-2 py-1 flex items-center justify-center cursor-pointer"
        @click="handleDepositClick">
        <van-icon name="add" class="mr-1" size="14" />代存
      </div>

      <!-- 消息通知图标 -->
      <button @click="handleNotificationClick"
        class="relative w-10 h-10 backdrop-blur-sm rounded-lg flex items-center justify-center">
        <svg class="w-6 h-6 text-neutral-secondary" fill="none" viewBox="0 0 24 24">
          <path d="M20.9716 12.9861C21.2854 12.9532 21.6006 13.0445 21.8466 13.2419C22.0924 13.4395 22.2504 13.7265 22.2861 14.0398L22.287 14.0408L22.6113 17.0349C22.6364 17.2686 22.5914 17.505 22.4814 17.7126C22.3988 17.8683 22.2819 18.0031 22.1415 18.1072L21.9931 18.2C21.5699 18.4264 21.0489 18.378 20.6738 18.075L19.9296 17.4792L16.1581 21.7947L16.1562 21.7966C16.0515 21.9223 15.9231 22.0263 15.7773 22.1003C15.6314 22.1744 15.4709 22.2179 15.3076 22.2283C15.1446 22.2385 14.9809 22.2149 14.8271 22.1599C14.7115 22.1185 14.6013 22.0591 14.5038 21.9851L14.4111 21.906L11.1992 18.8982L8.15131 22.0535C7.6999 22.5257 6.95152 22.5468 6.47455 22.1003C5.99112 21.6473 5.97015 20.8862 6.42767 20.407L10.2822 16.4089C10.501 16.1821 10.8011 16.049 11.1161 16.0408C11.4315 16.0328 11.7384 16.1494 11.9687 16.365L15.1093 19.3074L18.0693 15.9851L17.3281 15.3914C17.1449 15.2449 17.009 15.0456 16.9384 14.822C16.868 14.5983 16.8655 14.3576 16.9316 14.1326C16.9992 13.9077 17.1332 13.7077 17.3144 13.5583C17.4959 13.409 17.7182 13.3158 17.9521 13.2927L20.9716 12.9861ZM11.6913 2.25464C17.0099 2.25473 21.3308 6.51184 21.4394 11.8044L19.0038 12.0916C19.0042 12.0639 19.0068 12.0363 19.0068 12.0085C19.0068 7.96848 15.7314 4.69321 11.6913 4.69312C7.65122 4.69312 4.37592 7.96842 4.37592 12.0085C4.37597 14.3792 5.5046 16.4853 7.25287 17.822L5.55463 19.5876C3.34874 17.7994 1.93749 15.0694 1.93744 12.0085C1.93744 6.62171 6.30451 2.25464 11.6913 2.25464ZM10.8486 7.13159C11.1425 7.13159 11.4249 7.24796 11.6328 7.45581C11.8406 7.66367 11.957 7.94603 11.957 8.23999V12.0085H14.3066C14.6005 12.0085 14.8829 12.1249 15.0908 12.3328C15.2986 12.5406 15.415 12.823 15.415 13.1169C15.4149 13.4107 15.2984 13.6924 15.0908 13.9001C14.8829 14.108 14.6005 14.2253 14.3066 14.2253H10.8486C10.2369 14.2252 9.74031 13.7286 9.74017 13.1169V8.23999C9.74017 7.94603 9.85751 7.66367 10.0654 7.45581C10.2732 7.24819 10.5548 7.13165 10.8486 7.13159Z" fill="#1D2756" fill-opacity="0.7"/>
        </svg>
        <!-- 红点提示 -->
        <span v-if="hasUnreadMessage"
          class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
      </button>
    </div>
  </div>
</template>
