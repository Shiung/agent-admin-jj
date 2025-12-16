<script setup lang="ts">
import { ref, watch } from 'vue'
import Calendar from './Calendar.vue'
import Radio from './Radio.vue'
import CheckBox from './CheckBox.vue'

const show = defineModel<boolean>('show', { required: true })
const { title = '标题', sheetTitle = '进阶筛选' } = defineProps<{
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
}>()

const emit = defineEmits<{
  (e: 'change', value: Map<string, any>): void
}>()

const procces = ref<boolean>(false)
const fieldDoms = ref<Record<string, { getValue: () => any, reset: () => void }>>({})

const setUnitFieldDom = (el: any, key: string) => {
  if (el) fieldDoms.value[key] = el
  else delete fieldDoms.value[key]
}

const onConfirm = () => {
  const ls = new Map()
  Object.entries(fieldDoms.value).forEach(([key, val]) => {
    if (!ls.has(key)) {
      ls.set(key, typeof val?.getValue === 'function' ? val?.getValue() : null)
    }
  })

  emit('change', ls)
  procces.value = true
  show.value = false
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
  procces.value = true
  show.value = false
}

watch(show, (s) => {
  if (!s) {
    if (procces.value) return
    Object.entries(fieldDoms.value).forEach(([key, val]) => {
      if (typeof val.reset === 'function') {
        val.reset()
      }
    })
    procces.value = false
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
        />
        <CheckBox v-else-if="l.type === 'checkbox'" :time-title="l.title" :ls="l.list" v-bind="l.defaultSelected ? { defaultVal: l.defaultSelected }: {}" :ref="el => setUnitFieldDom(el, l.key)" />
        <Radio v-else-if="l.type === 'radio'" :time-title="l.title" :ls="l.list" v-bind="l.defaultSelected ? { defaultVal: l.defaultSelected }: {}" :ref="el => setUnitFieldDom(el, l.key)" />
      </template>
  
      <div class="flex items-center gap-3">
        <van-button type="primary" round block plain @click="onReset">重置</van-button>
        <van-button type="primary" round block @click="onConfirm">确认</van-button>
      </div>
    </div>
  </van-action-sheet>
</template>