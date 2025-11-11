<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useGlobalStore } from '@/stores/global'
const globalStore = useGlobalStore()
const { tabbarHeight } = storeToRefs(globalStore)
const activeTab = defineModel<number>('productActiveTab', { required: true })
defineProps<{
  productTabs: Array<{ id: number, title: string }>
}>()

const stickyH = computed(() => {
  const tabbarH = tabbarHeight.value
  return `${(tabbarH ? tabbarH : 0) + 8}px`
})
</script>

<template>
  <div class="box">
    <van-tabs
      v-model:active="activeTab"
      color="var(--color-primary-normal)"
      title-active-color="var(--color-white)"
      title-inactive-color="var(--color-neutral-secondary)"
      type="card"
    >
      <van-tab v-for="tab in productTabs" :key="tab.id" :title="tab.title" />
    </van-tabs>
  </div>
</template>

<style lang="scss" scoped>
.box {
  position: sticky;
  bottom: v-bind(stickyH);
  width: 7rem;
  left: 50%;
  transform: translateX(-50%);
}
/* 自定义 van-tabs 样式 */
:deep(.van-tabs) {
  --van-tabs-card-height: 2rem;
  --van-padding-md: 0rem;
  --van-radius-sm: 6.25rem;
  .van-tabs__nav.van-tabs__nav--card {
    padding: .25rem;
    border-color: var(--color-neutral2-seventh) !important;
  }
  .van-tab--card {
    border-right: none;
  }
  .van-tab.van-tab--card.van-tab--active {
    border-radius: var(--van-radius-sm);
  }
}

:deep(.van-tab) {
  font-size: 12px;
  font-weight: 400;
}
</style>