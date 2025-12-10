<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue'
import { cn } from '@/utils/className'
import dayjs from 'dayjs'

const defaultOption: { [key in string]: { label: string; startTime: number; endTime: number }} = {
  today: { label: '今日', startTime: dayjs().startOf('day').unix(), endTime: dayjs().endOf('day').unix() },
  yesterday: { label: '昨日', startTime: dayjs().subtract(1, 'day').startOf('day').unix(), endTime: dayjs().subtract(1, 'day').endOf('day').unix() },
  near7Days: { label: '近7日', startTime: dayjs().subtract(7, 'day').startOf('day').unix(), endTime: dayjs().endOf('day').unix() },
  near14Days: { label: '近14日', startTime: dayjs().subtract(14, 'day').startOf('day').unix(), endTime: dayjs().endOf('day').unix() },
  thisMonth: { label: '本月', startTime: dayjs().startOf('month').unix(), endTime: dayjs().endOf('month').unix() },
  lastMonth: { label: '上月', startTime: dayjs().subtract(1, 'month').startOf('month').unix(), endTime: dayjs().subtract(1, 'month').endOf('month').unix() },
}

// 日期區間180天
const minDate = ref(dayjs().subtract(180, 'day').toDate())
const maxDate = ref(dayjs().toDate())

const { timeTitle = '时间区间', timeDisableAll = false, defaultVal = '' } = defineProps<{
  timeTitle: string,
  defaultVal?: any,
  timeDisableAll?: boolean
}>()

const showDatePicker = ref<boolean>(false)
const selectedTime = ref<string>(defaultVal)
const customTimeRange = ref<{ startTime: number; endTime: number } | null>(null)

const formatTime = (ts: number) => dayjs.unix(ts).format('YYYY-MM-DD')

const timeRangeList = computed<Array<{ key: string; label: string }>>(() => {
  const ls = Object.entries(defaultOption).map(([key, val]) => {
    return {
      key: key,
      label: val.label
    }
  })

  if (!timeDisableAll) ls.unshift({ key: '', label: '全部' })
  ls.push({ key: 'customer', label: '自定义' })
  return ls
})

const handleDatePickerConfirm = (value: [number, number]) => {
  const data = { startTime: dayjs(value[0] || 0).unix(), endTime: dayjs(value[1] || 0).unix() }
  customTimeRange.value = data
  showDatePicker.value = false
}

watchEffect(() => {
  if (selectedTime.value === 'customer') {
    showDatePicker.value = true
  }
  customTimeRange.value = null
})

defineExpose<{
  getValue: () => { startTime: number; endTime: number } | null
  reset: () => void
}>({
  getValue: () => {
    if (customTimeRange.value) return customTimeRange.value
    const selected = defaultOption[selectedTime.value]
    if (selected) {
      return {
        startTime: selected.startTime,
        endTime: selected.endTime,
        label: selected.label
      }
    }
    return null
  },
  reset: () => {
    selectedTime.value = defaultVal
    customTimeRange.value = null
  }
})

</script>


<template>
  <div class="space-y-1">
    <div class="text-sm text-neutral2-basic">{{ timeTitle }}</div>
    <div class="flex items-center gap-2 flex-wrap">
      <div
        :class="cn('flex items-center justify-center min-w-15 px-1 py-3 rounded-full text-xs font-semibold text-neutral2-tertiary border border-neutral2-tertiary', {
          'bg-primary-5 border-primary-normal text-primary-normal': selectedTime === item.key 
        })"
        v-for="item in timeRangeList"
        :key="item.label"
        @click="selectedTime = item.key"
      >
        {{ item.label }}
      </div>
    </div>
    <div v-if="customTimeRange" class="inline-block rounded-full px-2 py-1 text-xs font-semibold bg-primary-5 border border-primary-normal text-primary-normal">
      {{ formatTime(customTimeRange.startTime) }} 至 {{ formatTime(customTimeRange.endTime) }}
    </div>
  </div>
  <van-calendar v-model:show="showDatePicker" :min-date="minDate" :max-date="maxDate" type="range" teleport="body" @confirm="handleDatePickerConfirm" />
</template>