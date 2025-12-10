<script setup lang="ts">
import type { HelpCenterListData } from '@/apis/codegen/data-contracts'

interface Props {
  detail: HelpCenterListData | null
}

const props = defineProps<Props>()
</script>

<template>
  <div class="flex flex-col pb-6 min-h-screen">
    <div class="flex flex-col px-3 pt-4">
      <div
        class="text-base text-neutral-secondary leading-relaxed whitespace-pre-wrap"
        v-html="props.detail?.Content || ''"
      />
    </div>
  </div>
</template>

<style scoped>
:deep(.text-base) {
  line-height: 1.6;
}
</style>

