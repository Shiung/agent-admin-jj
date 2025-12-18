<!-- 會員充值 - 會員充值記錄 - 訂單狀態 -->
<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useClipboard } from '@vueuse/core'
import { formatMoneyWithComma } from '@/utils/formatNumber'
import { type MemberRechargeOrderStatusQuery } from '@/apis/codegen/data-contracts'
import dayjs from 'dayjs'
import API from '@/apis'

import MessageRecordPopup from './messageRecordPopup.vue'

const { copy } = useClipboard()

const initFormData = (): MemberRechargeOrderStatusQuery => ({
  MsgStatus: 0,
  BeginTime: dayjs().startOf('month').unix(),
  EndTime: dayjs().endOf('month').unix(),
  DataType: '1',
  Page: 1,
  PageSize: 20
})
const formData = ref<MemberRechargeOrderStatusQuery>(initFormData())

const operationTime = ref({
  startTime: dayjs().startOf('month').unix(),
  endTime: dayjs().endOf('month').unix(),
})
const statusOptions = [
  { value: 0, label: '全部状态' },
  { value: '1', label: '发送中' },
  { value: '2', label: '待处理' },
  { value: '3', label: '发送失败' },
  { value: '5', label: '审核中' },
  { value: '4', label: '已建单' },
]

const list = ref<Record<string, any>>([])
const listLoading = ref<boolean>(false)
const listMaxCount = ref<number>(0)
const finished = ref<boolean>(false)
const refreshing = ref<boolean>(false)

const fetchMemberRechargeOrderStatus = async () => {
  const loading = showLoadingToast({ message: '加载中...', forbidClick: true, duration: 0 })
  try {
    const params = {
      ...formData.value, 
      MsgStatus: formData.value.MsgStatus === 0 ? '' : formData.value.MsgStatus
    }
    const res = await API.memberRecharge.getMemberRechargeOrderStatus(params)
    if (res.data.Code !== 200) {
      finished.value = true
      listLoading.value = false
      return
    }
    if (res.data.Data.Items) {
      const newItems = res.data.Data.Items.map((item) => {
        return {
          ...item,
          OriginalMsg: item.OriginalMsg && JSON.parse(item.OriginalMsg)
        }
      })
      list.value = list.value.concat(newItems)
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
  await fetchMemberRechargeOrderStatus()
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
  () => [formData.value.BeginTime, formData.value.EndTime, formData.value.MsgStatus], 
  () => {
    refreshing.value = true
    onRefresh()
  },
  { deep: true }
)

const formatTime = (time: number) => dayjs(time).format('YYYY-MM-DD HH:mm:ss')
const getStatusTagClass = (status: number): string => {
  switch(status) {
    case 1:
    case 2:
    case 5:
      return 'text-primary-normal border-primary-50 bg-primary-10'
    case 3:
      return 'text-error-normal border-error-50 bg-error-10'
    case 4:
      return 'text-success-normal border-success-50 bg-success-10'
    default:
      return ''
  }
}
const getStatusText = (status: number): string => {
  switch(status) {
    case 1:
      return '发送中'
    case 2:
      return '待处理'
    case 3:
      return '发送失败'
    case 5:
      return '审核中'
    case 4:
      return '已建单'
    default:
      return ''
  }
}

const handleCopy = (text: string) => {
  if (!text) return
  copy(text)
  showToast({ message: '复制成功', position: 'top' })
}

const showMessageRecordPopup = ref<boolean>(false)
const messageRecordData = ref<string>('')
const handleShowMessageRecord = (item: string) => {
  messageRecordData.value = item
  showMessageRecordPopup.value = true
}

onMounted(() => {
  fetchMemberRechargeOrderStatus()
})
</script>

<template>
  <div class="flex-1 flex flex-col">
    <div class="flex items-center px-3 py-2 gap-2 overflow-auto">
      <TimeFilterDropdown v-model="operationTime" title="操作时间" />
      <Filled v-model="formData.MsgStatus!" :options="statusOptions" />
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
              <div class="flex items-center gap-2">
                <div :class="['flex items-center justify-center h-5 px-2 rounded-[100px] border', getStatusTagClass(item.MsgStatus)]">
                  {{ getStatusText(item.MsgStatus) }}
                </div>
                <van-image src="./static/images/common/info.svg" class="size-4" fit="contain" @click="handleShowMessageRecord(item.ReplyText)" />
              </div>
            </div>
            <div class="mt-2 px-3 bg-white rounded-2xl">
              <div class="flex justify-between py-2 leading-5 gap-3 text-xs text-neutral2-basic">
                <div class="min-w-20">讯息ID</div>
                <div class="flex items-center justify-center font-semibold">
                  <div class="text-right break-all">{{ item.PlatformUuid }}</div>
                  <van-image src="./static/images/promote/copy_lite.png" class="ml-1 w-3 flex-shrink-0" fit="contain" @click="handleCopy(item.PlatformUuid)" />
                </div>
              </div>

              <div class="flex justify-between py-2 leading-5 gap-3 text-xs text-neutral2-basic border-t border-t-neutral2-sixth">
                <div class="min-w-20">产品名称</div>
                <div class="text-right font-semibold">{{ item.PackageName }}</div>
              </div>

              <div class="flex justify-between py-2 leading-5 gap-3 text-xs text-neutral2-basic border-t border-t-neutral2-sixth">
                <div class="min-w-20">会员账号</div>
                <div class="text-right font-semibold">{{ item.OriginalMsg?.account || '-' }}</div>
              </div>

              <div class="flex justify-between py-2 leading-5 gap-3 text-xs text-neutral2-basic border-t border-t-neutral2-sixth">
                <div class="min-w-20">充值金额</div>
                <div class="text-right font-semibold">{{ item.OriginalMsg.amount ? formatMoneyWithComma(item.OriginalMsg.amount, 2, false) : '-' }}</div>
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

  <MessageRecordPopup 
    v-model:show="showMessageRecordPopup"
    :data="messageRecordData"
  />
</template>

<style lang="scss" scoped>
.listContainer {
  height: calc(100vh - calc(var(--spacing) * 40));
  overflow: auto;
}
</style>