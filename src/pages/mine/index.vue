<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { formatMoneyWithComma } from '@/utils/formatNumber'
import API from '@/apis'

declare const __APP_VERSION__: string
const APP_VERSION = `v${__APP_VERSION__}`

// 常用功能
const SHORTCUTS = [
  {
    key: 'fundDetail',
    title: '资金明细',
  },
  {
    key: 'agentDeposit',
    title: '代理代存',
  },
  {
    key: 'agentTransfer',
    title: '代理转帐',
  },
  {
    key: 'commissionQuota',
    title: '佣金转额度',
  },
]

// 設置列表
const MENUS = [
  {
    key: 'withdrawAccount',
    title: '提现帐号',
  },
  {
    key: 'betRecord',
    title: '注单记录',
  },
  {
    key: 'memberRecharge',
    title: '会员充值',
  },
  {
    key: 'security',
    title: '安全设置',
  },
  {
    key: 'help',
    title: '帮助',
  },
  {
    key: 'version',
    title: '版本号',
    isVersion: true,
  },
]

const router = useRouter()
const userStore = useUserStore()

const agentAccount = computed(() => {
  return userStore.userInfo?.Admin?.Username || ''
})

const accountInfo = computed(() => userStore.accountInfo)

const goProfile = () => {
  router.push({ name: 'mineProfile' })
}

const goWithdraw = () => {
  router.push({ name: 'withdrawPage' })
}

const goRecharge = () => {
  router.push({ name: 'rechargePage' })
}

const commissionWalletBalance = ref<number>(0)
const fetchOverview = async () => {
  const res = await API.finance.getCommissionOverview()
  if (res.data.Code !== 200) return
  commissionWalletBalance.value = res.data.Data.Available
}

const creditWalletBalance = ref<number>(0)
const depositLimitInfo = ref<{
  minAmount: number
  maxAmount: number
  dailyAmount: number
  maxWithdrawMultiple: number
  isActive: number
  isShowMultiple: number
} | null>(null)

const fetchAccountBalance = async () => {
  const res = await API.finance.getAccountBalance()
  if (res.data.Code !== 200) return
  creditWalletBalance.value = res.data.Data.Items.Credit
console.log('代存限额信息Items3',res.data.Data.Items3)
  // 保存代存限额信息
  if (res.data.Data.Items3) {
    depositLimitInfo.value = {
      minAmount: (res.data.Data.Items3.MinDepositAmount || 0) / 100,
      maxAmount: (res.data.Data.Items3.MaxDepositAmount || 0) / 100,
      dailyAmount: (res.data.Data.Items3.DailyDepositAmount || 0) / 100,
      maxWithdrawMultiple: res.data.Data.Items3.WithdrawWaterMultiply || 1,
      isActive: res.data.Data.IsActiveLimit3 || 0,
      isShowMultiple: res.data.Data.IsShowMultiple || 0,
    }
  }
}

const handleMenuClick = (key: string) => {
  // 跳转到代理代存页面时，传递余额数据和限额信息
  if (key === 'agentDeposit') {
    const query: Record<string, string> = {
      commission: String(commissionWalletBalance.value),
      credit: String(creditWalletBalance.value),
    }

    // 传递限额信息
    if (depositLimitInfo.value) {
      query.minAmount = String(depositLimitInfo.value.minAmount)
      query.maxAmount = String(depositLimitInfo.value.maxAmount)
      query.dailyAmount = String(depositLimitInfo.value.dailyAmount)
      query.maxWithdrawMultiple = String(depositLimitInfo.value.maxWithdrawMultiple)
      query.isActive = String(depositLimitInfo.value.isActive)
      query.isShowMultiple = String(depositLimitInfo.value.isShowMultiple)
    }

    router.push({
      name: key,
      query,
    })
  } else {
    router.push({ name: key })
  }
}


onMounted(async () => {
  fetchOverview()
  fetchAccountBalance()
  await userStore.fetchAccountInfo()
})
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
          最近登录 {{ accountInfo?.Ip }}
        </p>
      </div>
      <van-icon name="arrow" size="24" class="text-neutral2-tertiary" />
    </div>

    <!-- 我的錢包 -->
    <div
      class="flex items-center justify-between gap-2 mx-3 mt-2 p-3 bg-white rounded-2xl shadow-[-0.5px_0.5px_3px_0px_rgba(0,0,0,0.15)]">
      <div class="flex-1 min-w-0 px-3 py-2 bg-bg-floor-1-2 rounded-2xl">
        <div class="text-xs leading-5 text-neutral-basic">佣金钱包</div>
        <div class="text-xl leading-7 truncate font-semibold text-primary-normal">{{
          formatMoneyWithComma(commissionWalletBalance) }}</div>
        <van-button type="primary" size="small" plain round class="w-full !font-semibold !bg-bg-floor-1-2"
          @click="goWithdraw">提现</van-button>
      </div>
      <div class="flex-1 min-w-0 px-3 py-2 bg-bg-floor-1-2 rounded-2xl">
        <div class="text-xs leading-5 text-neutral-basic">额度钱包</div>
        <div class="text-xl leading-7 truncate font-semibold text-primary-normal">{{
          formatMoneyWithComma(creditWalletBalance) }}</div>
        <van-button type="primary" size="small" plain round class="w-full !font-semibold !bg-bg-floor-1-2"
          @click="goRecharge">充值</van-button>
      </div>
    </div>

    <!-- 常用功能 -->
    <div class="px-3 py-3 bg-white rounded-2xl border border-neutral2-seventh mx-3 mt-4">
      <div class="flex items-center justify-between gap-2">
        <div v-for="item in SHORTCUTS" :key="item.key" class="flex-1 flex flex-col items-center cursor-pointer"
          @click="handleMenuClick(item.key)">
          <div class="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-2">
            <van-image :src="`./static/images/mine/${item.key}.svg`" size="24" />
          </div>
          <span class="text-sm text-neutral-basic text-center">{{ item.title }}</span>
        </div>
      </div>
    </div>

    <!-- 設置列表 -->
    <div class="px-3 py-2">
      <div v-for="item in MENUS" :key="item.key"
        class="flex items-center px-3 h-12 border-b border-dashed border-neutral2-sixth last:border-b-0"
        @click="handleMenuClick(item.key)">
        <van-image :src="`./static/images/mine/${item.key}.svg`" size="24" class="pr-3" />
        <span class="flex-1 text-sm text-neutral-basic">
          {{ item.title }}
        </span>
        <span v-if="item.isVersion" class="text-sm text-neutral-basic">
          {{ APP_VERSION }}
        </span>
        <van-icon v-else name="arrow" size="16" class="text-neutral2-tertiary" />
      </div>
    </div>

  </div>
</template>
