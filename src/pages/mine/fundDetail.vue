<script setup lang="ts">
import { computed, ref, watchEffect, watch } from 'vue'
import { cn } from '@/utils/className'
import dayjs from 'dayjs'
import { formatSignedMoney, formatMoney } from '@/utils/formatNumber'
import API from '@/apis/index'

import { useClipboard } from '@vueuse/core'

import type { InfinityExposeType } from '@/components/InfinityScroll/index.vue'
import type TimeFilterDropdown from '@/components/TimeFilter/TimeFilterDropdown.vue'

const infinityRef = ref<InfinityExposeType>()
const moreItems = ref<Awaited<ReturnType<typeof API.financecenter.getDetaillist>>['data']['Data']['MoreItems'] | null>(null)

const selectTime = ref<InstanceType<typeof TimeFilterDropdown>['modelValue']>({
  startTime: dayjs().startOf('month').unix(),
  endTime: dayjs().endOf('month').unix()
})

const selectWallet = ref<string>('1,2')
const selectTransferType = ref<number>(0)

const walletTypeList = [
  { label: '全部钱包', value: '1,2' },
  { label: '佣金钱包', value: '1' },
  { label: '额度钱包', value: '2' }
]

const transferTypeMap = [
  { label: '全部账变', value: 0, wallet: ['all', 'commission', 'quota'] },
  { label: '佣金结算', value: 15, wallet: ['all', 'commission'] },
  { label: '佣金发放', value: 7, wallet: ['all', 'commission'] },
  { label: '佣金提现', value: 6, wallet: ['all', 'commission'] },
  { label: '佣金提现返还', value: 16, wallet: ['all', 'commission'] },
  { label: '佣金还款', value: 9, wallet: ['all', 'commission'] },
  { label: '佣金调整', value: 12, wallet: ['all', 'commission'] },
  { label: '佣金转额度', value: 14, wallet: ['all', 'commission', 'quota'] },
  { label: '代理代存-代存', value: 2, wallet: ['all', 'commission', 'quota'] },
  { label: '代理代存-红利', value: 10, wallet: ['all', 'commission', 'quota'] },
  { label: '代理红利', value: 4, wallet: ['all', 'commission'] },
  { label: '代理转账', value: 1, wallet: ['all', 'commission', 'quota'] },
  { label: '代理充值', value: 11, wallet: ['all', 'quota'] },
  { label: '额度还款', value: 8, wallet: ['all', 'quota'] },
  { label: '额度调整', value: 3, wallet: ['all', 'quota'] },
]

const transferTypeList = computed(() => {
  const walletType = selectWallet.value
  let typeKey = 'all'
  if (walletType === '1') typeKey = 'commission'
  if (walletType === '2') typeKey = 'quota'
  return transferTypeMap.filter(i => i.wallet.includes(typeKey))
})

const sortOptions = ref([
  { value: '-CreateTime', label: '账变时间降序' },
  { value: 'CreateTime', label: '账变时间升序' },
  { value: '-AdjustAmount', label: '账变金额降序' },
  { value: 'AdjustAmount', label: '账变金额升序' },
])

const selectedSort = ref(sortOptions.value[0]?.value ?? '-CreateTime')

const copyHadandler = (c: string) => {
  useClipboard().copy(c)
  showToast({ message: '复制成功' })
}

const showNote = (item: Awaited<ReturnType<typeof API.financecenter.getDetaillist>>['data']['Data']['Items'][number]) => {
  if ([3, 8].some(k => k === item.TransferType)) {
    return item.ApplyNote || '-'
  }
  return item.Remark || '-'
}

const fetchData = async (page: number = 0) => {
  try {
    const res = await API.financecenter.getDetaillist({
      BeginTime: selectTime.value.startTime,
      EndTime: selectTime.value.endTime,
      Sort: selectedSort.value,
      TransferType: selectTransferType.value,
      WalletType: selectWallet.value,
      Page: page,
    })

    moreItems.value = res.data.Data.MoreItems
    return {
      data: res.data.Data.Items,
      paging: res.data.Data.Pagination
    }
  } catch (e) {
    console.warn('fetchData outside [error]: ', e)
    return { data: [], paging: null }
  }
}

watchEffect(() => {
  /** transferTypeList 清單改變 重置 */
  if (transferTypeList.value) selectTransferType.value = 0
})

watch([selectTime, selectWallet, selectTransferType, selectedSort], () => {
  infinityRef.value?.fetchData()
})

