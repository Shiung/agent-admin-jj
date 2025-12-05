<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import dayjs from 'dayjs'
import Big from 'big.js'

const { typeList, title } = defineProps({
  typeList: {
    type: Array<{ label: string; value: number }>,
  },
  title: {
    type: String,
    default: '',
  },
})

const show = defineModel<boolean>('show', { required: true })
// 有些地方不會有type
const type = defineModel<number>('type')
const timeRange = defineModel<{ startTime: number; endTime: number }>('timeRange', { required: true })

// 日期區間180天
const minDate = ref(dayjs().subtract(180, 'day').toDate())
const maxDate = ref(dayjs().toDate())

const showDatePicker = ref(false)
const selectedType = ref<number>(type?.value || 0)
const selectedTimeRange = ref<{ startTime: number; endTime: number }>({ ...timeRange.value })
const customTimeRange = ref<{ startTime: number; endTime: number }>({ startTime: 0, endTime: 0 })

watch(type, () => {
  selectedType.value = type?.value || 0
})

watch(timeRange, () => {
  selectedTimeRange.value = { ...timeRange.value }
})

// 時間區間
const timestampToSecond = (timestamp: number) => +new Big(timestamp).div(1000).toFixed(0)

const timeRangeList = ref([
  { label: '今日', startTime: timestampToSecond(dayjs().startOf('day').valueOf()), endTime: timestampToSecond(dayjs().endOf('day').valueOf()) },
  { label: '昨日', startTime: timestampToSecond(dayjs().subtract(1, 'day').startOf('day').valueOf()), endTime: timestampToSecond(dayjs().subtract(1, 'day').endOf('day').valueOf()) },
  { label: '近7日', startTime: timestampToSecond(dayjs().subtract(7, 'day').startOf('day').valueOf()), endTime: timestampToSecond(dayjs().endOf('day').valueOf()) },
  { label: '近14日', startTime: timestampToSecond(dayjs().subtract(14, 'day').startOf('day').valueOf()), endTime: timestampToSecond(dayjs().endOf('day').valueOf()) },
  { label: '本月', startTime: timestampToSecond(dayjs().startOf('month').valueOf()), endTime: timestampToSecond(dayjs().endOf('month').valueOf()) },
  { label: '上月', startTime: timestampToSecond(dayjs().subtract(1, 'month').startOf('month').valueOf()), endTime: timestampToSecond(dayjs().subtract(1, 'month').endOf('month').valueOf()) },
  { label: '自定义', action: () => { showDatePicker.value = true }, startTime: computed(() => customTimeRange.value.startTime), endTime: computed(() => customTimeRange.value.endTime) }
])

const displayText = computed(() => {
  const typeItem = typeList?.find(item => item.value === type.value)
  const timeItem = timeRangeList.value.find(item => item.startTime === timeRange.value.startTime && item.endTime === timeRange.value.endTime)
  const displayTime = timeItem?.action ? `${dayjs(timeRange.value.startTime * 1000).format('YYYY-MM-DD')} 至 ${dayjs(timeRange.value.endTime * 1000).format('YYYY-MM-DD')}` : timeItem?.label

  if (!typeItem && !title) return displayTime
  return `${title || typeItem?.label} | ${displayTime}`
})

const handleTypeClick = (value: number) => {
  selectedType.value = value
}

const handleTimeRangeClick = (item: any) => {
  if (item.action) return item.action()
  selectedTimeRange.value = { startTime: item.startTime, endTime: item.endTime }
}

const handleResetClick = () => {
  selectedType.value = type.value || 0
  selectedTimeRange.value = { ...timeRange.value }
}

const handleConfirmClick = () => {
  type.value = selectedType.value
  timeRange.value = { ...selectedTimeRange.value }
  show.value = false
}

const handleDatePickerConfirm = (value: [number, number]) => {
  const data = { startTime: timestampToSecond(dayjs(value[0] || 0).valueOf()), endTime: timestampToSecond(dayjs(value[1] || 0).valueOf()) }
  customTimeRange.value = data
  selectedTimeRange.value = { ...data }
  showDatePicker.value = false
}

</script>

<template>
  <div class="h-6 flex items-center justify-center px-2 bg-bg-floor-1-2 rounded-full text-neutral2-basic text-xs text-nowrap" @click="show = true">
    <div>{{ displayText }}</div>
    <van-icon :class="['w-2 h-2 ml-1 -mt-1 transform transition-all', { 'rotate-180 text-primary-normal mt-0': show }]" name="./static/images/manage/arrow-down.svg" />
  </div>
  <van-action-sheet v-model:show="show" title="时间筛选">
    <div class="px-4 py-3 flex flex-col gap-6">
      <!-- 有typeList才顯示 -->
      <div v-if="typeList">
        <div class="text-sm text-neutral2-basic mb-1">计算方式</div>
        <div class="flex items-center gap-2 flex-wrap">
          <div
            :class="[
              'flex items-center justify-center min-w-15 px-1 py-3 rounded-full text-xs font-semibold text-neutral2-tertiary border border-neutral2-tertiary',
              { 'bg-primary-5 border-primary-normal text-primary-normal': selectedType === item.value }
            ]"
            v-for="item in typeList"
            :key="item.value"
            @click="handleTypeClick(item.value)"
          >
            {{ item.label }}
          </div>
        </div>
      </div>

      <div>
        <div class="text-sm text-neutral2-basic mb-1">时间区间</div>
        <div class="flex items-center gap-2 flex-wrap">
          <div
            :class="[
              'flex items-center justify-center min-w-15 px-1 py-3 rounded-full text-xs font-semibold text-neutral2-tertiary border border-neutral2-tertiary',
              { 'bg-primary-5 border-primary-normal text-primary-normal': selectedTimeRange.startTime === item.startTime && selectedTimeRange.endTime === item.endTime }
            ]"
            v-for="item in timeRangeList"
            :key="item.label"
            @click="handleTimeRangeClick(item)"
          >
            {{ item.label }}
          </div>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <van-button type="primary" round block plain @click="handleResetClick">重置</van-button>
        <van-button type="primary" round block @click="handleConfirmClick">确认</van-button>
      </div>
    </div>
  </van-action-sheet>
  <van-calendar v-model:show="showDatePicker" :min-date="minDate" :max-date="maxDate" type="range" @confirm="handleDatePickerConfirm" />
</template>

<style scoped>
</style>