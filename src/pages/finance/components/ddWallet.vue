<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { formatMoneyWithComma } from '@/utils/formatNumber'
import { getWithdrawTypeImage } from '@/utils/finance'
import API from '@/apis'

const userStore = useUserStore()

const realName = computed(() => userStore.accountInfo?.RealName || '')

const loading = ref(false)

const ddbConfig = ref<{ Url: string }>({ Url: '' })
const fetchDDBWalletConfig = async () => {
  try {
    const params = {
      Amount: 0,
      RealName: realName.value
    }
    const res = await API.finance.getDDBWalletConfig(params)
    if (res.data.Code !== 200) return
    ddbConfig.value = res.data.Data
  } finally {}
}

const ddbBalance = ref<number>(0)
const fetchDDBBalance = async () => {
  loading.value = true
  try {
    const res = await API.finance.getDDBBalance({
      RealName: realName.value
    })
    if (res.data.Code !== 200) return
    ddbBalance.value = res.data.Data.Balance
  } finally {
    loading.value = false
  }
}

const goDDWallet = () => {
  const url = ddbConfig.value.Url
  if (!url) return
  window.open(url, '_blank')
}

onMounted(() => {
  fetchDDBBalance()
  fetchDDBWalletConfig()
})
</script>

<template>
  <div class="flex mt-2">
    <div class="flex-1 flex items-center justify-start px-4 py-3 gap-3 rounded-2xl border border-neutral2-seventh">
      <van-image :src="getWithdrawTypeImage(17)" fit="contain" class="m-1 w-8" />

      <div class="flex-1">
        <div class="flex items-center gap-1 text-xs font-semibold leading-5">
          我的DDB余额
          <van-image src="./static/images/common/reload.svg" fit="contain" class="w-4" :class="{ 'rotate-once': loading }" @click="fetchDDBBalance" />
        </div>
        <div class="text-sm font-semibold leading-6 text-primary-normal">
          {{ formatMoneyWithComma(ddbBalance, 2, false) }}
        </div>
      </div>

      <van-button type="primary" round size="small" @click="goDDWallet">前往DD钱包</van-button>
    </div>
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