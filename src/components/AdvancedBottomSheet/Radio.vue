<script setup lang="ts">
import { ref } from 'vue'
import { cn } from '@/utils/className'
const { timeTitle = '标题', defaultVal = '', ls = [] } = defineProps<{
  timeTitle: string,
  ls?: Array<{ label: string; value: any }>
  defaultVal?: any
}>()

const selectVal = ref<string>(defaultVal)

defineExpose<{
  getValue: () => any
  reset: (v?: any) => void
}>({
  getValue: () => {
    return selectVal.value ?? null
  },
  reset: (v) => {
    selectVal.value = v ? v : defaultVal
  }
})

</script>

<template>
  <div class="space-y-1">
    <div class="text-sm text-neutral2-basic">{{ timeTitle }}</div>
    <div class="flex items-center gap-2 flex-wrap">
      <div
        :class="cn('flex items-center justify-center min-w-15 px-1 py-3 rounded-full text-xs font-semibold text-neutral2-tertiary border border-neutral2-tertiary', {
          'bg-primary-5 border-primary-normal text-primary-normal': selectVal === item.value 
        })"
        v-for="item in ls"
        :key="item.label"
        @click="selectVal = item.value"
      >
        {{ item.label }}
      </div>
    </div>
  </div>
</template>