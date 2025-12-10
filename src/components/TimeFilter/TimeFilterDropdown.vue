<script setup lang="ts">
import { ref, computed, useAttrs, watch, type ComputedRef } from 'vue'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import dayjs from 'dayjs'
import Big from 'big.js'

const attrs = useAttrs()

interface TimeRangeOption {
  label: string
  startTime: number | (() => number) | ComputedRef<number>
  endTime: number | (() => number) | ComputedRef<number>
  action?: () => void
}

interface Props {
  height?: string
  placeholder?: string
  disabled?: boolean
  title?: string
  options?: TimeRangeOption[] // 可選的自定義選項
  maxDate?: Date // 可選的最大日期（默認為今天）
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '請選擇',
  disabled: false,
  height: '1.5rem',
  title: '',
})

// 有些地方不會有type
const model = defineModel<{ startTime: number; endTime: number }>('modelValue', { required: true })

// 暴露 calendar 的打开状态，让父组件可以在 calendar 打开时禁用下拉刷新
const showDatePicker = defineModel<boolean>('showCalendar', { default: false })

// 日期區間180天
const minDate = ref(dayjs().subtract(180, 'day').toDate())
const maxDate = computed(() => props.maxDate || dayjs().toDate())

const customTimeRange = ref<{ startTime: number; endTime: number }>({ startTime: 0, endTime: 0 })
const selectedOption = ref<any>(null)

// 時間區間
const timestampToSecond = (timestamp: number) => +new Big(timestamp).div(1000).toFixed(0)

// 默認選項（包含今天）
const defaultTimeRangeOptions = [
  { label: '今日', startTime: timestampToSecond(dayjs().startOf('day').valueOf()), endTime: timestampToSecond(dayjs().endOf('day').valueOf()) },
  { label: '昨日', startTime: timestampToSecond(dayjs().subtract(1, 'day').startOf('day').valueOf()), endTime: timestampToSecond(dayjs().subtract(1, 'day').endOf('day').valueOf()) },
  { label: '近7日', startTime: timestampToSecond(dayjs().subtract(7, 'day').startOf('day').valueOf()), endTime: timestampToSecond(dayjs().endOf('day').valueOf()) },
  { label: '近14日', startTime: timestampToSecond(dayjs().subtract(14, 'day').startOf('day').valueOf()), endTime: timestampToSecond(dayjs().endOf('day').valueOf()) },
  { label: '本月', startTime: timestampToSecond(dayjs().startOf('month').valueOf()), endTime: timestampToSecond(dayjs().endOf('month').valueOf()) },
  { label: '上月', startTime: timestampToSecond(dayjs().subtract(1, 'month').startOf('month').valueOf()), endTime: timestampToSecond(dayjs().subtract(1, 'month').endOf('month').valueOf()) },
  { label: '自定义', action: () => { showDatePicker.value = true }, startTime: computed(() => customTimeRange.value.startTime), endTime: computed(() => customTimeRange.value.endTime) }
]

// 使用自定義選項或默認選項
const timeRangeOptions = computed(() => {
  if (props.options && props.options.length > 0) {
    // 使用自定義選項，但保留自定義選項
    return props.options
  }
  return defaultTimeRangeOptions
})

// 獲取選項的實際數值（處理 number, function, ComputedRef）
const getTimeValue = (value: number | (() => number) | ComputedRef<number>): number => {
  if (typeof value === 'function') return value()
  if (typeof value === 'object' && 'value' in value) return value.value // ComputedRef
  return value
}

const displayText = computed(() => {
  console.log(model.value)
  if (!model.value) return props.placeholder || '請選擇'

  const timeItem = timeRangeOptions.value.find(item => {
    const itemStartTime = getTimeValue(item.startTime)
    const itemEndTime = getTimeValue(item.endTime)
    return itemStartTime === model.value.startTime && itemEndTime === model.value.endTime
  })

  // 如果找到匹配的选项
  let displayTime: string
  if (timeItem) {
    // 如果是自定义选项（有 action 的选项），显示日期范围
    if (timeItem.action) {
      displayTime = `${dayjs(model.value.startTime * 1000).format('YYYY-MM-DD')} 至 ${dayjs(model.value.endTime * 1000).format('YYYY-MM-DD')}`
    } else {
      // 否则显示选项标签（如"本月"、"今日"等）
      displayTime = timeItem.label
    }
  } else {
    // 没找到匹配的选项，显示日期范围
    displayTime = `${dayjs(model.value.startTime * 1000).format('YYYY-MM-DD')} 至 ${dayjs(model.value.endTime * 1000).format('YYYY-MM-DD')}`
  }

  if (!props.title) return displayTime
  return `${props.title} | ${displayTime}`
})

const handleSelectChange = (item: any) => {
  if (!item) return
  if (item.action) return item.action()

  const startTime = getTimeValue(item.startTime)
  const endTime = getTimeValue(item.endTime)
  model.value = { startTime, endTime }
}

