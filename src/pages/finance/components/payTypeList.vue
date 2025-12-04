<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { getWithdrawTypeImage, getRechargeTypeImage } from '@/utils/finance'

import SelectBox from './selectBox.vue'

export interface ListItem {
  Name: string
  PayType: number
  [key: string]: any
}

interface Props {
  type: 'withdraw' | 'recharge'
  list: ListItem[]
  selectPayTypeItem?: ListItem | null
}

const props = withDefaults(defineProps<Props>(), {
  type: 'withdraw',
  list: () => [],
  selectPayTypeItem: null,
})

const emit = defineEmits<{
  'itemClick': [item: ListItem],
}>()

const selectPayType = ref<number | null>(null)
const selectPayTypeItem = ref<ListItem | null>(null)
watch(
  () => props.selectPayTypeItem, 
  newValue => {
    if (!newValue) return
    if (selectPayType.value === newValue?.PayType) return
    selectPayType.value = newValue?.PayType
    selectPayTypeItem.value = JSON.parse(JSON.stringify(newValue))
  }
)
const handleItemClick = (item: ListItem): void => {
  selectPayTypeItem.value = item
  emit('itemClick', item)
}

const getIcon = (PayType: number): string => {
  return {
    withdraw: getWithdrawTypeImage(PayType),
    recharge: getRechargeTypeImage(PayType)
  }[props.type] || ''
}

const showMore = ref<boolean>(false)
const handleShowMoreClick = (): void => {
  showMore.value = !showMore.value
}

const showList = computed((): ListItem[] => {
  return showMore.value ? props.list : props.list.slice(0, 5)
})
</script>

<template>
  <div>
    <van-radio-group v-model="selectPayType" direction="horizontal" class="grid-radio-group mt-2 gap-2">
      <SelectBox 
        v-for="item in showList" 
        :key="`PayType${item.PayType}`" 
        :name="item.PayType"
        class="pl-2"
        @click="handleItemClick(item)"
      >
        <van-image :src="getIcon(item.PayType)" fit="contain" class="mr-2 w-5 h-5" />
        <div class="text-xs line-clamp-2">{{ item.Name }}</div>
      </SelectBox>

      <div 
        v-if="props.list.length > 5" 
        class="flex items-center justify-center px-4 h-10 min-w-[4.5rem] border border-neutral2-seventh text-neutral2-secondary font-normal rounded-xl bg-white" 
        @click="handleShowMoreClick"
      >
        <div class="text-xs line-clamp-2 mr-1">{{ showMore ? '收合' : '更多' }}</div>
        <div :class="['flex items-center justify-center w-2 h-2', showMore ? '' : 'rotate-180']">
          <van-image src="./static/images/common/triangle.svg" fit="contain" />
        </div>
      </div>
    </van-radio-group>
  </div>
</template>

<style lang="scss" scoped>
.grid-radio-group {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}
</style>