<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useClipboard } from '@vueuse/core'
import { formatMoneyWithComma } from '@/utils/formatNumber'
import { getRechargeName } from '@/utils/finance'
import { type RechargeRecordListQuery } from '@/apis/codegen/data-contracts'
import dayjs from 'dayjs'
import API from '@/apis'

const { copy } = useClipboard()

const initFormData = (): RechargeRecordListQuery => ({
  BeginTime: dayjs().startOf('month').unix(),
  EndTime: dayjs().endOf('month').unix(),
  Status: 0,
  Sort: '-CreateTime',
  Page: 1,
  PageSize: 20
})
const formData = ref<RechargeRecordListQuery>(initFormData())

const rechargeTime = ref({
  startTime: dayjs().startOf('month').unix(),
  endTime: dayjs().endOf('month').unix(),
})
const statusOptions = [
  { value: 0, label: '全部状态' },
  { value: 2, label: '充值完成' },
  { value: 3, label: '充值失败' },
  { value: 1, label: '处理中' },
  { value: 4, label: '已审核' },
  { value: 12, label: '充值取消' },
  { value: 13, label: '用户取消' },
]
const sortOptions = [
  {value: '-CreateTime', label: '充值时间降序'},
  {value: 'CreateTime', label: '充值时间升序'},
  {value: '-Amount', label: '充值金额降序'},
  {value: 'Amount', label: '充值金额升序'},
]

const list = ref<Record<string, any>>([])
const listLoading = ref<boolean>(false)
const listMaxCount = ref<number>(0)
const finished = ref<boolean>(false)
const refreshing = ref<boolean>(false)

const fetchRechargeRecordList = async () => {
  const loading = showLoadingToast({ message: '加载中...', forbidClick: true, duration: 0 })
  try {
    const params = {
      ...formData.value, 
      Status: formData.value.Status === 0 ? '' : formData.value.Status
    }
    const res = await API.finance.getRechargeRecordList(params)
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
    formData.value.Page && formData.value.Page++
  }
  await fetchRechargeRecordList()
  listLoading.value = false
}
const onRefresh = () => {
  finished.value = false
  listLoading.value = true
  onLoad()
}

watch(
  () => rechargeTime.value,
  (val) => {
    formData.value.BeginTime = val.startTime
    formData.value.EndTime = val.endTime
  },
  { deep: true }
)
watch(
  () => [formData.value.BeginTime, formData.value.EndTime, formData.value.Status, formData.value.Sort], 
  () => {
    refreshing.value = true
    onRefresh()
  },
  { deep: true }
)

const formatTime = (time: number) => dayjs(time).format('YYYY-MM-DD HH:mm:ss')
const getStatusTagClass = (status: number): string => {
  switch(status) {
    case 2:
      return 'text-success-normal border-success-50 bg-success-10'
    case 3:
      return 'text-error-normal border-error-50 bg-error-10'
    case 1:
    case 4:
      return 'text-primary-normal border-primary-50 bg-primary-10'
    case 12:
    case 13:
      return 'text-neutral2-secondary border-neutral2-fifth bg-neutral2-seventh'
    default:
      return ''
  }
}
const getStatusText = (status: number): string => {
  switch(status) {
    case 2:
      return '充值完成'
    case 3:
      return '充值失败'
    case 1:
      return '处理中'
    case 4:
      return '已审核'
    case 12:
      return '充值取消'
    case 13:
      return '用户取消'
    default:
      return ''
  }
}

const handleCopy = (text: string) => {
  if (!text) return
  copy(text)
  showToast({ message: '复制成功', position: 'top' })
}

onMounted(() => {
  fetchRechargeRecordList()
})
</script>

<template>
  <div class="flex-1 flex flex-col">
    <div class="flex items-center mt-2 px-3 py-2 gap-2 overflow-auto">
      <TimeFilterDropdown v-model="rechargeTime" title="充值时间" />
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
              <div :class="['flex items-center justify-center h-5 px-2 rounded-[100px] border', getStatusTagClass(item.Status)]">
                {{ getStatusText(item.Status) }}
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
                <div class="min-w-20">充值方式</div>
                <div class="text-right font-semibold">{{ getRechargeName(item.PayType) }}</div>
              </div>

              <div class="flex justify-between py-2 leading-5 gap-3 text-xs text-neutral2-basic border-t border-t-neutral2-sixth">
                <div class="min-w-20">充值金额</div>
                <div class="text-right font-semibold">{{ formatMoneyWithComma(item.RealAmount) }}</div>
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