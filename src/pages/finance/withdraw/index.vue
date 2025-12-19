<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

import NavBar from '@/components/NavBar/index.vue'
import WalletBanner from '../components/walletBanner.vue'

const router = useRouter()
const manualWalletType = ref<'commission' | 'credit'>('commission')

const goRecord = () => {
  manualWalletType.value = router.currentRoute.value.name === 'quotaWithdraw' ? 'credit':'commission'
  router.push({ name: 'withdrawRecord' })
}

const navBarTitle = computed(() => {
  const name = router.currentRoute.value.name ?? 'withdrawPage'
  const map = {
    withdrawPage: '佣金提现',
    withdrawRecord: '提现记录',
    quotaWithdraw: '额度提现'
  } as const
  return map[name as keyof typeof map]
})

const navBarShowDetail = computed(() => router.currentRoute.value.name !== 'withdrawRecord')

const walletType = computed<'commission' | 'credit'>(() => {
  const name = router.currentRoute.value.name ?? 'withdrawPage'
  const map = {
    withdrawPage: 'commission',
    withdrawRecord: manualWalletType.value ?? 'commission',
    quotaWithdraw: 'credit'
  } as const
  return map[name as keyof typeof map]
})
</script>

<template>
  <div class="flex-1 flex flex-col">
    <NavBar :title="navBarTitle" :showDetail="navBarShowDetail" @detailClick="goRecord" />
    <WalletBanner class="mx-3" :walletType="walletType" />
    <router-view />
  </div>
</template>
