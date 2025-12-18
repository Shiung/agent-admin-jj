<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useClipboard } from '@vueuse/core'
import { formatMoneyWithComma } from '@/utils/formatNumber'
import { getWithdrawName } from '@/utils/finance'
import { type WithdrawRecordListQuery } from '@/apis/codegen/data-contracts'
import { type ListItem } from '../components/payTypeList.vue'
import dayjs from 'dayjs'
import API from '@/apis'

const { copy } = useClipboard()

const initFormData = (): WithdrawRecordListQuery => ({
  BeginTime: dayjs().startOf('month').unix(),
  EndTime: dayjs().endOf('month').unix(),
  AccountType: 0,
  Status: 0,
  Sort: '-CreateTime',
  Page: 1,
  PageSize: 20
})
const formData = ref<WithdrawRecordListQuery>(initFormData())

const withdrawTime = ref({
  startTime: dayjs().startOf('month').unix(),
  endTime: dayjs().endOf('month').unix(),
})
const accountTypeOptions = computed(() => {
  let options = [{ label: '全部方式', value: 0 }]
  if (withdrawList.value && withdrawList.value.length > 0) {
    options = options.concat(withdrawList.value.map((item: ListItem) => ({ label: item.Name, value: item.PayType })))
  }
  return options
})
const statusOptions = [
  { label: '全部状态', value: 0 },
  { label: '待处理', value: 1 },
  { label: '已出款', value: '2,4' },
  { label: '退款驳回', value: 3 },
  { label: '處理中', value: 5 }
]
const sortOptions = [
  { label: '提现时间降序', value: '-CreateTime' },
  { label: '提现时间升序', value: 'CreateTime' },
  { label: '提现金额降序', value: '-Amount' },
  { label: '提现金额升序', value: 'Amount' },
]

const withdrawRecordConfig = ref<{
  IsOpen: number
  LimitDay: number
}>({
  /** 雲平台的設置是否打開 1:開, 2:關 */
  IsOpen: 2,
  /** 可查詢天數上限 */
  LimitDay: 0
})

const list = ref<Record<string, any>>([])
const listLoading = ref<boolean>(false)
const listMaxCount = ref<number>(0)
const finished = ref<boolean>(false)
const refreshing = ref<boolean>(false)

const fetchWithdrawRecordConfig = async () => {
  try {
    const res = await API.finance.getWithdrawRecordConfig()
    if (res.data.Code !== 200) return
    if (!res.data.Data[0]) return
    withdrawRecordConfig.value.IsOpen = res.data.Data[0]?.IsOpen
    if (withdrawRecordConfig.value.IsOpen === 1) {
      withdrawRecordConfig.value.LimitDay = res.data.Data[0]?.LimitDay
    }
  } finally {}
}
const fetchWithdrawRecordList = async () => {
  if (!checkTimeRange()) {
    finished.value = true
    return 
  }
  const loading = showLoadingToast({ message: '加载中...', forbidClick: true, duration: 0 })
  try {
    const params = {
      ...formData.value, 
      AccountType: formData.value.AccountType === 0 ? '' : formData.value.AccountType?.toString()
    }
    const res = await API.finance.getWithdrawRecordList(params)
    if (res.data.Code !== 200) {
      finished.value = true
      listLoading.value = false
      return
    }
    if (res.data.Data.Items) {
      list.value = list.value.concat(res.data.Data.Items)
    }
    listMaxCount.value = res.data.Data.Pagination.MaxCount
    if (list.value.length >= listMaxCount.value) {
      finished.value = true
    }
  } finally {
    loading.close()
  }
}

const onLoad = async () => {
  if (refreshing.value) {
    formData.value.Page = 1
    list.value = []
    refreshing.value = false
  } else {
    formData.value.Page++
  }
  await fetchWithdrawRecordList()
  listLoading.value = false
}
const onRefresh = () => {
  finished.value = false
  listLoading.value = true
  onLoad()
}

watch(
  () => withdrawTime.value,
  (val) => {
    formData.value.BeginTime = val.startTime
    formData.value.EndTime = val.endTime
  },
  { deep: true }
)
watch(
  () => [formData.value.BeginTime, formData.value.EndTime, formData.value.AccountType, formData.value.Status, formData.value.Sort], 
  () => {
    refreshing.value = true
    onRefresh()
  },
  { deep: true }
)

/** 提現通道列表 */
const withdrawList = ref<ListItem[]>([])
const fetchWithdrawList = async () => {
  const loading = showLoadingToast({ message: '加载中...', forbidClick: true, duration: 0 })
  try {
    const res = await API.finance.getWithdrawAllowedList()
    if (res.data.Code !== 200) return
    withdrawList.value = res.data.Data.Items.sort((a, b) => a.Sort - b.Sort)
  } finally {
    loading.close()
  }
}

const checkTimeRange = () => {
  if (withdrawRecordConfig.value.IsOpen === 2) return true

  const daysAgo = dayjs().subtract(withdrawRecordConfig.value.LimitDay, 'day').startOf('day').unix()
  if (formData.value.BeginTime < daysAgo) {
    showToast({ message: `查询时间范围不能超过${withdrawRecordConfig.value.LimitDay}天`, position: 'top' })
    return false
  }
  return true
}

