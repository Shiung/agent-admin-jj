<script setup lang="ts">
const activeTab = defineModel<number>('promoteActiveTab', { required: true })

defineProps<{
  promoteTabs: Array<{ id: number, title: string }>
}>()

</script>

<template>
  <div>
    <van-tabs
      v-model:active="activeTab"
      color="var(--color-primary-normal)"
      title-active-color="var(--color-white)"
      title-inactive-color="var(--color-neutral-secondary)"
      type="card"
    >
      <van-tab v-for="tab in promoteTabs" :key="tab.id" :title="tab.title" />
    </van-tabs>
  </div>
</template>

<style lang="scss" scoped>
/* 自定义 van-tabs 样式 */
:deep(.van-tabs) {
  --van-tabs-card-height: 3rem;
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
  font-size: 15px;
  font-weight: 400;
}
</style>