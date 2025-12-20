<script setup lang="ts">
import RichText from '@/components/RichText/index.vue'
import type { HelpCenterListData } from '@/apis/codegen/data-contracts'

interface Props {
  detail: HelpCenterListData | null
}

const props = defineProps<Props>()
</script>

<template>
  <div class="flex flex-col pb-6">
    <div class="flex flex-col px-3 pt-4">
      <RichText :html="props.detail?.Content" />
    </div>
  </div>
</template>

<style scoped>
</style>

