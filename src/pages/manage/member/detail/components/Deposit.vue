<script setup lang="ts">
import { inject } from 'vue'
import UnitCard from '../../../components/UnitCard.vue'
import API from '@/apis/index'
import dayjs from 'dayjs'
import { formatMoney } from '@/utils/formatNumber'
import { ProviderStateSymbol } from '../composables/useProvider'

const dateTransfer = (ts: number | string | null | undefined) => {
  if (!ts) return '-'
  const num = Number(ts)
  if (isNaN(num)) return '-'
  return dayjs(num > 1e12 ? num : num * 1000).format('YYYY-MM-DD HH:mm:ss')
}

const state = inject(ProviderStateSymbol)!

const fetchData = async (page: number = 0) => {
  const startTime = 1751299200
  const endTime = dayjs().endOf('day').unix()
  try {
    const res = await API.netCashPlayerGame.getAgentapplygoldlist({
      BeginTime: startTime,
      EndTime: endTime,
      PlayerId: state.playerId,
      Page: page
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

const agentType = (type: number) => {
  if (type === 1) return '佣金代存'
  if (type === 2) return '额度代存'
  return type
}

const transferType = (type: number) => {
  if (type === 2) return '代存'
  if (type === 10) return '紅利'
  return type
} 

</script>

<template>
  <div class="flex-1 flex flex-col">
    deposit

    <InfinityScroll
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
            <div class="flex items-center justify-around py-3">
              <div class="flex-1 flex flex-col items-center justify-center space-y-1">
                <div class="text-xs text-neutral2-secondary">代存类型</div>
                <div class="text-xs px-2 border rounded-xl leading-5 text-neutral2-secondary border-neutral2-secondary/50 bg-neutral2-secondary/10">{{ agentType(l.WalletType) }}</div>
              </div>
              <div class="flex-1 flex flex-col items-center justify-center space-y-1">
                <div class="text-xs text-neutral2-secondary">实际代存</div>
                <div>{{ formatMoney(l.Amount, 2, true) }}</div>
              </div>
            </div>
            <template #footer>
              <div class="flex items-center justify-between">
                <div class="text-xs text-neutral2-basic">{{ transferType(l.TransferType) }}</div>
                <div class="text-xs text-neutral2-basic">{{ dateTransfer(l.ProcessingTime) }}</div>
              </div>
            </template>
          </UnitCard>
        </div>
      </template>
    </InfinityScroll>
  </div>
</template>