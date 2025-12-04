<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import NavBar from '@/components/NavBar/index.vue'
import WalletBanner from '../components/walletBanner.vue'

const router = useRouter()

const goRecord = () => {
  router.push({ name: 'withdrawRecord' })
}

const navBarTitle = computed(() => {
  const name = router.currentRoute.value.name ?? 'withdrawPage'
  const map = {
    withdrawPage: '佣金提现',
    withdrawRecord: '提现记录'
  }
  return map[name as keyof typeof map]
})
const navBarShowDetail = computed(() => router.currentRoute.value.name === 'withdrawPage')
</script>

<template>
  <div class="flex-1 flex flex-col">
    <NavBar :title="navBarTitle" :showDetail="navBarShowDetail" @detailClick="goRecord" />
    <WalletBanner class="mx-3" walletType="commission" />
    <router-view />
  </div>
</template>
