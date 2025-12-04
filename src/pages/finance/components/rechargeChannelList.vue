<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { type ListItem } from './payTypeList.vue'
import { getRechargeTypeImage } from '@/utils/finance'
import { formatMoneyWithComma } from '@/utils/formatNumber'
import { type RechargeChannel } from '@/apis/codegen/data-contracts'

export type RechargeChannelItem = RechargeChannel

interface Props {
  selectPayTypeItem: ListItem
  selectRechargeChannelItem?: RechargeChannelItem | null
}

const props = withDefaults(defineProps<Props>(), {})

const emit = defineEmits<{
  'channelClick': [RechargeChannelItem],
}>()

const rechargeChannelList = computed(() => {
  if (!props.selectPayTypeItem) return []
  
  // 如果type有值("expandable"), 就顯示所有通道列表, 否則顯示權重最高的通道
  const list = props.selectPayTypeItem.expandables
  if (props.selectPayTypeItem.type) {
    return list
  } else {
    return [list[0]]
  }
})
const selectRechargeChannel = ref<RechargeChannelItem | null>(null)
watch(
  () => props.selectRechargeChannelItem,
  newValue => {
    if (!newValue) return
    if (selectRechargeChannel.value?.Id === newValue?.Id) return
    selectRechargeChannel.value = JSON.parse(JSON.stringify(newValue))
  }
)
const handleRechargeChannelClick = (item: RechargeChannelItem) => {
  selectRechargeChannel.value = item
  emit('channelClick', item)
}

const getIcon = (PayType: number): string => {
  if (!PayType) return ''
  return getRechargeTypeImage(PayType) || ''
}
</script>

<script lang="ts">
export const showLimit = (item: RechargeChannelItem) => {
  const data = JSON.parse(JSON.stringify(item))
  if (data.AllowInput === 1) {
    return `${formatMoneyWithComma(data.InputMin, 2, false)}~${formatMoneyWithComma(data.InputMax, 2, false)}`
  } else {
    if (!Array.isArray(data.Gears)) {
      data.Gears = data.Gears.split(',')
    }
    return `${formatMoneyWithComma(data.Gears[0], 2, false)}~${formatMoneyWithComma(data.Gears[data.Gears.length - 1], 2, false)}`
  }
}
</script>

<template>
  <div class="flex flex-col mt-2 gap-2">
    <div
      v-for="item in rechargeChannelList"
      :key="item.Id"
      :class="[
        'flex items-center relative px-4 py-3 gap-3 outline rounded-xl overflow-hidden',
        item.Id === selectRechargeChannel?.Id
          ? 'bg-primary-5 outline-primary-normal text-neutral-basic font-semibold'
          : 'bg-white outline-neutral2-seventh text-neutral2-secondary font-normal'
      ]"
      @click="handleRechargeChannelClick(item)"
    >
      <van-image :src="props.selectPayTypeItem.PayType ? getIcon(props.selectPayTypeItem.PayType) : ''" fit="contain" class="w-10 h-10" />
      <div class="flex-1 flex flex-col gap-1 text-xs leading-5">
        <div>别名：{{ item.ShowName }}</div>
        <div>单次限额：<span class="text-primary-normal">{{ showLimit(item) }}</span></div>
      </div>
      <van-image v-if="item.Id === selectRechargeChannel?.Id" src="./static/images/common/selectCheck.svg" fit="contain" class="!absolute right-0 bottom-0 w-7.5 h-7.5" />
    </div>
  </div>
</template>