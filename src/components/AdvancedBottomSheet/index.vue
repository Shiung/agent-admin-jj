<script setup lang="ts">
import { ref, watch } from 'vue'
import Calendar from './Calendar.vue'
import Radio from './Radio.vue'
import CheckBox from './CheckBox.vue'

const show = defineModel<boolean>('show', { required: true })
const { title = '标题', sheetTitle = '进阶筛选', isAllCheckBox = false, ls: dataLs, radioTempChangeHandler } = defineProps<{
  title?: string
  sheetTitle?: string
  ls: Array<{
    /** 欄位key */
    key: string
    /** 選擇器標題 */
    title: string
    /** 選單清單 */
    list?: Array<{ label: string, value: any }>
    /** 選擇器類型  */
    type: 'time' | 'radio' | 'checkbox'
    /** defaultSelected */
    defaultSelected?: string | number | Array<any> | null
    /**
     * for Calendar option
     * isShow all
     **/
    timeDisableAll?: boolean
    timeDisableTimeRange?: boolean
  }>
  isAllCheckBox?: boolean
  /** radio check for change Calendar limit */
  radioTempChangeHandler?: (v: any) => boolean
}>()

const emit = defineEmits<{
  (e: 'change', value: Map<string, any>): void
}>()

/** only `isAllCheckBox` 顯示點選後checkbox 數量 */
const tempCheckLs = ref<Array<any>>([])
/** 進行中 */
const proccesVal = ref<Map<string, any> | null>(null)
/** 選擇器 dom ref */
const fieldDoms = ref<Record<string, { getValue: () => any, reset: (v?: any) => void }>>({})

const setUnitFieldDom = (el: any, key: string) => {
  if (el) fieldDoms.value[key] = el
  else delete fieldDoms.value[key]
}

const handleCheckBoxChange = () => {
  if (!isAllCheckBox) return
  const ls = new Map()
  Object.entries(fieldDoms.value).forEach(([key, val]) => {
    if (!ls.has(key)) {
      ls.set(key, typeof val?.getValue === 'function' ? val?.getValue() : null)
    }
  })
  tempCheckLs.value = [...ls.values()].flat()
}

const hasCalendarUseFutureUnlimit = ref<boolean>(false)

const handleRadioChange = (value: any) => {
  if (typeof radioTempChangeHandler === 'function') {
    hasCalendarUseFutureUnlimit.value = radioTempChangeHandler(value) ?? false
  }
}

const onConfirm = () => {
  const ls = new Map()
  Object.entries(fieldDoms.value).forEach(([key, val]) => {
    if (!ls.has(key)) {
      ls.set(key, typeof val?.getValue === 'function' ? val?.getValue() : null)
    }
  })

  emit('change', ls)
  proccesVal.value = ls
  show.value = false
}

/** only `isAllCheckBox` 全選功能 */
const checkBoxAll = () => {
  const checkBoxLs = dataLs.filter((l) => l.type === 'checkbox')
  Object.entries(fieldDoms.value).forEach(([key, val]) => {
    const getList = checkBoxLs.find((c) => c.key === key)
    if (typeof val.reset === 'function' && getList) {
      val.reset(getList.list?.map(l => l.value))
    }
  })
}

/** only `isAllCheckBox` 全選功能 */
const resetCheckBoxAll = () => {
  Object.entries(fieldDoms.value).forEach(([key, val]) => {
    if (typeof val.reset === 'function') {
      val.reset()
    }
  })
}

/** 有進行中的選項 關閉彈窗後重置回上次送出的選單 */
const onResetToProcessVal = () => {
  Object.entries(fieldDoms.value).forEach(([key, val]) => {
    const hasProcessVal = proccesVal.value?.get(key)
    val.reset(hasProcessVal ? hasProcessVal : undefined)
  })
}

const onReset = () => {
  const ls = new Map()
  Object.entries(fieldDoms.value).forEach(([key, val]) => {
    if (typeof val.reset === 'function') {
      val.reset()
    }

    if (!ls.has(key)) {
      ls.set(key, typeof val?.getValue === 'function' ? val?.getValue() : null)
    }
  })

  emit('change', ls)
  proccesVal.value = null
  show.value = false
}

watch(show, (s) => {
  if (!s) {
    if (proccesVal.value) {
      onResetToProcessVal()
      return
    }
    Object.entries(fieldDoms.value).forEach(([key, val]) => {
      if (typeof val.reset === 'function') {
        val.reset()
      }
    })
  }
})
</script>


<template>
  <div @click="show = true">
    <slot name="title">
      <div class="h-6 flex items-center justify-center px-2 bg-bg-floor-1-2 rounded-full text-neutral2-basic text-xs text-nowrap">
        <div>{{ title }}</div>
        <van-icon :class="['w-2 h-2 ml-1 -mt-1 transform transition-all', { 'rotate-180 text-primary-normal mt-0': show }]" name="./static/images/manage/arrow-down.svg" />
      </div>
    </slot>
  </div>
  <van-action-sheet v-model:show="show" :title="sheetTitle" teleport="body">
    <div class="px-4 py-3 flex flex-col gap-6">
      <template v-for="l in ls" :key="l.key">
        <Calendar
          v-if="l.type === 'time'"
          :time-title="l.title"
          :ref="el => setUnitFieldDom(el, l.key)"
          v-bind="l.defaultSelected ? { defaultVal: l.defaultSelected }: {}"
          :time-disable-all="!!l.timeDisableAll"
          :time-diasble-range-limit="!!l.timeDisableTimeRange"
          :time-diasble-time-range-for-future="hasCalendarUseFutureUnlimit"
        />
        <CheckBox v-else-if="l.type === 'checkbox'" :time-title="l.title" :ls="l.list" v-bind="l.defaultSelected ? { defaultVal: l.defaultSelected }: {}" :ref="el => setUnitFieldDom(el, l.key)" @change="handleCheckBoxChange" />
        <Radio v-else-if="l.type === 'radio'" :time-title="l.title" :ls="l.list" v-bind="l.defaultSelected ? { defaultVal: l.defaultSelected }: {}" :ref="el => setUnitFieldDom(el, l.key)" @change="handleRadioChange" />
      </template>

    </div>
    <div v-if="!isAllCheckBox" class="flex items-center gap-3 sticky bottom-0 px-4 py-3 bg-white">
      <van-button type="primary" round block plain @click="onReset">重置</van-button>
      <van-button type="primary" round block @click="onConfirm">确认</van-button>
    </div>
    <div v-else class="sticky bottom-0 px-4 py-3 bg-white space-y-2">
      <div class="text-neutral2-tertiary text-xs text-left">选取 <span class="text-primary-normal">{{ tempCheckLs.length }}</span> 场馆</div>
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <div>
            <van-button type="primary" round block plain size="small" @click="checkBoxAll">全选</van-button>
          </div>
          <div>
            <van-button type="primary" round block plain size="small" @click="resetCheckBoxAll">清除</van-button>
          </div>
        </div>
        <van-button type="primary" class="!w-[108px]" round block @click="onConfirm">确认</van-button>
      </div>
    </div>
  </van-action-sheet>
</template>
