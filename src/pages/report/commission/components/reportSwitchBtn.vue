<script setup lang="ts">
const viewType = defineModel<number>('viewType', { required: true })

defineProps<{
  switchBtns: Array<{ id: number; title: string }>
}>()
</script>

<template>
  <div class="fixed-switch-btn">
    <van-tabs
      v-model:active="viewType"
      color="var(--color-primary-normal)"
      title-active-color="var(--color-white)"
      title-inactive-color="var(--color-neutral-secondary)"
      type="card"
    >
      <van-tab v-for="btn in switchBtns" :key="btn.id" :title="btn.title" :name="btn.id" />
    </van-tabs>
  </div>
</template>

<style lang="scss" scoped>
.fixed-switch-btn {
  position: fixed;
  bottom: calc(var(--van-tabbar-height, 0px) + env(safe-area-inset-bottom, 0px) + 8px);
  width: 7.25rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;

  --van-tabs-card-height: 40px;
  --van-padding-md: 0rem;
  --van-radius-sm: 6.25rem;

  /* 移除 VanTabs 的 overflow，让阴影可以显示 */
  :deep(.van-tabs) {
    overflow: visible !important;
  }

  :deep(.van-tabs__wrap) {
    overflow: visible !important;
  }

  :deep(.van-tabs__nav) {
    overflow: visible !important;
  }

  :deep(.van-tabs__nav.van-tabs__nav--card) {
    padding: 0.25rem;
    border: none !important;
    background: white;
    overflow: visible !important;
    box-shadow: 0px -1px 10px 0px rgba(0, 0, 0, 0.15);
  }

  :deep(.van-tab--card) {
    border: none !important;
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
