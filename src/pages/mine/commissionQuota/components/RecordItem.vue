<script setup lang="ts">
import { watchEffect } from 'vue'
import dayjs from 'dayjs'
import { formatMoneyWithComma } from '@/utils/formatNumber'
import type { CommissionToQuotaTotalItem } from '@/apis/codegen/data-contracts'
import { useClipboard } from '@vueuse/core'
import { showToast } from 'vant'
import { transferType } from '@/utils/mappingTransferType'

interface Props {
  record: CommissionToQuotaTotalItem
}
const { copy, copied } = useClipboard()
const props = defineProps<Props>()

const formatTime = (time: number) => {
  return dayjs(time * 1000).format('YYYY-MM-DD HH:mm:ss')
}

watchEffect(() => {
  if (copied.value) {
    showToast({ message: '复制成功' })
  }
})

</script>

<template>
  <div class="w-full bg-slate-50 rounded-2xl px-3 py-2 flex flex-col gap-2">
    <div class="w-full bg-white rounded-2xl flex flex-col overflow-hidden">
      <div class="flex justify-between items-center py-2 px-3">
        <div class="text-blue-950/90 text-xs font-normal leading-5">订单号</div>
        <div class="flex items-center gap-1 flex-1 justify-end min-w-0">
          <div class="text-blue-950/90 text-xs font-semibold leading-5 text-right break-all">{{ props.record.OrderId }}</div>
          <van-image
            src="./static/images/promote/copy_lite.png"
            class="w-3.5 h-3.5 flex-shrink-0 cursor-pointer"
            fit="contain"
            @click="copy(props.record.OrderId)"
          />
        </div>
      </div>
      <div class="flex flex-col">
        <div class="h-[0.5px] bg-gray-200 mx-3"></div>
        <div class="flex justify-between items-center py-2 px-3">
          <div class="text-blue-950/90 text-xs font-normal leading-5">转换方式</div>
          <div class="text-blue-950/90 text-xs font-semibold leading-5">{{ transferType(props.record.TransferType) }}</div>
        </div>
      </div>
      <div class="flex flex-col">
        <div class="h-[0.5px] bg-gray-200 mx-3"></div>
        <div class="flex justify-between items-center py-2 px-3">
          <div class="text-blue-950/90 text-xs font-normal leading-5">转账金额</div>
          <div class="text-blue-950/90 text-xs font-semibold leading-5">{{ formatMoneyWithComma(props.record.AdjustAmount) }}</div>
        </div>
      </div>
    </div>
    <div class="flex justify-between items-center">
      <div class="text-blue-950/90 text-xs font-normal leading-5">账变时间</div>
      <div class="text-blue-950/90 text-xs font-normal leading-5">{{ formatTime(props.record.CreateTime) }}</div>
    </div>
  </div>
</template>

<style scoped>

</style>
