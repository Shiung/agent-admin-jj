<script setup lang="ts">
import { defineComponent, h, computed, inject } from 'vue'
import UnitCard from '../../../components/UnitCard.vue'
import { ProviderStateSymbol } from '../composables/useProvider'
import API from '@/apis/index'
import dayjs from 'dayjs'
import { cn } from '@/utils/className'
import { formatMoney } from '@/utils/formatNumber'

const fakeData: Awaited<ReturnType<typeof API.netCashPlayerGame.getCommonWithdrawlist>>['data']['Data']['Items'] = [
  {
    AccountType: 10,
    Amount: 1000,
    Fee: 100,
    FeeRate: 2,
    FinishTime: 1764827116367,
    OrderId: '1238091js',
    PlayerId: 123456,
    Process: 8,
    RealAmount: 1000,
    RefundScore: 1,
    Status: 2
  }
]

const state = inject(ProviderStateSymbol)!

/** 
 * 对应后台状态
 * 待处理(等待风控审核)        status:1   process:1
 * 待处理(风控审核通过)        status:1   process:2
 * 待处理(三方驳回后重新出款)   status:1   process:3
 * 处理中(代表有地方正在處理)   status:5   process:2
 * 处理中(自助轮询查询)        status:5   process:4
 * 处理中(自助轮询结束)        status:5   process:9
 * 已出款(人工出款)           status:4   process:7
 * 已出款(三方出款)           status:2   process:7
 * 退款驳回                  status:3   process:8  refundScore: 1
*/
const StatusComp = defineComponent(
  (props: { item: Awaited<ReturnType<typeof API.netCashPlayerGame.getCommonWithdrawlist>>['data']['Data']['Items'][number] }, { attrs }) => {
    const returnVal = computed(() => {
      if (props.item.Status === 1) {
        return {
          text: '待处理',
          color: 'text-primary-normal border-primary-normal/50 bg-primary-normal/10'
        }
      }

      if (props.item.Status === 3 && props.item.Process === 8 && props.item.RefundScore === 1) {
        return {
          text: '退款驳回',
          color: 'text-error-normal border-error-normal/50 bg-error-normal/10'
        }
      }

      if (props.item.Status === 1) {
        return {
          text: '待处理',
          color: 'text-primary-normal border-primary-normal/50 bg-primary-normal/10'
        }
      }

      if ([2, 4].some(s => s === props.item.Status) && props.item.Process === 7) {
        return {
          text: '已出款',
          color: 'text-success-normal border-success-normal/50 bg-success-normal/10'
        }
      }

      /** status === 5 or others */
      return {
        text: '处理中',
        color: 'text-primary-normal border-primary-normal/50 bg-primary-normal/10'
      }
    })

    return () => h('div', { class: cn(attrs.class ?? '', returnVal.value.color) }, returnVal.value.text)
  },
  {
    props: ['item'],
    inheritAttrs: false
  }
)

const dateTransfer = (ts: number | string | null | undefined) => {
  if (!ts) return '-'
  const num = Number(ts)
  if (isNaN(num)) return '-'
  return dayjs(num > 1e12 ? num : num * 1000).format('YYYY-MM-DD HH:mm:ss')
}

const fetchData = async (page: number = 0) => {
  const startTime = 1751299200
  const endTime = dayjs().endOf('day').unix()
  try {
    const res = await API.netCashPlayerGame.getCommonWithdrawlist({
      BeginTime: startTime,
      EndTime: endTime,
      PlayerId: state.playerId,
      Page: page
    })

    return {
      data: fakeData, // res.data.Data.Items,
      paging: res.data.Data.Pagination
    }
  } catch (e) {
    console.warn('fetchData outside', e)
    return { data: [], paging: null }
  }
}
</script>

<template>
  <div class="flex-1 flex flex-col">
    Withdraw
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
                </div>
                <StatusComp class="text-xs px-2 border rounded-xl leading-5" :item="l" />
              </div>
            </template>
            <div class="flex items-center justify-around py-3">
              <div class="flex flex-col items-center">
                <div class="text-xs text-neutral2-secondary">申请提现</div>
                <div>{{ formatMoney(l.Amount, 2, true) }}</div>
              </div>
              <div class="flex flex-col items-center">
                <div class="text-xs text-neutral2-secondary">实际提现</div>
                <div>{{ formatMoney(l.RealAmount, 2, true) }}</div>
              </div>
            </div>
            <template #footer>
              <div class="flex justify-between items-center">
                <div class="text-xs text-neutral2-basic">{{ l.AccountType }}</div>
                <div class="text-xs text-neutral2-basic">{{ dateTransfer(l.FinishTime) }}</div>
              </div>
            </template>
          </UnitCard>
        </div>
      </template>
    </InfinityScroll>
  </div>
</template>