const formatTime = (time: number) => dayjs(time).format('YYYY-MM-DD HH:mm:ss')
// 狀態對齊雲平台, 不和代理後台PC同步
const getStatusTagClass = (OrderType: number, Status: number, Process: number): string => {
  const primary = 'text-primary-normal border-primary-50 bg-primary-10'
  const success = 'text-success-normal border-success-50 bg-success-10'
  const error = 'text-error-normal border-error-50 bg-error-10'
  switch (OrderType) {
    case 0:
      return error
    case 1:
    case 2:
      switch (Status) {
        case 1:
          return primary
        case 2:
        case 4:
          return success
        case 3:
          return error
        case 5:
          return primary
        default:
          return ''
      }
    case 3:
      if (Status == 1 && Process <= 4) {
        return primary
      } else if (Status == 1 && Process == 6) {
        return primary
      } else if ((Status == 2 || Status == 4) && Process == 7) {
        return success
      } else if (Status == 3 && Process == 8) {
        return error
      } else {
        return primary
      }
    default:
      return ''
  }
}
const getStatusText = (OrderType: number, Status: number, Process: number): string => {
  switch (OrderType) {
    case 0:
      return ''
    case 1:
    case 2:
      switch (Status) {
        case 1:
          return '待处理'
        case 2:
        case 4:
          return '已出款'
        case 3:
          return '退款驳回'
        case 5:
          return '處理中'
        default:
          return ''
      }
    case 3:
      if (Status == 1 && Process <= 4) {
        return '待处理'
      } else if ((Status == 2 || Status == 4) && Process == 7) {
        return '已出款'
      } else if (Status == 3 && Process == 8) {
        return '退款驳回'
      } else {
        return '處理中'
      }
    default:
      return ''
  }
}
const handleCopy = (text: string) => {
  if (!text) return
  copy(text)
  showToast({ message: '复制成功', position: 'top' })
}

onMounted(async () => {
  allowMultipleToast()
  fetchWithdrawList()
  await fetchWithdrawRecordConfig()
  fetchWithdrawRecordList()
})
</script>

<template>
  <div class="flex-1 flex flex-col">
    <div class="flex items-center mt-2 px-3 py-2 gap-2 overflow-auto">
      <TimeFilterDropdown v-model="withdrawTime" title="提现时间" />
      <Filled v-model="formData.AccountType!" :options="accountTypeOptions" />
      <Filled v-model="formData.Status!" :options="statusOptions" />
      <Filled v-model="formData.Sort!" :options="sortOptions" />
    </div>
    <div class="listContainer mt-2 px-3 pb-2">
      <van-pull-refresh v-model="refreshing" :style="[list.length === 0 && !listLoading && { height: '100%' }]" @refresh="onRefresh">
        <van-list
          v-if="list.length > 0"
          v-model:loading="listLoading"
          class="flex flex-col gap-2"
          :finished="finished"
          :immediate-check="false"
          :finished-text="list.length > 0 ? '没有更多了' : ''"
          @load="onLoad"
        >
          <div v-for="(item, index) in list" :key="index" class="flex flex-col p-3 rounded-2xl text-xs font-normal leading-5 bg-bg-floor-1-2">
            <div class="flex items-center justify-between">
              <div class="text-neutral2-basic">
                {{ formatTime(item.CreateTime * 1000) }}
              </div>
              <div :class="['flex items-center justify-center h-5 px-2 rounded-[100px] border', getStatusTagClass(item.OrderType, item.Status, item.Process)]">
                {{ getStatusText(item.OrderType, item.Status, item.Process) }}
              </div>
            </div>
            <div class="mt-2 px-3 bg-white rounded-2xl">
              <div class="flex justify-between py-2 leading-5 gap-3 text-xs text-neutral2-basic">
                <div class="min-w-20">订单号</div>
                <div class="flex items-center justify-center font-semibold">
                  <div class="text-right break-all">{{ item.OrderId }}</div>
                  <van-image src="./static/images/promote/copy_lite.png" class="ml-1 w-3 flex-shrink-0" fit="contain" @click="handleCopy(item.OrderId)" />
                </div>
              </div>

              <div class="flex justify-between py-2 leading-5 gap-3 text-xs text-neutral2-basic border-t border-t-neutral2-sixth">
                <div class="min-w-20">提现金额</div>
                <div class="text-right font-semibold">{{ formatMoneyWithComma(item.Amount) }}</div>
              </div>

              <div class="flex justify-between py-2 leading-5 gap-3 text-xs text-neutral2-basic border-t border-t-neutral2-sixth">
                <div class="min-w-20">提现方式</div>
                <div class="text-right font-semibold">{{ getWithdrawName(item.AccountType) }}</div>
              </div>

              <div class="flex justify-between py-2 leading-5 gap-3 text-xs text-neutral2-basic border-t border-t-neutral2-sixth">
                <div class="min-w-20">提现帐号</div>
                <div class="text-right font-semibold">
                  <template v-if="item.AccountType === 1001">
                    <div>{{ item.AccountBank }}</div>
                    <div>{{ item.AccountNum }}</div>
                    <div>{{ item.RealName }}</div>
                  </template>
                  <template v-else-if="item.AccountType === 1002">
                    <div>{{ item.AccountNum }}</div>
                    <div>{{ item.RealName }}</div>
                  </template>
                  <template v-else>
                    <div>{{ item.DigitalType }}</div>
                    <div>{{ item.DigitalAddress }}</div>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </van-list>

        <empty v-if="list.length === 0 && !listLoading && finished" />
      </van-pull-refresh>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.listContainer {
  height: calc(100vh - calc(var(--spacing) * 48));
  overflow: auto;
}
</style>