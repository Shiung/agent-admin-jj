<script setup lang="ts">
import { defineComponent, ref, h, computed, inject } from 'vue'
import UnitCard from '../../../components/UnitCard.vue'
import { formatMoney } from '@/utils/formatNumber'
import { cn } from '@/utils/className'
import API from '@/apis/index'
import dayjs from 'dayjs'

import { ProvideComputedSymbol } from '../composables/useProvider'

import type { InfinityExposeType } from '@/components/InfinityScroll/index.vue'

const infinityRef = ref<InfinityExposeType>()

const { rechargeTypeMapping } = inject(ProvideComputedSymbol)!

const dateTransfer = (ts: number | string | null | undefined) => {
  if (!ts) return '-'
  const num = Number(ts)
  if (isNaN(num)) return '-'
  return dayjs(num > 1e12 ? num : num * 1000).format('YYYY-MM-DD HH:mm:ss')
}

const StatusComp = defineComponent(
  (props: { status: number, process: string }, { attrs }) => {
    const returnVal = computed(() => {
      let text, color
      switch (props.status) {
        /** 狀態(0:全部 1:处理中 2:充值完成 3:充值失败 4:已审核 12:充值取消 13:用戶取消) */
        case 2: {
          /** 成功必要條件 status === 2 && process === 't' */
          if (props.process === 't') {
            text = '充值完成'
            color = 'text-success-normal border-success-normal/50 bg-success-normal/10'
            break
          }
        }
        case 1: {
          text = '处理中'
          color = 'text-primary-normal border-primary-normal/50 bg-primary-normal/10'
          break
        }
        case 3: {
          text = '充值失败'
          color = 'text-error-normal border-error-normal/50 bg-error-normal/10'
          break
        }
        case 4: {
          text = '已审核'
          color = 'text-primary-normal border-primary-normal/50 bg-primary-normal/10'
          break
        }
        case 12: {
          text = '充值取消'
          color = 'text-neutral2-secondary border-neutral2-secondary/50 bg-neutral2-secondary/10'
          break
        }
        case 13: {
          text = '用戶取消'
          color = 'text-neutral2-secondary border-neutral2-secondary/50 bg-neutral2-secondary/10'
          break
        }
        default: {}
      }
      return { text, color }
    })

    return () => h('div', { class: cn(attrs.class ?? '', returnVal.value.color) }, returnVal.value.text)
  },
  {
    props: ['status', 'process'],
    inheritAttrs: false
  }
)

const parseRealAmout = (item: Awaited<ReturnType<typeof API.netCashPlayerGame.getCommonRechargelist>>['data']['Data']['Items'][number]) => {
  if (item.Process === 't' || (item.Process === '' && item.Status === 2)) {
    return formatMoney(item.RealAmount, 2, true)
  }
  return '-'
}

const fetchData = async (page: number = 0) => {
  const startTime = 1751299200
  const endTime = dayjs().endOf('day').unix()

  try {
    const res = await API.netCashPlayerGame.getCommonRechargelist({
      BeginTime: startTime,
      EndTime: endTime,
      Page: page,
      PageSize: 10
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
</script>

<template>
  <div class="flex flex-col">
    recharge
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

                <StatusComp class="text-xs px-2 border rounded-xl leading-5" :status="l.Status" :process="l.Process" />
              </div>
            </template>
            <div class="flex items-center justify-around py-3">
              <div class="flex flex-col items-center">
                <div class="text-xs text-neutral2-secondary">申请充值</div>
                <div>{{ formatMoney(l.Amount, 2, true) }}</div>
              </div>
              <div class="flex flex-col items-center">
                <div class="text-xs text-neutral2-secondary">实际充值</div>
                <div>{{ parseRealAmout(l) }}</div>
              </div>
            </div>

            <template #footer>
              <div class="flex justify-between items-center">
                <div class="text-xs text-neutral2-basic">{{ rechargeTypeMapping.get(l.PayType)?.Name ?? '' }}</div>
                <div class="text-xs text-neutral2-basic">{{ dateTransfer(l.FinishTime) }}</div>
              </div>
            </template>
          </UnitCard>
        </div>
      </template>
    </InfinityScroll>
  </div>
</template>