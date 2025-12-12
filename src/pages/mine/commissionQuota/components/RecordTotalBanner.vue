<script setup lang="ts">
import { ref } from 'vue'
import { formatMoneyWithComma } from '@/utils/formatNumber'

interface Props {
  amount: number
}
const props = defineProps<Props>()
const title = ref('转换金额总计')
const iconImagePath = ref('./static/images/common/commissionQuotaIcon.png')

</script>

<template>
  <div class="flex items-center justify-between mt-2 bg-white rounded-2xl shadow-[-0.5px_0.5px_3px_0px_rgba(0,0,0,0.15)]">
    <div class="px-4 py-3">
      <div class="flex items-center gap-1">
        <span class="text-sm font-semibold leading-6">{{ title }}</span>
      </div>
      <div class="text-xl leading-7 font-semibold text-primary-normal">{{ formatMoneyWithComma(props.amount) }}</div>
    </div>
    <van-image :src="iconImagePath" fit="contain" class="h-19" />
  </div>
</template>

