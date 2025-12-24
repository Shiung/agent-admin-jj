<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { cn } from '@/utils/className'
import GameRecord from '@/pages/manage/member/detail/components/GameRecord.vue'
import { formatSignedMoney, formatMoney } from '@/utils/formatNumber'
import API from '@/apis/index'

import type SearchBar from '@/components/SearchBar/index.vue'

const sumInfo = ref<Parameters<NonNullable<InstanceType<typeof GameRecord>['$props']['onSumInfo']>>[0]>(null)

const sumShow = computed(() => {
  const { SumProfitGold, SumTotalBetGold, SumTotalBetNum, SumValidWater } = sumInfo.value || {}
  return {
    winGold: formatSignedMoney(SumProfitGold ?? 0, 2, false),
    totalBetNum: { text: SumTotalBetNum ?? 0, color: '' },
    totalBetGold: { text: formatMoney(SumTotalBetGold ?? 0, 2, true), color: '' },
    validWater: { text: formatMoney(SumValidWater ?? 0, 2, true), color: '' }
  }
})

const syncSum: InstanceType<typeof GameRecord>['$props']['onSumInfo'] = (e) => {
  sumInfo.value = e
}

const searchLsLoading = ref<boolean>(false)
const searchSelected = ref<InstanceType<typeof SearchBar>['$props']['selected']>(null)
const searchLs = ref<Array<{ id: number, text: string }>>([])

const searchPlayerLs = async () => {
  try {
    searchLsLoading.value = true
    const res = await API.playerManage.getPlayerSearch({})
    searchLs.value = (res.data.Data.Items ?? []).map((i) => ({ id: i.PlayerId, text: i.LoginAccount }))
  } catch (e) {
    console.warn('[searchPlayerLs error]:', e)
  } finally {
    searchLsLoading.value = false
  }
}

onMounted(() => {
  searchPlayerLs()
})

</script>

<template>
  <div class="flex-1 flex flex-col">
    <NavBar title="注单记录" />

    <div class="px-3 space-y-4">
      <div class="rounded-2xl shadow-[-0.5px_0.5px_3px_0px_rgba(0,0,0,0.15)] py-2">
        <div class="flex justify-between items-start [&>div]:flex-1">
          <div class="py-1 px-3 flex flex-col items-center">
            <div class="text-xs text-neutral2-secondary">总盈利</div>
            <div :class="cn('text-sm font-semibold', sumShow.winGold.color)">{{ sumShow.winGold.text }}</div>
          </div>
          <div class="py-1 px-3 flex flex-col items-center">
            <div class="text-xs text-neutral2-secondary">注单数</div>
            <div class="text-sm font-semibold">{{ sumShow.totalBetNum.text }}</div>
          </div>
        </div>

        <div class="flex justify-between items-start [&>div]:flex-1">
          <div class="py-1 px-3 flex flex-col items-center">
            <div class="text-xs text-neutral2-secondary">投注金额</div>
            <div class="text-sm font-semibold">{{ sumShow.totalBetGold.text }}</div>
          </div>
          <div class="py-1 px-3 flex flex-col items-center">
            <div class="text-xs text-neutral2-secondary">有效投注</div>
            <div class="text-sm font-semibold">{{ sumShow.validWater.text }}</div>
          </div>
        </div>
      </div>

      <SearchBar class="mb-2" placeholder="会员账号" v-model:selected="searchSelected" :search-ls="searchLs" />
    </div>

    <GameRecord v-bind="{ playerId: searchSelected?.id }" bet-record-mode @sum-info="syncSum" />
  </div>
</template>