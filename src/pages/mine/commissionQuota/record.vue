<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import TimeFilterDropdown from '@/components/TimeFilter/TimeFilterDropdown.vue'
// import Filled from '@/components/Dropdown/Filled.vue'
import RecordTotalBanner from './components/RecordTotalBanner.vue'
import RecordItem from './components/RecordItem.vue'
import type { CommissionToQuotaTotalItem, CommissionToQuotaTotalQuery, CommissionToQuotaTotalResponse } from '@/apis/codegen/data-contracts'
import dayjs from 'dayjs'
import API from '@/apis'

type QuotaTime = { startTime: number, endTime: number }
const quotaTime = ref<QuotaTime>({
  startTime: dayjs().startOf('month').unix(),
  endTime: dayjs().endOf('month').unix(),
})

// 暫時先隱藏排序功能
// const sortOptions = [
//   { value: '-UpdateTime', label: '账变时间降序' },
//   { value: 'UpdateTime', label: '账变时间升序' },
// ]
// const selectedSort = ref<CommissionToQuotaTotalQuery['Sort']>(sortOptions[0]?.value ?? '-UpdateTime')
const totalAmount = ref<CommissionToQuotaTotalResponse['Data']['MoreItems']['TotalChangeGold']>(0)
const records = ref<CommissionToQuotaTotalItem[]>([])
const refreshing = ref<boolean>(false)


const fetchCommissionToQuotaTotal = async () => {
  const loadingToast = showLoadingToast({ message: '加载中...', forbidClick: true, duration: 0 })
  try {
    const res = await API.admin.getCommissionToQuotaTotal({
      Page: 1,
      PageSize: 10,
      BeginTime: quotaTime.value.startTime,
      EndTime: quotaTime.value.endTime,
      BillType: 0,
      TransferType: 14
      // Sort: selectedSort.value
    })
    if (res.data.Code !== 200) {
      showFailToast(res.data.Msg)
      return
    }
    records.value = (res.data.Data.Items as CommissionToQuotaTotalItem[]) ?? []
    totalAmount.value = res.data.Data.MoreItems?.TotalChangeGold ?? 0
  } catch (error: any) {
    console.error('获取佣金转额度记录失败：', error)
    showFailToast(error?.response?.data?.Msg)
  } finally {
    loadingToast.close()
    refreshing.value = false
  }
}

onMounted(() => {
  fetchCommissionToQuotaTotal()
})

// watch([quotaTime, selectedSort], () => {
//   fetchCommissionToQuotaTotal()
// })

</script>
<template>
  <div class="flex-1 flex flex-col">
    <RecordTotalBanner class="mx-3" :amount="totalAmount" />
    <div class="flex items-center mt-2 px-3 py-2 gap-2 overflow-auto">
      <TimeFilterDropdown v-model="quotaTime" title="账变时间" />
      <!-- <Filled v-model:model-value="selectedSort" :options="sortOptions" /> -->
    </div>
    <van-pull-refresh v-model="refreshing" @refresh="fetchCommissionToQuotaTotal">
      <div class="flex flex-col gap-2 mx-3 mt-2">
        <template v-if="records.length > 0">
          <template v-for="item in records" :key="item.Id">
            <RecordItem :record="item" />
          </template>
        </template>
        <empty v-else class="min-h-[500px] flex-1" />
      </div>
    </van-pull-refresh>
  </div>
</template>
