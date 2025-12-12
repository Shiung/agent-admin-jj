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
  <div class="px-3 py-2 bg-slate-50 rounded-2xl inline-flex flex-col justify-start items-start gap-2">
    <div class="w-full bg-white rounded-2xl">
      <div class="px-3 py-2 border-b-[0.5px] flex justify-between align-center">
        <div class="justify-start text-blue-950/90 text-xs font-normal leading-5">订单号</div>
        <div class="self-stretch justify-start text-blue-950/90 text-xs font-semibold leading-5 line-clamp-1">
          {{ props.record.OrderId }}
          <van-image class="ml-1" src="./static/images/promote/copy_lite.png" width="15" height="15" @click="copy(props.record.OrderId)" />
        </div>
      </div>
      <div class="px-3 py-2 border-b-[0.5px] flex justify-between align-center">
        <div class="justify-start text-blue-950/90 text-xs font-normal leading-5">转换方式</div>
        <div class="self-stretch justify-start text-blue-950/90 text-xs font-semibold leading-5 line-clamp-1">{{ transferType(props.record.TransferType) }}</div>
      </div>
      <div class="px-3 py-2 flex justify-between align-center">
        <div class="justify-start text-blue-950/90 text-xs font-normal leading-5">转账金额</div>
        <div class="self-stretch justify-start text-blue-950/90 text-xs font-semibold leading-5 line-clamp-1">{{ formatMoneyWithComma(props.record.AdjustAmount) }}</div>
      </div>
    </div>
    <div class="w-full pt-2 flex justify-between align-center">
      <div class="justify-start text-blue-950/90 text-xs font-normal leading-5">账变时间</div>
      <div class="justify-start text-blue-950/90 text-xs font-normal leading-5">{{ formatTime(props.record.CreateTime) }}</div>
    </div>
  </div>
</template>

<style scoped>

</style>
