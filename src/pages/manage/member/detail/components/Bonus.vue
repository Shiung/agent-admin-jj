<script setup lang="ts">
import { onMounted, ref, inject } from 'vue'
import UnitCard from '../../../components/UnitCard.vue'
import { formatMoney } from '@/utils/formatNumber'
import { bonusType } from '@/utils/mappingStatus'
import { ProviderStateSymbol } from '../composables/useProvider'
import API from '@/apis/index'
import dayjs from 'dayjs'

import type { InfinityExposeType } from '@/components/InfinityScroll/index.vue'

const dateTransfer = (ts: number | string | null | undefined) => {
  if (!ts) return '-'
  const num = Number(ts)
  if (isNaN(num)) return '-'
  return dayjs(num > 1e12 ? num : num * 1000).format('YYYY-MM-DD HH:mm:ss')
}

const state = inject(ProviderStateSymbol)!

const infinityRef = ref<InfinityExposeType>()

const fetchData = async (page: number = 0) => {
  const startTime = 1751299200
  const endTime = dayjs().endOf('day').unix()

  try {
    const res = await API.netCashPlayerGame.getRedlist({
      BeginTime: startTime,
      EndTime: endTime,
      Status: 2,
      PlayerId: state.playerId
    })

    return {
      data: res.data.Data.Items,
      paging: res.data.Data.Pagination
    }
  
  } catch (e) {
    console.warn('fetchData outside', e)
    return { data: [], paging: null }
  }
}

onMounted(() => {
  fetchData()
})

</script>

<template>
  <div class="flex flex-col">
    bonus
    <InfinityScroll
      ref="infinityRef"
      :fetchAction="fetchData"
      class="flex-1 flex flex-col"
    >
      <template v-slot="{ ls }">
        <div class="space-y-2 px-3">
          <UnitCard v-for="l in ls" :key="l.OrderId">
            <template #header>
              <div class="flex justify-between items-center">
                <div class="text-xs text-neutral2-secondary space-x-1">
                  <span>订单号</span>
                  <span>{{ l.OrderId }}</span>
                  <van-image src="./static/images/promote/copy_lite.png" fit="contain" class="w-3" />
                </div>
              </div>
            </template>
            <div class="flex items-center justify-between py-3">
              <div class="flex-1 flex flex-col items-center justify-center space-y-1">
                <div class="text-xs text-neutral2-secondary">红利类型</div>
                <div class="text-xs px-2 border rounded-xl leading-5 text-neutral2-secondary border-neutral2-secondary/50 bg-neutral2-secondary/10">{{ bonusType(l.BonusType) }}</div>
              </div>
              <div class="flex-1 flex flex-col items-center justify-center space-y-1">
                <div class="text-xs text-neutral2-secondary">实际红利</div>
                <div>{{ formatMoney(l.Bonus, 2, true) }}</div>
              </div>
              <div class="flex-1 flex flex-col items-center justify-center space-y-1">
                <div class="text-xs text-neutral2-secondary">流水</div>
                <div>{{ formatMoney(l.DrawAmount, 2, true) }}</div>
              </div>
            </div>
            <template #footer>
              <div class="flex items-center justify-between">
                <div class="text-xs text-neutral2-secondary">审核时间</div>
                <div class="text-xs text-neutral2-basic">{{ dateTransfer(l.FinishTime) }}</div>
              </div>
              <div class="flex items-center justify-between">
                <div class="text-xs text-neutral2-secondary">领奖时间</div>
                <div class="text-xs text-neutral2-basic">{{ dateTransfer(l.SendTime) }}</div>
              </div>
            </template>
          </UnitCard>
        </div>
      </template>
    </InfinityScroll>
  </div>
</template>