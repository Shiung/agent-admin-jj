<script setup lang="ts">
import { useAttrs } from 'vue'
import { cn } from '@/utils/className';
defineOptions({
  inheritAttrs: false
})

const attrs = useAttrs()

const clickHandler = () => {
  if (typeof attrs.onClick === 'function') attrs.onClick()
}
</script>

<template>
  <div :class="cn('p-3 bg-white rounded-2xl shadow-[-0.5px_0.5px_3px_0px_rgba(0,0,0,0.15)] space-y-2 relative', attrs.class ?? '')" @click="clickHandler">
    <slot name="header" />
    <div class="rounded-2xl bg-bg-floor-1-2">
      <slot />
    </div>
    <slot name="footer" />
  </div>
</template>