<script setup lang="ts">
import { ref } from 'vue'
import type { TooltipContentProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
const showTip = ref<boolean>(false)

const {
  contentClass = 'bg-white shadow-[-0.5px_0.5px_3px_0px_rgba(0,0,0,0.15)]',
  contentArrowClass = 'bg-white fill-white'
} = defineProps<{
  contentClass?: HTMLAttributes['class']
  contentArrowClass?: HTMLAttributes['class']
  contentSide?: TooltipContentProps['side']
}>()

</script>

<template>
  <TooltipProvider>
    <Tooltip v-model:open="showTip">
      <TooltipTrigger as-child>
        <div @click="showTip = true">
          <slot />
        </div>
      </TooltipTrigger>

      <TooltipContent :side="contentSide" :class="contentClass" :arrow-class="contentArrowClass" >
        <div class="text-xs text-neutral2-basic">
          <slot name="content" />
        </div>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</template>