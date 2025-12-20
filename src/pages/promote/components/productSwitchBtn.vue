<script setup lang="ts">
const activeTab = defineModel<number>('productActiveTab', { required: true })
defineProps<{
  productTabs: Array<{ id: number, title: string }>
}>()
</script>

<template>
  <van-tabs class="switch-tabs" v-model:active="activeTab" color="var(--color-primary-normal)"
    title-active-color="var(--color-white)" title-inactive-color="var(--color-neutral-secondary)" type="card">
    <van-tab v-for="tab in productTabs" :key="tab.id" :title="tab.title" />
  </van-tabs>
</template>

<style lang="scss" scoped>
.switch-tabs {
  position: fixed;
  bottom: calc(var(--van-tabbar-height, 0px) + 0.5rem);
  width: 7rem;
  left: 50%;
  transform: translateX(-50%);

  --van-tabs-card-height: 2rem;
  --van-padding-md: 0rem;
  --van-radius-sm: 6.25rem;

  :deep(.van-tabs__nav.van-tabs__nav--card) {
    padding: .25rem;
    border-color: var(--color-neutral2-seventh) !important;
  }

  :deep(.van-tab--card) {
    border-right: none;
  }

  :deep(.van-tab.van-tab--card.van-tab--active) {
    border-radius: var(--van-radius-sm);
  }

  :deep(.van-tab) {
    font-size: 12px;
    font-weight: 400;
  }
}
</style>
