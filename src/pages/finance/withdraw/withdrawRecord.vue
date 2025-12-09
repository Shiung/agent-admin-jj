<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useClipboard } from '@vueuse/core'
import { formatMoneyWithComma } from '@/utils/formatNumber'
import { getWithdrawName } from '@/utils/finance'
import dayjs from 'dayjs'
import API from '@/apis'

const { copy } = useClipboard()

interface FormData {
  /** 開始時間 */
  BeginTime: number
  /** 結束時間 */
  EndTime: number
  /** 訂單狀態 1:申請中, 2:已打款, 3:已拒絕, 4:已打款, 5:審核中, */
  Status: number
  Page: number
  PageSize: number
}
const initFormData = (): FormData => ({
  BeginTime: dayjs().subtract(6, 'day').startOf('day').unix(),
  EndTime: dayjs().endOf('day').unix(),
  Status: 0,
  Page: 1,
  PageSize: 10
})
const formData = ref<FormData>(initFormData())

const statusOptions = [
  { label: '全部状态', value: 0 },
  { label: '申请中', value: 1 },
  { label: '已打款', value: '2,4' },
  { label: '已拒绝', value: 3 },
  { label: '审核中', value: 5 }
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
  const loading = showLoadingToast({ message: '加载中...', forbidClick: true, duration: 0 })
  try {
    const res = await API.finance.getWithdrawRecordList(formData.value)
    if (res.data.Code !== 200) return
    if (res.data.Data.Items) {
      list.value = list.value.concat(res.data.Data.Items)
    }
    listMaxCount.value = res.data.Data.Pagination.MaxCount
    console.log("list.value.length", list.value.length)
    console.log("listMaxCount.value", listMaxCount.value)
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
const handleChangeFilter = () => {
  refreshing.value = true
  onRefresh()
}

const getStatusTagClass = (status: number): string => {
  switch(status) {
    case 1:
      return 'text-primary-normal border-primary-50 bg-primary-10'
    case 2:
      return 'text-success-normal border-success-50 bg-success-10'
    case 3:
      return 'text-error-normal border-error-50 bg-error-10'
    case 4:
      return 'text-success-normal border-success-50 bg-success-10'
    case 5:
      return 'text-primary-normal border-primary-50 bg-primary-10'
    default:
      return ''
  }
}
const getStatusText = (status: number): string => {
  switch(status) {
    case 1:
      return '申请中'
    case 2:
      return '已打款'
    case 3:
      return '已拒绝'
    case 4:
      return '已打款'
    case 5:
      return '审核中'
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
  await fetchWithdrawRecordConfig()
  fetchWithdrawRecordList()
})
</script>

<template>
  <div class="flex-1 flex flex-col">
    <div class="flex items-center mt-2 px-3 py-2">
      <div class="text-sm leading-6">
        <Dropdown v-model="formData.Status" class="dropDownCus" :options="statusOptions" @change="handleChangeFilter" />
      </div>
    </div>
    <div class="listContainer mt-2 px-3 pb-2">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list
          v-model:loading="listLoading"
          :finished="finished"
          :immediate-check="false"
          finished-text="没有更多了"
          class="flex flex-col gap-2"
          @load="onLoad"
        >
          <div v-for="(item, index) in list" :key="index" class="flex flex-col p-3 rounded-2xl text-xs font-normal leading-5 bg-bg-floor-1-2">
            <div class="flex items-center justify-between">
              <div class="text-neutral2-basic">
                {{ dayjs(item.CreateTime * 1000).format('YYYY-MM-DD HH:mm:ss') }}
              </div>
              <div :class="['flex items-center justify-center h-5 px-2 rounded-[100px] border', getStatusTagClass(item.Status)]">
                {{ getStatusText(item.Status) }}
              </div>
            </div>
            <div class="mt-2 px-3 bg-white rounded-2xl">
              <div class="flex justify-between py-2 leading-5 text-xs text-neutral2-basic">
                <div class="font-normal">订单号</div>
                <div class="flex items-center justify-center font-semibold">
                  {{ item.OrderId }}
                  <van-image src="./static/images/promote/copy_lite.png" class="ml-1 w-3 h-3" fit="contain" @click="handleCopy(item.OrderId)" />
                </div>
              </div>

              <div class="flex justify-between py-2 leading-5 text-xs text-neutral2-basic border-t border-t-neutral2-sixth">
                <div class="font-normal">提现金额</div>
                <div class="font-semibold">{{ formatMoneyWithComma(item.Amount) }}</div>
              </div>

              <div class="flex justify-between py-2 leading-5 text-xs text-neutral2-basic border-t border-t-neutral2-sixth">
                <div class="font-normal">提现方式</div>
                <div class="font-semibold">{{ getWithdrawName(item.AccountType) }}</div>
              </div>

              <div class="flex justify-between py-2 leading-5 text-xs text-neutral2-basic border-t border-t-neutral2-sixth">
                <div class="font-normal">提现帐号</div>
                <div class="font-semibold text-right">
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
      </van-pull-refresh>
    </div>
  </div>
</template>

<style lang="scss" scoped>
:deep(.dropDownCus) {
  height: calc(var(--spacing) * 6);
  padding: calc(var(--spacing) * 0.5) calc(var(--spacing) * 2);
  font-weight: var(--font-weight-normal);
  font-size: var(--text-xs);
  color: var(--color-neutral2-basic);
  background: var(--color-bg-floor-1-2);
  border: none;
  box-shadow: none;
}
.listContainer {
  height: calc(100vh - calc(var(--spacing) * 48));
  overflow: auto;
}
</style>