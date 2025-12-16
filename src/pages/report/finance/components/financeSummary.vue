<script setup lang="ts">
import { formatSignedMoney } from '@/utils/formatNumber'
interface Props {
  total: number
}

const props = defineProps<Props>()
</script>

<template>
  <div class="bg-white rounded-2xl px-4 py-1 shadow-sm">
    <div class="flex items-center justify-between">
      <!-- 左侧：标题和金额 -->
      <div class="flex flex-col gap-1">
        <span class="text-neutral-secondary text-sm">总盈利</span>
        <span class="text-2xl font-semibold" :class="formatSignedMoney(props.total).color">{{ formatSignedMoney(props.total).text }}</span>
      </div>

      <!-- 右侧：装饰图标 -->
      <div class="h-[76px] w-[124px]">
        <van-image src="./static/images/common/creditWalletIcon.png" alt="总盈利" fit="contain"/>
      </div>
    </div>
  </div>
</template>

<style scoped>
.shadow-sm {
  box-shadow: -0.5px 0.5px 3px 0px rgba(0, 0, 0, 0.15);
}
</style>
