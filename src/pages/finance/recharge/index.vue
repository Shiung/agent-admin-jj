<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import NavBar from '@/components/NavBar/index.vue'
import WalletBanner from '../components/walletBanner.vue'

const router = useRouter()

const goRecord = () => {
  router.push({ name: 'rechargeRecord' })
}

const navBarTitle = computed(() => {
  const name = router.currentRoute.value.name ?? 'rechargePage'
  const map = {
    rechargePage: '额度充值',
    rechargeRecord: '充值记录'
  }
  return map[name as keyof typeof map]
})
const navBarShowDetail = computed(() => router.currentRoute.value.name === 'rechargePage')
</script>

<template>
  <div class="flex-1 flex flex-col">
    <NavBar :title="navBarTitle" :showDetail="navBarShowDetail" @detailClick="goRecord" />
    <WalletBanner class="mx-3" walletType="credit" />
    <router-view />
  </div>
</template>
