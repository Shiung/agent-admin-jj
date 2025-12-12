<!-- 會員充值 - 會員充值記錄 - 充值記錄 -->
<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useClipboard } from '@vueuse/core'
import { formatMoneyWithComma } from '@/utils/formatNumber'
import { type MemberRechargeOrderListQuery } from '@/apis/codegen/data-contracts'
import dayjs from 'dayjs'
import API from '@/apis'

const { copy } = useClipboard()

const initFormData = (): MemberRechargeOrderListQuery => ({
  Status: 'all',
  BeginTime: dayjs().startOf('month').unix(),
  EndTime: dayjs().endOf('month').unix(),
  Page: 1,
  PageSize: 20
})
const formData = ref<MemberRechargeOrderListQuery>(initFormData())

const operationTime = ref({
  startTime: dayjs().startOf('month').unix(),
  endTime: dayjs().endOf('month').unix(),
})
const statusOptions = [
  { value: 'all', label: '全部状态' },
  { value: '0', label: '待批准' },
  { value: '3', label: '处理中' },
  { value: '1', label: '已完成' },
  { value: '2', label: '拒绝' },
  { value: '4', label: '充值失败' },
]

const list = ref<Record<string, any>>([])
const listLoading = ref<boolean>(false)
const listMaxCount = ref<number>(0)
const finished = ref<boolean>(false)
const refreshing = ref<boolean>(false)

const fetchMemberRechargeOrderList = async () => {
  const loading = showLoadingToast({ message: '加载中...', forbidClick: true, duration: 0 })
  try {
    const params = {
      ...formData.value, 
      Status: formData.value.Status === 'all' ? '' : formData.value.Status
    }
    const res = await API.memberRecharge.getMemberRechargeOrderList(params)
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
  await fetchMemberRechargeOrderList()
  listLoading.value = false
}
const onRefresh = () => {
  finished.value = false
  listLoading.value = true
  onLoad()
}

watch(
  () => operationTime.value,
  (val) => {
    formData.value.BeginTime = val.startTime
    formData.value.EndTime = val.endTime
  },
  { deep: true }
)
watch(
  () => [formData.value.BeginTime, formData.value.EndTime, formData.value.Status], 
  () => {
    refreshing.value = true
    onRefresh()
  },
  { deep: true }
)

const formatTime = (time: number) => dayjs(time).format('YYYY-MM-DD HH:mm:ss')
const getStatusTagClass = (status: number): string => {
  switch(status) {
    case 0:
    case 3:
    case 4:
      return 'text-primary-normal border-primary-50 bg-primary-10'
    case 1:
      return 'text-success-normal border-success-50 bg-success-10'
    case 2:
      return 'text-error-normal border-error-50 bg-error-10'
    default:
      return ''
  }
}
const getStatusText = (status: number): string => {
  switch(status) {
    case 0:
      return '待批准'
    case 1:
      return '已完成'
    case 2:
      return '拒绝'
    case 3:
      return '处理中'
    case 4:
      return '充值失败'
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
  fetchMemberRechargeOrderList()
})
</script>

<template>
  <div class="flex-1 flex flex-col">
    <div class="flex items-center px-3 py-2 gap-2 overflow-auto">
      <TimeFilterDropdown v-model="operationTime" title="操作时间" />
      <Dropdown v-model="formData.Status!" class="dropDownCus" :options="statusOptions" />
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
                <div class="min-w-20">产品名称</div>
                <div class="text-right font-semibold">{{ item.PackageName }}</div>
              </div>

              <div class="flex justify-between py-2 leading-5 gap-3 text-xs text-neutral2-basic border-t border-t-neutral2-sixth">
                <div class="min-w-20">会员账号</div>
                <div class="text-right font-semibold">{{ item.LoginAccount || '-' }}</div>
              </div>

              <div class="flex justify-between py-2 leading-5 gap-3 text-xs text-neutral2-basic border-t border-t-neutral2-sixth">
                <div class="min-w-20">充值金额</div>
                <div class="text-right font-semibold">{{ item.SoldScore ? formatMoneyWithComma(item.SoldScore) : '-' }}</div>
              </div>

              <div class="flex justify-between py-2 leading-5 gap-3 text-xs text-neutral2-basic border-t border-t-neutral2-sixth">
                <div class="min-w-20">通知群组</div>
                <div class="text-right font-semibold">{{ item.NotifyGroup || '-' }}</div>
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
:deep(.dropDownCus) {
  width: auto;
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
  height: calc(100vh - calc(var(--spacing) * 40));
  overflow: auto;
}
</style>