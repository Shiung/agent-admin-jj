<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import CurrentPeriodCommission from './currentPeriodCommission/index.vue'
import OperationalData from './operationalData/index.vue'
import GameData from './gameData/index.vue'

const router = useRouter()
const userStore = useUserStore()

// 当前激活的标签页
const activeTab = ref(0)
const tabs = ['本期佣金', '运营数据', '游戏数据']

// 模拟数据 - 后续替换为 API
const hasUnreadMessage = ref(true)
const subordinateMembers = ref(168)
const activeMembers = ref(89)

// 代理账号
const agentAccount = computed(() => {
  return userStore.userInfo?.Admin?.Username || '代理用户'
})

// 当前显示的数据
const currentComponent = computed(() => {
  switch (activeTab.value) {
    case 0: return CurrentPeriodCommission
    case 1: return OperationalData
    case 2: return GameData
    default: return null
  }
})

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
  <div class="bg-white min-h-screen pb-[60px]">
    <!-- 头像与功能按钮行 -->
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

    <!-- 标签页 -->
    <div class="bg-white h-16 px-3 py-2">
      <van-tabs
        v-model:active="activeTab"
        color="var(--color-primary-normal)"
        title-active-color="var(--color-white)"
        title-inactive-color="var(--color-neutral-secondary)"
        type="card"
      >
        <van-tab v-for="(tab, index) in tabs" :key="index" :title="tab" />
      </van-tabs>
    </div>

    <!-- 指标数据 -->
    <div class="bg-primary-10 h-10 flex items-center justify-between gap-4 px-3 py-2">
      <div class="px-3">
        <div class="text-primary-normal text-sm">
          下级会员
          <span class="font-semibold">{{ subordinateMembers }}</span>
        </div>
      </div>
      <div class="px-3">
        <div class="text-primary-normal text-sm">
          活跃会员
          <span class="font-semibold">{{ activeMembers }}</span>
        </div>
      </div>
    </div>

    <!-- 中间区块 - 数据展示 -->
    <div class="px-4 py-4">
      <component :is="currentComponent" v-if="currentComponent" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
/* 自定义 van-tabs 样式 */
:deep(.van-tabs) {
  --van-tabs-card-height: 3rem;
  --van-padding-md: 0rem;
  --van-radius-sm: 6.25rem;
  .van-tabs__nav.van-tabs__nav--card {
    padding: .25rem;
    border-color: var(--color-neutral2-seventh) !important;
  }
  .van-tab--card {
    border-right: none;
  }
  .van-tab.van-tab--card.van-tab--active {
    border-radius: var(--van-radius-sm);
  }
}

:deep(.van-tab) {
  font-size: 15px;
  font-weight: 400;
}
</style>
