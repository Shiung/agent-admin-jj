<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { cn } from '@/utils/className'
const { timeTitle = '标题', defaultVal = [], ls = [] } = defineProps<{
  timeTitle: string,
  ls?: Array<{ label: string; value: any }>
  defaultVal?: any
}>()

const isCheckAll = ref<boolean>(false)
const checkedResult = ref<Array<any>>(defaultVal)
const isIndeterminate = ref<boolean>(false)

const checkAllChange = (val: boolean) => {
  checkedResult.value = val ? ls.map((l) => l.value) : []
  isIndeterminate.value = false
}

const checkedResultChange = (value: string[]) => {
  const checkedCount = value.length
  isCheckAll.value = checkedCount === ls.length
  isIndeterminate.value = checkedCount > 0 && checkedCount < ls.length
}

onMounted(() => {
  checkedResultChange(checkedResult.value)
})

defineExpose<{
  getValue: () => any
  reset: () => void
}>({
  getValue: () => {
    return checkedResult.value
  },
  reset: () => {
    checkedResult.value = []
  }
})

</script>

<template>
  <div class="space-y-1 cusCheckbox">
    <div class="text-sm text-neutral2-basic flex justify-between items-center">
      <div>{{ timeTitle }}</div>
      <div class="flex items-center justify-between space-x-1">
        <span>全選</span>
        <van-checkbox
          v-model="isCheckAll"
          :indeterminate="isIndeterminate"
          @change="checkAllChange"
        />
      </div>
    </div>
    <div class="flex items-center gap-2 flex-wrap">
      <van-checkbox-group v-model="checkedResult" @change="checkedResultChange">
        <van-cell-group inset class="flex flex-wrap mx-0 gap-2">
          <van-checkbox 
            v-for="item in ls"
            :key="item.value"
            :name="item.value"
            :class="cn('flex items-center justify-center min-w-15 px-1 py-3 rounded-full text-xs font-semibold text-neutral2-tertiary border border-neutral2-tertiary', {
              'bg-primary-5 border-primary-normal text-primary-normal cusCheckbox_active': checkedResult.includes(item.value) 
            })"
          >
            <template #icon></template>
            {{ item.label }}
          </van-checkbox>
        </van-cell-group>
      </van-checkbox-group>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.cusCheckbox {
  --van-cell-group-inset-padding: 0;
  :deep(.van-checkbox__label) {
    margin-left: 0;
    color: var(--color-neutral2-tertiary);
  }

  &_active {
    :deep(.van-checkbox__label) {
      color: var(--color-primary-normal);
    }
  }
}
</style>