<script setup lang="ts">
import { ref, useAttrs, computed, watch } from 'vue'
import UnitCard from '../../../components/UnitCard.vue'
import { formatMoney } from '@/utils/formatNumber'
import { bonusType } from '@/utils/mappingStatus'
import API from '@/apis/index'
import dayjs from 'dayjs'
import { useClipboard } from '@vueuse/core'

import FilterBox from '../../components/FilterBox.vue'

import type TimeFilterDropdown from '@/components/TimeFilter/TimeFilterDropdown.vue'
import type { InfinityExposeType } from '@/components/InfinityScroll/index.vue'

const dateTransfer = (ts: number | string | null | undefined) => {
  if (!ts) return '-'
  const num = Number(ts)
  if (isNaN(num)) return '-'
  return dayjs(num > 1e12 ? num : num * 1000).format('YYYY-MM-DD HH:mm:ss')
}


defineOptions({ inheritAttrs: false })
const attrs = useAttrs()

const playerId = computed<number | undefined>(() => attrs.playerId as number)

const infinityRef = ref<InfinityExposeType>()

const selectTime = ref<InstanceType<typeof TimeFilterDropdown>['modelValue']>({
  startTime: dayjs().startOf('month').unix(),
  endTime: dayjs().endOf('month').unix()
})

const sortOptions = [
  { value: '-send_time', label: '领奖时间降序' },
  { value: '+send_time', label: '领奖时间升序' },
  { value: '-bonus', label: '红利金额降序' },
  { value: '+bonus', label: '红利金额升序' },
]

const selectedSort = ref(sortOptions[0]?.value ?? '-send_time')

const fetchData = async (page: number = 0) => {
  try {
    const res = await API.netCashPlayerGame.getRedlist({
      BeginTime: selectTime.value.startTime,
      EndTime: selectTime.value.endTime,
      Status: 2,
      Sort: selectedSort.value,
      PlayerId: playerId.value,
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

const copyHadandler = (c: string) => {
  useClipboard().copy(c)
  showToast({ message: '复制成功' })
}

watch([selectTime, selectedSort], () => {
  infinityRef.value?.fetchData()
})

</script>

<template>
  <div class="flex flex-col">
    <FilterBox>
      <TimeFilterDropdown v-model="selectTime" title="领奖时间" />
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
                  <van-image src="./static/images/promote/copy_lite.png" fit="contain" class="w-3" @click="copyHadandler(l.OrderId)" />
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