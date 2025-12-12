<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import TimeFilterDropdown from '@/components/TimeFilter/TimeFilterDropdown.vue'
import Filled from '@/components/Dropdown/Filled.vue'
import RecordTotalBanner from './components/RecordTotalBanner.vue'
import RecordItem from './components/RecordItem.vue'
import type { CommissionToQuotaTotalItem } from '@/apis/codegen/data-contracts'
import dayjs from 'dayjs'
import API from '@/apis'

const quotaTime = ref({
  startTime: dayjs().startOf('month').unix(),
  endTime: dayjs().endOf('month').unix(),
})

const sortOptions = [
  { value: '-UpdateTime', label: '账变时间降序' },
  { value: 'UpdateTime', label: '账变时间升序' },
]
const selectedSort = ref(sortOptions[0]?.value ?? '-UpdateTime')
const totalAmount = ref(0)
const records = ref<CommissionToQuotaTotalItem[]>([])


const fetchCommissionToQuotaTotal = async () => {
  const res = await API.admin.getCommissionToQuotaTotal({
    Page: 1,
    PageSize: 10,
    BeginTime: quotaTime.value.startTime,
    EndTime: quotaTime.value.endTime,
    BillType: 0,
    TransferType: 14,
    Sort: selectedSort.value
  })
  if (res.data.Code !== 200) return
  records.value = res.data.Data.Items as CommissionToQuotaTotalItem[] ?? []
  totalAmount.value = res.data.Data.MoreItems?.TotalChangeGold ?? 0
}

onMounted(() => {
  fetchCommissionToQuotaTotal()
})

watch([quotaTime, selectedSort], () => {
  fetchCommissionToQuotaTotal()
})

</script>
<template>
  <div class="flex-1 flex flex-col">
    <RecordTotalBanner class="mx-3" :amount="totalAmount" />
    <div class="flex items-center mt-2 px-3 py-2 gap-2 overflow-auto">
      <TimeFilterDropdown v-model="quotaTime" title="账变时间" />
      <Filled v-model:model-value="selectedSort" :options="sortOptions" />
    </div>
    <div class="flex flex-col gap-2 mx-3 mt-2">
      <template v-if="records.length > 0">
        <template v-for="item in records" :key="item.Id">
          <RecordItem :record="item" />
        </template>
      </template>
      <div v-else class="min-h-[500px] flex flex-1 items-center">
        <empty />
      </div>
    </div>
  </div>
</template>