</script>

<template>
  <div class="flex-1 flex flex-col">
    <NavBar title="资金明细" />

    <div class="px-3">
      <div class="rounded-2xl shadow-[-0.5px_0.5px_3px_0px_rgba(0,0,0,0.15)] py-3">
        <div class="flex justify-between items-center">
          <div class="flex-1 flex flex-col items-center">
            <div class="text-sm font-semibold text-neutral2-basic">佣金账变</div>
            <div :class="cn('font-semibold', formatSignedMoney(moreItems?.CommissionChangeGold ?? 0, 2, false).color)">
              {{ formatSignedMoney(moreItems?.CommissionChangeGold ?? 0, 2, false).text }}
            </div>
          </div>
          <div class="flex-1 flex flex-col items-center">
            <div class="text-sm font-semibold text-neutral2-basic">额度账变</div>
            <div :class="cn('font-semibold', formatSignedMoney(moreItems?.QuotaChangeGold ?? 0, 2, false).color)">
              {{ formatSignedMoney(moreItems?.QuotaChangeGold ?? 0, 2, false).text }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex items-center px-4 my-2 overflow-x-auto space-x-2">
      <TimeFilterDropdown v-model="selectTime" title="结算时间" />
      <Filled v-model:model-value="selectWallet" :options="walletTypeList" />
      <Filled v-model:model-value="selectTransferType" :options="transferTypeList" />
      <Filled v-model:model-value="selectedSort" :options="sortOptions" />
    </div>

    <InfinityScroll
      ref="infinityRef" 
      :fetch-action="fetchData"
      class="flex-1 flex flex-col"
    >
      <template v-slot="{ ls }">
        <div class="space-y-2 px-4">
          <div v-for="l in ls" :key="l.Id" class="rounded-2xl bg-bg-floor-1-2 px-3 pt-2 pb-3 space-y-2">
            <div class="rounded-2xl bg-white px-3 [&>div:not(:first-of-type)]:border-t [&>div:not(:first-of-type)]:border-neutral2-sixth">
              <div class="flex items-center justify-between py-2 text-xs text-neutral2-basic">
                <div class="font-normal flex-[0_0_30%]">订单号</div>
                <div class="font-semibold text-right flex items-center space-x-1">
                  <span>{{ l.OrderId }}</span>
                  <van-image src="./static/images/promote/copy_lite.png" fit="contain" class="w-3" @click.stop="copyHadandler(l.OrderId)"/>
                </div>
              </div>
              <div class="flex items-center justify-between py-2 text-xs text-neutral2-basic">
                <div class="font-normal flex-[0_0_30%]">账变金额</div>
                <div :class="cn('font-semibold text-right', formatSignedMoney(l.AdjustAmount ?? 0, 2, false).color)">{{ formatSignedMoney(l.AdjustAmount ?? 0, 2, false).text }}</div>
              </div>
              <div class="flex items-center justify-between py-2 text-xs text-neutral2-basic">
                <div class="font-normal flex-[0_0_30%]">钱包余额</div>
                <div class="font-semibold text-right">{{ formatMoney(l.AdjustAmountAft ?? 0, 2, true) }}</div>
              </div>
              <div class="flex items-center justify-between py-2 text-xs text-neutral2-basic">
                <div class="font-normal flex-[0_0_30%]">账变类型</div>
                <div class="font-semibold text-right">{{ transferTypeMap.find(t => Number(t.value) === Number(l.TransferType))?.label ?? '-' }}</div>
              </div>
              <div class="flex items-center justify-between py-2 text-xs text-neutral2-basic">
                <div class="font-normal flex-[0_0_30%]">钱包类型</div>
                <div class="font-semibold text-right">{{ walletTypeList.find(w => Number(w.value) === Number(l.WalletType))?.label ?? '-' }}</div>
              </div>
              <div class="flex items-center justify-between py-2 text-xs text-neutral2-basic">
                <div class="font-normal flex-[0_0_30%]">备注</div>
                <div class="font-semibold text-right break-all">{{ showNote(l) }}</div>
              </div>
            </div>

            <div class="flex items-center justify-between text-xs text-neutral2-basic">
              <div>账变时间</div>
              <div>{{ dayjs.unix(l.CreateTime).format('YYYY-MM-DD HH:mm:ss') }}</div>
            </div>
          </div>
        </div>
      </template>
    </InfinityScroll>
  </div>
</template>r