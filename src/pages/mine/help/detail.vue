<script setup lang="ts">
import { ref, onMounted } from 'vue'
import NavBar from '@/components/NavBar/index.vue'
import type { HelpCenterListData } from '@/apis/codegen/data-contracts'

const helpDetail = ref<HelpCenterListData | null>(null)

onMounted(() => {
  const helpItemStr = sessionStorage.getItem('helpItem')

  const helpItem = JSON.parse(helpItemStr as string) as HelpCenterListData
  helpDetail.value = helpItem
  sessionStorage.removeItem('helpItem')
})
</script>

<template>
  <div class="flex flex-col pb-6 min-h-screen">
    <NavBar :title="helpDetail?.Tag || ''" />

    <div class="flex flex-col px-3 pt-4">
      <div
        class="text-base text-neutral-secondary leading-relaxed whitespace-pre-wrap"
        v-html="helpDetail?.Content || ''"
      />
    </div>
  </div>
</template>

<style scoped>
:deep(.text-base) {
  line-height: 1.6;
}
</style>