const handleDatePickerConfirm = (value: [number, number]) => {
  const data = { startTime: timestampToSecond(dayjs(value[0] || 0).valueOf()), endTime: timestampToSecond(dayjs(value[1] || 0).endOf('day').valueOf()) }
  customTimeRange.value = data
  model.value = { ...data }
  showDatePicker.value = false
}

// 判断选项是否被选中（处理 computed 类型的时间值）
const isOptionSelected = (option: TimeRangeOption) => {
  if (!model.value) return false
  const optionStartTime = getTimeValue(option.startTime)
  const optionEndTime = getTimeValue(option.endTime)
  return model.value.startTime === optionStartTime && model.value.endTime === optionEndTime
}

// 当 model 从外部初始化时，同步更新 customTimeRange
// 这样如果是自定义时间范围，就能正确匹配和高亮显示
watch(() => model.value, (newValue) => {
  if (!newValue) return

  // 检查是否匹配任何预设选项
  const matchesPreset = timeRangeOptions.value.some(option => {
    // 跳过自定义选项（有 action 的选项）
    if (option.action) return false
    const optionStartTime = getTimeValue(option.startTime)
    const optionEndTime = getTimeValue(option.endTime)
    return newValue.startTime === optionStartTime && newValue.endTime === optionEndTime
  })

  // 如果不匹配任何预设选项，说明是自定义时间，更新 customTimeRange
  if (!matchesPreset) {
    customTimeRange.value = {
      startTime: newValue.startTime,
      endTime: newValue.endTime
    }
  }
}, { immediate: true })

</script>

<template>
  <Select v-model="selectedOption" :disabled="disabled" @update:modelValue="handleSelectChange">
    <SelectTrigger class="dropdown-button" :class="attrs.class">
      <SelectValue :placeholder="placeholder">
        <slot name="prefix" />
        <p class="whitespace-nowrap overflow-hidden text-ellipsis">{{ displayText }}</p>
        <slot name="suffix" />
      </SelectValue>
    </SelectTrigger>
    <SelectContent class="dropdown-menu min-w-auto">
      <SelectGroup>
        <SelectItem
          v-for="option in timeRangeOptions"
          :key="`${option.label}-${option.startTime}-${option.endTime}`"
          :value="option"
          :class="['dropdown-item', { 'is-selected': isOptionSelected(option) }]"
          hiddenCheck
        >
          <p class="whitespace-nowrap overflow-hidden text-ellipsis">{{ option.label }}</p>
        </SelectItem>
      </SelectGroup>
    </SelectContent>
  </Select>

  <van-calendar :overlay-style="{ background: 'rgba(0, 0, 0, 0.5)' }" v-model:show="showDatePicker" :min-date="minDate" :max-date="maxDate" type="range" @confirm="handleDatePickerConfirm" />
</template>

<style lang="scss" scoped>
.dropdown-button {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: space-between;
  width: auto;
  height: v-bind(height);
  padding: .75rem .5rem;
  background: var(--color-bg-floor-1-2);
  border: 0px solid var(--color-primary-normal);
  border-radius: 6.25rem;
  font-size: 0.75rem;
  color: var(--color-neutral2-basic);
  cursor: pointer;
  transition: all 0.2s ease;
}

.dropdown-button:hover:not(.is-disabled) {
  border-width: 0px;
  box-shadow: none;
  background: var(--color-bg-floor-1-3);
}

.dropdown-button[data-state="open"] {
  border-width: 0px;
  box-shadow: none;
}

.dropdown-button[data-disabled="true"] {
  background: var(--color-bg-floor-1-2);
  color: var(--color-neutral2-secondary);
  cursor: not-allowed;
  opacity: 0.6;
}

/* RWD 響應式 */
@media (max-width: 640px) {
  .dropdown-button {
    height: v-bind(height);
    padding: .75rem .5rem;
    font-size: .75rem;
  }
}

.dropdown-menu {
  background: var(--color-white);
  border: 1px solid var(--color-neutral2-seventh);
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  /* max-height: 16rem; */
  --reka-popper-available-height: 16rem;
  & > [role="presentation"] {
    min-width: auto;
    padding: 0;
  }
}

/* 滾動條樣式 */
.dropdown-menu::-webkit-scrollbar {
  width: 6px;
}

.dropdown-menu::-webkit-scrollbar-track {
  background: var(--color-neutral2-seventh);
  border-radius: 0 0.5rem 0.5rem 0;
}

.dropdown-menu::-webkit-scrollbar-thumb {
  background: var(--color-neutral2-seventh);
  border-radius: 3px;
}

.dropdown-menu::-webkit-scrollbar-thumb:hover {
  background: var(--color-neutral2-seventh);
}

.dropdown-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.625rem 0.75rem;
  font-size: 0.75rem;
  color: var(--color-neutral2-secondary);
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.dropdown-item:hover {
  background: transparent;
}

.dropdown-item.is-selected {
  background: transparent;
  color: var(--color-primary-normal);
  font-weight: 500;
}

/* RWD 響應式 */
@media (max-width: 640px) {
  .dropdown-item {
    padding: .75rem .5rem;
    font-size: .75rem;
  }

  .dropdown-menu {
    max-height: 60vh;
  }
}
</style>
