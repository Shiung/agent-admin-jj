<script setup lang="ts">
import { ref, useAttrs, watch, computed } from 'vue'
import UnitCard from '../../../components/UnitCard.vue'
import API from '@/apis/index'
import dayjs from 'dayjs'
import { formatMoney } from '@/utils/formatNumber'

import FilterBox from '../../components/FilterBox.vue'
import { useClipboard } from '@vueuse/core'

import type TimeFilterDropdown from '@/components/TimeFilter/TimeFilterDropdown.vue'
import type { InfinityExposeType } from '@/components/InfinityScroll/index.vue'

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()

const playerId = computed<number | undefined>(() => attrs.playerId as number)

const infinityRef = ref<InfinityExposeType>()

const dateTransfer = (ts: number | string | null | undefined) => {
  if (!ts) return '-'
  const num = Number(ts)
  if (isNaN(num)) return '-'
  return dayjs(num > 1e12 ? num : num * 1000).format('YYYY-MM-DD HH:mm:ss')
}

const selectTime = ref<InstanceType<typeof TimeFilterDropdown>['modelValue']>({
  startTime: dayjs().startOf('month').unix(),
  endTime: dayjs().endOf('month').unix()
})

const sortOptions = [
  { value: '-update_time', label: '账变时间降序' },
  { value: '+update_time', label: '账变时间升序' },
  { value: '-amount', label: '代存金额降序' },
  { value: '+amount', label: '代存金额升序' },
]

const selectedSort = ref(sortOptions[0]?.value ?? '-update_time')

const fetchData = async (page: number = 0) => {
  try {
    const res = await API.netCashPlayerGame.getAgentapplygoldlist({
      BeginTime: selectTime.value.startTime,
      EndTime: selectTime.value.endTime,
      PlayerId: playerId.value,
      Sort: selectedSort.value,
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

const copyHadandler = (c: string) => {
  useClipboard().copy(c)
  showToast({ message: '复制成功' })
}

watch([selectTime, selectedSort], () => {
  infinityRef.value?.fetchData()
})

</script>

<template>
  <div class="flex-1 flex flex-col">
    <FilterBox>
      <TimeFilterDropdown v-model="selectTime" title="账变时间" />
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