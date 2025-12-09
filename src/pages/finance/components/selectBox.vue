<script setup lang="ts">
import { cn } from '@/utils/className'

interface Props {
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  class: '',
})
</script>

<template>
  <van-radio class="select-box">
    <template #default="{ checked }">
      <div 
        :class="cn(
          'flex items-center relative px-4 h-10 min-w-[4.5rem] border rounded-xl overflow-hidden',
          checked
            ? 'bg-primary-5 border-primary-normal text-primary-normal font-semibold'
            : 'bg-white border-neutral2-seventh text-neutral2-secondary font-normal',
          props.class
        )"
      >
        <slot />
        <van-image v-if="checked" src="./static/images/common/selectCheck.svg" fit="contain" class="!absolute right-0 bottom-0 w-5.5 h-5.5" />
      </div>
    </template>
  </van-radio>
</template>

<style lang="scss" scoped>
.select-box {
  margin: 0;

  :deep(.van-radio__icon) {
    display: none;
  }

  :deep(.van-radio__label) {
    display: inline-block;
    margin: 0;
    width: 100%;
  }
}
</style>
