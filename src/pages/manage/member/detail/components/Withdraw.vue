<script setup lang="ts">
import { defineComponent, h, computed, ref, useAttrs, watch } from 'vue'
import UnitCard from '../../../components/UnitCard.vue'
import { getWithdrawName } from '@/utils/finance'
import API from '@/apis/index'
import dayjs from 'dayjs'
import { cn } from '@/utils/className'
import { formatMoney } from '@/utils/formatNumber'

import type TimeFilterDropdown from '@/components/TimeFilter/TimeFilterDropdown.vue'
import type { InfinityExposeType } from '@/components/InfinityScroll/index.vue'

import FilterBox from '../../components/FilterBox.vue'

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()

const playerId = computed<number | undefined>(() => attrs.playerId as number)

const infinityRef = ref<InfinityExposeType>()

const selectTime = ref<InstanceType<typeof TimeFilterDropdown>['modelValue']>({
  startTime: dayjs().startOf('month').unix(),
  endTime: dayjs().endOf('month').unix()
})

/** 0:全部 1:待处理 2:已出款 3:退款驳回 5:处理中 */
const statusLs = [
  { label: '全部状态', value: 0 },
  { label: '已出款', value: 2 },
  { label: '退款驳回', value: 3 },
  { label: '待处理', value: 1 },
  { label: '处理中', value: 5 },
]

const selectStatus = ref<number>(statusLs[1]?.value ?? 2)

const sortOptions = [
  { value: '-finish_time', label: '账变时间降序' },
  { value: '+finish_time', label: '账变时间升序' },
  { value: '-amount', label: '提现金额降序' },
  { value: '+amount', label: '提现金额升序' },
]

const selectedSort = ref(sortOptions[0]?.value ?? '-finish_time')

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
  try {
    const res = await API.netCashPlayerGame.getCommonWithdrawlist({
      BeginTime: selectTime.value.startTime,
      EndTime: selectTime.value.endTime,
      PlayerId: playerId.value,
      Status: selectStatus.value,
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

watch([selectTime, selectStatus, selectedSort], () => {
  infinityRef.value?.fetchData()
})

</script>

<template>
  <div class="flex-1 flex flex-col">
    <FilterBox>
      <TimeFilterDropdown v-model="selectTime" title="账变时间" />
      <Filled v-model:model-value="selectStatus" :options="statusLs" />
      <Filled v-model:model-value="selectedSort" :options="sortOptions" />
    </FilterBox>
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
                <div class="text-xs text-neutral2-basic">{{ getWithdrawName(l.AccountType) }}</div>
                <div class="text-xs text-neutral2-basic">{{ dateTransfer(l.FinishTime) }}</div>
              </div>
            </template>
          </UnitCard>
        </div>
      </template>
    </InfinityScroll>
  </div>
</template>