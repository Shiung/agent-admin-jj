<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import pkg from '../../../package.json'

// 常用功能
const SHORTCUTS = [
  {
    key: 'fundDetail',
    title: '资金明细',
    // icon: `./static/images/mine/icon-fund.png`,
  },
  {
    key: 'agentDeposit',
    title: '代理代存',
    // icon: `./static/images/mine/icon-deposit.png`,
  },
  {
    key: 'agentTransfer',
    title: '代理转帐',
    // icon: `./static/images/mine/icon-transfer.png`,
  },
  {
    key: 'commissionQuota',
    title: '佣金转额度',
    // icon: `./static/images/mine/icon-quota.png`,
  },
]

// 設置列表
const MENUS = [
  {
    key: 'withdrawAccount',
    title: '提现帐号',
    icon: 'user-o',
  },
  {
    key: 'security',
    title: '安全设置',
    icon: 'shield-o',
  },
  {
    key: 'help',
    title: '帮助',
    icon: 'question-o',
  },
  {
    key: 'version',
    title: '版本号',
    icon: 'setting-o',
    isVersion: true,
  },
]

const router = useRouter()
const userStore = useUserStore()

const agentAccount = computed(() => {
  return userStore.userInfo?.Admin?.Username || ''
})
const lastLoginIp = ''

const goProfile = () => {
  router.push({ name: 'mineProfile' })
}

const handleMenuClick = () => {
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
          最近登录 {{ lastLoginIp }}
        </p>
      </div>
      <van-icon name="arrow" size="24" class="text-neutral2-tertiary" />
    </div>

    <!-- 我的錢包 -->
    <div class="px-3 pt-2 pb-3 bg-white rounded-2xl shadow-sm mx-3 mt-2">
      <h2 class="text-base font-semibold text-neutral-basic mb-3">
        我的钱包
      </h2>
    </div>

    <!-- 常用功能 -->
    <div class="px-3 pt-2 pb-3 bg-white rounded-2xl border border-neutral2-seventh mx-3 mt-4">
      <h2 class="text-base font-semibold text-neutral-basic mb-3">
        常用功能
      </h2>
    </div>

    <!-- 設置列表 -->
    <div class="px-3 py-2">
      <div v-for="item in MENUS" :key="item.key"
        class="flex items-center px-3 h-12 border-b border-dashed border-neutral2-sixth last:border-b-0"
        @click="handleMenuClick()">
        <van-icon :name="item.icon" size="24" class="text-neutral-basic mr-2" />
        <span class="flex-1 text-sm text-neutral-basic">
          {{ item.title }}
        </span>
        <span v-if="item.isVersion" class="text-sm text-neutral-basic">
          {{ pkg.version }}
        </span>
        <van-icon v-else name="arrow" size="16" class="text-neutral2-tertiary" />
      </div>
    </div>

  </div>
</template>
