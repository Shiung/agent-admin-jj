<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { formatMoneyWithComma } from '@/utils/formatNumber'

const userStore = useUserStore()

interface Props {
  /** commission佣金錢包 / credit額度錢包 */
  walletType: 'commission' | 'credit'
}

const props = withDefaults(defineProps<Props>(), {
  walletType: 'commission'
})

const title = computed(() => {
  return {
    commission: '佣金钱包',
    credit: '额度钱包',
  }[props.walletType]
})

const iconImagePath = computed(() => {
  return {
    commission: './static/images/common/commissionWalletIcon.png',
    credit: './static/images/common/creditWalletIcon.png',
  }[props.walletType]
})

const balance = computed(() => {
  if (props.walletType === 'commission') {
    return userStore.commissionWalletBalance
  } else if (props.walletType === 'credit') {
    return userStore.creditWalletBalance
  } else {
    return 0
  }
})
const loading = ref<boolean>(false)

const fetchWalletBalance = async() => {
  loading.value = true
  try {
    if (props.walletType === 'commission') {
      await userStore.fetchCommissionBalance()
    } else if (props.walletType === 'credit') {
      await userStore.fetchCreditBalanceAndLimits()
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchWalletBalance()
})
</script>

<template>
  <div class="flex items-center justify-between mt-2 bg-white rounded-2xl shadow-[-0.5px_0.5px_3px_0px_rgba(0,0,0,0.15)]">
    <div class="px-4 py-3">
      <div class="flex items-center gap-1">
        <span class="text-sm font-semibold leading-6">{{ title }}</span>
        <van-image src="./static/images/common/reload.svg" fit="contain" class="w-4" :class="{ 'rotate-once': loading }" @click="fetchWalletBalance" />
      </div>
      <div class="text-xl leading-7 font-semibold text-primary-normal">{{ formatMoneyWithComma(balance) }}</div>
    </div>
    <van-image :src="iconImagePath" fit="contain" class="h-19" />
  </div>
</template>

<style scoped>
.rotate-once {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>