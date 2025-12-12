<!-- 會員充值 - 會員充值記錄 -->
<script setup lang="ts">
import { ref, defineAsyncComponent, type Component } from 'vue'

const tabs: Array<{ id: number, title: string, comp: Component }> = [
  { id: 0, title: '订单状态', comp: defineAsyncComponent(() => import('./components/orderStatus.vue')) },
  { id: 1, title: '充值记录', comp: defineAsyncComponent(() => import('./components/rechargeRecord.vue')) }
]
const activeTab = ref<number>(tabs[0]?.id ?? 0)
</script>

<template>
  <div class="flex-1 flex flex-col">
    <NavBar title="会员充值记录" />
    <van-tabs
      v-model:active="activeTab"
      class="custom-tabs rounded-2xl"
      color="var(--color-primary-normal)"
      title-active-color="var(--color-white)"
      title-inactive-color="var(--color-neutral-secondary)"
      type="card"
    >
      <van-tab v-for="tab in tabs" :key="tab.id" :title="tab.title" />
    </van-tabs>
    <component :is="tabs[activeTab]?.comp" />
  </div>
</template>

<style lang="scss" scoped>
.custom-tabs {
  padding: calc(var(--spacing) * 2) calc(var(--spacing) * 3);

  :deep(.van-tabs__wrap) {
    height: calc(var(--spacing) * 12);

    .van-tabs__nav {
      height: 100%;
      margin: 0;
      padding: calc(var(--spacing) * 1);
      border-color: var(--color-neutral2-seventh) !important;
      border-radius: 100px;
  
      .van-tab--card {
        padding: calc(var(--spacing) * 2) calc(var(--spacing) * 5);
        font-size: var(--text-sm);
        border-right: none;
      }
  
      .van-tab.van-tab--card.van-tab--active {
        border-radius: 100px;
      }
    }
  }
}
</style>